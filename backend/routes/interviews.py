from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, List
from datetime import datetime, timedelta

from models import User, UserRole
from models_credit_interview import (
    InterviewRequest,
    InterviewRequestCreate,
    InterviewRequestUpdate,
    InterviewRequestStatus,
    InterviewRating,
    InterviewRatingCreate,
    SkillRating,
    PlatformSettings,
    CreditTransactionExtended,
    TransactionType,
    TransactionCategory
)
from routes.auth import get_current_user

router = APIRouter()

# Database will be injected from main server
db = None

# ==================== Interview Requests ====================

@router.post('/requests')
async def create_interview_request(
    request_data: InterviewRequestCreate,
    current_user: User = Depends(get_current_user)
):
    """Job seeker creates interview request"""
    if not current_user or current_user.role != UserRole.JOB_SEEKER:
        raise HTTPException(status_code=403, detail='Only job seekers can request interviews')
    
    # Get platform settings
    settings = await db.platform_settings.find_one({})
    if not settings:
        settings = PlatformSettings().model_dump()
    
    cost = settings.get('interview_request_cost', 5000)
    
    # Check job seeker has enough credits
    user = await db.users.find_one({'id': current_user.id})
    total_credits = user.get('credits_free', 0) + user.get('credits_paid', 0)
    
    if total_credits < cost:
        raise HTTPException(
            status_code=400,
            detail=f'Insufficient credits. Required: {cost}, Available: {total_credits}'
        )
    
    # Get job seeker profile for name
    profile = await db.jobseeker_profiles.find_one({'user_id': current_user.id})
    jobseeker_name = None
    if profile:
        jobseeker_name = f"{profile.get('first_name', '')} {profile.get('last_name', '')}".strip()
    
    # Deduct credits
    credits_paid = user.get('credits_paid', 0)
    credits_free = user.get('credits_free', 0)
    
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
    
    # Create interview request
    import uuid
    interview_request = InterviewRequest(
        id=str(uuid.uuid4()),
        jobseeker_id=current_user.id,
        jobseeker_email=current_user.email,
        jobseeker_name=jobseeker_name,
        skills_to_verify=request_data.skills_to_verify,
        credits_paid=cost,
        jobseeker_notes=request_data.jobseeker_notes
    )
    
    await db.interview_requests.insert_one(interview_request.model_dump())
    
    # Create transaction record
    transaction = CreditTransactionExtended(
        user_id=current_user.id,
        amount=-cost,
        transaction_type=TransactionType.SPEND,
        category=TransactionCategory.INTERVIEW_REQUEST,
        description='Interview verification request',
        reference_id=interview_request.id,
        reference_type='interview_request',
        balance_free=new_free,
        balance_paid=new_paid
    )
    
    await db.credit_transactions.insert_one(transaction.model_dump())
    
    # Find matching interviewers
    matching_interviewers = await find_matching_interviewers(request_data.skills_to_verify)
    
    # TODO: Send email notifications to matching interviewers
    # For now, just store the notified list
    if matching_interviewers:
        await db.interview_requests.update_one(
            {'id': interview_request.id},
            {'$set': {'notified_interviewers': matching_interviewers}}
        )
    
    return {
        'message': 'Interview request created successfully',
        'request': interview_request,
        'matching_interviewers_count': len(matching_interviewers),
        'remaining_credits': {
            'free': new_free,
            'paid': new_paid,
            'total': new_free + new_paid
        }
    }


async def find_matching_interviewers(skills: List[str]) -> List[str]:
    """Find interviewers whose primary skills match the required skills"""
    # Get all interviewer profiles
    interviewer_profiles = await db.interviewer_profiles.find({}).to_list(100)
    
    matching_ids = []
    for profile in interviewer_profiles:
        profile_skills = profile.get('expertise', [])
        # Check if any primary skill matches
        if profile_skills:
            for skill_obj in profile_skills:
                if isinstance(skill_obj, dict):
                    skill_name = skill_obj.get('skill')
                    is_primary = skill_obj.get('is_primary', False)
                    if is_primary and skill_name in skills:
                        matching_ids.append(profile['user_id'])
                        break
    
    return matching_ids


@router.get('/requests/available')
async def get_available_requests(
    current_user: User = Depends(get_current_user)
):
    """Interviewer views available interview requests"""
    if not current_user or current_user.role != UserRole.INTERVIEWER:
        raise HTTPException(status_code=403, detail='Only interviewers can view available requests')
    
    # Get requests where interviewer was notified or status is pending
    requests = await db.interview_requests.find({
        '$or': [
            {'notified_interviewers': current_user.id},
            {'status': InterviewRequestStatus.PENDING}
        ]
    }).sort('created_at', -1).to_list(50)
    
    return [InterviewRequest(**req) for req in requests]


@router.post('/requests/{request_id}/accept')
async def accept_interview_request(
    request_id: str,
    current_user: User = Depends(get_current_user)
):
    """Interviewer accepts an interview request"""
    if not current_user or current_user.role != UserRole.INTERVIEWER:
        raise HTTPException(status_code=403, detail='Only interviewers can accept requests')
    
    # Get request
    request = await db.interview_requests.find_one({'id': request_id})
    if not request:
        raise HTTPException(status_code=404, detail='Interview request not found')
    
    if request['status'] != InterviewRequestStatus.PENDING:
        raise HTTPException(status_code=400, detail='Request is no longer available')
    
    # Assign interviewer
    await db.interview_requests.update_one(
        {'id': request_id},
        {
            '$set': {
                'status': InterviewRequestStatus.ASSIGNED,
                'interviewer_id': current_user.id,
                'interviewer_email': current_user.email,
                'assigned_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
        }
    )
    
    return {
        'message': 'Interview request accepted successfully',
        'request_id': request_id
    }


@router.get('/requests/my-interviews')
async def get_my_interview_requests(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Get interview requests for current user (job seeker or interviewer)"""
    if not current_user:
        raise HTTPException(status_code=401, detail='Authentication required')
    
    query = {}
    
    if current_user.role == UserRole.JOB_SEEKER:
        query['jobseeker_id'] = current_user.id
    elif current_user.role == UserRole.INTERVIEWER:
        query['interviewer_id'] = current_user.id
    else:
        raise HTTPException(status_code=403, detail='Only job seekers and interviewers can view requests')
    
    if status:
        query['status'] = status
    
    requests = await db.interview_requests.find(query).sort('created_at', -1).to_list(100)
    
    return [InterviewRequest(**req) for req in requests]


@router.put('/requests/{request_id}')
async def update_interview_request(
    request_id: str,
    update_data: InterviewRequestUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update interview request (Admin only for now)"""
    if not current_user or current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail='Admin access required')
    
    request = await db.interview_requests.find_one({'id': request_id})
    if not request:
        raise HTTPException(status_code=404, detail='Interview request not found')
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    update_dict['updated_at'] = datetime.utcnow()
    
    if update_data.interviewer_id and update_data.interviewer_id != request.get('interviewer_id'):
        update_dict['assigned_by'] = current_user.id
        update_dict['assigned_at'] = datetime.utcnow()
    
    await db.interview_requests.update_one(
        {'id': request_id},
        {'$set': update_dict}
    )
    
    return {'message': 'Interview request updated successfully'}


# ==================== Interview Ratings ====================

@router.post('/ratings')
async def submit_interview_rating(
    rating_data: InterviewRatingCreate,
    current_user: User = Depends(get_current_user)
):
    """Interviewer submits rating after completing interview"""
    if not current_user or current_user.role != UserRole.INTERVIEWER:
        raise HTTPException(status_code=403, detail='Only interviewers can submit ratings')
    
    # Get interview request
    request = await db.interview_requests.find_one({'id': rating_data.interview_request_id})
    if not request:
        raise HTTPException(status_code=404, detail='Interview request not found')
    
    if request['interviewer_id'] != current_user.id:
        raise HTTPException(status_code=403, detail='You are not assigned to this interview')
    
    if request['status'] == InterviewRequestStatus.COMPLETED:
        raise HTTPException(status_code=400, detail='Rating already submitted for this interview')
    
    # Validate ratings (0.5 to 5.0 in 0.5 increments)
    for skill_rating in rating_data.skill_ratings:
        if skill_rating.rating < 0.5 or skill_rating.rating > 5.0:
            raise HTTPException(status_code=400, detail=f'Invalid rating for {skill_rating.skill_name}')
        if (skill_rating.rating * 2) % 1 != 0:  # Check if it's a multiple of 0.5
            raise HTTPException(status_code=400, detail=f'Rating must be in 0.5 increments for {skill_rating.skill_name}')
    
    # Calculate overall rating
    overall_rating = sum(sr.rating for sr in rating_data.skill_ratings) / len(rating_data.skill_ratings)
    
    # Get platform settings for earnings
    settings = await db.platform_settings.find_one({})
    if not settings:
        settings = PlatformSettings().model_dump()
    
    earnings = settings.get('interview_completion_earning', 500)
    
    # Create rating
    import uuid
    rating = InterviewRating(
        id=str(uuid.uuid4()),
        interview_request_id=rating_data.interview_request_id,
        jobseeker_id=request['jobseeker_id'],
        interviewer_id=current_user.id,
        overall_rating=round(overall_rating, 1),
        skill_ratings=rating_data.skill_ratings,
        strengths=rating_data.strengths,
        areas_for_improvement=rating_data.areas_for_improvement,
        general_feedback=rating_data.general_feedback,
        recommendation=rating_data.recommendation,
        interviewer_credits_earned=earnings
    )
    
    await db.interview_ratings.insert_one(rating.model_dump())
    
    # Update interview request status
    await db.interview_requests.update_one(
        {'id': rating_data.interview_request_id},
        {
            '$set': {
                'status': InterviewRequestStatus.COMPLETED,
                'completed_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
        }
    )
    
    # Add credits to interviewer
    interviewer = await db.users.find_one({'id': current_user.id})
    new_free_balance = interviewer.get('credits_free', 0) + earnings
    
    await db.users.update_one(
        {'id': current_user.id},
        {'$set': {'credits_free': new_free_balance}}
    )
    
    # Create transaction record
    transaction = CreditTransactionExtended(
        user_id=current_user.id,
        amount=earnings,
        transaction_type=TransactionType.EARN,
        category=TransactionCategory.INTERVIEW_COMPLETION,
        description=f'Interview completed for {request["jobseeker_email"]}',
        reference_id=rating.id,
        reference_type='interview_rating',
        balance_free=new_free_balance,
        balance_paid=interviewer.get('credits_paid', 0)
    )
    
    await db.credit_transactions.insert_one(transaction.model_dump())
    
    return {
        'message': 'Rating submitted successfully',
        'rating': rating,
        'credits_earned': earnings,
        'new_balance': {
            'free': new_free_balance,
            'paid': interviewer.get('credits_paid', 0),
            'total': new_free_balance + interviewer.get('credits_paid', 0)
        }
    }


@router.get('/ratings/jobseeker/{jobseeker_id}')
async def get_jobseeker_ratings(
    jobseeker_id: str
):
    """Get all ratings for a job seeker (public access for verification badge)"""
    # Get the latest rating for the job seeker
    ratings = await db.interview_ratings.find({
        'jobseeker_id': jobseeker_id
    }).sort('created_at', -1).to_list(10)
    
    if not ratings:
        return {
            'has_verification': False,
            'ratings': []
        }
    
    # Return the most recent rating (can be overwritten with re-evaluation)
    latest_rating = ratings[0]
    
    return {
        'has_verification': True,
        'latest_rating': InterviewRating(**latest_rating),
        'all_ratings': [InterviewRating(**r) for r in ratings]
    }


@router.get('/admin/requests')
async def admin_get_all_requests(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Admin: View all interview requests"""
    if not current_user or current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail='Admin access required')
    
    query = {}
    if status:
        query['status'] = status
    
    requests = await db.interview_requests.find(query).sort('created_at', -1).to_list(500)
    
    return [InterviewRequest(**req) for req in requests]


@router.get('/admin/ratings')
async def admin_get_all_ratings(
    current_user: User = Depends(get_current_user)
):
    """Admin: View all interview ratings"""
    if not current_user or current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail='Admin access required')
    
    ratings = await db.interview_ratings.find({}).sort('created_at', -1).to_list(500)
    
    return [InterviewRating(**r) for r in ratings]
