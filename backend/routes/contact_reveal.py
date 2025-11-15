from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, List
from datetime import datetime, timedelta

from models import User, UserRole
from models_credit_interview import (
    ContactAccess,
    ContactAccessCreate,
    PlatformSettings,
    CreditTransactionExtended,
    TransactionType,
    TransactionCategory
)
from routes.auth import get_current_user

router = APIRouter()

# Database will be injected from main server
db = None

# ==================== Contact Reveal ====================

@router.post('/reveal')
async def reveal_contact(
    access_data: ContactAccessCreate,
    current_user: User = Depends(get_current_user)
):
    """Employer reveals job seeker contact information"""
    if not current_user or current_user.role != UserRole.EMPLOYER:
        raise HTTPException(status_code=403, detail='Only employers can reveal contacts')
    
    # Get platform settings
    settings = await db.platform_settings.find_one({})
    if not settings:
        settings = PlatformSettings().model_dump()
    
    cost = settings.get('contact_reveal_cost', 10000)
    duration_days = settings.get('contact_access_duration_days', 365)
    
    # Check if already has access
    existing_access = await db.contact_access.find_one({
        'employer_id': current_user.id,
        'jobseeker_id': access_data.jobseeker_id,
        'is_active': True
    })
    
    if existing_access:
        # Check if access is still valid
        if existing_access['access_expires_at'] > datetime.utcnow():
            return {
                'message': 'You already have access to this contact',
                'access': ContactAccess(**existing_access)
            }
        else:
            # Deactivate expired access
            await db.contact_access.update_one(
                {'id': existing_access['id']},
                {'$set': {'is_active': False}}
            )
    
    # Get job seeker details
    jobseeker = await db.users.find_one({'id': access_data.jobseeker_id})
    if not jobseeker:
        raise HTTPException(status_code=404, detail='Job seeker not found')
    
    if jobseeker['role'] != UserRole.JOB_SEEKER:
        raise HTTPException(status_code=400, detail='Target user is not a job seeker')
    
    # Get job seeker profile for current company
    jobseeker_profile = await db.jobseeker_profiles.find_one({'user_id': access_data.jobseeker_id})
    current_company = None
    if jobseeker_profile and jobseeker_profile.get('work_experience'):
        # Get most recent company (first in list)
        if len(jobseeker_profile['work_experience']) > 0:
            current_company = jobseeker_profile['work_experience'][0].get('company_name')
    
    # Check employer has enough credits
    employer = await db.users.find_one({'id': current_user.id})
    total_credits = employer.get('credits_free', 0) + employer.get('credits_paid', 0)
    
    if total_credits < cost:
        raise HTTPException(
            status_code=400,
            detail=f'Insufficient credits. Required: {cost}, Available: {total_credits}'
        )
    
    # Deduct credits (paid first, then free)
    credits_paid = employer.get('credits_paid', 0)
    credits_free = employer.get('credits_free', 0)
    
    remaining_to_deduct = cost
    new_paid = credits_paid
    new_free = credits_free
    
    if credits_paid >= remaining_to_deduct:
        new_paid = credits_paid - remaining_to_deduct
    else:
        new_paid = 0
        remaining_to_deduct -= credits_paid
        new_free = credits_free - remaining_to_deduct
    
    await db.users.update_one(
        {'id': current_user.id},
        {'$set': {'credits_paid': new_paid, 'credits_free': new_free}}
    )
    
    # Create contact access record
    import uuid
    access_expires_at = datetime.utcnow() + timedelta(days=duration_days)
    
    contact_access = ContactAccess(
        id=str(uuid.uuid4()),
        employer_id=current_user.id,
        jobseeker_id=access_data.jobseeker_id,
        credits_spent=cost,
        access_expires_at=access_expires_at,
        revealed_email=jobseeker['email'],
        revealed_phone=jobseeker.get('phone'),
        revealed_current_company=current_company
    )
    
    await db.contact_access.insert_one(contact_access.model_dump())
    
    # Create transaction record
    transaction = CreditTransactionExtended(
        user_id=current_user.id,
        amount=-cost,
        transaction_type=TransactionType.SPEND,
        category=TransactionCategory.CONTACT_REVEAL,
        description=f'Revealed contact for job seeker {jobseeker["email"]}',
        reference_id=contact_access.id,
        reference_type='contact_access',
        balance_free=new_free,
        balance_paid=new_paid
    )
    
    await db.credit_transactions.insert_one(transaction.model_dump())
    
    return {
        'message': 'Contact revealed successfully',
        'access': contact_access,
        'remaining_credits': {
            'free': new_free,
            'paid': new_paid,
            'total': new_free + new_paid
        }
    }


@router.get('/access/{jobseeker_id}')
async def check_contact_access(
    jobseeker_id: str,
    current_user: User = Depends(get_current_user)
):
    """Check if employer has access to job seeker contact"""
    if not current_user or current_user.role != UserRole.EMPLOYER:
        raise HTTPException(status_code=403, detail='Only employers can check contact access')
    
    access = await db.contact_access.find_one({
        'employer_id': current_user.id,
        'jobseeker_id': jobseeker_id,
        'is_active': True
    })
    
    if not access:
        return {
            'has_access': False,
            'message': 'No access to this contact'
        }
    
    # Check if expired
    if access['access_expires_at'] < datetime.utcnow():
        # Deactivate expired access
        await db.contact_access.update_one(
            {'id': access['id']},
            {'$set': {'is_active': False}}
        )
        return {
            'has_access': False,
            'message': 'Access expired'
        }
    
    return {
        'has_access': True,
        'access': ContactAccess(**access)
    }


@router.get('/my-access')
async def get_my_contact_access(
    current_user: User = Depends(get_current_user)
):
    """Get all contact access purchased by employer"""
    if not current_user or current_user.role != UserRole.EMPLOYER:
        raise HTTPException(status_code=403, detail='Only employers can view contact access')
    
    access_list = await db.contact_access.find({
        'employer_id': current_user.id,
        'is_active': True,
        'access_expires_at': {'$gt': datetime.utcnow()}
    }).sort('access_granted_at', -1).to_list(100)
    
    return [ContactAccess(**access) for access in access_list]


@router.get('/admin/all-access')
async def admin_get_all_access(
    current_user: User = Depends(get_current_user)
):
    """Admin: View all contact access records"""
    if not current_user or current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail='Admin access required')
    
    access_list = await db.contact_access.find({}).sort('access_granted_at', -1).to_list(500)
    
    return [ContactAccess(**access) for access in access_list]
