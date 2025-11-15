#!/usr/bin/env python3
"""
Backend API Testing for TalentHub - Iteration 4 Credit System
Tests all credit system, contact reveal, and interview verification endpoints.
"""

import requests
import json
import uuid
from datetime import datetime, timedelta
import os
import sys
import csv
import io

# Get backend URL from frontend .env file
BACKEND_URL = "https://careerlink-52.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def log_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.ENDC}")

def log_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.ENDC}")

def log_warning(message):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.ENDC}")

def log_info(message):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.ENDC}")

class CreditSystemTester:
    def __init__(self):
        self.admin_token = None
        self.employer_token = None
        self.job_seeker_token = None
        self.interviewer_token = None
        self.admin_user_id = None
        self.employer_user_id = None
        self.job_seeker_user_id = None
        self.interviewer_user_id = None
        self.test_interview_request_id = None
        
    def create_test_users(self):
        """Create test users for all roles"""
        log_info("Creating test users...")
        
        # Create admin user
        admin_data = {
            "email": f"admin_{uuid.uuid4().hex[:8]}@test.com",
            "password": "AdminPassword123!",
            "role": "admin"
        }
        
        response = requests.post(f"{API_BASE}/auth/register", json=admin_data)
        if response.status_code == 200:
            log_success("Admin account created")
            login_response = requests.post(f"{API_BASE}/auth/login", json={
                "email": admin_data["email"],
                "password": admin_data["password"]
            })
            if login_response.status_code == 200:
                self.admin_token = login_response.json()["access_token"]
                self.admin_user_id = login_response.json()["user"]["id"]
                log_success("Admin logged in successfully")
            else:
                log_error(f"Admin login failed: {login_response.text}")
                return False
        else:
            log_error(f"Admin registration failed: {response.text}")
            return False
        
        # Create employer
        employer_data = {
            "email": f"employer_{uuid.uuid4().hex[:8]}@test.com",
            "password": "EmployerPassword123!",
            "role": "employer"
        }
        
        response = requests.post(f"{API_BASE}/auth/register", json=employer_data)
        if response.status_code == 200:
            log_success("Employer account created")
            login_response = requests.post(f"{API_BASE}/auth/login", json={
                "email": employer_data["email"],
                "password": employer_data["password"]
            })
            if login_response.status_code == 200:
                self.employer_token = login_response.json()["access_token"]
                self.employer_user_id = login_response.json()["user"]["id"]
                log_success("Employer logged in successfully")
            else:
                log_error(f"Employer login failed: {login_response.text}")
                return False
        else:
            log_error(f"Employer registration failed: {response.text}")
            return False
            
        # Create job seeker
        job_seeker_data = {
            "email": f"jobseeker_{uuid.uuid4().hex[:8]}@test.com",
            "password": "JobSeekerPassword123!",
            "role": "jobseeker"
        }
        
        response = requests.post(f"{API_BASE}/auth/register", json=job_seeker_data)
        if response.status_code == 200:
            log_success("Job seeker account created")
            login_response = requests.post(f"{API_BASE}/auth/login", json={
                "email": job_seeker_data["email"],
                "password": job_seeker_data["password"]
            })
            if login_response.status_code == 200:
                self.job_seeker_token = login_response.json()["access_token"]
                self.job_seeker_user_id = login_response.json()["user"]["id"]
                log_success("Job seeker logged in successfully")
            else:
                log_error(f"Job seeker login failed: {login_response.text}")
                return False
        else:
            log_error(f"Job seeker registration failed: {response.text}")
            return False
        
        # Create interviewer
        interviewer_data = {
            "email": f"interviewer_{uuid.uuid4().hex[:8]}@test.com",
            "password": "InterviewerPassword123!",
            "role": "interviewer"
        }
        
        response = requests.post(f"{API_BASE}/auth/register", json=interviewer_data)
        if response.status_code == 200:
            log_success("Interviewer account created")
            login_response = requests.post(f"{API_BASE}/auth/login", json={
                "email": interviewer_data["email"],
                "password": interviewer_data["password"]
            })
            if login_response.status_code == 200:
                self.interviewer_token = login_response.json()["access_token"]
                self.interviewer_user_id = login_response.json()["user"]["id"]
                log_success("Interviewer logged in successfully")
            else:
                log_error(f"Interviewer login failed: {login_response.text}")
                return False
        else:
            log_error(f"Interviewer registration failed: {response.text}")
            return False
            
        return True
    
    def create_test_profiles(self):
        """Create profiles for test users"""
        log_info("Creating test profiles...")
        
        # Create employer profile
        employer_profile_data = {
            "company_name": "TechCorp Solutions",
            "contact_person_name": "Sarah Johnson",
            "contact_person_designation": "HR Manager",
            "industry": "Technology",
            "company_size": "51-200",
            "company_website": "https://techcorp.com",
            "location": "San Francisco, CA",
            "about": "Leading technology solutions provider"
        }
        
        headers = {"Authorization": f"Bearer {self.employer_token}"}
        response = requests.post(f"{API_BASE}/profiles/employer/profile", json=employer_profile_data, headers=headers)
        
        if response.status_code != 200:
            log_error(f"Employer profile creation failed: {response.text}")
            return False
        
        # Create job seeker profile
        jobseeker_profile_data = {
            "first_name": "Alex",
            "last_name": "Rodriguez",
            "phone": "+1-555-0123",
            "location": "San Francisco, CA",
            "title": "Senior Software Engineer",
            "summary": "Experienced software engineer with 8 years in full-stack development",
            "skills": ["Python", "JavaScript", "React", "Node.js", "AWS"],
            "work_experience": [
                {
                    "company_name": "Google Inc",
                    "job_title": "Senior Software Engineer",
                    "start_date": "2020-01-01",
                    "end_date": "2024-12-01",
                    "is_current": False,
                    "description": "Led development of scalable web applications"
                }
            ]
        }
        
        headers = {"Authorization": f"Bearer {self.job_seeker_token}"}
        response = requests.post(f"{API_BASE}/profiles/jobseeker/profile", json=jobseeker_profile_data, headers=headers)
        
        if response.status_code != 200:
            log_error(f"Job seeker profile creation failed: {response.text}")
            return False
        
        # Create interviewer profile
        interviewer_profile_data = {
            "first_name": "Michael",
            "last_name": "Chen",
            "phone": "+1-555-0456",
            "location": "San Francisco, CA",
            "title": "Senior Technical Interviewer",
            "company": "Meta",
            "years_of_experience": 12,
            "expertise": [
                {"skill": "Python", "years_of_experience": 10, "is_primary": True},
                {"skill": "JavaScript", "years_of_experience": 8, "is_primary": True},
                {"skill": "React", "years_of_experience": 6, "is_primary": False},
                {"skill": "AWS", "years_of_experience": 5, "is_primary": False}
            ]
        }
        
        headers = {"Authorization": f"Bearer {self.interviewer_token}"}
        response = requests.post(f"{API_BASE}/profiles/interviewer/profile", json=interviewer_profile_data, headers=headers)
        
        if response.status_code != 200:
            log_error(f"Interviewer profile creation failed: {response.text}")
            return False
        
        log_success("All test profiles created successfully")
        return True
    
    # ==================== Platform Settings Tests ====================
    
    def test_platform_settings_api(self):
        """Test GET/PUT /api/credits/settings - Platform settings (Admin only)"""
        log_info("Testing Platform Settings API...")
        
        # Test GET settings (should create default if not exists)
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        response = requests.get(f"{API_BASE}/credits/settings", headers=headers)
        
        if response.status_code == 200:
            settings = response.json()
            log_success("Platform settings retrieved successfully")
            log_info(f"Contact reveal cost: {settings.get('contact_reveal_cost', 'N/A')}")
            log_info(f"Interview request cost: {settings.get('interview_request_cost', 'N/A')}")
        else:
            log_error(f"Platform settings retrieval failed: {response.text}")
            return False
        
        # Test PUT settings (update)
        update_data = {
            "contact_reveal_cost": 12000,
            "interview_request_cost": 6000,
            "interview_completion_earning": 600
        }
        
        response = requests.put(f"{API_BASE}/credits/settings", json=update_data, headers=headers)
        
        if response.status_code == 200:
            log_success("Platform settings updated successfully")
        else:
            log_error(f"Platform settings update failed: {response.text}")
            return False
        
        # Test unauthorized access (non-admin)
        headers = {"Authorization": f"Bearer {self.employer_token}"}
        response = requests.get(f"{API_BASE}/credits/settings", headers=headers)
        
        if response.status_code == 403:
            log_success("Non-admin correctly blocked from accessing settings")
        else:
            log_error("Non-admin was able to access settings (authorization issue)")
            return False
        
        return True
    
    def test_credit_balance_api(self):
        """Test GET /api/credits/balance - Credit balance check"""
        log_info("Testing Credit Balance API...")
        
        # Test with job seeker
        headers = {"Authorization": f"Bearer {self.job_seeker_token}"}
        response = requests.get(f"{API_BASE}/credits/balance", headers=headers)
        
        if response.status_code == 200:
            balance = response.json()
            log_success("Job seeker credit balance retrieved")
            log_info(f"Free credits: {balance.get('credits_free', 0)}")
            log_info(f"Paid credits: {balance.get('credits_paid', 0)}")
            log_info(f"Total credits: {balance.get('total_credits', 0)}")
        else:
            log_error(f"Job seeker credit balance failed: {response.text}")
            return False
        
        # Test with employer
        headers = {"Authorization": f"Bearer {self.employer_token}"}
        response = requests.get(f"{API_BASE}/credits/balance", headers=headers)
        
        if response.status_code == 200:
            balance = response.json()
            log_success("Employer credit balance retrieved")
            log_info(f"Total credits: {balance.get('total_credits', 0)}")
        else:
            log_error(f"Employer credit balance failed: {response.text}")
            return False
        
        # Test with interviewer
        headers = {"Authorization": f"Bearer {self.interviewer_token}"}
        response = requests.get(f"{API_BASE}/credits/balance", headers=headers)
        
        if response.status_code == 200:
            balance = response.json()
            log_success("Interviewer credit balance retrieved")
            log_info(f"Total credits: {balance.get('total_credits', 0)}")
        else:
            log_error(f"Interviewer credit balance failed: {response.text}")
            return False
        
        return True
    
    def test_admin_credit_management_api(self):
        """Test POST /api/credits/admin/add-credits and deduct-credits"""
        log_info("Testing Admin Credit Management API...")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test add credits to employer (for contact reveal testing)
        add_data = {
            "user_id": self.employer_user_id,
            "amount": 50000,
            "description": "Test credits for employer"
        }
        
        response = requests.post(f"{API_BASE}/credits/admin/add-credits", 
                               params=add_data, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            log_success("Credits added to employer successfully")
            log_info(f"New balance: {result['new_balance']['total']}")
        else:
            log_error(f"Add credits failed: {response.text}")
            return False
        
        # Test add credits to job seeker (for interview request testing)
        add_data = {
            "user_id": self.job_seeker_user_id,
            "amount": 20000,
            "description": "Test credits for job seeker"
        }
        
        response = requests.post(f"{API_BASE}/credits/admin/add-credits", 
                               params=add_data, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            log_success("Credits added to job seeker successfully")
            log_info(f"New balance: {result['new_balance']['total']}")
        else:
            log_error(f"Add credits to job seeker failed: {response.text}")
            return False
        
        # Test deduct credits (with sufficient balance)
        deduct_data = {
            "user_id": self.employer_user_id,
            "amount": 5000,
            "description": "Test deduction"
        }
        
        response = requests.post(f"{API_BASE}/credits/admin/deduct-credits", 
                               params=deduct_data, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            log_success("Credits deducted successfully")
            log_info(f"New balance: {result['new_balance']['total']}")
        else:
            log_error(f"Deduct credits failed: {response.text}")
            return False
        
        # Test deduct credits with insufficient balance
        deduct_data = {
            "user_id": self.employer_user_id,
            "amount": 100000,
            "description": "Test insufficient balance"
        }
        
        response = requests.post(f"{API_BASE}/credits/admin/deduct-credits", 
                               params=deduct_data, headers=headers)
        
        if response.status_code == 400:
            log_success("Insufficient balance correctly handled")
        else:
            log_error("Insufficient balance not properly handled")
            return False
        
        # Test unauthorized access
        headers = {"Authorization": f"Bearer {self.employer_token}"}
        response = requests.post(f"{API_BASE}/credits/admin/add-credits", 
                               params=add_data, headers=headers)
        
        if response.status_code == 403:
            log_success("Non-admin correctly blocked from credit management")
        else:
            log_error("Non-admin was able to manage credits (authorization issue)")
            return False
        
        return True
    
    def test_transaction_history_api(self):
        """Test GET /api/credits/transactions and CSV export"""
        log_info("Testing Transaction History API...")
        
        # Test get transaction history for employer
        headers = {"Authorization": f"Bearer {self.employer_token}"}
        response = requests.get(f"{API_BASE}/credits/transactions", headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            log_success(f"Transaction history retrieved - {result['total']} transactions")
            log_info(f"Page: {result['page']}, Limit: {result['limit']}")
            
            if result['transactions']:
                tx = result['transactions'][0]
                log_info(f"Latest transaction: {tx['transaction_type']} - {tx['amount']} credits")
        else:
            log_error(f"Transaction history failed: {response.text}")
            return False
        
        # Test with filters
        params = {
            "transaction_type": "admin_add",
            "page": 1,
            "limit": 10
        }
        
        response = requests.get(f"{API_BASE}/credits/transactions", params=params, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            log_success("Filtered transaction history retrieved")
        else:
            log_error(f"Filtered transaction history failed: {response.text}")
            return False
        
        # Test CSV export
        response = requests.get(f"{API_BASE}/credits/transactions/export", headers=headers)
        
        if response.status_code == 200:
            if 'text/csv' in response.headers.get('content-type', ''):
                log_success("CSV export successful")
                # Check if CSV has proper headers
                csv_content = response.text
                if 'Date,Transaction Type,Category' in csv_content:
                    log_success("CSV format is correct")
                else:
                    log_warning("CSV format may be incorrect")
            else:
                log_error("CSV export returned wrong content type")
                return False
        else:
            log_error(f"CSV export failed: {response.text}")
            return False
        
        return True
    
    # ==================== Contact Reveal Tests ====================
    
    def test_contact_reveal_api(self):
        """Test POST /api/contacts/reveal - Contact reveal system"""
        log_info("Testing Contact Reveal API...")
        
        headers = {"Authorization": f"Bearer {self.employer_token}"}
        
        # Test reveal contact with sufficient credits
        reveal_data = {
            "jobseeker_id": self.job_seeker_user_id
        }
        
        response = requests.post(f"{API_BASE}/contacts/reveal", json=reveal_data, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            log_success("Contact revealed successfully")
            log_info(f"Revealed email: {result['access']['revealed_email']}")
            log_info(f"Revealed phone: {result['access'].get('revealed_phone', 'N/A')}")
            log_info(f"Access expires: {result['access']['access_expires_at']}")
            log_info(f"Remaining credits: {result['remaining_credits']['total']}")
        else:
            log_error(f"Contact reveal failed: {response.text}")
            return False
        
        # Test duplicate reveal (should return existing access)
        response = requests.post(f"{API_BASE}/contacts/reveal", json=reveal_data, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            if "already have access" in result['message']:
                log_success("Duplicate reveal correctly handled")
            else:
                log_warning("Duplicate reveal may not be properly handled")
        else:
            log_error(f"Duplicate reveal test failed: {response.text}")
            return False
        
        # Test unauthorized access (job seeker trying to reveal)
        headers = {"Authorization": f"Bearer {self.job_seeker_token}"}
        response = requests.post(f"{API_BASE}/contacts/reveal", json=reveal_data, headers=headers)
        
        if response.status_code == 403:
            log_success("Job seeker correctly blocked from revealing contacts")
        else:
            log_error("Job seeker was able to reveal contacts (authorization issue)")
            return False
        
        return True
    
    def test_contact_access_api(self):
        """Test GET /api/contacts/access/{jobseeker_id} and my-access"""
        log_info("Testing Contact Access API...")
        
        headers = {"Authorization": f"Bearer {self.employer_token}"}
        
        # Test check access for revealed contact
        response = requests.get(f"{API_BASE}/contacts/access/{self.job_seeker_user_id}", headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            if result.get('has_access'):
                log_success("Contact access check successful - has access")
                log_info(f"Access expires: {result['access']['access_expires_at']}")
            else:
                log_warning("Contact access check shows no access")
        else:
            log_error(f"Contact access check failed: {response.text}")
            return False
        
        # Test get all my access
        response = requests.get(f"{API_BASE}/contacts/my-access", headers=headers)
        
        if response.status_code == 200:
            access_list = response.json()
            log_success(f"My access list retrieved - {len(access_list)} active access")
            
            if access_list:
                access = access_list[0]
                log_info(f"Access to: {access['revealed_email']}")
                log_info(f"Expires: {access['access_expires_at']}")
        else:
            log_error(f"My access list failed: {response.text}")
            return False
        
        return True
    
    # ==================== Interview Request Tests ====================
    
    def test_interview_request_creation_api(self):
        """Test POST /api/interviews/requests - Create interview request"""
        log_info("Testing Interview Request Creation API...")
        
        headers = {"Authorization": f"Bearer {self.job_seeker_token}"}
        
        # Test create interview request with sufficient credits
        request_data = {
            "skills_to_verify": ["Python", "JavaScript"],
            "jobseeker_notes": "Looking for verification of my backend development skills"
        }
        
        response = requests.post(f"{API_BASE}/interviews/requests", json=request_data, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            self.test_interview_request_id = result['request']['id']
            log_success("Interview request created successfully")
            log_info(f"Request ID: {self.test_interview_request_id}")
            log_info(f"Skills to verify: {result['request']['skills_to_verify']}")
            log_info(f"Matching interviewers: {result['matching_interviewers_count']}")
            log_info(f"Remaining credits: {result['remaining_credits']['total']}")
        else:
            log_error(f"Interview request creation failed: {response.text}")
            return False
        
        # Test unauthorized access (employer trying to create request)
        headers = {"Authorization": f"Bearer {self.employer_token}"}
        response = requests.post(f"{API_BASE}/interviews/requests", json=request_data, headers=headers)
        
        if response.status_code == 403:
            log_success("Employer correctly blocked from creating interview requests")
        else:
            log_error("Employer was able to create interview requests (authorization issue)")
            return False
        
        return True
    
    def test_interviewer_request_management_api(self):
        """Test interviewer request viewing and acceptance"""
        log_info("Testing Interviewer Request Management API...")
        
        # Test get available requests for interviewer
        headers = {"Authorization": f"Bearer {self.interviewer_token}"}
        response = requests.get(f"{API_BASE}/interviews/requests/available", headers=headers)
        
        if response.status_code == 200:
            requests_list = response.json()
            log_success(f"Available requests retrieved - {len(requests_list)} requests")
            
            if requests_list:
                request = requests_list[0]
                log_info(f"Request from: {request['jobseeker_email']}")
                log_info(f"Skills: {request['skills_to_verify']}")
                log_info(f"Status: {request['status']}")
        else:
            log_error(f"Available requests retrieval failed: {response.text}")
            return False
        
        # Test accept interview request
        if self.test_interview_request_id:
            response = requests.post(f"{API_BASE}/interviews/requests/{self.test_interview_request_id}/accept", 
                                   headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                log_success("Interview request accepted successfully")
                log_info(f"Request ID: {result['request_id']}")
            else:
                log_error(f"Interview request acceptance failed: {response.text}")
                return False
        
        # Test get my interviews (for interviewer)
        response = requests.get(f"{API_BASE}/interviews/requests/my-interviews", headers=headers)
        
        if response.status_code == 200:
            my_interviews = response.json()
            log_success(f"My interviews retrieved - {len(my_interviews)} interviews")
        else:
            log_error(f"My interviews retrieval failed: {response.text}")
            return False
        
        # Test get my interviews (for job seeker)
        headers = {"Authorization": f"Bearer {self.job_seeker_token}"}
        response = requests.get(f"{API_BASE}/interviews/requests/my-interviews", headers=headers)
        
        if response.status_code == 200:
            my_requests = response.json()
            log_success(f"Job seeker requests retrieved - {len(my_requests)} requests")
        else:
            log_error(f"Job seeker requests retrieval failed: {response.text}")
            return False
        
        return True
    
    def test_interview_rating_api(self):
        """Test POST /api/interviews/ratings - Submit interview rating"""
        log_info("Testing Interview Rating API...")
        
        if not self.test_interview_request_id:
            log_warning("No interview request ID available for rating test")
            return True
        
        headers = {"Authorization": f"Bearer {self.interviewer_token}"}
        
        # Test submit rating
        rating_data = {
            "interview_request_id": self.test_interview_request_id,
            "skill_ratings": [
                {
                    "skill_name": "Python",
                    "rating": 4.5,
                    "years_of_experience": 6,
                    "interviewer_notes": "Strong knowledge of Python frameworks"
                },
                {
                    "skill_name": "JavaScript",
                    "rating": 4.0,
                    "years_of_experience": 5,
                    "interviewer_notes": "Good understanding of modern JS concepts"
                }
            ],
            "strengths": "Strong problem-solving skills and clean code practices",
            "areas_for_improvement": "Could improve knowledge of advanced algorithms",
            "general_feedback": "Excellent candidate with solid technical foundation",
            "recommendation": "hire"
        }
        
        response = requests.post(f"{API_BASE}/interviews/ratings", json=rating_data, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            log_success("Interview rating submitted successfully")
            log_info(f"Overall rating: {result['rating']['overall_rating']}")
            log_info(f"Credits earned: {result['credits_earned']}")
            log_info(f"New balance: {result['new_balance']['total']}")
        else:
            log_error(f"Interview rating submission failed: {response.text}")
            return False
        
        # Test invalid rating (should fail)
        invalid_rating_data = rating_data.copy()
        invalid_rating_data['skill_ratings'][0]['rating'] = 5.3  # Invalid rating
        
        response = requests.post(f"{API_BASE}/interviews/ratings", json=invalid_rating_data, headers=headers)
        
        if response.status_code == 400:
            log_success("Invalid rating correctly rejected")
        else:
            log_error("Invalid rating was accepted (validation issue)")
            return False
        
        # Test duplicate rating (should fail)
        response = requests.post(f"{API_BASE}/interviews/ratings", json=rating_data, headers=headers)
        
        if response.status_code == 400:
            log_success("Duplicate rating correctly rejected")
        else:
            log_error("Duplicate rating was accepted")
            return False
        
        return True
    
    def test_jobseeker_verification_badge_api(self):
        """Test GET /api/interviews/ratings/jobseeker/{id} - Verification badge"""
        log_info("Testing Job Seeker Verification Badge API...")
        
        # Test get verification badge (public access)
        response = requests.get(f"{API_BASE}/interviews/ratings/jobseeker/{self.job_seeker_user_id}")
        
        if response.status_code == 200:
            result = response.json()
            log_success("Verification badge data retrieved")
            log_info(f"Has verification: {result['has_verification']}")
            
            if result['has_verification']:
                rating = result['latest_rating']
                log_info(f"Overall rating: {rating['overall_rating']}")
                log_info(f"Verification date: {rating['verification_date']}")
                log_info(f"Number of ratings: {len(result['all_ratings'])}")
        else:
            log_error(f"Verification badge retrieval failed: {response.text}")
            return False
        
        # Test with non-existent user
        fake_user_id = str(uuid.uuid4())
        response = requests.get(f"{API_BASE}/interviews/ratings/jobseeker/{fake_user_id}")
        
        if response.status_code == 200:
            result = response.json()
            if not result['has_verification']:
                log_success("Non-existent user correctly shows no verification")
            else:
                log_error("Non-existent user shows verification")
                return False
        else:
            log_error(f"Non-existent user test failed: {response.text}")
            return False
        
        return True
    
    def test_admin_interview_management_api(self):
        """Test admin interview management endpoints"""
        log_info("Testing Admin Interview Management API...")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test get all requests (admin)
        response = requests.get(f"{API_BASE}/interviews/admin/requests", headers=headers)
        
        if response.status_code == 200:
            requests_list = response.json()
            log_success(f"Admin requests view - {len(requests_list)} requests")
        else:
            log_error(f"Admin requests view failed: {response.text}")
            return False
        
        # Test get all ratings (admin)
        response = requests.get(f"{API_BASE}/interviews/admin/ratings", headers=headers)
        
        if response.status_code == 200:
            ratings_list = response.json()
            log_success(f"Admin ratings view - {len(ratings_list)} ratings")
        else:
            log_error(f"Admin ratings view failed: {response.text}")
            return False
        
        # Test manual assignment (admin)
        if self.test_interview_request_id:
            update_data = {
                "status": "assigned",
                "interviewer_id": self.interviewer_user_id,
                "admin_notes": "Manually assigned by admin for testing"
            }
            
            response = requests.put(f"{API_BASE}/interviews/requests/{self.test_interview_request_id}", 
                                  json=update_data, headers=headers)
            
            if response.status_code == 200:
                log_success("Admin manual assignment successful")
            else:
                log_error(f"Admin manual assignment failed: {response.text}")
                return False
        
        # Test unauthorized access
        headers = {"Authorization": f"Bearer {self.employer_token}"}
        response = requests.get(f"{API_BASE}/interviews/admin/requests", headers=headers)
        
        if response.status_code == 403:
            log_success("Non-admin correctly blocked from admin endpoints")
        else:
            log_error("Non-admin was able to access admin endpoints")
            return False
        
        return True
    
    def test_admin_transaction_viewing_api(self):
        """Test GET /api/credits/admin/transactions - Admin transaction viewing"""
        log_info("Testing Admin Transaction Viewing API...")
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test get all transactions
        response = requests.get(f"{API_BASE}/credits/admin/transactions", headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            log_success(f"Admin transaction view - {result['total']} transactions")
            log_info(f"Page: {result['page']}, Limit: {result['limit']}")
        else:
            log_error(f"Admin transaction view failed: {response.text}")
            return False
        
        # Test with user_id filter
        params = {
            "user_id": self.employer_user_id,
            "page": 1,
            "limit": 10
        }
        
        response = requests.get(f"{API_BASE}/credits/admin/transactions", params=params, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            log_success("Filtered admin transaction view successful")
        else:
            log_error(f"Filtered admin transaction view failed: {response.text}")
            return False
        
        return True

    # Old job system tests removed - focusing on Iteration 4 credit system tests
    
    def run_all_tests(self):
        """Run all backend API tests for Iteration 4 Credit System"""
        print(f"{Colors.BOLD}🚀 Starting TalentHub Iteration 4 Backend API Tests{Colors.ENDC}")
        print(f"Backend URL: {BACKEND_URL}")
        print("Testing: Credit System, Contact Reveal, Interview Verification")
        print("=" * 70)
        
        tests = [
            ("Create Test Users", self.create_test_users),
            ("Create Test Profiles", self.create_test_profiles),
            ("Platform Settings API", self.test_platform_settings_api),
            ("Credit Balance API", self.test_credit_balance_api),
            ("Admin Credit Management API", self.test_admin_credit_management_api),
            ("Transaction History API", self.test_transaction_history_api),
            ("Contact Reveal API", self.test_contact_reveal_api),
            ("Contact Access API", self.test_contact_access_api),
            ("Interview Request Creation API", self.test_interview_request_creation_api),
            ("Interviewer Request Management API", self.test_interviewer_request_management_api),
            ("Interview Rating API", self.test_interview_rating_api),
            ("Job Seeker Verification Badge API", self.test_jobseeker_verification_badge_api),
            ("Admin Interview Management API", self.test_admin_interview_management_api),
            ("Admin Transaction Viewing API", self.test_admin_transaction_viewing_api),
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            print(f"\n{Colors.BOLD}Testing: {test_name}{Colors.ENDC}")
            try:
                if test_func():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                log_error(f"Test {test_name} crashed: {str(e)}")
                failed += 1
        
        print(f"\n{Colors.BOLD}Test Results Summary:{Colors.ENDC}")
        print(f"{Colors.GREEN}✅ Passed: {passed}{Colors.ENDC}")
        print(f"{Colors.RED}❌ Failed: {failed}{Colors.ENDC}")
        print(f"Total: {passed + failed}")
        
        if failed == 0:
            print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 All tests passed! Backend APIs are working correctly.{Colors.ENDC}")
            return True
        else:
            print(f"\n{Colors.RED}{Colors.BOLD}⚠️  Some tests failed. Please check the issues above.{Colors.ENDC}")
            return False

if __name__ == "__main__":
    tester = CreditSystemTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)