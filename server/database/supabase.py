from supabase import create_client, Client, AsyncClient
from config import settings

supabase: Client = create_client(
    settings.supabase_url,
    settings.supabase_key
)

supabase_admin: Client = create_client(
    settings.supabase_url,
    settings.supabase_service_key
)

# Async Clients
async_supabase: AsyncClient = AsyncClient(
    settings.supabase_url,
    settings.supabase_key
)

async_supabase_admin: AsyncClient = AsyncClient(
    settings.supabase_url,
    settings.supabase_service_key
)