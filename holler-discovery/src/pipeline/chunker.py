"""URL chunking and pagination utilities."""

import math
from typing import List, Dict, Any, Iterator
from collections import defaultdict
from sqlalchemy import func

from ..config import config
from ..db import db, DiscoveredKept


class URLChunker:
    """URL chunking and pagination system."""
    
    def __init__(self, links_per_page: int = None):
        self.links_per_page = links_per_page or config.links_per_page
    
    def get_urls_for_date(self, date_str: str, min_score: float = None) -> List[Dict[str, Any]]:
        """Get URLs picked on a specific date, optionally filtered by score."""
        if min_score is None:
            min_score = config.min_publish_score
        
        session = db.get_session()
        
        try:
            # Query URLs picked on the given date, only P0/P1 (priority_class 0,1)
            # and above minimum score
            records = session.query(DiscoveredKept).filter(
                func.date(DiscoveredKept.picked_at) == date_str,
                DiscoveredKept.discovery_score >= min_score,
                DiscoveredKept.priority_class.in_([0, 1])  # P0 and P1 only
            ).order_by(
                DiscoveredKept.discovery_score.desc(),  # Order by discovery score
                DiscoveredKept.novelty_score.desc(),
                DiscoveredKept.parking_score.asc()
            ).all()
            
            # Convert to dict format
            urls = []
            for record in records:
                urls.append({
                    'url': record.url,
                    'host': record.host,
                    'tld': record.tld,
                    'parking_score': record.parking_score,
                    'novelty_score': record.novelty_score,
                    'discovery_score': record.discovery_score,
                    'priority_class': record.priority_class,
                    'signals': record.signals or {},
                    'picked_at': record.picked_at
                })
            
            return urls
            
        finally:
            session.close()
    
    def chunk_urls(self, urls: List[Dict[str, Any]]) -> Iterator[List[Dict[str, Any]]]:
        """Chunk URLs into pages."""
        for i in range(0, len(urls), self.links_per_page):
            yield urls[i:i + self.links_per_page]
    
    def get_page_count(self, url_count: int) -> int:
        """Calculate number of pages needed."""
        return math.ceil(url_count / self.links_per_page)
    
    def get_page_info(self, url_count: int, page_num: int) -> Dict[str, Any]:
        """Get information about a specific page."""
        total_pages = self.get_page_count(url_count)
        
        return {
            'page_num': page_num,
            'total_pages': total_pages,
            'has_prev': page_num > 1,
            'has_next': page_num < total_pages,
            'prev_page': page_num - 1 if page_num > 1 else None,
            'next_page': page_num + 1 if page_num < total_pages else None,
            'start_index': (page_num - 1) * self.links_per_page + 1,
            'end_index': min(page_num * self.links_per_page, url_count)
        }
    
    def get_sample_hosts(self, urls: List[Dict[str, Any]], max_hosts: int = 5) -> List[str]:
        """Get sample hostnames for page description."""
        hosts = []
        seen_hosts = set()
        
        for url_data in urls[:max_hosts * 2]:  # Look at more URLs to get diverse hosts
            host = url_data.get('host', '')
            if host and host not in seen_hosts:
                hosts.append(host)
                seen_hosts.add(host)
                if len(hosts) >= max_hosts:
                    break
        
        return hosts
    
    def get_navigation_info(self, date_str: str, page_num: int) -> Dict[str, Any]:
        """Get navigation information for a page."""
        urls = self.get_urls_for_date(date_str)
        url_count = len(urls)
        
        page_info = self.get_page_info(url_count, page_num)
        
        # Get sample hosts for description
        sample_hosts = self.get_sample_hosts(urls)
        
        return {
            'date': date_str,
            'page_info': page_info,
            'sample_hosts': sample_hosts,
            'total_urls': url_count
        }
    
    def get_day_navigation(self, date_str: str) -> Dict[str, Any]:
        """Get navigation info for day index."""
        from datetime import datetime, timedelta
        
        # Parse date
        try:
            current_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return {'error': 'Invalid date format'}
        
        # Get URLs for this date
        urls = self.get_urls_for_date(date_str)
        url_count = len(urls)
        total_pages = self.get_page_count(url_count)
        
        # Check for previous/next days
        prev_date = current_date - timedelta(days=1)
        next_date = current_date + timedelta(days=1)
        
        # Check if previous/next days have data
        has_prev_day = self.get_urls_for_date(prev_date.strftime('%Y-%m-%d'))
        has_next_day = self.get_urls_for_date(next_date.strftime('%Y-%m-%d'))
        
        return {
            'date': date_str,
            'total_urls': url_count,
            'total_pages': total_pages,
            'has_prev_day': bool(has_prev_day),
            'has_next_day': bool(has_next_day),
            'prev_date': prev_date.strftime('%Y-%m-%d') if has_prev_day else None,
            'next_date': next_date.strftime('%Y-%m-%d') if has_next_day else None
        }
