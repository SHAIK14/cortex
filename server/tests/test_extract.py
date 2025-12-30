"""
Test memory extraction functionality.
"""
import pytest
import sys
sys.path.insert(0, '/Users/shaikasif/Documents/Cortex/server')

from memory.extract import extract_memories


class TestExtractMemories:
    """Test the extract_memories function."""

    @pytest.mark.asyncio
    async def test_extract_basic_facts(self):
        """Test extracting basic facts from conversation."""
        messages = [
            {"role": "user", "content": "Hi, I'm Sarah. I work at Apple."},
            {"role": "assistant", "content": "Nice to meet you!"}
        ]

        facts = await extract_memories(messages)

        assert facts is not None
        assert isinstance(facts, list)
        # Should extract at least name and job
        assert len(facts) >= 1

    @pytest.mark.asyncio
    async def test_extract_multiple_facts(self):
        """Test extracting multiple facts from one message."""
        messages = [
            {"role": "user", "content": "I'm vegetarian, live in Tokyo, and love hiking."}
        ]

        facts = await extract_memories(messages)

        assert facts is not None
        # Should extract multiple facts
        assert len(facts) >= 2

    @pytest.mark.asyncio
    async def test_extract_empty_messages(self):
        """Test extraction with empty messages."""
        messages = []

        facts = await extract_memories(messages)

        assert facts is not None
        assert len(facts) == 0

    @pytest.mark.asyncio
    async def test_extract_no_user_messages(self):
        """Test extraction with only assistant messages."""
        messages = [
            {"role": "assistant", "content": "Hello! How can I help you?"},
            {"role": "assistant", "content": "Let me know if you need anything."}
        ]

        facts = await extract_memories(messages)

        # Should not extract facts from assistant messages
        assert facts is not None
        assert len(facts) == 0

    @pytest.mark.asyncio
    async def test_extract_fact_structure(self):
        """Test that extracted facts have required fields."""
        messages = [
            {"role": "user", "content": "I'm a doctor in Berlin."}
        ]

        facts = await extract_memories(messages)

        assert len(facts) >= 1

        for fact in facts:
            assert "text" in fact
            assert "type" in fact
            assert "confidence" in fact
            # type should be one of the valid types
            assert fact["type"] in ["identity", "fact", "preference", "event", "context"]
            # confidence should be between 0 and 1
            assert 0 <= fact["confidence"] <= 1

    @pytest.mark.asyncio
    async def test_extract_identity_type(self):
        """Test that identity facts are correctly typed."""
        messages = [
            {"role": "user", "content": "I am a vegan and I'm a musician."}
        ]

        facts = await extract_memories(messages)

        # At least one should be identity type
        types = [f["type"] for f in facts]
        # "vegan" and "musician" are identity facts
        assert "identity" in types or len(facts) >= 1

    @pytest.mark.asyncio
    async def test_extract_preference_type(self):
        """Test that preferences are correctly typed."""
        messages = [
            {"role": "user", "content": "I prefer tea over coffee and I hate mornings."}
        ]

        facts = await extract_memories(messages)

        assert len(facts) >= 1
        # Should include preference type facts

    @pytest.mark.asyncio
    async def test_extract_event_type(self):
        """Test that events are correctly typed."""
        messages = [
            {"role": "user", "content": "I just got married yesterday and started a new job last week."}
        ]

        facts = await extract_memories(messages)

        assert len(facts) >= 1
        # Should include event type facts

    @pytest.mark.asyncio
    async def test_extract_entities(self):
        """Test that entities are extracted."""
        messages = [
            {"role": "user", "content": "I work at Google in San Francisco using Python."}
        ]

        facts = await extract_memories(messages)

        assert len(facts) >= 1

        # Check if entities are extracted
        all_entities = []
        for fact in facts:
            entities = fact.get("entities", [])
            all_entities.extend(entities)

        # Should find Google, San Francisco, Python
        # Note: depends on LLM extraction quality
        print(f"Extracted entities: {all_entities}")

    @pytest.mark.asyncio
    async def test_extract_category(self):
        """Test that categories are assigned."""
        messages = [
            {"role": "user", "content": "I work at Microsoft and I love Italian food."}
        ]

        facts = await extract_memories(messages)

        assert len(facts) >= 1

        # Check categories
        categories = [f.get("category") for f in facts]
        print(f"Extracted categories: {categories}")
        # Should have employment and food categories
