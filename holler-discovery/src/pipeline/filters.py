"""URL filtering and scoring pipeline."""

from typing import List, Dict, Set
from collections import defaultdict
from sqlalchemy import func

from ..config import config
from ..db import db, DiscoveredRaw, DiscoveredKept
from ..ingest.normalize import URLNormalizer


class URLFilter:
    """URL filtering and scoring system."""
    
    def __init__(self):
        self.normalizer = URLNormalizer()
    
    def calculate_scores(self, urls: List[str]) -> Dict[str, Dict[str, float]]:
        """Calculate parking and novelty scores for URLs."""
        scores = {}
        
        for url in urls:
            parking_score = self.normalizer.calculate_parking_score(url)
            novelty_score = self.normalizer.calculate_novelty_score(url)
            
            scores[url] = {
                'parking_score': parking_score,
                'novelty_score': novelty_score
            }
        
        return scores
    
    def apply_host_caps(self, urls_with_scores: Dict[str, Dict[str, float]], 
                       host_cap: int = None) -> Dict[str, Dict[str, float]]:
        """Apply per-host URL limits."""
        if host_cap is None:
            host_cap = config.host_cap
        
        # Group URLs by host
        host_groups = defaultdict(list)
        for url, scores in urls_with_scores.items():
            try:
                from urllib.parse import urlparse
                host = urlparse(url).netloc.lower()
                host_groups[host].append((url, scores))
            except Exception:
                continue
        
        # Apply caps and keep best URLs per host
        capped_urls = {}
        
        for host, host_urls in host_groups.items():
            # Sort by novelty score (descending), then by parking score (ascending)
            sorted_urls = sorted(
                host_urls,
                key=lambda x: (x[1]['novelty_score'], -x[1]['parking_score']),
                reverse=True
            )
            
            # Take up to host_cap URLs
            for url, scores in sorted_urls[:host_cap]:
                capped_urls[url] = scores
        
        return capped_urls
    
    def filter_urls(self, urls_with_scores: Dict[str, Dict[str, float]]) -> Dict[str, Dict[str, float]]:
        """Filter URLs based on parking and novelty thresholds."""
        filtered_urls = {}
        
        for url, scores in urls_with_scores.items():
            parking_score = scores['parking_score']
            novelty_score = scores['novelty_score']
            
            # Apply filtering logic
            if self.normalizer.should_keep_url(
                url, 
                config.parking_threshold, 
                config.novelty_threshold
            ):
                filtered_urls[url] = scores
        
        return filtered_urls
    
    def deduplicate_urls(self, urls_with_scores: Dict[str, Dict[str, float]]) -> Dict[str, Dict[str, float]]:
        """Remove duplicate URLs (keep best score)."""
        # Group by normalized URL
        normalized_groups = defaultdict(list)
        
        for url, scores in urls_with_scores.items():
            normalized = self.normalizer.normalize_url(url)
            if normalized:
                normalized_groups[normalized].append((url, scores))
        
        # Keep the best URL from each group
        deduplicated = {}
        
        for normalized_url, group in normalized_groups.items():
            if len(group) == 1:
                url, scores = group[0]
                deduplicated[url] = scores
            else:
                # Multiple URLs normalize to the same thing - pick the best one
                best_url, best_scores = max(
                    group,
                    key=lambda x: (x[1]['novelty_score'], -x[1]['parking_score'])
                )
                deduplicated[best_url] = best_scores
        
        return deduplicated
    
    def process_batch(self, urls: List[str], host_cap: int = None) -> Dict[str, Dict[str, float]]:
        """Process a batch of URLs through the full filtering pipeline."""
        print(f"Processing {len(urls)} URLs through filtering pipeline...")
        
        # Calculate scores
        print("Calculating parking and novelty scores...")
        scored_urls = self.calculate_scores(urls)
        
        # Apply host caps
        print(f"Applying host caps (max {host_cap or config.host_cap} per host)...")
        capped_urls = self.apply_host_caps(scored_urls, host_cap)
        print(f"After host capping: {len(capped_urls)} URLs")
        
        # Filter by thresholds
        print(f"Filtering by thresholds (parking < {config.parking_threshold}, novelty >= {config.novelty_threshold})...")
        filtered_urls = self.filter_urls(capped_urls)
        print(f"After filtering: {len(filtered_urls)} URLs")
        
        # Deduplicate
        print("Deduplicating URLs...")
        deduplicated_urls = self.deduplicate_urls(filtered_urls)
        print(f"After deduplication: {len(deduplicated_urls)} URLs")
        
        return deduplicated_urls


def filter_raw_urls(host_cap: int = None) -> int:
    """Filter raw URLs and move good ones to discovered_kept table."""
    session = db.get_session()
    
    try:
        # Get all raw URLs that haven't been processed
        raw_urls = session.query(DiscoveredRaw).all()
        
        if not raw_urls:
            print("No raw URLs to process")
            return 0
        
        print(f"Found {len(raw_urls)} raw URLs to process")
        
        # Extract URLs for processing
        urls = [record.url for record in raw_urls]
        
        # Process through filtering pipeline
        filterer = URLFilter()
        processed_urls = filterer.process_batch(urls, host_cap)
        
        # Insert good URLs into discovered_kept
        inserted_count = 0
        for url, scores in processed_urls.items():
            # Check if already exists in kept table
            existing = session.query(DiscoveredKept).filter(DiscoveredKept.url == url).first()
            if existing:
                continue
            
            # Get the original record for host/tld info
            original = next((r for r in raw_urls if r.url == url), None)
            if not original:
                continue
            
            # Create new kept record
            kept_record = DiscoveredKept(
                url=url,
                host=original.host,
                tld=original.tld,
                parking_score=scores['parking_score'],
                novelty_score=scores['novelty_score']
            )
            session.add(kept_record)
            inserted_count += 1
            
            # Batch commit
            if inserted_count % 100 == 0:
                session.commit()
                print(f"Inserted {inserted_count} kept URLs...")
        
        session.commit()
        print(f"Filtering complete: {inserted_count} URLs moved to discovered_kept")
        
        return inserted_count
        
    except Exception as e:
        session.rollback()
        print(f"Error during filtering: {e}")
        raise
    finally:
        session.close()
