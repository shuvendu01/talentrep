from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
import os
from datetime import datetime

from models import User, UserCreate, UserLogin, MagicLinkRequest, UserRole, BonusConfig
from utils.auth import hash_password, verify_password, generate_magic_token, create_access_token, decode_access_token
from utils.email import send_magic_link_email
from utils.acl import check_permission

router = APIRouter()

# Database will be injected from main server
db = None

FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')

async def get_current_user(authorization: Optional[str] = Header(None)) -> Optional[User]:
    """
    Get current user from JWT token
    """
    if not authorization or not authorization.startswith('Bearer '):
        return None
    
    token = authorization.split(' ')[1]
    payload = decode_access_token(token)
    
    if not payload:
        return None
    
    user_id = payload.get('user_id')
    user_data = await db.users.find_one({'id': user_id}, {'_id': 0})
    
    if not user_data:
        return None
    
    return User(**user_data)

@router.post('/register')
async def register(user_data: UserCreate):
    """
    Register a new user with email and password
    """
    # Check if email already exists
    existing_user = await db.users.find_one({'email': user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail='Email already registered')
    
    # Check if phone already exists (if provided)
    if user_data.phone:
        existing_phone = await db.users.find_one({'phone': user_data.phone})
        if existing_phone:
            raise HTTPException(status_code=400, detail='Phone number already registered')
    
    # Validate password length
    if len(user_data.password) < 6:
        raise HTTPException(status_code=400, detail='Password must be at least 6 characters')
    
    # Get bonus config for the role
    bonus_config = await db.bonus_configs.find_one({'role': user_data.role})
    signup_bonus = 0
    
    if not bonus_config:
        # Create default bonus config
        default_bonuses = {
            UserRole.JOB_SEEKER: {'signup_bonus': 200, 'referral_bonus': 50, 'daily_login_bonus': 10, 'session_time_bonus': 10, 'session_time_threshold': 3600},
            UserRole.EMPLOYER: {'signup_bonus': 10000, 'referral_bonus': 0, 'daily_login_bonus': 0, 'session_time_bonus': 0, 'session_time_threshold': 3600},
            UserRole.INTERVIEWER: {'signup_bonus': 500, 'referral_bonus': 0, 'daily_login_bonus': 0, 'session_time_bonus': 0, 'session_time_threshold': 3600},
            UserRole.ADMIN: {'signup_bonus': 0, 'referral_bonus': 0, 'daily_login_bonus': 0, 'session_time_bonus': 0, 'session_time_threshold': 3600},
        }
        bonus_data = default_bonuses.get(user_data.role, {'signup_bonus': 0})
        signup_bonus = bonus_data['signup_bonus']
        bonus_config_obj = BonusConfig(role=user_data.role, **bonus_data)
        await db.bonus_configs.insert_one(bonus_config_obj.model_dump())
    else:
        signup_bonus = bonus_config.get('signup_bonus', 0)
    
    # Hash password
    password_hash = hash_password(user_data.password)
    
    # Create user
    user = User(
        email=user_data.email,
        phone=user_data.phone,
        password_hash=password_hash,
        role=user_data.role,
        credits_free=signup_bonus,
        credits_paid=0
    )
    
    await db.users.insert_one(user.model_dump())
    
    # Log credit transaction for signup bonus
    if signup_bonus > 0:
        from models import CreditTransaction, CreditType
        transaction = CreditTransaction(
            user_id=user.id,
            amount=signup_bonus,
            credit_type=CreditType.FREE,
            transaction_type='bonus',
            description='Signup bonus'
        )
        await db.credit_transactions.insert_one(transaction.model_dump())
    
    return {
        'message': 'User registered successfully',
        'user': {
            'id': user.id,
            'email': user.email,
            'role': user.role,
            'credits_free': user.credits_free
        }
    }

@router.post('/login')
async def login(login_data: UserLogin):
    """
    Login with email and password
    """
    # Find user by email
    user_data = await db.users.find_one({'email': login_data.email}, {'_id': 0})
    
    if not user_data:
        raise HTTPException(status_code=401, detail='Invalid email or password')
    
    user = User(**user_data)
    
    # Verify password
    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail='Invalid email or password')
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(status_code=403, detail='Account is inactive')
    
    # Update last login
    await db.users.update_one(
        {'id': user.id},
        {'$set': {'last_login': datetime.utcnow()}}
    )
    
    # Generate JWT access token
    access_token = create_access_token(
        data={'user_id': user.id, 'email': user.email, 'role': user.role}
    )
    
    return {
        'access_token': access_token,
        'token_type': 'bearer',
        'user': {
            'id': user.id,
            'email': user.email,
            'role': user.role,
            'credits_free': user.credits_free,
            'credits_paid': user.credits_paid,
            'is_verified': user.is_verified
        }
    }

@router.post('/forgot-password')
async def forgot_password(magic_link_request: MagicLinkRequest):
    """
    Request a password reset magic link
    """
    # Find user by email
    user_data = await db.users.find_one({'email': magic_link_request.email})
    
    if not user_data:
        raise HTTPException(status_code=404, detail='User not found')
    
    user = User(**user_data)
    
    # Invalidate old magic link if exists
    if user.magic_link_token:
        # The old token will be automatically invalidated when we set a new one
        pass
    
    # Generate new magic token
    magic_token = generate_magic_token()
    
    # Update user with new magic link token
    await db.users.update_one(
        {'id': user.id},
        {
            '$set': {
                'magic_link_token': magic_token,
                'magic_link_created_at': datetime.utcnow()
            }
        }
    )
    
    # Generate magic link
    magic_link = f"{FRONTEND_URL}/auth/verify?token={magic_token}"
    
    # Send email
    email_sent = send_magic_link_email(user.email, magic_link)
    
    if not email_sent:
        raise HTTPException(status_code=500, detail='Failed to send email')
    
    return {
        'message': 'Magic link sent to your email',
        'email': user.email
    }

@router.get('/verify')
async def verify_magic_link(token: str):
    """
    Verify magic link token and authenticate user
    """
    # Find user by magic link token
    user_data = await db.users.find_one({'magic_link_token': token})
    
    if not user_data:
        raise HTTPException(status_code=400, detail='Invalid or expired magic link')
    
    user = User(**user_data)
    
    # Clear magic link token (one-time use)
    await db.users.update_one(
        {'id': user.id},
        {
            '$set': {
                'magic_link_token': None,
                'magic_link_created_at': None,
                'last_login': datetime.utcnow()
            }
        }
    )
    
    # Generate JWT access token
    access_token = create_access_token(
        data={'user_id': user.id, 'email': user.email, 'role': user.role}
    )
    
    return {
        'access_token': access_token,
        'token_type': 'bearer',
        'user': {
            'id': user.id,
            'email': user.email,
            'role': user.role,
            'credits_free': user.credits_free,
            'credits_paid': user.credits_paid
        }
    }

@router.get('/me')
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user information
    """
    if not current_user:
        raise HTTPException(status_code=401, detail='Not authenticated')
    
    return {
        'id': current_user.id,
        'email': current_user.email,
        'role': current_user.role,
        'credits_free': current_user.credits_free,
        'credits_paid': current_user.credits_paid,
        'is_verified': current_user.is_verified
    }

@router.post('/logout')
async def logout(current_user: User = Depends(get_current_user)):
    """
    Logout user (client-side token removal)
    """
    if not current_user:
        raise HTTPException(status_code=401, detail='Not authenticated')
    
    return {'message': 'Logged out successfully'}
