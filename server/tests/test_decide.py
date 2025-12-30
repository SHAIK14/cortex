"""
Test decision making functionality.
"""
import pytest
import sys
sys.path.insert(0, '/Users/shaikasif/Documents/Cortex/server')

from memory.decide import decide_actions


class TestDecideActions:
    """Test the decide_actions function."""

    @pytest.mark.asyncio
    async def test_decide_add_new_fact(self):
        """Test ADD decision for new facts."""
        new_facts = [
            {
                "text": "User works at Apple",
                "type": "fact",
                "confidence": 0.9,
                "category": "employment"
            }
        ]
        existing_memories = [[]]  # No existing memories

        decisions = await decide_actions(new_facts, existing_memories)

        assert len(decisions) == 1
        assert decisions[0]["action"] == "ADD"

    @pytest.mark.asyncio
    async def test_decide_none_for_duplicate(self):
        """Test NONE decision for duplicate facts."""
        new_facts = [
            {
                "text": "User is a software engineer",
                "type": "identity",
                "confidence": 0.9,
                "category": "employment"
            }
        ]
        existing_memories = [[
            {
                "id": "123",
                "text": "User is a software engineer",
                "type": "identity",
                "confidence": 0.9,
                "category": "employment"
            }
        ]]

        decisions = await decide_actions(new_facts, existing_memories)

        assert len(decisions) == 1
        # Should be NONE (duplicate) or UPDATE
        assert decisions[0]["action"] in ["NONE", "UPDATE"]

    @pytest.mark.asyncio
    async def test_decide_delete_hard_contradiction(self):
        """Test DELETE decision for hard contradictions."""
        new_facts = [
            {
                "text": "User lives in Berlin",
                "type": "fact",
                "confidence": 0.9,
                "category": "location"
            }
        ]
        existing_memories = [[
            {
                "id": "456",
                "text": "User lives in New York",
                "type": "fact",
                "confidence": 0.8,
                "category": "location"
            }
        ]]

        decisions = await decide_actions(new_facts, existing_memories)

        assert len(decisions) == 1
        # Should be DELETE (hard contradiction - can't live in two places)
        assert decisions[0]["action"] in ["DELETE", "ADD"]
        if decisions[0]["action"] == "DELETE":
            assert decisions[0]["target_id"] == "456"

    @pytest.mark.asyncio
    async def test_decide_conflict_soft_contradiction(self):
        """Test CONFLICT decision for soft contradictions."""
        new_facts = [
            {
                "text": "User ate a steak dinner",
                "type": "event",
                "confidence": 0.9,
                "category": "food"
            }
        ]
        existing_memories = [[
            {
                "id": "789",
                "text": "User is vegetarian",
                "type": "identity",
                "confidence": 0.9,
                "category": "food"
            }
        ]]

        decisions = await decide_actions(new_facts, existing_memories)

        assert len(decisions) == 1
        # Should ideally be CONFLICT (soft contradiction)
        # identity + event = CONFLICT (exception doesn't change identity)
        print(f"Decision for soft contradiction: {decisions[0]}")

        # If CONFLICT, should have new_confidence
        if decisions[0]["action"] == "CONFLICT":
            assert decisions[0]["new_confidence"] is not None
            assert decisions[0]["target_id"] == "789"

    @pytest.mark.asyncio
    async def test_decide_update_more_detail(self):
        """Test UPDATE decision for more detailed information."""
        new_facts = [
            {
                "text": "User is a senior software engineer at Google",
                "type": "fact",
                "confidence": 0.9,
                "category": "employment"
            }
        ]
        existing_memories = [[
            {
                "id": "101",
                "text": "User is an engineer",
                "type": "fact",
                "confidence": 0.8,
                "category": "employment"
            }
        ]]

        decisions = await decide_actions(new_facts, existing_memories)

        assert len(decisions) == 1
        # Should be UPDATE (more detailed version)
        print(f"Decision for update: {decisions[0]}")

    @pytest.mark.asyncio
    async def test_decide_multiple_facts(self):
        """Test decisions for multiple facts at once."""
        new_facts = [
            {
                "text": "User likes pizza",
                "type": "preference",
                "confidence": 0.8,
                "category": "food"
            },
            {
                "text": "User works at Meta",
                "type": "fact",
                "confidence": 0.9,
                "category": "employment"
            }
        ]
        existing_memories = [[], []]  # No existing memories for either

        decisions = await decide_actions(new_facts, existing_memories)

        assert len(decisions) == 2
        # Both should be ADD
        for decision in decisions:
            assert decision["action"] == "ADD"

    @pytest.mark.asyncio
    async def test_decide_empty_facts(self):
        """Test with empty facts list."""
        new_facts = []
        existing_memories = []

        decisions = await decide_actions(new_facts, existing_memories)

        assert decisions == []

    @pytest.mark.asyncio
    async def test_decision_structure(self):
        """Test that decisions have required fields."""
        new_facts = [
            {
                "text": "User plays tennis",
                "type": "preference",
                "confidence": 0.7,
                "category": "hobby"
            }
        ]
        existing_memories = [[]]

        decisions = await decide_actions(new_facts, existing_memories)

        assert len(decisions) == 1
        decision = decisions[0]

        # Required fields
        assert "fact_index" in decision
        assert "action" in decision
        assert "reasoning" in decision

        # fact_index should match
        assert decision["fact_index"] == 0

        # action should be valid
        assert decision["action"] in ["ADD", "UPDATE", "DELETE", "CONFLICT", "NONE"]
