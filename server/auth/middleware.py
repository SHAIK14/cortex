from fastapi import HTTPException

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database.supabase import async_supabase_admin

security = HTTPBearer()

async def validate_api_key(credentials: HTTPAuthorizationCredentials) -> dict:
    """Validate API key and return api_key record"""
    api_key = credentials.credentials
    if not api_key.startswith("ctx_"):
        raise HTTPException(status_code=401, detail="Invalid API key format")
        
    result = await async_supabase_admin.table("api_keys")\
        .select("*")\
        .eq("key", api_key)\
        .eq("is_active", True)\
        .execute()
        
    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid or inactive API key")
    
    api_key_record = result.data[0]
    await async_supabase_admin.table("api_keys")\
        .update({"last_used_at": "now()"})\
        .eq("id", api_key_record["id"])\
        .execute()
        
    return api_key_record