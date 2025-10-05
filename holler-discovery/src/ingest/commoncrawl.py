"""Common Crawl Index ingestion."""

import asyncio
import aiohttp
import json
from typing import List, Set, Dict, Any
from urllib.parse import urlparse

from ..config import config
from ..db import db, DiscoveredRaw


class CommonCrawlIngester:
    """Common Crawl Index ingester."""
    
    def __init__(self):
        self.session = None
        self.base_url = config.cc_base
    
    async def __aenter__(self):
        """Async context manager entry."""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=60),
            connector=aiohttp.TCPConnector(limit=10)
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        if self.session:
            await self.session.close()
    
    async def get_latest_crawls(self, count: int = 3) -> List[str]:
        """Get the latest N crawl IDs from Common Crawl."""
        try:
            async with self.session.get(f"{self.base_url}/CC-MAIN-index") as response:
                if response.status == 200:
                    content = await response.text()
                    # Parse the HTML to extract crawl IDs
                    # The CC index page lists crawl IDs in a specific format
                    lines = content.split('\n')
                    crawl_ids = []
                    
                    for line in lines:
                        if 'CC-MAIN-' in line and 'index' in line:
                            # Extract crawl ID from the line
                            parts = line.split()
                            for part in parts:
                                if part.startswith('CC-MAIN-') and 'index' in part:
                                    crawl_id = part.replace('index', '').rstrip('/')
                                    if crawl_id not in crawl_ids:
                                        crawl_ids.append(crawl_id)
                    
                    # Return the latest N crawl IDs
                    return crawl_ids[:count]
                else:
                    print(f"Warning: CC index returned status {response.status}")
                    return []
        
        except Exception as e:
            print(f"Error fetching CC crawl list: {e}")
            return []
    
    async def query_crawl_index(self, crawl_id: str, limit: int = 10000) -> List[Dict[str, Any]]:
        """Query a specific crawl index for URLs."""
        urls = []
        
        # Sample queries for different types of content
        queries = [
            "url:*.pdf",
            "url:*.doc",
            "url:*.docx", 
            "url:*.csv",
            "url:*.json",
            "url:*/documents/*",
            "url:*/minutes/*",
            "url:*/rfp/*",
            "url:*/press/*",
            "url:*/reports/*",
        ]
        
        for query in queries:
            try:
                params = {
                    "url": query,
                    "output": "json",
                    "limit": limit // len(queries)  # Distribute limit across queries
                }
                
                async with self.session.get(
                    f"{self.base_url}/{crawl_id}-index",
                    params=params
                ) as response:
                    if response.status == 200:
                        content = await response.text()
                        lines = content.strip().split('\n')
                        
                        for line in lines:
                            try:
                                data = json.loads(line)
                                url = data.get('url', '').strip()
                                if url:
                                    urls.append({
                                        'url': url,
                                        'timestamp': data.get('timestamp'),
                                        'status': data.get('status'),
                                        'mime': data.get('mime')
                                    })
                            except json.JSONDecodeError:
                                continue
                    
                    elif response.status == 404:
                        print(f"Warning: Crawl {crawl_id} not found")
                    else:
                        print(f"Warning: CC query returned status {response.status}")
            
            except Exception as e:
                print(f"Error querying crawl {crawl_id} with query '{query}': {e}")
            
            # Rate limiting
            await asyncio.sleep(config.request_delay)
        
        return urls[:limit]
    
    def normalize_url(self, url: str) -> str:
        """Normalize URL from Common Crawl."""
        if not url:
            return ""
        
        url = url.strip()
        if not url:
            return ""
        
        # Skip obvious non-web URLs
        if any(skip in url.lower() for skip in ["javascript:", "mailto:", "tel:", "ftp:"]):
            return ""
        
        # Ensure URL has a scheme
        if not url.startswith(("http://", "https://")):
            url = f"https://{url}"
        
        try:
            parsed = urlparse(url)
            if not parsed.netloc:
                return ""
            
            # Reconstruct clean URL
            clean_url = f"https://{parsed.netloc}{parsed.path}"
            if parsed.query:
                clean_url += f"?{parsed.query}"
            if parsed.fragment:
                clean_url += f"#{parsed.fragment}"
            
            return clean_url
        except Exception:
            return ""
    
    async def ingest(self, limit: int = None) -> int:
        """Ingest URLs from Common Crawl."""
        if limit is None:
            limit = config.cc_url_limit
        
        print(f"Ingesting URLs from Common Crawl (limit: {limit})...")
        
        # Get latest crawl IDs
        crawl_ids = await self.get_latest_crawls(config.cc_datasets_recent)
        if not crawl_ids:
            print("No Common Crawl datasets found")
            return 0
        
        print(f"Using crawl IDs: {crawl_ids}")
        
        all_urls = []
        
        # Query each crawl
        for crawl_id in crawl_ids:
            print(f"Querying crawl {crawl_id}...")
            urls = await self.query_crawl_index(crawl_id, limit // len(crawl_ids))
            all_urls.extend(urls)
            print(f"Found {len(urls)} URLs in {crawl_id}")
        
        print(f"Total URLs found: {len(all_urls)}")
        
        if not all_urls:
            return 0
        
        session = db.get_session()
        inserted_count = 0
        
        try:
            for url_data in all_urls:
                url = url_data.get('url', '')
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
                    source="cc"
                )
                session.add(record)
                inserted_count += 1
                
                # Batch commit every 100 records
                if inserted_count % 100 == 0:
                    session.commit()
                    print(f"Inserted {inserted_count} CC URLs...")
            
            session.commit()
            print(f"Common Crawl ingestion complete: {inserted_count} new URLs inserted")
            
        except Exception as e:
            session.rollback()
            print(f"Error during CC ingestion: {e}")
            raise
        finally:
            session.close()
        
        return inserted_count


async def ingest_cc(limit: int = None) -> int:
    """Convenience function for Common Crawl ingestion."""
    async with CommonCrawlIngester() as ingester:
        return await ingester.ingest(limit)
