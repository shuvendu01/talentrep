"""
Authentication Models for TalentHub
Includes Session Management and Login History
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

class DeviceInfo(BaseModel):
    """Device information for session tracking"""
    device_type: str = Field(..., description="mobile_app, mobile_browser, desktop_browser")
    device_name: Optional[str] = Field(None, description="Device name/model")
    browser: Optional[str] = Field(None, description="Browser name and version")
    os: Optional[str] = Field(None, description="Operating system")
    ip_address: Optional[str] = Field(None, description="IP address")
    user_agent: Optional[str] = Field(None, description="Full user agent string")

class UserSession(BaseModel):
    """User session for multi-device support"""
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    device_info: DeviceInfo
    token: str  # JWT token
    refresh_token: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_accessed: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    is_active: bool = True
    ip_address: Optional[str] = None
    location: Optional[str] = None  # City, Country based on IP

class LoginHistory(BaseModel):
    """Login history for audit trail"""
    history_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    email: str
    role: str
    login_time: datetime = Field(default_factory=datetime.utcnow)
    logout_time: Optional[datetime] = None
    session_duration: Optional[int] = None  # in seconds
    device_info: DeviceInfo
    ip_address: Optional[str] = None
    location: Optional[str] = None
    status: str = Field(default="success", description="success, failed, expired, logged_out")
    failure_reason: Optional[str] = None
    session_id: Optional[str] = None

class LoginHistoryResponse(BaseModel):
    """Response model for login history"""
    total: int
    page: int
    limit: int
    history: List[LoginHistory]

class ActiveSessionsResponse(BaseModel):
    """Response model for active sessions"""
    total: int
    sessions: List[UserSession]

class SessionLogoutRequest(BaseModel):
    """Request to logout specific session"""
    session_id: str

class LoginRequest(BaseModel):
    """Enhanced login request with device info"""
    email: str
    password: str
    device_info: DeviceInfo

class TokenResponse(BaseModel):
    """Enhanced token response with session info"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    session_id: str
    expires_in: int  # seconds
    user: dict
