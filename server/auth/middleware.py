from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database.supabase import auth_supabase

security = HTTPBearer()


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    Validate Supabase Auth JWT and extract user_id.

    This validates against YOUR Supabase Auth (not the user's database).
    The JWT contains the user.id from when they logged in.

    Returns:
        user_id (str): The authenticated user's ID

    Raises:
        HTTPException 401: If token is invalid or expired
    """
    token = credentials.credentials

    try:
        # Verify the JWT with YOUR Supabase Auth
        user_response = auth_supabase.auth.get_user(token)

        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired token"
            )

        return user_response.user.id

    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Authentication failed: {str(e)}"
        )
