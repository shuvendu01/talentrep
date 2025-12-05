"""
Session Management and Login History Routes
Handles multi-device sessions and audit trail
"""
from fastapi import APIRouter, HTTPException, Depends, Header, Request
from typing import Optional, List
from datetime import datetime, timedelta
import os

from models import User
from models_auth import (
    UserSession, LoginHistory, LoginHistoryResponse, 
    ActiveSessionsResponse, SessionLogoutRequest, DeviceInfo
)
from utils.auth import decode_access_token
from routes.auth import get_current_user

router = APIRouter()
db = None

@router.get('/sessions/active', response_model=ActiveSessionsResponse)
async def get_active_sessions(current_user: User = Depends(get_current_user)):
    """
    Get all active sessions for current user
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Get active sessions
    sessions = await db.user_sessions.find({
        'user_id': current_user.id,
        'is_active': True,
        'expires_at': {'$gt': datetime.utcnow()}
    }, {'_id': 0}).to_list(100)
    
    return {
        'total': len(sessions),
        'sessions': sessions
    }

@router.post('/sessions/logout')
async def logout_session(
    request: SessionLogoutRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Logout a specific session
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Find session
    session = await db.user_sessions.find_one({
        'session_id': request.session_id,
        'user_id': current_user.id
    })
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Mark session as inactive
    await db.user_sessions.update_one(
        {'session_id': request.session_id},
        {'$set': {'is_active': False}}
    )
    
    # Update login history
    if session.get('session_id'):
        login_history = await db.login_history.find_one({
            'session_id': session['session_id'],
            'user_id': current_user.id
        })
        
        if login_history:
            logout_time = datetime.utcnow()
            login_time = login_history.get('login_time')
            
            if isinstance(login_time, str):
                login_time = datetime.fromisoformat(login_time)
            
            duration = int((logout_time - login_time).total_seconds())
            
            await db.login_history.update_one(
                {'history_id': login_history['history_id']},
                {
                    '$set': {
                        'logout_time': logout_time.isoformat(),
                        'session_duration': duration,
                        'status': 'logged_out'
                    }
                }
            )
    
    return {'message': 'Session logged out successfully'}

@router.post('/sessions/logout-all')
async def logout_all_sessions(current_user: User = Depends(get_current_user)):
    """
    Logout all sessions except current one
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Mark all sessions as inactive
    result = await db.user_sessions.update_many(
        {'user_id': current_user.id, 'is_active': True},
        {'$set': {'is_active': False}}
    )
    
    # Update login history for all active sessions
    await db.login_history.update_many(
        {
            'user_id': current_user.id,
            'status': 'success',
            'logout_time': None
        },
        {
            '$set': {
                'logout_time': datetime.utcnow().isoformat(),
                'status': 'logged_out'
            }
        }
    )
    
    return {
        'message': f'Logged out {result.modified_count} sessions',
        'count': result.modified_count
    }

@router.get('/login-history', response_model=LoginHistoryResponse)
async def get_login_history(
    page: int = 1,
    limit: int = 20,
    current_user: User = Depends(get_current_user)
):
    """
    Get login history for current user (audit trail)
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    skip = (page - 1) * limit
    
    # Get history
    history = await db.login_history.find(
        {'user_id': current_user.id},
        {'_id': 0}
    ).sort('login_time', -1).skip(skip).limit(limit).to_list(limit)
    
    # Get total count
    total = await db.login_history.count_documents({'user_id': current_user.id})
    
    return {
        'total': total,
        'page': page,
        'limit': limit,
        'history': history
    }

@router.get('/admin/login-history', response_model=LoginHistoryResponse)
async def get_all_login_history(
    page: int = 1,
    limit: int = 50,
    user_id: Optional[str] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Admin endpoint: Get login history for all users
    """
    if not current_user or current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    skip = (page - 1) * limit
    
    # Build query
    query = {}
    if user_id:
        query['user_id'] = user_id
    if status:
        query['status'] = status
    
    # Get history
    history = await db.login_history.find(
        query,
        {'_id': 0}
    ).sort('login_time', -1).skip(skip).limit(limit).to_list(limit)
    
    # Get total count
    total = await db.login_history.count_documents(query)
    
    return {
        'total': total,
        'page': page,
        'limit': limit,
        'history': history
    }

@router.delete('/admin/sessions/{user_id}')
async def admin_logout_user_sessions(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Admin endpoint: Force logout all sessions for a specific user
    """
    if not current_user or current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Mark all sessions as inactive
    result = await db.user_sessions.update_many(
        {'user_id': user_id, 'is_active': True},
        {'$set': {'is_active': False}}
    )
    
    # Update login history
    await db.login_history.update_many(
        {
            'user_id': user_id,
            'status': 'success',
            'logout_time': None
        },
        {
            '$set': {
                'logout_time': datetime.utcnow().isoformat(),
                'status': 'force_logout'
            }
        }
    )
    
    return {
        'message': f'Force logged out {result.modified_count} sessions for user {user_id}',
        'count': result.modified_count
    }

@router.get('/sessions/device-info')
async def get_current_device_info(request: Request):
    """
    Helper endpoint to get device info from current request
    Useful for frontend to gather device information before login
    """
    user_agent = request.headers.get('user-agent', '')
    ip = request.client.host if request.client else None
    
    # Basic device type detection
    device_type = 'desktop_browser'
    if 'mobile' in user_agent.lower():
        if 'app' in user_agent.lower():
            device_type = 'mobile_app'
        else:
            device_type = 'mobile_browser'
    
    return {
        'user_agent': user_agent,
        'ip_address': ip,
        'detected_device_type': device_type,
        'example_device_info': {
            'device_type': device_type,
            'device_name': 'Example Device',
            'browser': 'Chrome 120',
            'os': 'Windows 11',
            'ip_address': ip,
            'user_agent': user_agent
        }
    }
