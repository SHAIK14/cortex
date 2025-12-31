from fastapi import APIRouter, HTTPException

from database.supabase import auth_supabase
from auth.models import SignupRequest, LoginRequest

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup")
async def signup(request: SignupRequest):
    """
    Create a new user account.

    Uses YOUR Supabase Auth - no API keys generated.
    User will configure their own API keys (OpenAI, Supabase, etc.) in Settings.
    """
    try:
        auth_response = auth_supabase.auth.sign_up({
            "email": request.email,
            "password": request.password
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not auth_response.user:
        raise HTTPException(status_code=400, detail="Signup failed")

    # Check if email confirmation is required
    if auth_response.session:
        return {
            "message": "Signup successful",
            "user_id": auth_response.user.id,
            "access_token": auth_response.session.access_token,
        }
    else:
        # Email confirmation required
        return {
            "message": "Signup successful. Please check your email to confirm your account.",
            "user_id": auth_response.user.id,
        }


@router.post("/login")
async def login(request: LoginRequest):
    """
    Login with email and password.

    Returns JWT access_token for authenticating subsequent requests.
    """
    try:
        auth_response = auth_supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid credentials: {str(e)}")

    if not auth_response.user:
        raise HTTPException(status_code=401, detail="Login failed - no user returned")

    if not auth_response.session:
        raise HTTPException(status_code=401, detail="Login failed - no session returned")

    return {
        "message": "Login successful",
        "user_id": auth_response.user.id,
        "email": auth_response.user.email,
        "access_token": auth_response.session.access_token,
        "refresh_token": auth_response.session.refresh_token,
    }


@router.post("/refresh")
async def refresh_token(refresh_token: str):
    """Refresh an expired access token."""
    try:
        auth_response = auth_supabase.auth.refresh_session(refresh_token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token refresh failed: {str(e)}")

    if not auth_response.session:
        raise HTTPException(status_code=401, detail="Token refresh failed")

    return {
        "access_token": auth_response.session.access_token,
        "refresh_token": auth_response.session.refresh_token,
    }
