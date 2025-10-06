"""Tests for the discovery ranker."""

import pytest
from datetime import datetime, timedelta
from unittest.mock import Mock, patch

from src.pipeline.ranker import DiscoveryRanker, DiscoverySignals


class TestDiscoverySignals:
    """Test DiscoverySignals dataclass."""
    
    def test_default_values(self):
        """Test default signal values."""
        signals = DiscoverySignals()
        assert signals.unseen_likelihood == 0.0
        assert signals.host_novelty == 0.0
        assert signals.content_readiness == 0.0
        assert signals.link_yield == 0.0
        assert signals.source_reliability == 0.0
        assert signals.freshness == 0.0
        assert signals.safety == 0.0
        assert signals.topic_boost == 0.0


class TestDiscoveryRanker:
    """Test DiscoveryRanker class."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.ranker = DiscoveryRanker()
    
    def test_compute_unseen_likelihood(self):
        """Test unseen likelihood computation."""
        # High novelty, low parking = high unseen likelihood
        score = self.ranker._compute_unseen_likelihood(
            host="example.com", tld="com", parking_score=0.1, novelty_score=0.9
        )
        assert 0.0 <= score <= 1.0
        assert score > 0.5  # Should be high
        
        # Low novelty, high parking = low unseen likelihood
        score = self.ranker._compute_unseen_likelihood(
            host="example.com", tld="com", parking_score=0.9, novelty_score=0.1
        )
        assert 0.0 <= score <= 1.0
        assert score < 0.5  # Should be low
        
        # New TLD should boost score
        score_new_tld = self.ranker._compute_unseen_likelihood(
            host="example.app", tld="app", parking_score=0.5, novelty_score=0.5
        )
        score_old_tld = self.ranker._compute_unseen_likelihood(
            host="example.com", tld="com", parking_score=0.5, novelty_score=0.5
        )
        assert score_new_tld > score_old_tld
    
    def test_compute_host_novelty(self):
        """Test host novelty computation."""
        # High novelty score should result in high host novelty
        score = self.ranker._compute_host_novelty(
            host="example.com", tld="com", novelty_score=0.9
        )
        assert 0.0 <= score <= 1.0
        assert score > 0.5
        
        # Rare TLD should boost score
        score_rare = self.ranker._compute_host_novelty(
            host="example.io", tld="io", novelty_score=0.5
        )
        score_common = self.ranker._compute_host_novelty(
            host="example.com", tld="com", novelty_score=0.5
        )
        assert score_rare > score_common
        
        # Subdomain patterns should boost score
        score_subdomain = self.ranker._compute_host_novelty(
            host="new.example.com", tld="com", novelty_score=0.5
        )
        score_regular = self.ranker._compute_host_novelty(
            host="example.com", tld="com", novelty_score=0.5
        )
        assert score_subdomain > score_regular
    
    def test_compute_content_readiness(self):
        """Test content readiness computation."""
        # Low parking score should result in high content readiness
        score = self.ranker._compute_content_readiness(
            url="https://example.com/page", parking_score=0.1, host="example.com"
        )
        assert 0.0 <= score <= 1.0
        assert score > 0.5
        
        # Document-like paths should boost score
        score_doc = self.ranker._compute_content_readiness(
            url="https://example.com/documents/report.pdf", parking_score=0.5, host="example.com"
        )
        score_regular = self.ranker._compute_content_readiness(
            url="https://example.com/page", parking_score=0.5, host="example.com"
        )
        assert score_doc > score_regular
        
        # File extensions should boost score
        score_pdf = self.ranker._compute_content_readiness(
            url="https://example.com/report.pdf", parking_score=0.5, host="example.com"
        )
        score_html = self.ranker._compute_content_readiness(
            url="https://example.com/page.html", parking_score=0.5, host="example.com"
        )
        assert score_pdf > score_html
    
    def test_compute_link_yield(self):
        """Test link yield computation."""
        # Document-like paths should have high link yield
        score = self.ranker._compute_link_yield(
            url="https://example.com/documents/report.pdf", host="example.com"
        )
        assert 0.0 <= score <= 1.0
        assert score > 0.5
        
        # Government domains should have higher yield
        score_gov = self.ranker._compute_link_yield(
            url="https://example.gov/report.pdf", host="example.gov"
        )
        score_com = self.ranker._compute_link_yield(
            url="https://example.com/report.pdf", host="example.com"
        )
        assert score_gov > score_com
    
    def test_compute_source_reliability(self):
        """Test source reliability computation."""
        # CT should have highest reliability
        assert self.ranker._compute_source_reliability('ct') == 1.0
        
        # RSS should be high
        assert self.ranker._compute_source_reliability('rss') == 0.9
        
        # CC should be medium
        assert self.ranker._compute_source_reliability('cc') == 0.7
        
        # Unknown should be low
        assert self.ranker._compute_source_reliability('unknown') == 0.5
    
    def test_compute_freshness(self):
        """Test freshness computation."""
        now = datetime.now()
        
        # Very recent should be 1.0
        recent = now - timedelta(minutes=30)
        assert self.ranker._compute_freshness(recent) == 1.0
        
        # 1 hour ago should be 1.0
        hour_ago = now - timedelta(hours=1)
        assert self.ranker._compute_freshness(hour_ago) == 1.0
        
        # 6 hours ago should be 0.9
        six_hours_ago = now - timedelta(hours=6)
        assert self.ranker._compute_freshness(six_hours_ago) == 0.9
        
        # 24 hours ago should be 0.7
        day_ago = now - timedelta(hours=24)
        assert self.ranker._compute_freshness(day_ago) == 0.7
        
        # 72 hours ago should be 0.5
        three_days_ago = now - timedelta(hours=72)
        assert self.ranker._compute_freshness(three_days_ago) == 0.5
        
        # Very old should be 0.2
        week_ago = now - timedelta(days=7)
        assert self.ranker._compute_freshness(week_ago) == 0.2
    
    def test_compute_safety(self):
        """Test safety computation."""
        # Clean URL should be 1.0
        score = self.ranker._compute_safety(
            url="https://example.com/page", host="example.com", tld="com"
        )
        assert score == 1.0
        
        # Adult content should reduce score
        score_adult = self.ranker._compute_safety(
            url="https://adult.example.com/page", host="adult.example.com", tld="com"
        )
        assert score_adult < 1.0
        
        # Suspicious TLD should reduce score
        score_suspicious = self.ranker._compute_safety(
            url="https://example.tk/page", host="example.tk", tld="tk"
        )
        assert score_suspicious < 1.0
    
    def test_compute_topic_boost(self):
        """Test topic boost computation."""
        # Government-related content should get boost
        score_gov = self.ranker._compute_topic_boost(
            url="https://example.gov/policy", host="example.gov"
        )
        assert score_gov > 0.0
        
        # Research content should get boost
        score_research = self.ranker._compute_topic_boost(
            url="https://research.example.com/study", host="research.example.com"
        )
        assert score_research > 0.0
        
        # Regular content should have no boost
        score_regular = self.ranker._compute_topic_boost(
            url="https://example.com/page", host="example.com"
        )
        assert score_regular == 0.0
    
    def test_compute_discovery_score(self):
        """Test full discovery score computation."""
        # High-quality URL should get high score
        score, signals = self.ranker.compute_discovery_score(
            url="https://research.example.gov/documents/report.pdf",
            host="research.example.gov",
            tld="gov",
            parking_score=0.1,
            novelty_score=0.9,
            source="ct",
            seen_at=datetime.now()
        )
        
        assert 0.0 <= score <= 100.0
        assert score > 70.0  # Should be high quality
        
        # Check that all signals are computed
        assert signals.unseen_likelihood > 0.0
        assert signals.host_novelty > 0.0
        assert signals.content_readiness > 0.0
        assert signals.link_yield > 0.0
        assert signals.source_reliability > 0.0
        assert signals.freshness > 0.0
        assert signals.safety > 0.0
    
    def test_map_to_priority_class(self):
        """Test priority class mapping."""
        # High scores should map to P0
        assert self.ranker.map_to_priority_class(85.0) == 0
        assert self.ranker.map_to_priority_class(80.0) == 0
        
        # Medium-high scores should map to P1
        assert self.ranker.map_to_priority_class(79.0) == 1
        assert self.ranker.map_to_priority_class(60.0) == 1
        
        # Medium scores should map to P2
        assert self.ranker.map_to_priority_class(59.0) == 2
        assert self.ranker.map_to_priority_class(40.0) == 2
        
        # Low scores should map to P3
        assert self.ranker.map_to_priority_class(39.0) == 3
        assert self.ranker.map_to_priority_class(0.0) == 3
    
    def test_compute_next_check_at(self):
        """Test next check time computation."""
        now = datetime.now()
        
        # P0/P1 should not have next check time
        assert self.ranker.compute_next_check_at(0, now) is None
        assert self.ranker.compute_next_check_at(1, now) is None
        
        # P2 should have next check time
        next_check_p2 = self.ranker.compute_next_check_at(2, now)
        assert next_check_p2 is not None
        assert next_check_p2 > now
        
        # P3 should have longer next check time
        next_check_p3 = self.ranker.compute_next_check_at(3, now)
        assert next_check_p3 is not None
        assert next_check_p3 > next_check_p2
    
    @pytest.mark.asyncio
    async def test_rank_urls(self):
        """Test URL ranking process."""
        # Mock database session
        with patch('src.pipeline.ranker.db') as mock_db:
            # Mock URL records
            mock_record1 = Mock()
            mock_record1.url = "https://example.com/page1"
            mock_record1.host = "example.com"
            mock_record1.tld = "com"
            mock_record1.parking_score = 0.1
            mock_record1.novelty_score = 0.9
            mock_record1.picked_at = datetime.now()
            mock_record1.discovery_score = 0.0
            mock_record1.priority_class = 2
            mock_record1.signals = None
            mock_record1.next_check_at = None
            
            mock_record2 = Mock()
            mock_record2.url = "https://example.org/page2"
            mock_record2.host = "example.org"
            mock_record2.tld = "org"
            mock_record2.parking_score = 0.2
            mock_record2.novelty_score = 0.8
            mock_record2.picked_at = datetime.now()
            mock_record2.discovery_score = 0.0
            mock_record2.priority_class = 2
            mock_record2.signals = None
            mock_record2.next_check_at = None
            
            # Mock session
            mock_session = Mock()
            mock_session.query.return_value.filter.return_value.all.return_value = [mock_record1, mock_record2]
            mock_session.query.return_value.filter.return_value.count.return_value = 1
            mock_db.get_session.return_value = mock_session
            
            # Run ranking
            counts = await self.ranker.rank_urls()
            
            # Check results
            assert isinstance(counts, dict)
            assert 'P0' in counts
            assert 'P1' in counts
            assert 'P2' in counts
            assert 'P3' in counts
            
            # Check that records were updated
            assert mock_record1.discovery_score > 0.0
            assert mock_record1.priority_class in [0, 1, 2, 3]
            assert mock_record1.signals is not None
            
            # Commit should have been called
            mock_session.commit.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_get_publishable_urls(self):
        """Test getting publishable URLs."""
        # Mock database session
        with patch('src.pipeline.ranker.db') as mock_db:
            # Mock URL records
            mock_record = Mock()
            mock_record.url = "https://example.com/page"
            mock_record.host = "example.com"
            mock_record.discovery_score = 75.0
            mock_record.priority_class = 1
            
            # Mock session
            mock_session = Mock()
            mock_session.query.return_value.filter.return_value.order_by.return_value.all.return_value = [mock_record]
            mock_db.get_session.return_value = mock_session
            
            # Get publishable URLs
            urls = await self.ranker.get_publishable_urls()
            
            # Check results
            assert len(urls) == 1
            assert urls[0].url == "https://example.com/page"
            
            # Check query filters
            query_call = mock_session.query.call_args[0][0]
            assert query_call.__name__ == 'DiscoveredKept'
    
    def test_boundary_conditions(self):
        """Test boundary conditions for scoring."""
        # Test score clamping
        score, _ = self.ranker.compute_discovery_score(
            url="https://example.com/page",
            host="example.com",
            tld="com",
            parking_score=0.0,  # Best possible
            novelty_score=1.0,  # Best possible
            source="ct",        # Best possible
            seen_at=datetime.now()  # Most recent
        )
        assert 0.0 <= score <= 100.0
        
        # Test edge case with worst possible values
        score, _ = self.ranker.compute_discovery_score(
            url="https://adult.example.tk/page",
            host="adult.example.tk",
            tld="tk",
            parking_score=1.0,  # Worst possible
            novelty_score=0.0,  # Worst possible
            source="unknown",   # Worst possible
            seen_at=datetime.now() - timedelta(days=30)  # Very old
        )
        assert 0.0 <= score <= 100.0
        assert score < 50.0  # Should be low quality


class TestRankerIntegration:
    """Integration tests for the ranker."""
    
    def test_score_consistency(self):
        """Test that scores are consistent for similar inputs."""
        ranker = DiscoveryRanker()
        
        # Same inputs should produce same scores
        score1, _ = ranker.compute_discovery_score(
            url="https://example.com/page",
            host="example.com",
            tld="com",
            parking_score=0.5,
            novelty_score=0.5,
            source="ct",
            seen_at=datetime.now()
        )
        
        score2, _ = ranker.compute_discovery_score(
            url="https://example.com/page",
            host="example.com",
            tld="com",
            parking_score=0.5,
            novelty_score=0.5,
            source="ct",
            seen_at=datetime.now()
        )
        
        assert abs(score1 - score2) < 0.01  # Should be nearly identical
    
    def test_priority_distribution(self):
        """Test that priority classes are distributed reasonably."""
        ranker = DiscoveryRanker()
        
        # Test with various score ranges
        test_scores = [0, 20, 40, 60, 80, 100]
        priority_counts = {0: 0, 1: 0, 2: 0, 3: 0}
        
        for score in test_scores:
            priority = ranker.map_to_priority_class(score)
            priority_counts[priority] += 1
        
        # Should have some distribution across classes
        assert sum(priority_counts.values()) == len(test_scores)
        assert priority_counts[0] > 0  # Some P0
        assert priority_counts[3] > 0  # Some P3


if __name__ == '__main__':
    pytest.main([__file__])
