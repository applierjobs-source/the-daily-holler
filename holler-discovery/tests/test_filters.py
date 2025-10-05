"""Tests for URL filtering and scoring."""

import pytest
from holler_discovery.pipeline.filters import URLFilter
from holler_discovery.ingest.normalize import URLNormalizer


class TestURLNormalizer:
    """Test URL normalization and scoring."""
    
    def test_normalize_url(self):
        """Test URL normalization."""
        normalizer = URLNormalizer()
        
        # Test basic normalization
        assert normalizer.normalize_url("https://www.example.com/path") == "https://example.com/path"
        assert normalizer.normalize_url("http://example.com/path/") == "http://example.com/path"
        assert normalizer.normalize_url("example.com") == "https://example.com/"
        
        # Test invalid URLs
        assert normalizer.normalize_url("") is None
        assert normalizer.normalize_url("invalid") is None
        assert normalizer.normalize_url("mailto:test@example.com") is None
    
    def test_parking_score(self):
        """Test parking score calculation."""
        normalizer = URLNormalizer()
        
        # Test obvious parking URLs
        assert normalizer.calculate_parking_score("https://parking.example.com") > 0.3
        assert normalizer.calculate_parking_score("https://example.com/for-sale") > 0.3
        assert normalizer.calculate_parking_score("https://example.com/coming-soon") > 0.3
        
        # Test normal URLs
        assert normalizer.calculate_parking_score("https://example.com/document.pdf") < 0.3
        assert normalizer.calculate_parking_score("https://news.example.com/article") < 0.3
    
    def test_novelty_score(self):
        """Test novelty score calculation."""
        normalizer = URLNormalizer()
        
        # Test document extensions
        assert normalizer.calculate_novelty_score("https://example.com/report.pdf") > 0.5
        assert normalizer.calculate_novelty_score("https://example.com/data.csv") > 0.5
        
        # Test document paths
        assert normalizer.calculate_novelty_score("https://example.com/documents/report") > 0.5
        assert normalizer.calculate_novelty_score("https://example.com/research/paper") > 0.5
        
        # Test simple URLs
        assert normalizer.calculate_novelty_score("https://example.com") < 0.5
    
    def test_should_keep_url(self):
        """Test URL keeping logic."""
        normalizer = URLNormalizer()
        
        # Test documents (should always keep)
        assert normalizer.should_keep_url("https://example.com/report.pdf")
        assert normalizer.should_keep_url("https://example.com/data.json")
        
        # Test high novelty scores
        assert normalizer.should_keep_url("https://example.com/documents/report")
        
        # Test low parking scores
        assert normalizer.should_keep_url("https://news.example.com/article")
        
        # Test parking pages (should not keep)
        assert not normalizer.should_keep_url("https://parking.example.com")


class TestURLFilter:
    """Test URL filtering pipeline."""
    
    def test_calculate_scores(self):
        """Test score calculation for multiple URLs."""
        filterer = URLFilter()
        urls = [
            "https://example.com/document.pdf",
            "https://parking.example.com",
            "https://news.example.com/article"
        ]
        
        scores = filterer.calculate_scores(urls)
        
        assert len(scores) == 3
        assert all(url in scores for url in urls)
        assert all('parking_score' in score for score in scores.values())
        assert all('novelty_score' in score for score in scores.values())
    
    def test_apply_host_caps(self):
        """Test per-host URL limiting."""
        filterer = URLFilter()
        
        # Create URLs from same host
        urls_with_scores = {
            "https://example.com/page1": {'parking_score': 0.1, 'novelty_score': 0.8},
            "https://example.com/page2": {'parking_score': 0.2, 'novelty_score': 0.7},
            "https://example.com/page3": {'parking_score': 0.3, 'novelty_score': 0.6},
            "https://example.com/page4": {'parking_score': 0.4, 'novelty_score': 0.5},
            "https://other.com/page1": {'parking_score': 0.1, 'novelty_score': 0.9},
        }
        
        # Apply cap of 2 URLs per host
        capped = filterer.apply_host_caps(urls_with_scores, host_cap=2)
        
        # Should keep 2 URLs from example.com (highest novelty scores)
        example_urls = [url for url in capped.keys() if 'example.com' in url]
        assert len(example_urls) == 2
        
        # Should keep 1 URL from other.com
        other_urls = [url for url in capped.keys() if 'other.com' in url]
        assert len(other_urls) == 1
    
    def test_filter_urls(self):
        """Test URL filtering by thresholds."""
        filterer = URLFilter()
        
        urls_with_scores = {
            "https://example.com/document.pdf": {'parking_score': 0.1, 'novelty_score': 0.8},
            "https://parking.example.com": {'parking_score': 0.9, 'novelty_score': 0.1},
            "https://news.example.com/article": {'parking_score': 0.2, 'novelty_score': 0.6},
        }
        
        filtered = filterer.filter_urls(urls_with_scores)
        
        # Should keep document and news article, but not parking page
        assert "https://example.com/document.pdf" in filtered
        assert "https://news.example.com/article" in filtered
        assert "https://parking.example.com" not in filtered
    
    def test_deduplicate_urls(self):
        """Test URL deduplication."""
        filterer = URLFilter()
        
        urls_with_scores = {
            "https://example.com/path": {'parking_score': 0.1, 'novelty_score': 0.8},
            "https://www.example.com/path": {'parking_score': 0.2, 'novelty_score': 0.7},
            "https://example.com/other": {'parking_score': 0.1, 'novelty_score': 0.9},
        }
        
        deduplicated = filterer.deduplicate_urls(urls_with_scores)
        
        # Should keep 2 URLs (one deduplicated, one unique)
        assert len(deduplicated) == 2
        # Should keep the one with higher novelty score
        assert any(urls_with_scores[url]['novelty_score'] == 0.8 for url in deduplicated.keys())
        assert "https://example.com/other" in deduplicated
