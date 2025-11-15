from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from datetime import datetime, timedelta

from models import User, UserRole
from models_job import Job, JobCreate, JobUpdate, JobApplication, JobApplicationCreate, JobApplicationUpdate
from routes.auth import get_current_user

router = APIRouter()

# Database will be injected from main server
db = None

# ==================== Job CRUD ====================

@router.post('/jobs')
async def create_job(
    job_data: JobCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new job posting (Employers only)"""
    if not current_user or current_user.role != UserRole.EMPLOYER:
        raise HTTPException(status_code=403, detail='Only employers can post jobs')
    
    # Get employer profile for company name
    employer_profile = await db.employer_profiles.find_one({'user_id': current_user.id})
    if not employer_profile:
        raise HTTPException(status_code=400, detail='Please complete your company profile first')
    
    # Create job
    import uuid
    job = Job(
        id=str(uuid.uuid4()),
        employer_id=current_user.id,
        company_name=employer_profile['company_name'],
        **job_data.model_dump()
    )
    
    await db.jobs.insert_one(job.model_dump())
    
    return {'message': 'Job posted successfully', 'job': job}

@router.get('/jobs/{job_id}')
async def get_job(job_id: str):
    """Get job details by ID"""
    job_data = await db.jobs.find_one({'id': job_id})
    
    if not job_data:
        raise HTTPException(status_code=404, detail='Job not found')
    
    # Increment view count
    await db.jobs.update_one(
        {'id': job_id},
        {'$inc': {'views_count': 1}}
    )
    
    # Calculate freshness
    created_at = job_data['created_at']
    freshness_days = (datetime.utcnow() - created_at).days
    job_data['freshness_days'] = freshness_days
    
    return Job(**job_data)

@router.get('/jobs')
async def search_jobs(
    query: Optional[str] = None,
    location: Optional[str] = None,
    job_type: Optional[str] = None,
    work_mode: Optional[str] = None,
    min_experience: Optional[float] = None,
    max_experience: Optional[float] = None,
    min_salary: Optional[int] = None,
    skills: Optional[str] = None,  # comma-separated
    company: Optional[str] = None,
    freshness: Optional[int] = None,  # days
    sort_by: str = "created_at",  # created_at, salary, relevance
    page: int = 1,
    limit: int = 20
):
    """Search and filter jobs"""
    
    # Build query
    filter_query = {'status': 'active'}
    
    # Text search on title and description
    if query:
        filter_query['$or'] = [
            {'job_title': {'$regex': query, '$options': 'i'}},
            {'description': {'$regex': query, '$options': 'i'}},
        ]
    
    # Location filter
    if location:
        filter_query['location'] = {'$regex': location, '$options': 'i'}
    
    # Job type filter
    if job_type:
        filter_query['job_type'] = job_type
    
    # Work mode filter
    if work_mode:
        filter_query['work_mode'] = work_mode
    
    # Experience filter
    if min_experience is not None:
        filter_query['min_experience'] = {'$lte': min_experience}
    if max_experience is not None:
        filter_query['max_experience'] = {'$gte': max_experience}
    
    # Salary filter
    if min_salary:
        filter_query['min_salary'] = {'$gte': min_salary}
    
    # Skills filter
    if skills:
        skill_list = [s.strip() for s in skills.split(',')]
        filter_query['required_skills'] = {'$in': skill_list}
    
    # Company filter
    if company:
        filter_query['company_name'] = {'$regex': company, '$options': 'i'}
    
    # Freshness filter
    if freshness:
        cutoff_date = datetime.utcnow() - timedelta(days=freshness)
        filter_query['created_at'] = {'$gte': cutoff_date}
    
    # Get total count
    total = await db.jobs.count_documents(filter_query)
    
    # Sort
    sort_field = sort_by if sort_by in ['created_at', 'min_salary'] else 'created_at'
    sort_order = -1  # descending
    
    # Pagination
    skip = (page - 1) * limit
    
    # Execute query
    jobs_cursor = db.jobs.find(filter_query).sort(sort_field, sort_order).skip(skip).limit(limit)
    jobs = await jobs_cursor.to_list(length=limit)
    
    # Calculate freshness for each job
    for job in jobs:
        created_at = job['created_at']
        freshness_days = (datetime.utcnow() - created_at).days
        job['freshness_days'] = freshness_days
    
    return {
        'jobs': [Job(**job) for job in jobs],
        'total': total,
        'page': page,
        'limit': limit,
        'pages': (total + limit - 1) // limit
    }

@router.put('/jobs/{job_id}')
async def update_job(
    job_id: str,
    job_data: JobUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update job posting (Employers only, own jobs)"""
    if not current_user or current_user.role != UserRole.EMPLOYER:
        raise HTTPException(status_code=403, detail='Only employers can update jobs')
    
    # Check if job exists and belongs to employer
    existing_job = await db.jobs.find_one({'id': job_id, 'employer_id': current_user.id})
    if not existing_job:
        raise HTTPException(status_code=404, detail='Job not found or unauthorized')
    
    # Update job
    update_data = {k: v for k, v in job_data.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.utcnow()
    
    await db.jobs.update_one(
        {'id': job_id},
        {'$set': update_data}
    )
    
    return {'message': 'Job updated successfully'}

@router.delete('/jobs/{job_id}')
async def delete_job(
    job_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete job posting (Employers only, own jobs)"""
    if not current_user or current_user.role != UserRole.EMPLOYER:
        raise HTTPException(status_code=403, detail='Only employers can delete jobs')
    
    # Check if job exists and belongs to employer
    existing_job = await db.jobs.find_one({'id': job_id, 'employer_id': current_user.id})
    if not existing_job:
        raise HTTPException(status_code=404, detail='Job not found or unauthorized')
    
    # Delete job
    await db.jobs.delete_one({'id': job_id})
    
    return {'message': 'Job deleted successfully'}

@router.get('/my-jobs')
async def get_my_jobs(
    current_user: User = Depends(get_current_user)
):
    """Get all jobs posted by current employer"""
    if not current_user or current_user.role != UserRole.EMPLOYER:
        raise HTTPException(status_code=403, detail='Only employers can view their jobs')
    
    jobs = await db.jobs.find({'employer_id': current_user.id}).sort('created_at', -1).to_list(100)
    
    # Calculate freshness for each job
    for job in jobs:
        created_at = job['created_at']
        freshness_days = (datetime.utcnow() - created_at).days
        job['freshness_days'] = freshness_days
    
    return [Job(**job) for job in jobs]

# ==================== Job Applications ====================

@router.post('/applications')
async def apply_for_job(
    application_data: JobApplicationCreate,
    current_user: User = Depends(get_current_user)
):
    """Apply for a job (Job Seekers only)"""
    if not current_user or current_user.role != UserRole.JOB_SEEKER:
        raise HTTPException(status_code=403, detail='Only job seekers can apply for jobs')
    
    # Check if job exists
    job = await db.jobs.find_one({'id': application_data.job_id, 'status': 'active'})
    if not job:
        raise HTTPException(status_code=404, detail='Job not found or no longer active')
    
    # Check if already applied
    existing_application = await db.job_applications.find_one({
        'job_id': application_data.job_id,
        'job_seeker_id': current_user.id
    })
    if existing_application:
        raise HTTPException(status_code=400, detail='You have already applied for this job')
    
    # Create application
    import uuid
    application = JobApplication(
        id=str(uuid.uuid4()),
        job_id=application_data.job_id,
        job_seeker_id=current_user.id,
        employer_id=job['employer_id'],
        cover_letter=application_data.cover_letter
    )
    
    await db.job_applications.insert_one(application.model_dump())
    
    # Increment applications count
    await db.jobs.update_one(
        {'id': application_data.job_id},
        {'$inc': {'applications_count': 1}}
    )
    
    return {'message': 'Application submitted successfully', 'application': application}

@router.get('/applications/my-applications')
async def get_my_applications(
    current_user: User = Depends(get_current_user)
):
    """Get all applications submitted by current job seeker"""
    if not current_user or current_user.role != UserRole.JOB_SEEKER:
        raise HTTPException(status_code=403, detail='Only job seekers can view their applications')
    
    applications = await db.job_applications.find({'job_seeker_id': current_user.id}).sort('applied_at', -1).to_list(100)
    
    # Enrich with job details
    for app in applications:
        job = await db.jobs.find_one({'id': app['job_id']})
        if job:
            app['job_title'] = job['job_title']
            app['company_name'] = job['company_name']
            app['location'] = job['location']
    
    return [JobApplication(**app) for app in applications]

@router.get('/applications/job/{job_id}')
async def get_job_applications(
    job_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get all applications for a specific job (Employers only, own jobs)"""
    if not current_user or current_user.role != UserRole.EMPLOYER:
        raise HTTPException(status_code=403, detail='Only employers can view job applications')
    
    # Check if job belongs to employer
    job = await db.jobs.find_one({'id': job_id, 'employer_id': current_user.id})
    if not job:
        raise HTTPException(status_code=404, detail='Job not found or unauthorized')
    
    applications = await db.job_applications.find({'job_id': job_id}).sort('applied_at', -1).to_list(100)
    
    # Enrich with job seeker details
    for app in applications:
        profile = await db.jobseeker_profiles.find_one({'user_id': app['job_seeker_id']})
        if profile:
            app['applicant_name'] = profile.get('full_name', 'N/A')
            app['applicant_headline'] = profile.get('headline', '')
            app['applicant_location'] = profile.get('location', '')
            app['applicant_experience'] = profile.get('total_experience_years', 0)
    
    return [JobApplication(**app) for app in applications]

@router.put('/applications/{application_id}')
async def update_application_status(
    application_id: str,
    update_data: JobApplicationUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update application status (Employers only)"""
    if not current_user or current_user.role != UserRole.EMPLOYER:
        raise HTTPException(status_code=403, detail='Only employers can update applications')
    
    # Check if application exists and belongs to employer
    application = await db.job_applications.find_one({
        'id': application_id,
        'employer_id': current_user.id
    })
    if not application:
        raise HTTPException(status_code=404, detail='Application not found or unauthorized')
    
    # Update application
    update_dict = update_data.model_dump()
    update_dict['updated_at'] = datetime.utcnow()
    
    await db.job_applications.update_one(
        {'id': application_id},
        {'$set': update_dict}
    )
    
    return {'message': 'Application updated successfully'}
