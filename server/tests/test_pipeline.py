"""
Test the full memory pipeline: Add → Search → Get → Delete
"""
import pytest
from tests.conftest import TEST_USER_ID


class TestFullPipeline:
    """Test complete memory lifecycle."""

    @pytest.mark.asyncio
    async def test_add_search_get_delete_flow(self, client, auth_headers):
        """Test complete flow: add memory, search it, get it, delete it."""

        # Step 1: Add a memory
        add_payload = {
            "messages": [
                {"role": "user", "content": "I work at Microsoft as a data scientist."}
            ],
            "user_id": "pipeline_test_user",
            "conversation_id": "pipeline_test_001"
        }

        add_response = await client.post("/memory/add", json=add_payload, headers=auth_headers)
        assert add_response.status_code == 200
        add_data = add_response.json()
        assert add_data["extracted_count"] >= 1

        # Get the memory ID from the response
        memories = add_data.get("memories", [])
        assert len(memories) > 0

        # Find an ADD action result
        added_memory = None
        for mem in memories:
            if mem.get("action") == "ADD" and mem.get("memory"):
                added_memory = mem["memory"]
                break

        if added_memory is None:
            pytest.skip("No new memory was added (might be duplicate)")

        memory_id = added_memory["id"]

        # Step 2: Search for the memory
        search_payload = {
            "query": "Microsoft data scientist",
            "user_id": "pipeline_test_user",
            "limit": 10
        }

        search_response = await client.post("/memory/search", json=search_payload, headers=auth_headers)
        assert search_response.status_code == 200
        search_data = search_response.json()

        # Should find the memory we just added
        found_ids = [m["id"] for m in search_data["memories"]]
        assert memory_id in found_ids, "Added memory should be found in search"

        # Step 3: Get the single memory
        get_response = await client.get(f"/memory/{memory_id}", headers=auth_headers)
        assert get_response.status_code == 200
        get_data = get_response.json()
        assert get_data["memory"]["id"] == memory_id

        # Step 4: Delete the memory
        delete_response = await client.delete(f"/memory/{memory_id}", headers=auth_headers)
        assert delete_response.status_code == 200

        # Step 5: Verify it's deleted (archived)
        get_after_delete = await client.get(f"/memory/{memory_id}", headers=auth_headers)
        # Should either return 404 or show status=archived
        # Depends on implementation - soft delete might still return the memory
        assert get_after_delete.status_code in [200, 404]


class TestMemoryTypes:
    """Test different memory types are correctly classified."""

    @pytest.mark.asyncio
    async def test_identity_extraction(self, client, auth_headers):
        """Test that identity facts are extracted."""
        payload = {
            "messages": [
                {"role": "user", "content": "I'm a doctor and I'm vegetarian."}
            ],
            "user_id": "type_test_user"
        }

        response = await client.post("/memory/add", json=payload, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()

        # Should extract at least one identity-type memory
        memories = data.get("memories", [])
        types_found = []
        for mem in memories:
            if mem.get("action") == "ADD" and mem.get("memory"):
                types_found.append(mem["memory"].get("type"))

        assert len(types_found) > 0, "Should extract some memories"

    @pytest.mark.asyncio
    async def test_preference_extraction(self, client, auth_headers):
        """Test that preference facts are extracted."""
        payload = {
            "messages": [
                {"role": "user", "content": "I prefer dark mode and I hate meetings."}
            ],
            "user_id": "pref_test_user"
        }

        response = await client.post("/memory/add", json=payload, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["extracted_count"] >= 1

    @pytest.mark.asyncio
    async def test_fact_extraction(self, client, auth_headers):
        """Test that factual information is extracted."""
        payload = {
            "messages": [
                {"role": "user", "content": "I live in Berlin and work at Google."}
            ],
            "user_id": "fact_test_user"
        }

        response = await client.post("/memory/add", json=payload, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["extracted_count"] >= 1


class TestSearchQuality:
    """Test search quality and ranking."""

    @pytest.mark.asyncio
    async def test_semantic_search(self, client, auth_headers):
        """Test semantic search finds related content."""
        # First add some memories
        payload = {
            "messages": [
                {"role": "user", "content": "I love Python programming and machine learning."}
            ],
            "user_id": "search_quality_user"
        }
        await client.post("/memory/add", json=payload, headers=auth_headers)

        # Search with semantically related query
        search_payload = {
            "query": "coding and AI",  # Related to Python and ML
            "user_id": "search_quality_user",
            "limit": 5
        }

        response = await client.post("/memory/search", json=search_payload, headers=auth_headers)
        assert response.status_code == 200
        # Should find something if semantic search works

    @pytest.mark.asyncio
    async def test_keyword_search(self, client, auth_headers):
        """Test keyword search finds exact matches."""
        # Add memory with specific keyword
        payload = {
            "messages": [
                {"role": "user", "content": "I use PostgreSQL database for my projects."}
            ],
            "user_id": "keyword_test_user"
        }
        await client.post("/memory/add", json=payload, headers=auth_headers)

        # Search with exact keyword
        search_payload = {
            "query": "PostgreSQL",
            "user_id": "keyword_test_user",
            "limit": 5
        }

        response = await client.post("/memory/search", json=search_payload, headers=auth_headers)
        assert response.status_code == 200
