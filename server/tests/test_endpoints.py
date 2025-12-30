"""
Test all API endpoints.
"""
import pytest
from tests.conftest import TEST_USER_ID


class TestHealthEndpoint:
    """Test health/root endpoint."""

    @pytest.mark.asyncio
    async def test_root_endpoint(self, client):
        """Test root endpoint returns welcome message."""
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data or "status" in data


class TestMemoryAddEndpoint:
    """Test POST /memory/add endpoint."""

    @pytest.mark.asyncio
    async def test_add_memory_success(self, client, auth_headers, sample_conversation):
        """Test adding memories from conversation."""
        payload = {
            "messages": sample_conversation,
            "user_id": TEST_USER_ID,
            "conversation_id": "test_conv_001"
        }

        response = await client.post("/memory/add", json=payload, headers=auth_headers)
        assert response.status_code == 200

        data = response.json()
        assert "memories" in data
        assert "extracted_count" in data
        assert "stored_count" in data
        assert data["extracted_count"] >= 1

    @pytest.mark.asyncio
    async def test_add_memory_empty_messages(self, client, auth_headers):
        """Test adding with empty messages."""
        payload = {
            "messages": [],
            "user_id": TEST_USER_ID
        }

        response = await client.post("/memory/add", json=payload, headers=auth_headers)
        # Should return 200 with no facts extracted
        assert response.status_code == 200
        data = response.json()
        assert data.get("extracted_count", 0) == 0 or "No facts" in data.get("message", "")

    @pytest.mark.asyncio
    async def test_add_memory_no_auth(self, client, sample_conversation):
        """Test adding memory without auth fails."""
        payload = {
            "messages": sample_conversation,
            "user_id": TEST_USER_ID
        }

        response = await client.post("/memory/add", json=payload)
        assert response.status_code in [401, 403, 422]

    @pytest.mark.asyncio
    async def test_add_memory_invalid_api_key(self, client, sample_conversation):
        """Test adding memory with invalid API key."""
        headers = {
            "Authorization": "Bearer invalid_key_12345",
            "Content-Type": "application/json"
        }
        payload = {
            "messages": sample_conversation,
            "user_id": TEST_USER_ID
        }

        response = await client.post("/memory/add", json=payload, headers=headers)
        assert response.status_code in [401, 403]


class TestMemorySearchEndpoint:
    """Test POST /memory/search endpoint."""

    @pytest.mark.asyncio
    async def test_search_memory(self, client, auth_headers):
        """Test searching memories."""
        payload = {
            "query": "vegetarian",
            "user_id": TEST_USER_ID,
            "limit": 5
        }

        response = await client.post("/memory/search", json=payload, headers=auth_headers)
        assert response.status_code == 200

        data = response.json()
        assert "memories" in data
        assert "query" in data
        assert "count" in data
        assert isinstance(data["memories"], list)

    @pytest.mark.asyncio
    async def test_search_memory_empty_query(self, client, auth_headers):
        """Test search with empty query."""
        payload = {
            "query": "",
            "user_id": TEST_USER_ID
        }

        response = await client.post("/memory/search", json=payload, headers=auth_headers)
        # Should either fail validation or return empty results
        assert response.status_code in [200, 422]

    @pytest.mark.asyncio
    async def test_search_memory_no_results(self, client, auth_headers):
        """Test search that returns no results."""
        payload = {
            "query": "xyznonexistentquery123",
            "user_id": "nonexistent_user"
        }

        response = await client.post("/memory/search", json=payload, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 0


class TestUserMemoriesEndpoint:
    """Test GET /memory/user/{user_id} endpoint."""

    @pytest.mark.asyncio
    async def test_get_user_memories(self, client, auth_headers):
        """Test getting all memories for a user."""
        response = await client.get(f"/memory/user/{TEST_USER_ID}", headers=auth_headers)
        assert response.status_code == 200

        data = response.json()
        assert "memories" in data
        assert "total_count" in data
        assert isinstance(data["memories"], list)

    @pytest.mark.asyncio
    async def test_get_user_memories_nonexistent_user(self, client, auth_headers):
        """Test getting memories for user with no memories."""
        response = await client.get("/memory/user/nonexistent_user_xyz", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total_count"] == 0


class TestSingleMemoryEndpoint:
    """Test GET/DELETE /memory/{memory_id} endpoints."""

    @pytest.mark.asyncio
    async def test_get_single_memory_not_found(self, client, auth_headers):
        """Test getting non-existent memory."""
        fake_uuid = "00000000-0000-0000-0000-000000000000"
        response = await client.get(f"/memory/{fake_uuid}", headers=auth_headers)
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_memory_not_found(self, client, auth_headers):
        """Test deleting non-existent memory."""
        fake_uuid = "00000000-0000-0000-0000-000000000000"
        response = await client.delete(f"/memory/{fake_uuid}", headers=auth_headers)
        assert response.status_code == 404
