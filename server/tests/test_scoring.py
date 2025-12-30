"""
Test hybrid scoring and ranking functionality.
"""
import pytest
from datetime import datetime, timezone, timedelta
import sys
sys.path.insert(0, '/Users/shaikasif/Documents/Cortex/server')

from memory.retrieve import calculate_hybrid_score
from memory.fusion import reciprocal_rank_fusion


class TestHybridScoring:
    """Test the calculate_hybrid_score function."""

    def test_score_components(self):
        """Test that score includes all components."""
        memory = {
            "id": "test-1",
            "text": "User likes Python",
            "type": "preference",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "access_count": 10
        }

        score = calculate_hybrid_score(memory, similarity=0.8)

        # Score should be between 0 and 1
        assert 0 <= score <= 1

        # With high similarity and recent memory, score should be decent
        assert score > 0.3

    def test_recency_decay(self):
        """Test that older memories get lower recency scores."""
        now = datetime.now(timezone.utc)

        new_memory = {
            "id": "new",
            "text": "Recent fact",
            "type": "fact",
            "created_at": now.isoformat(),
            "access_count": 0
        }

        old_memory = {
            "id": "old",
            "text": "Old fact",
            "type": "fact",
            "created_at": (now - timedelta(days=60)).isoformat(),
            "access_count": 0
        }

        new_score = calculate_hybrid_score(new_memory, similarity=0.8)
        old_score = calculate_hybrid_score(old_memory, similarity=0.8)

        # New memory should have higher score due to recency
        assert new_score > old_score

    def test_type_weights(self):
        """Test that identity type gets higher weight than event."""
        now = datetime.now(timezone.utc).isoformat()

        identity_memory = {
            "id": "identity",
            "text": "User is a doctor",
            "type": "identity",
            "created_at": now,
            "access_count": 0
        }

        event_memory = {
            "id": "event",
            "text": "User went to doctor",
            "type": "event",
            "created_at": now,
            "access_count": 0
        }

        identity_score = calculate_hybrid_score(identity_memory, similarity=0.8)
        event_score = calculate_hybrid_score(event_memory, similarity=0.8)

        # Identity should score higher than event
        assert identity_score > event_score

    def test_access_frequency(self):
        """Test that frequently accessed memories score higher."""
        now = datetime.now(timezone.utc).isoformat()

        popular_memory = {
            "id": "popular",
            "text": "Popular fact",
            "type": "fact",
            "created_at": now,
            "access_count": 100
        }

        unpopular_memory = {
            "id": "unpopular",
            "text": "Unpopular fact",
            "type": "fact",
            "created_at": now,
            "access_count": 0
        }

        popular_score = calculate_hybrid_score(popular_memory, similarity=0.8)
        unpopular_score = calculate_hybrid_score(unpopular_memory, similarity=0.8)

        # Popular should score higher
        assert popular_score > unpopular_score

    def test_similarity_dominates(self):
        """Test that similarity has highest weight when difference is large enough."""
        now = datetime.now(timezone.utc).isoformat()

        high_similarity = {
            "id": "high-sim",
            "text": "High similarity",
            "type": "fact",  # Same type to isolate similarity
            "created_at": now,  # Same recency
            "access_count": 0
        }

        low_similarity = {
            "id": "low-sim",
            "text": "Low similarity",
            "type": "fact",  # Same type
            "created_at": now,  # Same recency
            "access_count": 0  # Same access count
        }

        high_sim_score = calculate_hybrid_score(high_similarity, similarity=0.95)
        low_sim_score = calculate_hybrid_score(low_similarity, similarity=0.3)

        # With same other factors, higher similarity should win
        assert high_sim_score > low_sim_score


class TestReciprocalRankFusion:
    """Test the RRF algorithm."""

    def test_rrf_basic(self):
        """Test basic RRF with two lists."""
        vector_results = [
            {"id": "a", "text": "First", "similarity": 0.9},
            {"id": "b", "text": "Second", "similarity": 0.8},
            {"id": "c", "text": "Third", "similarity": 0.7}
        ]

        keyword_results = [
            {"id": "b", "text": "Second", "rank": 0.9},
            {"id": "d", "text": "Fourth", "rank": 0.8},
            {"id": "a", "text": "First", "rank": 0.7}
        ]

        fused = reciprocal_rank_fusion(vector_results, keyword_results)

        # Should contain all unique IDs
        ids = [m["id"] for m in fused]
        assert "a" in ids
        assert "b" in ids
        assert "c" in ids
        assert "d" in ids

        # Items in both lists should rank higher
        # "a" and "b" are in both lists

    def test_rrf_empty_lists(self):
        """Test RRF with empty lists."""
        fused = reciprocal_rank_fusion([], [])
        assert fused == []

    def test_rrf_one_empty(self):
        """Test RRF with one empty list."""
        vector_results = [
            {"id": "a", "text": "First", "similarity": 0.9}
        ]

        fused = reciprocal_rank_fusion(vector_results, [])

        assert len(fused) == 1
        assert fused[0]["id"] == "a"

    def test_rrf_no_overlap(self):
        """Test RRF with no overlapping results."""
        vector_results = [
            {"id": "a", "text": "First"},
            {"id": "b", "text": "Second"}
        ]

        keyword_results = [
            {"id": "c", "text": "Third"},
            {"id": "d", "text": "Fourth"}
        ]

        fused = reciprocal_rank_fusion(vector_results, keyword_results)

        # Should contain all 4
        assert len(fused) == 4

    def test_rrf_score_assignment(self):
        """Test that RRF assigns scores."""
        vector_results = [
            {"id": "a", "text": "First", "similarity": 0.9}
        ]

        keyword_results = [
            {"id": "a", "text": "First", "rank": 0.8}
        ]

        fused = reciprocal_rank_fusion(vector_results, keyword_results)

        assert len(fused) == 1
        # Should have rrf_score
        assert "rrf_score" in fused[0]
        # Score from both lists should be higher
        assert fused[0]["rrf_score"] > 0
