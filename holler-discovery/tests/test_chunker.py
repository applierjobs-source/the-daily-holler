"""Tests for URL chunking and pagination."""

import pytest
from holler_discovery.pipeline.chunker import URLChunker


class TestURLChunker:
    """Test URL chunking functionality."""
    
    def test_chunk_urls(self):
        """Test URL chunking into pages."""
        chunker = URLChunker(links_per_page=3)
        
        urls = [
            {'url': f'https://example{i}.com', 'host': f'example{i}.com'}
            for i in range(10)
        ]
        
        chunks = list(chunker.chunk_urls(urls))
        
        # Should have 4 chunks (10 URLs / 3 per page = 4 pages)
        assert len(chunks) == 4
        
        # First 3 chunks should have 3 URLs each
        for i in range(3):
            assert len(chunks[i]) == 3
        
        # Last chunk should have 1 URL
        assert len(chunks[3]) == 1
    
    def test_get_page_count(self):
        """Test page count calculation."""
        chunker = URLChunker(links_per_page=5)
        
        assert chunker.get_page_count(0) == 0
        assert chunker.get_page_count(5) == 1
        assert chunker.get_page_count(10) == 2
        assert chunker.get_page_count(13) == 3  # 13 / 5 = 3 pages
    
    def test_get_page_info(self):
        """Test page information generation."""
        chunker = URLChunker(links_per_page=5)
        
        # Test page 1 of 3
        info = chunker.get_page_info(10, 1)
        assert info['page_num'] == 1
        assert info['total_pages'] == 2
        assert info['has_prev'] == False
        assert info['has_next'] == True
        assert info['prev_page'] is None
        assert info['next_page'] == 2
        assert info['start_index'] == 1
        assert info['end_index'] == 5
        
        # Test page 2 of 3
        info = chunker.get_page_info(10, 2)
        assert info['page_num'] == 2
        assert info['total_pages'] == 2
        assert info['has_prev'] == True
        assert info['has_next'] == False
        assert info['prev_page'] == 1
        assert info['next_page'] is None
        assert info['start_index'] == 6
        assert info['end_index'] == 10
        
        # Test invalid page number
        with pytest.raises(ValueError):
            chunker.get_page_info(10, 3)
    
    def test_get_sample_hosts(self):
        """Test sample host extraction."""
        chunker = URLChunker()
        
        urls = [
            {'url': 'https://example1.com/page1', 'host': 'example1.com'},
            {'url': 'https://example2.com/page2', 'host': 'example2.com'},
            {'url': 'https://example1.com/page3', 'host': 'example1.com'},  # Duplicate host
            {'url': 'https://example3.com/page4', 'host': 'example3.com'},
        ]
        
        sample_hosts = chunker.get_sample_hosts(urls, max_hosts=3)
        
        # Should get unique hosts up to max_hosts
        assert len(sample_hosts) <= 3
        assert 'example1.com' in sample_hosts
        assert 'example2.com' in sample_hosts
        assert all(host in ['example1.com', 'example2.com', 'example3.com'] for host in sample_hosts)
    
    def test_get_navigation_info(self):
        """Test navigation information generation."""
        chunker = URLChunker(links_per_page=5)
        
        # Mock the get_urls_for_date method
        urls = [
            {'url': f'https://example{i}.com', 'host': f'example{i}.com'}
            for i in range(12)
        ]
        
        # Mock the method
        original_method = chunker.get_urls_for_date
        chunker.get_urls_for_date = lambda date: urls
        
        try:
            nav_info = chunker.get_navigation_info('2024-01-01', 2)
            
            assert nav_info['date'] == '2024-01-01'
            assert nav_info['page_info']['page_num'] == 2
            assert nav_info['page_info']['total_pages'] == 3
            assert nav_info['total_urls'] == 12
            assert len(nav_info['sample_hosts']) <= 5
        finally:
            # Restore original method
            chunker.get_urls_for_date = original_method
    
    def test_get_day_navigation(self):
        """Test day navigation information."""
        chunker = URLChunker()
        
        # Mock the get_urls_for_date method
        def mock_get_urls(date):
            if date == '2024-01-01':
                return [{'url': f'https://example{i}.com', 'host': f'example{i}.com'} for i in range(5)]
            elif date == '2023-12-31':
                return [{'url': f'https://old{i}.com', 'host': f'old{i}.com'} for i in range(3)]
            else:
                return []
        
        original_method = chunker.get_urls_for_date
        chunker.get_urls_for_date = mock_get_urls
        
        try:
            nav_info = chunker.get_day_navigation('2024-01-01')
            
            assert nav_info['date'] == '2024-01-01'
            assert nav_info['total_urls'] == 5
            assert nav_info['total_pages'] == 1  # 5 URLs / 200 per page = 1 page
            assert nav_info['has_prev_day'] == True
            assert nav_info['has_next_day'] == False
            assert nav_info['prev_date'] == '2023-12-31'
            assert nav_info['next_date'] is None
        finally:
            # Restore original method
            chunker.get_urls_for_date = original_method
