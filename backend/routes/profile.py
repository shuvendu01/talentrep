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
