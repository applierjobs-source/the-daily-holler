"""Certificate Transparency log ingestion."""

import asyncio
import aiohttp
from datetime import datetime, timedelta
from typing import List, Set
from urllib.parse import urlparse, urljoin

from ..config import config
from ..db import db, DiscoveredRaw


class CTIngester:
    """Certificate Transparency log ingester."""
    
    def __init__(self):
        self.crt_sh_base = "https://crt.sh"
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
    
    async def fetch_domains(self, hours_back: int = 24) -> List[str]:
        """Fetch domains from CT logs for the last N hours."""
        # Calculate timestamp for N hours ago
        cutoff_time = datetime.utcnow() - timedelta(hours=hours_back)
        cutoff_timestamp = int(cutoff_time.timestamp())
        
        domains = set()
        
        # Query crt.sh for certificates issued in the last N hours
        query = f"""
        SELECT DISTINCT name_value 
        FROM certificate_identity 
        WHERE id IN (
            SELECT certificate_id 
            FROM ct_log_entry 
            WHERE timestamp >= {cutoff_timestamp}
        )
        AND name_type = 'dNSName'
        LIMIT 10000
        """
        
        params = {
            "q": query,
            "output": "json"
        }
        
        try:
            async with self.session.get(f"{self.crt_sh_base}/", params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    for item in data:
                        domain = item.get("name_value", "").strip()
                        if domain and not domain.startswith("*"):
                            domains.add(domain.lower())
                else:
                    print(f"Warning: CT API returned status {response.status}")
        
        except Exception as e:
            print(f"Error fetching from CT logs: {e}")
        
        return list(domains)
    
    def normalize_url(self, domain: str) -> str:
        """Normalize domain to full URL."""
        if not domain:
            return ""
        
        # Remove any leading/trailing whitespace and make lowercase
        domain = domain.strip().lower()
        
        # Skip invalid domains
        if not domain or "." not in domain or len(domain) < 3:
            return ""
        
        # Skip obvious non-website domains
        if any(skip in domain for skip in ["localhost", "127.0.0.1", "::1", "example.com"]):
            return ""
        
        # Add https:// if no scheme
        if not domain.startswith(("http://", "https://")):
            domain = f"https://{domain}"
        
        try:
            parsed = urlparse(domain)
            if parsed.netloc:
                return f"https://{parsed.netloc}/"
        except Exception:
            return ""
        
        return ""
    
    async def ingest(self, hours_back: int = None) -> int:
        """Ingest domains from CT logs."""
        if hours_back is None:
            hours_back = config.ct_lookback_hours
        
        print(f"Fetching domains from CT logs (last {hours_back} hours)...")
        
        domains = await self.fetch_domains(hours_back)
        print(f"Found {len(domains)} unique domains from CT logs")
        
        if not domains:
            return 0
        
        session = db.get_session()
        inserted_count = 0
        
        try:
            for domain in domains:
                url = self.normalize_url(domain)
                if not url:
                    continue
                
                # Check if URL already exists
                existing = session.query(DiscoveredRaw).filter(DiscoveredRaw.url == url).first()
                if existing:
                    continue
                
                # Extract host and TLD
                try:
                    parsed = urlparse(url)
                    host = parsed.netloc.lower()
                    tld = host.split('.')[-1] if '.' in host else ''
                except Exception:
                    continue
                
                # Insert new record
                record = DiscoveredRaw(
                    url=url,
                    host=host,
                    tld=tld,
                    source="ct"
                )
                session.add(record)
                inserted_count += 1
                
                # Batch commit every 100 records
                if inserted_count % 100 == 0:
                    session.commit()
                    print(f"Inserted {inserted_count} CT URLs...")
            
            session.commit()
            print(f"CT ingestion complete: {inserted_count} new URLs inserted")
            
        except Exception as e:
            session.rollback()
            print(f"Error during CT ingestion: {e}")
            raise
        finally:
            session.close()
        
        return inserted_count


async def ingest_ct(hours_back: int = None) -> int:
    """Convenience function for CT ingestion."""
    async with CTIngester() as ingester:
        return await ingester.ingest(hours_back)
