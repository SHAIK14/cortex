import secrets

def generate_api_key() -> str:
    """Generate a new API key like ctx_abc123..."""
    random_bytes = secrets.token_bytes(24)
    return "ctx_" + random_bytes.hex()

