from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import StreamingResponse
from typing import Optional, List
from datetime import datetime, timedelta
import csv
import io

from models import User, UserRole
from models_credit_interview import (
    CreditTransactionExtended,
    TransactionType,
    TransactionCategory,
    PlatformSettings,
    PlatformSettingsUpdate
)

def convert_legacy_transaction(t):
    """Convert legacy transaction format to new format"""
    # If it's already in new format, return as is
    if 'category' in t and 'balance_free' in t and 'balance_paid' in t:
        return CreditTransactionExtended(**t)
    
    # Convert legacy format
    legacy_data = {
        'id': t.get('id', ''),
        'user_id': t.get('user_id', ''),
        'amount': t.get('amount', 0),
        'transaction_type': t.get('transaction_type', 'earn'),
        'category': 'signup_bonus' if t.get('transaction_type') == 'bonus' else 'admin_adjustment',
        'description': t.get('description', ''),
        'reference_id': t.get('reference_id'),
        'reference_type': t.get('reference_type'),
        'balance_free': 0,  # Legacy transactions don't have balance info
        'balance_paid': 0,
        'created_at': t.get('created_at'),
        'created_by': t.get('created_by')
    }
    
    return CreditTransactionExtended(**legacy_data)
from routes.auth import get_current_user

router = APIRouter()

# Database will be injected from main server
db = None

# ==================== Platform Settings (Admin Only) ====================

@router.get('/settings')
async def get_platform_settings(
    current_user: User = Depends(get_current_user)
):
    """Get platform settings (Admin only)"""
    if not current_user or current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail='Admin access required')
    
    settings = await db.platform_settings.find_one({})
    
    if not settings:
        # Create default settings
        default_settings = PlatformSettings()
        await db.platform_settings.insert_one(default_settings.model_dump())
        return default_settings
    
    return PlatformSettings(**settings)

@router.put('/settings')
async def update_platform_settings(
    settings_data: PlatformSettingsUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update platform settings (Admin only)"""
    if not current_user or current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail='Admin access required')
    
    existing = await db.platform_settings.find_one({})
    
    if not existing:
        # Create new settings
        new_settings = PlatformSettings(**settings_data.model_dump(exclude_unset=True))
        new_settings.updated_by = current_user.id
        await db.platform_settings.insert_one(new_settings.model_dump())
        return {'message': 'Settings created successfully', 'settings': new_settings}
    
    # Update existing settings
    update_data = {k: v for k, v in settings_data.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.utcnow()
    update_data['updated_by'] = current_user.id
    
    await db.platform_settings.update_one(
        {'id': existing['id']},
        {'$set': update_data}
    )
    
    return {'message': 'Settings updated successfully'}


# ==================== Credit Management ====================

@router.get('/balance')
async def get_credit_balance(
    current_user: User = Depends(get_current_user)
):
    """Get current credit balance"""
    if not current_user:
        raise HTTPException(status_code=401, detail='Authentication required')
    
    user = await db.users.find_one({'id': current_user.id})
    
    return {
        'user_id': user['id'],
        'credits_free': user.get('credits_free', 0),
        'credits_paid': user.get('credits_paid', 0),
        'total_credits': user.get('credits_free', 0) + user.get('credits_paid', 0)
    }


@router.post('/admin/add-credits')
async def admin_add_credits(
    user_id: str,
    amount: int,
    description: str,
    current_user: User = Depends(get_current_user)
):
    """Admin: Manually add credits to user account"""
    if not current_user or current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail='Admin access required')
    
    if amount <= 0:
        raise HTTPException(status_code=400, detail='Amount must be positive')
    
    # Get user
    user = await db.users.find_one({'id': user_id})
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    
    # Add credits (as free credits)
    new_free_balance = user.get('credits_free', 0) + amount
    
    await db.users.update_one(
        {'id': user_id},
        {'$set': {'credits_free': new_free_balance}}
    )
    
    # Create transaction record
    transaction = CreditTransactionExtended(
        user_id=user_id,
        amount=amount,
        transaction_type=TransactionType.ADMIN_ADD,
        category=TransactionCategory.ADMIN_ADJUSTMENT,
        description=description,
        balance_free=new_free_balance,
        balance_paid=user.get('credits_paid', 0),
        created_by=current_user.id
    )
    
    await db.credit_transactions.insert_one(transaction.model_dump())
    
    return {
        'message': 'Credits added successfully',
        'user_id': user_id,
        'amount_added': amount,
        'new_balance': {
            'free': new_free_balance,
            'paid': user.get('credits_paid', 0),
            'total': new_free_balance + user.get('credits_paid', 0)
        }
    }


@router.post('/admin/deduct-credits')
async def admin_deduct_credits(
    user_id: str,
    amount: int,
    description: str,
    current_user: User = Depends(get_current_user)
):
    """Admin: Manually deduct credits from user account"""
    if not current_user or current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail='Admin access required')
    
    if amount <= 0:
        raise HTTPException(status_code=400, detail='Amount must be positive')
    
    # Get user
    user = await db.users.find_one({'id': user_id})
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    
    current_free = user.get('credits_free', 0)
    current_paid = user.get('credits_paid', 0)
    total = current_free + current_paid
    
    if total < amount:
        raise HTTPException(status_code=400, detail='Insufficient credits')
    
    # Deduct from paid first, then free
    remaining_to_deduct = amount
    new_paid = current_paid
    new_free = current_free
    
    if current_paid >= remaining_to_deduct:
        new_paid = current_paid - remaining_to_deduct
    else:
        new_paid = 0
        remaining_to_deduct -= current_paid
        new_free = current_free - remaining_to_deduct
    
    await db.users.update_one(
        {'id': user_id},
        {'$set': {'credits_free': new_free, 'credits_paid': new_paid}}
    )
    
    # Create transaction record
    transaction = CreditTransactionExtended(
        user_id=user_id,
        amount=-amount,
        transaction_type=TransactionType.ADMIN_DEDUCT,
        category=TransactionCategory.ADMIN_ADJUSTMENT,
        description=description,
        balance_free=new_free,
        balance_paid=new_paid,
        created_by=current_user.id
    )
    
    await db.credit_transactions.insert_one(transaction.model_dump())
    
    return {
        'message': 'Credits deducted successfully',
        'user_id': user_id,
        'amount_deducted': amount,
        'new_balance': {
            'free': new_free,
            'paid': new_paid,
            'total': new_free + new_paid
        }
    }


# ==================== Transaction History ====================

@router.get('/transactions')
async def get_transaction_history(
    transaction_type: Optional[str] = None,
    category: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    current_user: User = Depends(get_current_user)
):
    """Get credit transaction history"""
    if not current_user:
        raise HTTPException(status_code=401, detail='Authentication required')
    
    # Build query
    query = {'user_id': current_user.id}
    
    if transaction_type:
        query['transaction_type'] = transaction_type
    
    if category:
        query['category'] = category
    
    if start_date or end_date:
        date_query = {}
        if start_date:
            date_query['$gte'] = datetime.fromisoformat(start_date)
        if end_date:
            date_query['$lte'] = datetime.fromisoformat(end_date)
        query['created_at'] = date_query
    
    # Get total count
    total = await db.credit_transactions.count_documents(query)
    
    # Get transactions
    skip = (page - 1) * limit
    transactions_cursor = db.credit_transactions.find(query).sort('created_at', -1).skip(skip).limit(limit)
    transactions = await transactions_cursor.to_list(length=limit)
    
    return {
        'transactions': [convert_legacy_transaction(t) for t in transactions],
        'total': total,
        'page': page,
        'limit': limit,
        'pages': (total + limit - 1) // limit
    }


@router.get('/transactions/export')
async def export_transactions_csv(
    transaction_type: Optional[str] = None,
    category: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Export transaction history as CSV"""
    if not current_user:
        raise HTTPException(status_code=401, detail='Authentication required')
    
    # Build query
    query = {'user_id': current_user.id}
    
    if transaction_type:
        query['transaction_type'] = transaction_type
    
    if category:
        query['category'] = category
    
    if start_date or end_date:
        date_query = {}
        if start_date:
            date_query['$gte'] = datetime.fromisoformat(start_date)
        if end_date:
            date_query['$lte'] = datetime.fromisoformat(end_date)
        query['created_at'] = date_query
    
    # Get all transactions
    transactions_cursor = db.credit_transactions.find(query).sort('created_at', -1)
    transactions = await transactions_cursor.to_list(length=None)
    
    # Create CSV
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        'Date',
        'Transaction Type',
        'Category',
        'Amount',
        'Description',
        'Free Balance',
        'Paid Balance',
        'Total Balance',
        'Reference ID'
    ])
    
    # Write data
    for t in transactions:
        converted_t = convert_legacy_transaction(t)
        writer.writerow([
            converted_t.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            converted_t.transaction_type,
            converted_t.category,
            converted_t.amount,
            converted_t.description,
            converted_t.balance_free,
            converted_t.balance_paid,
            converted_t.balance_free + converted_t.balance_paid,
            converted_t.reference_id or ''
        ])
    
    # Prepare response
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type='text/csv',
        headers={
            'Content-Disposition': f'attachment; filename=transactions_{datetime.utcnow().strftime("%Y%m%d")}.csv'
        }
    )


@router.get('/admin/transactions')
async def admin_get_all_transactions(
    user_id: Optional[str] = None,
    transaction_type: Optional[str] = None,
    category: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    current_user: User = Depends(get_current_user)
):
    """Admin: View all credit transactions"""
    if not current_user or current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail='Admin access required')
    
    # Build query
    query = {}
    
    if user_id:
        query['user_id'] = user_id
    
    if transaction_type:
        query['transaction_type'] = transaction_type
    
    if category:
        query['category'] = category
    
    if start_date or end_date:
        date_query = {}
        if start_date:
            date_query['$gte'] = datetime.fromisoformat(start_date)
        if end_date:
            date_query['$lte'] = datetime.fromisoformat(end_date)
        query['created_at'] = date_query
    
    # Get total count
    total = await db.credit_transactions.count_documents(query)
    
    # Get transactions
    skip = (page - 1) * limit
    transactions_cursor = db.credit_transactions.find(query).sort('created_at', -1).skip(skip).limit(limit)
    transactions = await transactions_cursor.to_list(length=limit)
    
    return {
        'transactions': [convert_legacy_transaction(t) for t in transactions],
        'total': total,
        'page': page,
        'limit': limit,
        'pages': (total + limit - 1) // limit
    }
