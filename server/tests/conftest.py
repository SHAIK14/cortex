"""
Pytest configuration and shared fixtures.
"""
import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from main import app

# Test configuration
TEST_API_KEY = "ctx_d203d3fb74181237649832a45e130688b5879fa683b3cc74"
TEST_USER_ID = "test_user_001"
BASE_URL = "http://test"


@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def auth_headers():
    """Return authorization headers."""
    return {
        "Authorization": f"Bearer {TEST_API_KEY}",
        "Content-Type": "application/json"
    }


@pytest.fixture
async def client():
    """Create async test client."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url=BASE_URL) as ac:
        yield ac


@pytest.fixture
def sample_conversation():
    """Sample conversation for testing."""
    return [
        {"role": "user", "content": "Hi, I'm John. I'm a software engineer at Google."},
        {"role": "assistant", "content": "Nice to meet you, John!"},
        {"role": "user", "content": "I'm vegetarian and I prefer dark mode in all my apps."}
    ]


@pytest.fixture
def contradiction_conversation():
    """Conversation with hard contradiction (location change)."""
    return [
        {"role": "user", "content": "I just moved to Berlin from NYC."}
    ]


@pytest.fixture
def soft_contradiction_conversation():
    """Conversation with soft contradiction (vegetarian eating steak)."""
    return [
        {"role": "user", "content": "I had a great steak dinner last night."}
    ]
