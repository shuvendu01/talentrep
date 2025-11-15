from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum
import uuid

class UserRole(str, Enum):
    JOB_SEEKER = "jobseeker"
    EMPLOYER = "employer"
    INTERVIEWER = "interviewer"
    ADMIN = "admin"

class CreditType(str, Enum):
    FREE = "free"
    PAID = "paid"

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    phone: Optional[str] = None
    role: UserRole
    is_verified: bool = False
    is_active: bool = True
    credits_free: int = 0
    credits_paid: int = 0
    magic_link_token: Optional[str] = None
    magic_link_created_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None

class UserCreate(BaseModel):
    email: EmailStr
    phone: Optional[str] = None
    role: UserRole

class MagicLinkRequest(BaseModel):
    email: EmailStr

class CreditTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    amount: int
    credit_type: CreditType
    transaction_type: str  # earn, spend, bonus
    description: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BonusConfig(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: UserRole
    signup_bonus: int = 0
    referral_bonus: int = 0
    daily_login_bonus: int = 0
    session_time_bonus: int = 0
    session_time_threshold: int = 3600  # in seconds
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ACLPermission(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: UserRole
    resource: str  # e.g., 'jobs', 'profiles', 'credits'
    action: str  # e.g., 'create', 'read', 'update', 'delete'
    allowed: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
