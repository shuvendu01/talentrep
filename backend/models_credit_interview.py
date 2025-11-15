from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime, timedelta
from enum import Enum
import uuid

# ==================== Platform Settings ====================

class PlatformSettings(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    # Contact Reveal Settings
    contact_reveal_cost: int = 10000  # credits
    contact_access_duration_days: int = 365  # 1 year
    
    # Interview Settings
    interview_request_cost: int = 5000  # credits paid by job seeker
    interview_completion_earning: int = 500  # credits earned by interviewer
    interviewer_certification_cost: int = 0  # credits to become certified interviewer
    
    # Bonus Settings (per role)
    jobseeker_signup_bonus: int = 200
    employer_signup_bonus: int = 10000
    interviewer_signup_bonus: int = 500
    
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    updated_by: Optional[str] = None  # admin user id

class PlatformSettingsUpdate(BaseModel):
    contact_reveal_cost: Optional[int] = None
    contact_access_duration_days: Optional[int] = None
    interview_request_cost: Optional[int] = None
    interview_completion_earning: Optional[int] = None
    interviewer_certification_cost: Optional[int] = None
    jobseeker_signup_bonus: Optional[int] = None
    employer_signup_bonus: Optional[int] = None
    interviewer_signup_bonus: Optional[int] = None


# ==================== Contact Reveal System ====================

class ContactAccess(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    employer_id: str  # who purchased access
    jobseeker_id: str  # whose contact was revealed
    credits_spent: int
    access_granted_at: datetime = Field(default_factory=datetime.utcnow)
    access_expires_at: datetime  # 1 year from granted
    is_active: bool = True
    
    # Revealed information (cached for quick access)
    revealed_email: str
    revealed_phone: Optional[str]
    revealed_current_company: Optional[str]

class ContactAccessCreate(BaseModel):
    jobseeker_id: str


# ==================== Interview Verification System ====================

class InterviewRequestStatus(str, Enum):
    PENDING = "pending"  # waiting for interviewer to accept
    ASSIGNED = "assigned"  # interviewer assigned/accepted
    SCHEDULED = "scheduled"  # interview scheduled
    COMPLETED = "completed"  # interview done, ratings submitted
    CANCELLED = "cancelled"
    EXPIRED = "expired"

class InterviewRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    jobseeker_id: str
    jobseeker_email: str
    jobseeker_name: Optional[str]
    
    # Skills to be verified (from jobseeker's primary skills)
    skills_to_verify: List[str]
    
    # Request details
    status: InterviewRequestStatus = InterviewRequestStatus.PENDING
    credits_paid: int
    
    # Interviewer assignment
    interviewer_id: Optional[str] = None
    interviewer_email: Optional[str] = None
    assigned_at: Optional[datetime] = None
    assigned_by: Optional[str] = None  # admin user id if manually assigned
    
    # Notified interviewers (for tracking who was contacted)
    notified_interviewers: List[str] = []
    
    # Interview details
    scheduled_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    interview_duration_minutes: int = 60
    
    # Notes
    jobseeker_notes: Optional[str] = None
    admin_notes: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class InterviewRequestCreate(BaseModel):
    skills_to_verify: List[str]
    jobseeker_notes: Optional[str] = None

class InterviewRequestUpdate(BaseModel):
    status: Optional[InterviewRequestStatus] = None
    interviewer_id: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    admin_notes: Optional[str] = None


class SkillRating(BaseModel):
    skill_name: str
    rating: float  # 0.5 to 5.0 in increments of 0.5
    years_of_experience: Optional[float] = None
    interviewer_notes: Optional[str] = None

class InterviewRating(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    interview_request_id: str
    jobseeker_id: str
    interviewer_id: str
    
    # Overall rating
    overall_rating: float  # Average of all skill ratings
    
    # Skill-specific ratings
    skill_ratings: List[SkillRating]
    
    # Interview feedback
    strengths: Optional[str] = None
    areas_for_improvement: Optional[str] = None
    general_feedback: Optional[str] = None
    recommendation: Optional[str] = None  # hire, maybe, no hire
    
    # Verification badge
    verified: bool = True
    verification_date: datetime = Field(default_factory=datetime.utcnow)
    
    # Earnings
    interviewer_credits_earned: int
    
    created_at: datetime = Field(default_factory=datetime.utcnow)

class InterviewRatingCreate(BaseModel):
    interview_request_id: str
    skill_ratings: List[SkillRating]
    strengths: Optional[str] = None
    areas_for_improvement: Optional[str] = None
    general_feedback: Optional[str] = None
    recommendation: Optional[str] = None


# ==================== Enhanced Credit Transaction ====================

class TransactionType(str, Enum):
    EARN = "earn"
    SPEND = "spend"
    BONUS = "bonus"
    ADMIN_ADD = "admin_add"
    ADMIN_DEDUCT = "admin_deduct"

class TransactionCategory(str, Enum):
    SIGNUP_BONUS = "signup_bonus"
    INTERVIEW_COMPLETION = "interview_completion"
    CONTACT_REVEAL = "contact_reveal"
    INTERVIEW_REQUEST = "interview_request"
    INTERVIEWER_CERTIFICATION = "interviewer_certification"
    ADMIN_ADJUSTMENT = "admin_adjustment"
    REFERRAL_BONUS = "referral_bonus"
    DAILY_LOGIN = "daily_login"
    SESSION_TIME = "session_time"

class CreditTransactionExtended(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    amount: int  # positive for earn, negative for spend
    transaction_type: TransactionType
    category: TransactionCategory
    description: str
    
    # Reference IDs for tracking
    reference_id: Optional[str] = None  # job_id, interview_id, contact_access_id, etc.
    reference_type: Optional[str] = None  # job, interview, contact_access, etc.
    
    # Balance after transaction
    balance_free: int
    balance_paid: int
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None  # admin user id if admin action


# ==================== Interviewer Certification ====================

class InterviewerCertification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    interviewer_id: str
    is_certified: bool = False
    certification_date: Optional[datetime] = None
    credits_paid: int = 0
    
    # Stats
    total_interviews_conducted: int = 0
    total_credits_earned: int = 0
    average_rating: Optional[float] = None  # based on feedback from job seekers
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ==================== Notification Banner ====================

class NotificationBanner(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    message: str
    banner_type: str  # public, jobseeker, employer, interviewer, user_specific
    is_active: bool = True
    priority: int = 1  # higher priority shows first
    
    # Date range for display (optional)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    
    # User-specific notification
    target_user_id: Optional[str] = None  # if set, only this user sees it
    
    # Display settings
    show_icon: bool = True
    bg_color: Optional[str] = None  # hex color
    text_color: Optional[str] = None
    icon_name: Optional[str] = None  # lucide icon name
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str  # admin user id

class NotificationBannerCreate(BaseModel):
    title: str
    message: str
    banner_type: str
    is_active: bool = True
    priority: int = 1
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    target_user_id: Optional[str] = None
    show_icon: bool = True
    bg_color: Optional[str] = None
    text_color: Optional[str] = None
    icon_name: Optional[str] = None

class NotificationBannerUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    is_active: Optional[bool] = None
    priority: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    show_icon: Optional[bool] = None
    bg_color: Optional[str] = None
    text_color: Optional[str] = None
    icon_name: Optional[str] = None


# ==================== Custom CSS/JS ====================

class CustomCode(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code_type: str  # css or js
    code_content: str
    is_active: bool = True
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str  # admin user id

class CustomCodeCreate(BaseModel):
    code_type: str
    code_content: str
    is_active: bool = True
    description: Optional[str] = None

class CustomCodeUpdate(BaseModel):
    code_content: Optional[str] = None
    is_active: Optional[bool] = None
    description: Optional[str] = None


# ==================== User Credit Donation ====================

class CreditDonation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    amount: int
    donated_by: str  # admin user id
    reason: Optional[str] = None
    notification_sent: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CreditDonationCreate(BaseModel):
    user_id: str
    amount: int
    reason: Optional[str] = None
    send_notification: bool = True
