from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Server configuration.

    Only YOUR Supabase credentials are needed here (for authentication).
    User's API keys (OpenAI, their Supabase, Cohere) come from request body.
    """

    # YOUR Supabase (for authentication only)
    supabase_url: str
    supabase_key: str
    supabase_service_key: str

    # Memory limits
    max_memories_per_user: int = 50

    class Config:
        env_file = ".env"
        extra = "ignore"  # Ignore extra env vars like openai_api_key, cohere_api_key


settings = Settings()
