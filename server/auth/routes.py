from fastapi import APIRouter, HTTPException

from database.supabase import supabase, supabase_admin
from auth.models import SignupRequest, LoginRequest
from auth.api_key import generate_api_key

router = APIRouter(prefix="/auth", tags=["auth"])




@router.post("/signup")
async def signup(request:SignupRequest):
    
    try:
        auth_response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not auth_response.user:
        raise HTTPException(status_code=400, detail="Login failed")
    user_id = auth_response.user.id
    api_key = generate_api_key()
    supabase_admin.table("api_keys").insert({
        "developer_id": user_id,
        "key": api_key,
        "name": "Default"
    }).execute()
    return {
        "message": "Signup successful",
        "api_key": api_key,
        "note": "Save this API key - it won't be shown again!"
    }


@router.post("/login")
async def login(request: LoginRequest):
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
    except Exception as e:
        print(f"Login error: {type(e).__name__}: {e}")  # Debug logging
        raise HTTPException(status_code=401, detail=f"Invalid credentials: {str(e)}")

    if not auth_response.user:
        raise HTTPException(status_code=401, detail="Login failed - no user returned")

    if not auth_response.session:
        raise HTTPException(status_code=401, detail="Login failed - no session returned")

    user_id = auth_response.user.id
    api_key_result = supabase_admin.table("api_keys")\
        .select("key")\
        .eq("developer_id", user_id)\
        .eq("is_active", True)\
        .limit(1)\
        .execute()
    
    api_key = api_key_result.data[0]["key"] if api_key_result.data else None
    
    return {
        "message": "Login successful",
        "access_token": auth_response.session.access_token,
        "api_key": api_key  # TODO: Remove after testing
    }

