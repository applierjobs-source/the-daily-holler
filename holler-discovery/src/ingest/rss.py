"""RSS feed ingestion."""

import asyncio
import aiohttp
import feedparser
from typing import List, Set
from urllib.parse import urlparse, urljoin
from pathlib import Path

from ..config import config
from ..db import db, DiscoveredRaw


class RSSIngester:
    """RSS feed ingester."""
    
    def __init__(self):
        self.session = None
    
    async def __aenter__(self):
        """Async context manager entry."""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            connector=aiohttp.TCPConnector(limit=10)
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        if self.session:
            await self.session.close()
    
    def load_feeds(self, feeds_path: str = None) -> List[str]:
        """Load RSS feed URLs from file."""
        if feeds_path is None:
            feeds_path = config.rss_feeds_path
        
        feeds_path = Path(feeds_path)
        if not feeds_path.exists():
            print(f"Warning: RSS feeds file not found: {feeds_path}")
            return []
        
        feeds = []
        with open(feeds_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    feeds.append(line)
        
        print(f"Loaded {len(feeds)} RSS feeds from {feeds_path}")
        return feeds
    
    async def fetch_feed(self, feed_url: str) -> List[str]:
        """Fetch URLs from a single RSS feed."""
        urls = []
        
        try:
            async with self.session.get(feed_url) as response:
                if response.status == 200:
                    content = await response.text()
                    feed = feedparser.parse(content)
                    
                    for entry in feed.entries:
                        # Get the main link
                        if hasattr(entry, 'link'):
                            urls.append(entry.link)
                        
                        # Also check for enclosures (podcasts, etc.)
                        if hasattr(entry, 'enclosures'):
                            for enclosure in entry.enclosures:
                                if hasattr(enclosure, 'href'):
                                    urls.append(enclosure.href)
                    
                    print(f"Found {len(urls)} URLs in {feed_url}")
                else:
                    print(f"Warning: RSS feed {feed_url} returned status {response.status}")
        
        except Exception as e:
            print(f"Error fetching RSS feed {feed_url}: {e}")
        
        return urls
    
    def normalize_url(self, url: str) -> str:
        """Normalize URL."""
        if not url:
            return ""
        
        url = url.strip()
        if not url:
            return ""
        
        # Skip obvious non-web URLs
        if any(skip in url.lower() for skip in ["mailto:", "tel:", "ftp:", "file:"]):
            return ""
        
        # Ensure URL has a scheme
        if not url.startswith(("http://", "https://")):
            url = f"https://{url}"
        
        try:
            parsed = urlparse(url)
            if not parsed.netloc:
                return ""
            
            # Reconstruct URL with https scheme
            return f"https://{parsed.netloc}{parsed.path}{parsed.params}{parsed.query}{parsed.fragment}"
        except Exception:
            return ""
    
    async def ingest(self, feeds_path: str = None) -> int:
        """Ingest URLs from RSS feeds."""
        feeds = self.load_feeds(feeds_path)
        if not feeds:
            return 0
        
        print(f"Ingesting URLs from {len(feeds)} RSS feeds...")
        
        all_urls = set()
        
        # Fetch all feeds concurrently
        tasks = [self.fetch_feed(feed_url) for feed_url in feeds]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for result in results:
            if isinstance(result, list):
                all_urls.update(result)
            elif isinstance(result, Exception):
                print(f"Error in RSS feed processing: {result}")
        
        print(f"Found {len(all_urls)} unique URLs from RSS feeds")
        
        if not all_urls:
            return 0
        
        session = db.get_session()
        inserted_count = 0
        
        try:
            for url in all_urls:
                normalized_url = self.normalize_url(url)
                if not normalized_url:
                    continue
                
                # Check if URL already exists
                existing = session.query(DiscoveredRaw).filter(DiscoveredRaw.url == normalized_url).first()
                if existing:
                    continue
                
                # Extract host and TLD
                try:
                    parsed = urlparse(normalized_url)
                    host = parsed.netloc.lower()
                    tld = host.split('.')[-1] if '.' in host else ''
                except Exception:
                    continue
                
                # Insert new record
                record = DiscoveredRaw(
                    url=normalized_url,
                    host=host,
                    tld=tld,
                    source="rss"
                )
                session.add(record)
                inserted_count += 1
                
                # Batch commit every 100 records
                if inserted_count % 100 == 0:
                    session.commit()
                    print(f"Inserted {inserted_count} RSS URLs...")
            
            session.commit()
            print(f"RSS ingestion complete: {inserted_count} new URLs inserted")
            
        except Exception as e:
            session.rollback()
            print(f"Error during RSS ingestion: {e}")
            raise
        finally:
            session.close()
        
        return inserted_count


async def ingest_rss(feeds_path: str = None) -> int:
    """Convenience function for RSS ingestion."""
    async with RSSIngester() as ingester:
        return await ingester.ingest(feeds_path)
