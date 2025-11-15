from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

class Skill(BaseModel):
    name: str
    years_of_experience: float
    is_primary: bool = True
    weightage: int = 0  # 0-100
    rating: Optional[float] = None  # Will be set by interviewer
    
class Experience(BaseModel):
    company: str
    position: str
    location: str
    start_date: str
    end_date: Optional[str] = None  # None means current
    description: Optional[str] = None
    is_current: bool = False

class Education(BaseModel):
    institution: str
    degree: str
    field_of_study: str
    start_year: int
    end_year: Optional[int] = None
    grade: Optional[str] = None

class Project(BaseModel):
    name: str
    description: Optional[str] = None
    technologies: List[str] = []
    url: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class ProfileTheme(BaseModel):
    template: str = "modern"  # modern, professional, creative, minimal
    primary_color: str = "#2563eb"  # blue
    secondary_color: str = "#10b981"  # green
    font_family: str = "Inter"  # Inter, Roboto, Poppins, Merriweather

class JobSeekerProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    profile_image_url: Optional[str] = None
    full_name: str
    headline: Optional[str] = None
    professional_summary: Optional[str] = None
    about: Optional[str] = None
    location: str
    skills: List[Skill] = []
    experience: List[Experience] = []
    education: List[Education] = []
    projects: List[Project] = []
    resume_url: Optional[str] = None
    resume_original_url: Optional[str] = None  # For admin access
    total_experience_years: float = 0
    expected_salary: Optional[int] = None
    notice_period_days: Optional[int] = None
    overall_rating: Optional[float] = None
    verification_count: int = 0
    is_profile_complete: bool = False
    theme: ProfileTheme = Field(default_factory=ProfileTheme)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class JobSeekerProfileCreate(BaseModel):
    full_name: str
    headline: Optional[str] = None
    about: Optional[str] = None
    location: str
    total_experience_years: float = 0
    expected_salary: Optional[int] = None
    notice_period_days: Optional[int] = None

class JobSeekerProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    headline: Optional[str] = None
    about: Optional[str] = None
    location: Optional[str] = None
    total_experience_years: Optional[float] = None
    expected_salary: Optional[int] = None
    notice_period_days: Optional[int] = None

class EmployerProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    company_name: str
    company_category: str = "unpaid"  # paid, top, featured, highlighted, unpaid, special, free, new
    company_logo_url: Optional[str] = None
    company_website: Optional[str] = None
    company_size: Optional[str] = None
    industry: Optional[str] = None
    location: str
    about: Optional[str] = None
    contact_person_name: str
    contact_person_designation: Optional[str] = None
    is_profile_complete: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class EmployerProfileCreate(BaseModel):
    company_name: str
    location: str
    contact_person_name: str
    company_website: Optional[str] = None
    company_size: Optional[str] = None
    industry: Optional[str] = None
    about: Optional[str] = None
    contact_person_designation: Optional[str] = None

class EmployerProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    location: Optional[str] = None
    contact_person_name: Optional[str] = None
    company_website: Optional[str] = None
    company_size: Optional[str] = None
    industry: Optional[str] = None
    about: Optional[str] = None
    contact_person_designation: Optional[str] = None

class InterviewerProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    full_name: str
    headline: Optional[str] = None
    location: str
    years_of_experience: float
    expertise_areas: List[str] = []  # Primary skills they can interview for
    secondary_expertise: List[str] = []
    is_certified: bool = False
    certified_by: Optional[str] = None  # user_id of certifier
    certification_date: Optional[datetime] = None
    interviews_conducted: int = 0
    average_rating: Optional[float] = None
    is_profile_complete: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class InterviewerProfileCreate(BaseModel):
    full_name: str
    headline: Optional[str] = None
    location: str
    years_of_experience: float
    expertise_areas: List[str] = []
    secondary_expertise: List[str] = []

class InterviewerProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    headline: Optional[str] = None
    location: Optional[str] = None
    years_of_experience: Optional[float] = None
    expertise_areas: Optional[List[str]] = None
    secondary_expertise: Optional[List[str]] = None

class Company(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str = "unpaid"
    display_order: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CompanyCreate(BaseModel):
    name: str
    category: str = "unpaid"
