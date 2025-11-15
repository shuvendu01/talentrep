from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

class JobType(str):
    FULL_TIME = "full-time"
    PART_TIME = "part-time"
    CONTRACT = "contract"
    INTERNSHIP = "internship"
    REMOTE = "remote"

class JobStatus(str):
    ACTIVE = "active"
    CLOSED = "closed"
    DRAFT = "draft"

class Job(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    employer_id: str
    company_name: str
    job_title: str
    job_type: str  # full-time, part-time, contract, internship, remote
    location: str
    work_mode: str = "onsite"  # onsite, remote, hybrid
    description: str
    responsibilities: List[str] = []
    requirements: List[str] = []
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    min_experience: float = 0
    max_experience: Optional[float] = None
    min_salary: Optional[int] = None
    max_salary: Optional[int] = None
    number_of_openings: int = 1
    status: str = "active"  # active, closed, draft
    applications_count: int = 0
    views_count: int = 0
    freshness_days: int = 0  # calculated from created_at
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None

class JobCreate(BaseModel):
    job_title: str
    job_type: str
    location: str
    work_mode: str = "onsite"
    description: str
    responsibilities: List[str] = []
    requirements: List[str] = []
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    min_experience: float = 0
    max_experience: Optional[float] = None
    min_salary: Optional[int] = None
    max_salary: Optional[int] = None
    number_of_openings: int = 1
    status: str = "active"

class JobUpdate(BaseModel):
    job_title: Optional[str] = None
    job_type: Optional[str] = None
    location: Optional[str] = None
    work_mode: Optional[str] = None
    description: Optional[str] = None
    responsibilities: Optional[List[str]] = None
    requirements: Optional[List[str]] = None
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None
    min_experience: Optional[float] = None
    max_experience: Optional[float] = None
    min_salary: Optional[int] = None
    max_salary: Optional[int] = None
    number_of_openings: Optional[int] = None
    status: Optional[str] = None

class JobApplication(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    job_id: str
    job_seeker_id: str
    employer_id: str
    status: str = "pending"  # pending, shortlisted, interviewed, rejected, hired
    cover_letter: Optional[str] = None
    applied_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    notes: Optional[str] = None  # Employer notes

class JobApplicationCreate(BaseModel):
    job_id: str
    cover_letter: Optional[str] = None

class JobApplicationUpdate(BaseModel):
    status: str
    notes: Optional[str] = None
