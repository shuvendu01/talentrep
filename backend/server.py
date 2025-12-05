from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone
from middleware import APIKeyMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Import routes after setting up database
from routes import auth, profile, jobs, credits, contact_reveal, interviews, admin, sessions
# Inject database connection into route modules
auth.db = db
profile.db = db
jobs.db = db
credits.db = db
contact_reveal.db = db
interviews.db = db
admin.db = db
sessions.db = db

# Create the main app without a prefix
app = FastAPI(
    title="TalentHub API",
    version="1.0.0",
    description="""
## TalentHub - Professional Job Portal API

A comprehensive job portal platform with AI-powered candidate ranking, skill verification system, and credit-based economy.

### Features:
* 🔐 **Multi-role Authentication** - Job Seekers, Employers, Interviewers, Admin
* 👤 **Profile Management** - Resume upload, skill verification, company profiles
* 💼 **Job System** - Post jobs, search, apply, manage applications
* 💰 **Credit Economy** - Signup bonuses, credit transactions, purchase credits
* 📞 **Contact Reveal** - Employers can reveal candidate contacts (12,000 credits)
* ⭐ **Interview Verification** - Skill verification through interviews (6,000 credits)
* 🤖 **ATS Ranking** - AI-powered candidate matching algorithm
* 👨‍💼 **Admin Panel** - User management, platform settings, ACL system

### Authentication:
All API requests require two headers:
1. **API Key** (Required for ALL requests):
```
X-API-Key: your-api-key-here
```

2. **JWT Token** (Required for protected routes):
```
Authorization: Bearer <your_jwt_token>
```

To get JWT token, call `POST /api/auth/login` with email and password.

### Base URLs:
- **Development:** `http://localhost:8001/api`
- **Production:** `https://talenthubapi.bisgensolutions.com/api`

### Frontend URL:
- **Production:** `https://talenthub.bisgensolutions.com`
    """,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    contact={
        "name": "TalentHub Support",
        "url": "https://talenthub.bisgensolutions.com",
        "email": "contact@bisgensolutions.com"
    },
    license_info={
        "name": "Proprietary",
    }
)

# Add CORS middleware FIRST
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],  # Allow all origins for development
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add API Key middleware (after CORS, before routes)
# Note: API key validation is optional in development (when API_KEY env is not set)
app.add_middleware(
    APIKeyMiddleware,
    excluded_paths=[
        "/api/docs",
        "/api/redoc", 
        "/api/openapi.json",
        "/docs",
        "/redoc",
        "/openapi.json"
    ]
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "TalentHub API v1.0"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Include auth routes
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# Include profile routes
api_router.include_router(profile.router, prefix="/profiles", tags=["Profiles"])

# Include job routes
api_router.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])

# Include credit routes
api_router.include_router(credits.router, prefix="/credits", tags=["Credits"])

# Include contact reveal routes
api_router.include_router(contact_reveal.router, prefix="/contacts", tags=["Contact Reveal"])

# Include interview routes
api_router.include_router(interviews.router, prefix="/interviews", tags=["Interviews"])

# Include admin routes
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])

# Include session management routes
api_router.include_router(sessions.router, prefix="/sessions", tags=["Session Management"])

# Include the router in the main app
app.include_router(api_router)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()