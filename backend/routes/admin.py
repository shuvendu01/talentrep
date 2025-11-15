from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from datetime import datetime

from models import User, UserRole
from models_credit_interview import (
    NotificationBanner,
    NotificationBannerCreate,
    NotificationBannerUpdate,
    CustomCode,
    CustomCodeCreate,
    CustomCodeUpdate,
    CreditDonation,
    CreditDonationCreate,
    CreditTransactionExtended,
    TransactionType,
    TransactionCategory
)
from routes.auth import get_current_user

router = APIRouter()

# Database will be injected from main server
db = None

# ==================== Notification Banners ====================

@router.post('/notifications')
async def create_notification(
    notification_data: NotificationBannerCreate,
    current_user: User = Depends(get_current_user)
):
    """Admin: Create notification banner"""
    if not current_user or current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail='Admin access required')
    
    import uuid
    notification = NotificationBanner(
        id=str(uuid.uuid4()),
        **notification_data.model_dump(),
        created_by=current_user.id
    )
    
    await db.notification_banners.insert_one(notification.model_dump())
    
    return {'message': 'Notification created successfully', 'notification': notification}


@router.get('/notifications')
async def get_all_notifications(
    current_user: User = Depends(get_current_user)
):
    """Admin: Get all notifications"""
    if not current_user or current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail='Admin access required')
    
    notifications = await db.notification_banners.find({}).sort('priority', -1).to_list(100)
    
    return [NotificationBanner(**n) for n in notifications]


@router.put('/notifications/{notification_id}')
async def update_notification(
    notification_id: str,
    notification_data: NotificationBannerUpdate,
    current_user: User = Depends(get_current_user)
):
    """Admin: Update notification banner"""
    if not current_user or current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail='Admin access required')
    
    notification = await db.notification_banners.find_one({'id': notification_id})
    if not notification:
        raise HTTPException(status_code=404, detail='Notification not found')
    
    update_data = {k: v for k, v in notification_data.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.utcnow()
    
    await db.notification_banners.update_one(
        {'id': notification_id},
        {'$set': update_data}
    )
    
    return {'message': 'Notification updated successfully'}


@router.delete('/notifications/{notification_id}')
async def delete_notification(
    notification_id: str,
    current_user: User = Depends(get_current_user)
):
    """Admin: Delete notification banner"""
    if not current_user or current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail='Admin access required')
    
    result = await db.notification_banners.delete_one({'id': notification_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail='Notification not found')
    
    return {'message': 'Notification deleted successfully'}


@router.get('/notifications/public')
async def get_public_notifications():
    """Public: Get active notifications (no auth required)"""
    current_time = datetime.utcnow()
    
    # Query for active notifications
    query = {
        'is_active': True,
        'banner_type': 'public',
        'target_user_id': None
    }
    
    notifications = await db.notification_banners.find(query).sort('priority', -1).to_list(10)
    
    # Filter by date range
    active_notifications = []
    for notif in notifications:
        start_date = notif.get('start_date')
        end_date = notif.get('end_date')
        
        # If no dates set, always show
        if not start_date and not end_date:
            active_notifications.append(NotificationBanner(**notif))
            continue
        
        # Check if current time is within range
        if start_date and end_date:
            if start_date <= current_time <= end_date:
                active_notifications.append(NotificationBanner(**notif))
        elif start_date and current_time >= start_date:
            active_notifications.append(NotificationBanner(**notif))
        elif end_date and current_time <= end_date:
            active_notifications.append(NotificationBanner(**notif))
    
    return active_notifications


@router.get('/notifications/user')
async def get_user_notifications(
    current_user: User = Depends(get_current_user)
):
    """Get notifications for logged-in user"""
    if not current_user:
        raise HTTPException(status_code=401, detail='Authentication required')
    
    current_time = datetime.utcnow()
    
    # Get role-specific and user-specific notifications
    query = {
        'is_active': True,
        '$or': [
            {'banner_type': current_user.role.value},
            {'target_user_id': current_user.id}
        ]
    }
    
    notifications = await db.notification_banners.find(query).sort('priority', -1).to_list(10)
    
    # Filter by date range
    active_notifications = []
    for notif in notifications:
        start_date = notif.get('start_date')
        end_date = notif.get('end_date')
        
        # User-specific notifications override date checks
        if notif.get('target_user_id') == current_user.id:
            active_notifications.append(NotificationBanner(**notif))
            continue
        
        # For role-based, check dates
        if not start_date and not end_date:
            active_notifications.append(NotificationBanner(**notif))
            continue
        
        if start_date and end_date:
            if start_date <= current_time <= end_date:
                active_notifications.append(NotificationBanner(**notif))
        elif start_date and current_time >= start_date:
            active_notifications.append(NotificationBanner(**notif))
        elif end_date and current_time <= end_date:
            active_notifications.append(NotificationBanner(**notif))
    
    return active_notifications


# ==================== Custom CSS/JS ====================

@router.post('/custom-code')
async def create_custom_code(
    code_data: CustomCodeCreate,
    current_user: User = Depends(get_current_user)
):
    """Admin: Add custom CSS or JS"""
    if not current_user or current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail='Admin access required')
    
    if code_data.code_type not in ['css', 'js']:
        raise HTTPException(status_code=400, detail='code_type must be either "css" or "js"')
    
    import uuid
    custom_code = CustomCode(
        id=str(uuid.uuid4()),
        **code_data.model_dump(),
        created_by=current_user.id
    )
    
    await db.custom_code.insert_one(custom_code.model_dump())
    
    return {'message': 'Custom code created successfully', 'code': custom_code}


@router.get('/custom-code')
async def get_all_custom_code(
    code_type: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Admin: Get all custom code"""
    if not current_user or current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail='Admin access required')
    
    query = {}
    if code_type:
        query['code_type'] = code_type
    
    codes = await db.custom_code.find(query).sort('created_at', -1).to_list(100)
    
    return [CustomCode(**c) for c in codes]


@router.get('/custom-code/active')
async def get_active_custom_code():
    """Public: Get active custom CSS and JS"""
    codes = await db.custom_code.find({'is_active': True}).to_list(100)
    
    css_codes = []
    js_codes = []
    
    for code in codes:
        if code['code_type'] == 'css':
            css_codes.append(code['code_content'])
        elif code['code_type'] == 'js':
            js_codes.append(code['code_content'])
    
    return {
        'css': '\n'.join(css_codes),
        'js': '\n'.join(js_codes)
    }


@router.put('/custom-code/{code_id}')
async def update_custom_code(
    code_id: str,
    code_data: CustomCodeUpdate,
    current_user: User = Depends(get_current_user)
):
    """Admin: Update custom code"""
    if not current_user or current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail='Admin access required')
    
    code = await db.custom_code.find_one({'id': code_id})
    if not code:
        raise HTTPException(status_code=404, detail='Custom code not found')
    
    update_data = {k: v for k, v in code_data.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.utcnow()
    
    await db.custom_code.update_one(
        {'id': code_id},
        {'$set': update_data}
    )
    
    return {'message': 'Custom code updated successfully'}


@router.delete('/custom-code/{code_id}')
async def delete_custom_code(
    code_id: str,
    current_user: User = Depends(get_current_user)
):
    """Admin: Delete custom code"""
    if not current_user or current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail='Admin access required')
    
    result = await db.custom_code.delete_one({'id': code_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail='Custom code not found')
    
    return {'message': 'Custom code deleted successfully'}


# ==================== User Management ====================

@router.get('/users')
async def get_all_users(
    role: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    current_user: User = Depends(get_current_user)
):
    """Admin: Get all users with filters"""
    if not current_user or current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail='Admin access required')
    
    query = {}
    
    if role:
        query['role'] = role
    
    if search:
        query['$or'] = [
            {'email': {'$regex': search, '$options': 'i'}},
            {'phone': {'$regex': search, '$options': 'i'}}
        ]
    
    total = await db.users.count_documents(query)
    skip = (page - 1) * limit
    
    users = await db.users.find(query).skip(skip).limit(limit).to_list(limit)
    
    # Remove password hashes
    for user in users:
        user.pop('password_hash', None)
        user.pop('magic_link_token', None)
    
    return {
        'users': users,
        'total': total,
        'page': page,
        'limit': limit,
        'pages': (total + limit - 1) // limit
    }


@router.get('/users/{user_id}')
async def get_user_details(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    """Admin: Get user details"""
    if not current_user or current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail='Admin access required')
    
    user = await db.users.find_one({'id': user_id})
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    
    # Remove sensitive data
    user.pop('password_hash', None)
    user.pop('magic_link_token', None)
    
    # Get profile based on role
    profile = None
    if user['role'] == UserRole.JOB_SEEKER:
        profile = await db.jobseeker_profiles.find_one({'user_id': user_id})
    elif user['role'] == UserRole.EMPLOYER:
        profile = await db.employer_profiles.find_one({'user_id': user_id})
    elif user['role'] == UserRole.INTERVIEWER:
        profile = await db.interviewer_profiles.find_one({'user_id': user_id})
    
    return {
        'user': user,
        'profile': profile
    }


@router.post('/users/{user_id}/donate-credits')
async def donate_credits_to_user(
    user_id: str,
    donation_data: CreditDonationCreate,
    current_user: User = Depends(get_current_user)
):
    """Admin: Donate credits to specific user"""
    if not current_user or current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail='Admin access required')
    
    if donation_data.amount <= 0:
        raise HTTPException(status_code=400, detail='Amount must be positive')
    
    # Get user
    user = await db.users.find_one({'id': user_id})
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    
    # Add credits
    new_free_balance = user.get('credits_free', 0) + donation_data.amount
    
    await db.users.update_one(
        {'id': user_id},
        {'$set': {'credits_free': new_free_balance}}
    )
    
    # Create donation record
    import uuid
    donation = CreditDonation(
        id=str(uuid.uuid4()),
        user_id=user_id,
        amount=donation_data.amount,
        donated_by=current_user.id,
        reason=donation_data.reason,
        notification_sent=donation_data.send_notification
    )
    
    await db.credit_donations.insert_one(donation.model_dump())
    
    # Create transaction record
    transaction = CreditTransactionExtended(
        user_id=user_id,
        amount=donation_data.amount,
        transaction_type=TransactionType.BONUS,
        category=TransactionCategory.ADMIN_ADJUSTMENT,
        description=donation_data.reason or f'Credit donation from admin',
        reference_id=donation.id,
        reference_type='donation',
        balance_free=new_free_balance,
        balance_paid=user.get('credits_paid', 0),
        created_by=current_user.id
    )
    
    await db.credit_transactions.insert_one(transaction.model_dump())
    
    # Create user-specific notification if requested
    if donation_data.send_notification:
        notification = NotificationBanner(
            id=str(uuid.uuid4()),
            title='🎉 Credits Donated!',
            message=f'You have received {donation_data.amount} free credits from admin. {donation_data.reason or ""}',
            banner_type='user_specific',
            target_user_id=user_id,
            is_active=True,
            priority=10,
            show_icon=True,
            bg_color='#10b981',
            text_color='#ffffff',
            icon_name='gift',
            created_by=current_user.id
        )
        
        await db.notification_banners.insert_one(notification.model_dump())
    
    return {
        'message': 'Credits donated successfully',
        'donation': donation,
        'new_balance': {
            'free': new_free_balance,
            'paid': user.get('credits_paid', 0),
            'total': new_free_balance + user.get('credits_paid', 0)
        }
    }


@router.get('/users/{user_id}/donations')
async def get_user_donations(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    """Admin: Get all donations for a user"""
    if not current_user or current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail='Admin access required')
    
    donations = await db.credit_donations.find({'user_id': user_id}).sort('created_at', -1).to_list(100)
    
    return [CreditDonation(**d) for d in donations]


@router.get('/donations/all')
async def get_all_donations(
    current_user: User = Depends(get_current_user)
):
    """Admin: Get all credit donations"""
    if not current_user or current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail='Admin access required')
    
    donations = await db.credit_donations.find({}).sort('created_at', -1).to_list(500)
    
    return [CreditDonation(**d) for d in donations]
