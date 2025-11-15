from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import Optional
import os
from datetime import datetime

from models import User, UserRole
from models_profile import (
    JobSeekerProfile, JobSeekerProfileCreate, JobSeekerProfileUpdate,
    EmployerProfile, EmployerProfileCreate, EmployerProfileUpdate,
    InterviewerProfile, InterviewerProfileCreate, InterviewerProfileUpdate,
    Company, CompanyCreate
)
from routes.auth import get_current_user
from utils.s3 import upload_file_to_s3, delete_file_from_s3, generate_presigned_url
from utils.document_converter import convert_doc_to_pdf, validate_file_size, validate_file_type

router = APIRouter()

# Database will be injected from main server
db = None

# ==================== Job Seeker Profile ====================

@router.post('/jobseeker/profile')
async def create_jobseeker_profile(
    profile_data: dict,
    current_user: User = Depends(get_current_user)
):
    """Create job seeker profile"""
    if not current_user or current_user.role != UserRole.JOB_SEEKER:
        raise HTTPException(status_code=403, detail='Only job seekers can create this profile')
    
    # Check if profile already exists
    existing_profile = await db.jobseeker_profiles.find_one({'user_id': current_user.id})
    if existing_profile:
        raise HTTPException(status_code=400, detail='Profile already exists')
    
    # Create profile
    import uuid
    profile_dict = {
        'id': str(uuid.uuid4()),
        'user_id': current_user.id,
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow(),
        'is_profile_complete': False,
        'overall_rating': None,
        'verification_count': 0,
        'resume_url': None,
        'resume_original_url': None,
        **profile_data
    }
    
    await db.jobseeker_profiles.insert_one(profile_dict)
    
    return {'message': 'Profile created successfully', 'profile': profile_dict}

@router.get('/jobseeker/profile')
async def get_jobseeker_profile(current_user: User = Depends(get_current_user)):
    """Get current user's job seeker profile"""
    if not current_user:
        raise HTTPException(status_code=401, detail='Not authenticated')
    
    profile_data = await db.jobseeker_profiles.find_one({'user_id': current_user.id})
    
    if not profile_data:
        raise HTTPException(status_code=404, detail='Profile not found')
    
    return JobSeekerProfile(**profile_data)

@router.put('/jobseeker/profile')
async def update_jobseeker_profile(
    profile_data: dict,
    current_user: User = Depends(get_current_user)
):
    """Update job seeker profile"""
    if not current_user or current_user.role != UserRole.JOB_SEEKER:
        raise HTTPException(status_code=403, detail='Only job seekers can update this profile')
    
    existing_profile = await db.jobseeker_profiles.find_one({'user_id': current_user.id})
    if not existing_profile:
        raise HTTPException(status_code=404, detail='Profile not found')
    
    # Update with all fields from profile_data
    update_data = {k: v for k, v in profile_data.items() if v is not None and k != 'user_id' and k != 'id'}
    update_data['updated_at'] = datetime.utcnow()
    
    await db.jobseeker_profiles.update_one(
        {'user_id': current_user.id},
        {'$set': update_data}
    )
    
    return {'message': 'Profile updated successfully'}

@router.post('/jobseeker/profile/image')
async def upload_profile_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload profile image"""
    if not current_user or current_user.role != UserRole.JOB_SEEKER:
        raise HTTPException(status_code=403, detail='Only job seekers can upload profile image')
    
    # Get profile
    profile_data = await db.jobseeker_profiles.find_one({'user_id': current_user.id})
    if not profile_data:
        raise HTTPException(status_code=404, detail='Profile not found. Create profile first.')
    
    # Read file content
    file_content = await file.read()
    
    # Validate file size (5MB max for images)
    if len(file_content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail='Image size must be less than 5MB')
    
    # Validate file type
    allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail='Only JPEG, PNG, and WebP images are allowed')
    
    # Upload to S3
    image_url = upload_file_to_s3(
        file_content,
        f"profile_{file.filename}",
        file.content_type
    )
    
    if not image_url:
        raise HTTPException(status_code=500, detail='Failed to upload image')
    
    # Delete old profile image if exists
    if profile_data.get('profile_image_url'):
        delete_file_from_s3(profile_data['profile_image_url'])
    
    # Update profile with new image URL
    await db.jobseeker_profiles.update_one(
        {'user_id': current_user.id},
        {
            '$set': {
                'profile_image_url': image_url,
                'updated_at': datetime.utcnow()
            }
        }
    )
    
    return {
        'message': 'Profile image uploaded successfully',
        'image_url': image_url
    }

@router.post('/jobseeker/profile/resume')
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload resume (PDF, DOC, DOCX) - converts to PDF and stores both versions"""
    if not current_user or current_user.role != UserRole.JOB_SEEKER:
        raise HTTPException(status_code=403, detail='Only job seekers can upload resume')
    
    # Get profile
    profile_data = await db.jobseeker_profiles.find_one({'user_id': current_user.id})
    if not profile_data:
        raise HTTPException(status_code=404, detail='Profile not found. Create profile first.')
    
    # Read file content
    file_content = await file.read()
    
    # Validate file size (20MB max)
    is_valid_size, size_error = validate_file_size(file_content, max_size_mb=20)
    if not is_valid_size:
        raise HTTPException(status_code=400, detail=size_error)
    
    # Validate file type
    is_valid_type, type_error = validate_file_type(file.filename)
    if not is_valid_type:
        raise HTTPException(status_code=400, detail=type_error)
    
    # Store original file for admin access
    original_url = upload_file_to_s3(
        file_content,
        f"original_{file.filename}",
        file.content_type or 'application/octet-stream'
    )
    
    if not original_url:
        raise HTTPException(status_code=500, detail='Failed to upload original file')
    
    # Convert to PDF if needed
    pdf_content, conversion_error = convert_doc_to_pdf(file_content, file.filename)
    
    if pdf_content is None:
        # Cleanup uploaded original
        delete_file_from_s3(original_url)
        raise HTTPException(status_code=400, detail=conversion_error)
    
    # Upload PDF version
    pdf_filename = file.filename.rsplit('.', 1)[0] + '.pdf'
    pdf_url = upload_file_to_s3(
        pdf_content,
        pdf_filename,
        'application/pdf'
    )
    
    if not pdf_url:
        # Cleanup uploaded original
        delete_file_from_s3(original_url)
        raise HTTPException(status_code=500, detail='Failed to upload PDF file')
    
    # Delete old resume files if they exist
    if profile_data.get('resume_url'):
        delete_file_from_s3(profile_data['resume_url'])
    if profile_data.get('resume_original_url'):
        delete_file_from_s3(profile_data['resume_original_url'])
    
    # Update profile with new resume URLs
    await db.jobseeker_profiles.update_one(
        {'user_id': current_user.id},
        {
            '$set': {
                'resume_url': pdf_url,
                'resume_original_url': original_url,
                'updated_at': datetime.utcnow()
            }
        }
    )
    
    return {
        'message': 'Resume uploaded successfully',
        'resume_url': pdf_url,
        'original_format': file.filename.split('.')[-1]
    }

# ==================== Employer Profile ====================

@router.post('/employer/profile')
async def create_employer_profile(
    profile_data: EmployerProfileCreate,
    current_user: User = Depends(get_current_user)
):
    """Create employer profile"""
    if not current_user or current_user.role != UserRole.EMPLOYER:
        raise HTTPException(status_code=403, detail='Only employers can create this profile')
    
    # Check if profile already exists
    existing_profile = await db.employer_profiles.find_one({'user_id': current_user.id})
    if existing_profile:
        raise HTTPException(status_code=400, detail='Profile already exists')
    
    # Create or get company
    company = await db.companies.find_one({'name': profile_data.company_name})
    if not company:
        company_obj = Company(name=profile_data.company_name, category='new')
        await db.companies.insert_one(company_obj.model_dump())
    
    # Create profile
    profile = EmployerProfile(
        user_id=current_user.id,
        **profile_data.model_dump()
    )
    
    await db.employer_profiles.insert_one(profile.model_dump())
    
    return {'message': 'Profile created successfully', 'profile': profile}

@router.get('/employer/profile')
async def get_employer_profile(current_user: User = Depends(get_current_user)):
    """Get current user's employer profile"""
    if not current_user:
        raise HTTPException(status_code=401, detail='Not authenticated')
    
    profile_data = await db.employer_profiles.find_one({'user_id': current_user.id})
    
    if not profile_data:
        raise HTTPException(status_code=404, detail='Profile not found')
    
    return EmployerProfile(**profile_data)

@router.put('/employer/profile')
async def update_employer_profile(
    profile_data: EmployerProfileUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update employer profile"""
    if not current_user or current_user.role != UserRole.EMPLOYER:
        raise HTTPException(status_code=403, detail='Only employers can update this profile')
    
    existing_profile = await db.employer_profiles.find_one({'user_id': current_user.id})
    if not existing_profile:
        raise HTTPException(status_code=404, detail='Profile not found')
    
    # Update only provided fields
    update_data = {k: v for k, v in profile_data.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.utcnow()
    
    await db.employer_profiles.update_one(
        {'user_id': current_user.id},
        {'$set': update_data}
    )
    
    return {'message': 'Profile updated successfully'}

# ==================== Interviewer Profile ====================

@router.post('/interviewer/profile')
async def create_interviewer_profile(
    profile_data: InterviewerProfileCreate,
    current_user: User = Depends(get_current_user)
):
    """Create interviewer profile"""
    if not current_user or current_user.role != UserRole.INTERVIEWER:
        raise HTTPException(status_code=403, detail='Only interviewers can create this profile')
    
    # Check if profile already exists
    existing_profile = await db.interviewer_profiles.find_one({'user_id': current_user.id})
    if existing_profile:
        raise HTTPException(status_code=400, detail='Profile already exists')
    
    # Create profile
    profile = InterviewerProfile(
        user_id=current_user.id,
        **profile_data.model_dump()
    )
    
    await db.interviewer_profiles.insert_one(profile.model_dump())
    
    return {'message': 'Profile created successfully', 'profile': profile}

@router.get('/interviewer/profile')
async def get_interviewer_profile(current_user: User = Depends(get_current_user)):
    """Get current user's interviewer profile"""
    if not current_user:
        raise HTTPException(status_code=401, detail='Not authenticated')
    
    profile_data = await db.interviewer_profiles.find_one({'user_id': current_user.id})
    
    if not profile_data:
        raise HTTPException(status_code=404, detail='Profile not found')
    
    return InterviewerProfile(**profile_data)

@router.put('/interviewer/profile')
async def update_interviewer_profile(
    profile_data: InterviewerProfileUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update interviewer profile"""
    if not current_user or current_user.role != UserRole.INTERVIEWER:
        raise HTTPException(status_code=403, detail='Only interviewers can update this profile')
    
    existing_profile = await db.interviewer_profiles.find_one({'user_id': current_user.id})
    if not existing_profile:
        raise HTTPException(status_code=404, detail='Profile not found')
    
    # Update only provided fields
    update_data = {k: v for k, v in profile_data.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.utcnow()
    
    await db.interviewer_profiles.update_one(
        {'user_id': current_user.id},
        {'$set': update_data}
    )
    
    return {'message': 'Profile updated successfully'}

# ==================== Company Auto-suggest ====================

@router.get('/companies/suggest')
async def suggest_companies(query: str):
    """Auto-suggest company names"""
    if not query or len(query) < 2:
        return {'companies': []}
    
    # Search companies with regex (case-insensitive)
    companies = await db.companies.find(
        {'name': {'$regex': f'^{query}', '$options': 'i'}},
        {'_id': 0}
    ).sort('display_order', 1).limit(10).to_list(10)
    
    return {'companies': [Company(**c) for c in companies]}

@router.post('/companies')
async def create_company(company_data: CompanyCreate, current_user: User = Depends(get_current_user)):
    """Create a new company (admin only)"""
    if not current_user or current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail='Only admins can create companies')
    
    # Check if company already exists
    existing = await db.companies.find_one({'name': company_data.name})
    if existing:
        raise HTTPException(status_code=400, detail='Company already exists')
    
    company = Company(**company_data.model_dump())
    await db.companies.insert_one(company.model_dump())
    
    return {'message': 'Company created successfully', 'company': company}

# ==================== Job Seeker Search (Employer Feature) ====================

@router.get('/jobseeker/search')
async def search_jobseekers(
    query: Optional[str] = None,
    location: Optional[str] = None,
    experience_min: Optional[int] = None,
    experience_max: Optional[int] = None,
    skills: Optional[str] = None,
    verified_only: Optional[bool] = False,
    sort_by: str = 'relevance',
    page: int = 1,
    limit: int = 20,
    current_user: User = Depends(get_current_user)
):
    """Search job seekers (employer only)"""
    if not current_user or current_user.role != UserRole.EMPLOYER:
        raise HTTPException(status_code=403, detail='Only employers can search talent')
    
    # Build search filters
    filters = {}
    
    if query:
        # Search in name, position, company
        filters['$or'] = [
            {'first_name': {'$regex': query, '$options': 'i'}},
            {'last_name': {'$regex': query, '$options': 'i'}},
            {'current_position': {'$regex': query, '$options': 'i'}},
            {'current_company': {'$regex': query, '$options': 'i'}},
        ]
    
    if location:
        filters['location'] = {'$regex': location, '$options': 'i'}
    
    if experience_min is not None or experience_max is not None:
        filters['experience_years'] = {}
        if experience_min is not None:
            filters['experience_years']['$gte'] = experience_min
        if experience_max is not None:
            filters['experience_years']['$lte'] = experience_max
    
    if skills:
        skill_list = [s.strip() for s in skills.split(',')]
        filters['primary_skills'] = {'$in': skill_list}
    
    if verified_only:
        filters['verification_status'] = 'verified'
    
    # Sorting
    sort_options = {
        'relevance': [('overall_rating', -1), ('verification_count', -1)],
        'experience': [('experience_years', -1)],
        'recent': [('updated_at', -1)]
    }
    sort = sort_options.get(sort_by, sort_options['relevance'])
    
    # Pagination
    skip = (page - 1) * limit
    
    # Execute query
    profiles_cursor = db.jobseeker_profiles.find(filters, {'_id': 0}).sort(sort).skip(skip).limit(limit)
    profiles = await profiles_cursor.to_list(limit)
    
    # Get user emails for each profile
    for profile in profiles:
        user = await db.users.find_one({'id': profile['user_id']}, {'_id': 0, 'email': 1})
        if user:
            profile['email'] = user['email']
    
    total = await db.jobseeker_profiles.count_documents(filters)
    
    return {
        'profiles': profiles,
        'total': total,
        'page': page,
        'limit': limit,
        'pages': (total + limit - 1) // limit
    }

# ==================== Job Seeker Settings ====================

@router.get('/jobseeker/settings')
async def get_jobseeker_settings(current_user: User = Depends(get_current_user)):
    """Get job seeker settings"""
    if not current_user or current_user.role != UserRole.JOB_SEEKER:
        raise HTTPException(status_code=403, detail='Only job seekers can access settings')
    
    profile_data = await db.jobseeker_profiles.find_one({'user_id': current_user.id}, {'_id': 0})
    
    if not profile_data:
        raise HTTPException(status_code=404, detail='Profile not found')
    
    # Return only settings-related fields
    settings = {
        'expected_salary': profile_data.get('expected_salary'),
        'current_salary': profile_data.get('current_salary'),
        'notice_period': profile_data.get('notice_period'),
        'preferred_locations': profile_data.get('preferred_locations', []),
        'preferred_positions': profile_data.get('preferred_positions', []),
        'job_search_status': profile_data.get('job_search_status', 'actively_looking'),
        'willing_to_relocate': profile_data.get('willing_to_relocate', False),
    }
    
    return settings

@router.put('/jobseeker/settings')
async def update_jobseeker_settings(
    settings_data: dict,
    current_user: User = Depends(get_current_user)
):
    """Update job seeker settings"""
    if not current_user or current_user.role != UserRole.JOB_SEEKER:
        raise HTTPException(status_code=403, detail='Only job seekers can update settings')
    
    existing_profile = await db.jobseeker_profiles.find_one({'user_id': current_user.id})
    if not existing_profile:
        raise HTTPException(status_code=404, detail='Profile not found')
    
    # Only update allowed settings fields
    allowed_fields = [
        'expected_salary', 'current_salary', 'notice_period',
        'preferred_locations', 'preferred_positions',
        'job_search_status', 'willing_to_relocate'
    ]
    
    update_data = {k: v for k, v in settings_data.items() if k in allowed_fields and v is not None}
    update_data['updated_at'] = datetime.utcnow()
    
    await db.jobseeker_profiles.update_one(
        {'user_id': current_user.id},
        {'$set': update_data}
    )
    
    return {'message': 'Settings updated successfully'}

# ==================== ATS Ranking ====================

@router.post('/ats/rank-candidate')
async def rank_candidate_for_job(
    data: dict,
    current_user: User = Depends(get_current_user)
):
    """
    Calculate ATS ranking for a candidate against a job
    Requires: job_id, candidate_id (or uses current user if job seeker)
    """
    from utils.ats_ranking import calculate_ats_ranking
    
    job_id = data.get('job_id')
    candidate_id = data.get('candidate_id', current_user.id if current_user.role == UserRole.JOB_SEEKER else None)
    
    if not job_id:
        raise HTTPException(status_code=400, detail='job_id is required')
    
    if not candidate_id:
        raise HTTPException(status_code=400, detail='candidate_id is required')
    
    # Fetch job data
    job = await db.jobs.find_one({'id': job_id}, {'_id': 0})
    if not job:
        raise HTTPException(status_code=404, detail='Job not found')
    
    # Fetch candidate profile
    candidate = await db.jobseeker_profiles.find_one({'user_id': candidate_id}, {'_id': 0})
    if not candidate:
        raise HTTPException(status_code=404, detail='Candidate profile not found')
    
    # Calculate ATS ranking
    ranking_result = calculate_ats_ranking(job, candidate)
    
    return {
        'job_id': job_id,
        'candidate_id': candidate_id,
        'job_title': job.get('title'),
        'candidate_name': f"{candidate.get('first_name', '')} {candidate.get('last_name', '')}".strip(),
        **ranking_result
    }

@router.post('/ats/rank-multiple')
async def rank_multiple_candidates(
    data: dict,
    current_user: User = Depends(get_current_user)
):
    """
    Rank multiple candidates for a job (employer feature)
    Requires: job_id, candidate_ids (optional, if not provided ranks all applicants)
    """
    from utils.ats_ranking import calculate_ats_ranking
    
    if current_user.role != UserRole.EMPLOYER:
        raise HTTPException(status_code=403, detail='Only employers can use this feature')
    
    job_id = data.get('job_id')
    if not job_id:
        raise HTTPException(status_code=400, detail='job_id is required')
    
    # Fetch job data
    job = await db.jobs.find_one({'id': job_id}, {'_id': 0})
    if not job:
        raise HTTPException(status_code=404, detail='Job not found')
    
    # Verify job belongs to employer
    if job.get('employer_id') != current_user.id:
        raise HTTPException(status_code=403, detail='You can only rank candidates for your own jobs')
    
    # Get candidate IDs
    candidate_ids = data.get('candidate_ids', [])
    
    # If no specific candidates, get all applicants for this job
    if not candidate_ids:
        applications = await db.applications.find({'job_id': job_id}, {'_id': 0, 'jobseeker_id': 1}).to_list(1000)
        candidate_ids = [app['jobseeker_id'] for app in applications]
    
    if not candidate_ids:
        return {
            'job_id': job_id,
            'job_title': job.get('title'),
            'candidates': [],
            'message': 'No candidates to rank'
        }
    
    # Rank all candidates
    ranked_candidates = []
    for candidate_id in candidate_ids:
        candidate = await db.jobseeker_profiles.find_one({'user_id': candidate_id}, {'_id': 0})
        if candidate:
            ranking_result = calculate_ats_ranking(job, candidate)
            ranked_candidates.append({
                'candidate_id': candidate_id,
                'candidate_name': f"{candidate.get('first_name', '')} {candidate.get('last_name', '')}".strip(),
                'current_position': candidate.get('current_position'),
                'experience_years': candidate.get('experience_years'),
                **ranking_result
            })
    
    # Sort by overall score (highest first)
    ranked_candidates.sort(key=lambda x: x['overall_score'], reverse=True)
    
    return {
        'job_id': job_id,
        'job_title': job.get('title'),
        'total_candidates': len(ranked_candidates),
        'candidates': ranked_candidates
    }
