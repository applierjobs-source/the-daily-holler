"""Tests for sitemap generation."""

import pytest
import tempfile
import gzip
from pathlib import Path
from xml.etree.ElementTree import fromstring
from holler_discovery.pipeline.sitemap_writer import SitemapWriter


class TestSitemapWriter:
    """Test sitemap generation functionality."""
    
    def test_create_sitemap_entry(self):
        """Test individual sitemap entry creation."""
        writer = SitemapWriter()
        
        entry = writer.create_sitemap_entry(
            "https://example.com/page",
            lastmod=None,
            changefreq="daily",
            priority="0.8"
        )
        
        assert entry.tag == "url"
        assert entry.find("loc").text == "https://example.com/page"
        assert entry.find("changefreq").text == "daily"
        assert entry.find("priority").text == "0.8"
        assert entry.find("lastmod") is not None
    
    def test_create_sitemap(self):
        """Test sitemap XML creation."""
        writer = SitemapWriter()
        
        urls = [
            {
                'url': 'https://example.com/page1',
                'lastmod': None
            },
            {
                'url': 'https://example.com/page2',
                'lastmod': None
            }
        ]
        
        sitemap_xml = writer.create_sitemap(urls)
        
        # Parse XML to verify structure
        root = fromstring(sitemap_xml)
        assert root.tag == "urlset"
        assert root.get("xmlns") == "http://www.sitemaps.org/schemas/sitemap/0.9"
        
        url_elements = root.findall("url")
        assert len(url_elements) == 2
        
        # Check first URL entry
        first_url = url_elements[0]
        assert first_url.find("loc").text == "https://example.com/page1"
        assert first_url.find("changefreq").text == "daily"
        assert first_url.find("priority").text == "0.8"
    
    def test_create_sitemap_index(self):
        """Test sitemap index creation."""
        writer = SitemapWriter()
        
        sitemap_files = [
            "sitemaps/sitemap-discover-001.xml.gz",
            "sitemaps/sitemap-discover-002.xml.gz"
        ]
        
        index_xml = writer.create_sitemap_index(sitemap_files)
        
        # Parse XML to verify structure
        root = fromstring(index_xml)
        assert root.tag == "sitemapindex"
        assert root.get("xmlns") == "http://www.sitemaps.org/schemas/sitemap/0.9"
        
        sitemap_elements = root.findall("sitemap")
        assert len(sitemap_elements) == 2
        
        # Check first sitemap entry
        first_sitemap = sitemap_elements[0]
        expected_url = f"{writer.base_url}/sitemaps/sitemap-discover-001.xml.gz"
        assert first_sitemap.find("loc").text == expected_url
        assert first_sitemap.find("lastmod") is not None
    
    def test_generate_sitemaps(self):
        """Test sitemap file generation."""
        with tempfile.TemporaryDirectory() as temp_dir:
            writer = SitemapWriter(output_dir=temp_dir, base_url="https://test.com")
            
            # Mock the get_all_discovery_urls method
            mock_urls = [
                {'url': 'https://test.com/discover/2024-01-01/', 'lastmod': None},
                {'url': 'https://test.com/discover/2024-01-02/', 'lastmod': None},
            ]
            writer.get_all_discovery_urls = lambda: mock_urls
            
            generated_files = writer.generate_sitemaps()
            
            # Should generate sitemap index and sitemap files
            assert len(generated_files) >= 2  # At least index + 1 sitemap
            
            # Check that files exist
            for file_path in generated_files:
                assert Path(file_path).exists()
            
            # Check sitemap index
            index_path = Path(temp_dir) / "sitemap-index.xml"
            assert index_path.exists()
            
            # Verify sitemap index content
            with open(index_path, 'r', encoding='utf-8') as f:
                index_content = f.read()
                assert "sitemapindex" in index_content
                assert "https://test.com/" in index_content
    
    def test_sitemap_sharding(self):
        """Test that sitemaps are properly sharded."""
        with tempfile.TemporaryDirectory() as temp_dir:
            writer = SitemapWriter(output_dir=temp_dir, base_url="https://test.com")
            writer.urls_per_file = 1  # Small limit for testing
            
            # Mock URLs
            mock_urls = [
                {'url': f'https://test.com/discover/2024-01-{i:02d}/', 'lastmod': None}
                for i in range(1, 4)  # 3 URLs
            ]
            writer.get_all_discovery_urls = lambda: mock_urls
            
            generated_files = writer.generate_sitemaps()
            
            # Should generate 3 sitemap files + 1 index
            sitemap_files = [f for f in generated_files if 'sitemap-discover' in f]
            assert len(sitemap_files) == 3
            
            # Each sitemap should contain exactly 1 URL
            for sitemap_file in sitemap_files:
                with gzip.open(sitemap_file, 'rt', encoding='utf-8') as f:
                    content = f.read()
                    root = fromstring(content)
                    url_elements = root.findall("url")
                    assert len(url_elements) == 1
    
    def test_gzip_compression(self):
        """Test that sitemap files are gzipped."""
        with tempfile.TemporaryDirectory() as temp_dir:
            writer = SitemapWriter(output_dir=temp_dir, base_url="https://test.com")
            
            # Mock URLs
            mock_urls = [
                {'url': 'https://test.com/discover/2024-01-01/', 'lastmod': None}
            ]
            writer.get_all_discovery_urls = lambda: mock_urls
            
            generated_files = writer.generate_sitemaps()
            
            # Find sitemap files (not the index)
            sitemap_files = [f for f in generated_files if f.endswith('.xml.gz')]
            assert len(sitemap_files) >= 1
            
            # Verify gzip compression
            for sitemap_file in sitemap_files:
                with gzip.open(sitemap_file, 'rt', encoding='utf-8') as f:
                    content = f.read()
                    assert "urlset" in content
                    assert "https://test.com/discover/2024-01-01/" in content
