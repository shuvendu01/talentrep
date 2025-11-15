from typing import List, Dict
from models import UserRole

# Default ACL permissions
DEFAULT_PERMISSIONS = {
    UserRole.ADMIN: {
        'users': ['create', 'read', 'update', 'delete'],
        'jobs': ['create', 'read', 'update', 'delete'],
        'profiles': ['create', 'read', 'update', 'delete'],
        'credits': ['create', 'read', 'update', 'delete'],
        'settings': ['create', 'read', 'update', 'delete'],
        'bonus': ['create', 'read', 'update', 'delete'],
        'interviews': ['create', 'read', 'update', 'delete'],
    },
    UserRole.JOB_SEEKER: {
        'jobs': ['read'],
        'profiles': ['create', 'read', 'update'],  # own profile only
        'credits': ['read'],  # own credits only
        'applications': ['create', 'read', 'update'],
        'interviews': ['create', 'read'],
    },
    UserRole.EMPLOYER: {
        'jobs': ['create', 'read', 'update', 'delete'],  # own jobs
        'profiles': ['read'],  # with credit payment
        'credits': ['read', 'update'],  # own credits
        'applications': ['read', 'update'],
        'interviews': ['create', 'read'],
    },
    UserRole.INTERVIEWER: {
        'profiles': ['read', 'update'],  # verification
        'credits': ['read'],  # own credits
        'interviews': ['read', 'update'],
        'verifications': ['create', 'read', 'update'],
    },
}

def check_permission(user_role: UserRole, resource: str, action: str) -> bool:
    """
    Check if a user role has permission to perform an action on a resource
    """
    role_permissions = DEFAULT_PERMISSIONS.get(user_role, {})
    resource_permissions = role_permissions.get(resource, [])
    return action in resource_permissions

def get_user_permissions(user_role: UserRole) -> Dict[str, List[str]]:
    """
    Get all permissions for a user role
    """
    return DEFAULT_PERMISSIONS.get(user_role, {})
