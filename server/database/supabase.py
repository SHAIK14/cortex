from supabase import create_client, Client, AsyncClient
from config import settings


# =============================================================================
# YOUR SUPABASE (for authentication only)
# =============================================================================

# Sync client for auth operations
auth_supabase: Client = create_client(
    settings.supabase_url,
    settings.supabase_key
)

# Admin client for auth operations (bypasses RLS)
auth_supabase_admin: Client = create_client(
    settings.supabase_url,
    settings.supabase_service_key
)


# =============================================================================
# USER'S SUPABASE (for memory storage - credentials from request)
# =============================================================================

def create_user_supabase(url: str, key: str) -> Client:
    """
    Create a Supabase client using user's credentials.
    This connects to the USER's database, not yours.
    """
    return create_client(url, key)


async def create_user_supabase_async(url: str, key: str) -> AsyncClient:
    """
    Create an async Supabase client using user's credentials.
    This connects to the USER's database, not yours.
    """
    return AsyncClient(url, key)


# =============================================================================
# Legacy exports (for backwards compatibility during migration)
# =============================================================================
# These will be removed after refactoring is complete
supabase = auth_supabase
supabase_admin = auth_supabase_admin
