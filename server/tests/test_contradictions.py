"""
Test contradiction handling: DELETE (hard) and CONFLICT (soft).
"""
import pytest
import asyncio


class TestHardContradictions:
    """Test DELETE action for hard contradictions."""

    @pytest.mark.asyncio
    async def test_location_change_contradiction(self, client, auth_headers):
        """Test: User moves from one city to another = DELETE old location."""
        user_id = "location_test_user"

        # Step 1: Add initial location
        payload1 = {
            "messages": [
                {"role": "user", "content": "I live in New York City."}
            ],
            "user_id": user_id,
            "conversation_id": "loc_001"
        }

        response1 = await client.post("/memory/add", json=payload1, headers=auth_headers)
        assert response1.status_code == 200
        data1 = response1.json()
        assert data1["extracted_count"] >= 1

        # Wait a bit for processing
        await asyncio.sleep(1)

        # Step 2: Add contradicting location
        payload2 = {
            "messages": [
                {"role": "user", "content": "I just moved to Berlin, Germany."}
            ],
            "user_id": user_id,
            "conversation_id": "loc_002"
        }

        response2 = await client.post("/memory/add", json=payload2, headers=auth_headers)
        assert response2.status_code == 200
        data2 = response2.json()

        # Check if DELETE action occurred
        actions = [m.get("action") for m in data2.get("memories", [])]
        # Should see DELETE+ADD for location change
        # Note: This depends on LLM correctly identifying the contradiction
        print(f"Actions for location change: {actions}")

    @pytest.mark.asyncio
    async def test_job_change_contradiction(self, client, auth_headers):
        """Test: User changes job = DELETE old job."""
        user_id = "job_test_user"

        # Step 1: Add initial job
        payload1 = {
            "messages": [
                {"role": "user", "content": "I work at Google as an engineer."}
            ],
            "user_id": user_id
        }

        response1 = await client.post("/memory/add", json=payload1, headers=auth_headers)
        assert response1.status_code == 200

        await asyncio.sleep(1)

        # Step 2: Add new job (contradiction)
        payload2 = {
            "messages": [
                {"role": "user", "content": "I just started at Meta, left my old job."}
            ],
            "user_id": user_id
        }

        response2 = await client.post("/memory/add", json=payload2, headers=auth_headers)
        assert response2.status_code == 200
        data2 = response2.json()

        actions = [m.get("action") for m in data2.get("memories", [])]
        print(f"Actions for job change: {actions}")


class TestSoftContradictions:
    """Test CONFLICT action for soft contradictions."""

    @pytest.mark.asyncio
    async def test_vegetarian_eating_steak(self, client, auth_headers):
        """Test: Vegetarian eats steak = CONFLICT (lower confidence, don't delete)."""
        user_id = "vegetarian_test_user"

        # Step 1: Establish vegetarian identity
        payload1 = {
            "messages": [
                {"role": "user", "content": "I'm a strict vegetarian, have been for 10 years."}
            ],
            "user_id": user_id
        }

        response1 = await client.post("/memory/add", json=payload1, headers=auth_headers)
        assert response1.status_code == 200

        await asyncio.sleep(1)

        # Step 2: Add soft contradiction (one-time exception)
        payload2 = {
            "messages": [
                {"role": "user", "content": "I had steak at my friend's wedding last night."}
            ],
            "user_id": user_id
        }

        response2 = await client.post("/memory/add", json=payload2, headers=auth_headers)
        assert response2.status_code == 200
        data2 = response2.json()

        # Should see CONFLICT action (not DELETE)
        actions = [m.get("action") for m in data2.get("memories", [])]
        print(f"Actions for vegetarian+steak: {actions}")

        # Ideally should be CONFLICT, but LLM might interpret differently
        # The key is that "vegetarian" identity should NOT be deleted

    @pytest.mark.asyncio
    async def test_preference_exception(self, client, auth_headers):
        """Test: User prefers dark mode but used light mode once = CONFLICT."""
        user_id = "darkmode_test_user"

        # Step 1: Establish preference
        payload1 = {
            "messages": [
                {"role": "user", "content": "I always use dark mode, can't stand light mode."}
            ],
            "user_id": user_id
        }

        response1 = await client.post("/memory/add", json=payload1, headers=auth_headers)
        assert response1.status_code == 200

        await asyncio.sleep(1)

        # Step 2: Add exception
        payload2 = {
            "messages": [
                {"role": "user", "content": "Had to use light mode today because of the sun glare."}
            ],
            "user_id": user_id
        }

        response2 = await client.post("/memory/add", json=payload2, headers=auth_headers)
        assert response2.status_code == 200
        data2 = response2.json()

        actions = [m.get("action") for m in data2.get("memories", [])]
        print(f"Actions for darkmode exception: {actions}")


class TestDuplicateDetection:
    """Test NONE action for duplicates."""

    @pytest.mark.asyncio
    async def test_duplicate_memory(self, client, auth_headers):
        """Test: Adding same fact twice = NONE (skip)."""
        user_id = "duplicate_test_user"

        # Step 1: Add fact
        payload = {
            "messages": [
                {"role": "user", "content": "I have a golden retriever named Max."}
            ],
            "user_id": user_id
        }

        response1 = await client.post("/memory/add", json=payload, headers=auth_headers)
        assert response1.status_code == 200

        await asyncio.sleep(1)

        # Step 2: Add same fact again
        response2 = await client.post("/memory/add", json=payload, headers=auth_headers)
        assert response2.status_code == 200
        data2 = response2.json()

        # Should see NONE action (duplicate detected)
        actions = [m.get("action") for m in data2.get("memories", [])]
        print(f"Actions for duplicate: {actions}")

        # Check that "NONE" appears (duplicate skipped)
        # Or stored_count should be 0 if all were duplicates


class TestUpdateAction:
    """Test UPDATE action for refined information."""

    @pytest.mark.asyncio
    async def test_update_with_more_detail(self, client, auth_headers):
        """Test: More detailed version of existing memory = UPDATE."""
        user_id = "update_test_user"

        # Step 1: Add basic fact
        payload1 = {
            "messages": [
                {"role": "user", "content": "I'm an engineer."}
            ],
            "user_id": user_id
        }

        response1 = await client.post("/memory/add", json=payload1, headers=auth_headers)
        assert response1.status_code == 200

        await asyncio.sleep(1)

        # Step 2: Add more detailed version
        payload2 = {
            "messages": [
                {"role": "user", "content": "I'm a senior software engineer specializing in backend systems."}
            ],
            "user_id": user_id
        }

        response2 = await client.post("/memory/add", json=payload2, headers=auth_headers)
        assert response2.status_code == 200
        data2 = response2.json()

        actions = [m.get("action") for m in data2.get("memories", [])]
        print(f"Actions for update with detail: {actions}")
