"""Discovery scoring and prioritization system."""

import re
import json
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
from urllib.parse import urlparse
from dataclasses import dataclass

from ..config import config
from ..db import db, DiscoveredKept, RunManifest


@dataclass
class DiscoverySignals:
    """Sub-scores and signals used in discovery scoring."""
    unseen_likelihood: float = 0.0
    host_novelty: float = 0.0
    content_readiness: float = 0.0
    link_yield: float = 0.0
    source_reliability: float = 0.0
    freshness: float = 0.0
    safety: float = 0.0
    topic_boost: float = 0.0


class DiscoveryRanker:
    """Ranks discovered URLs using multiple signals."""
    
    def __init__(self):
        self.config = config
        
        # Document-like path patterns
        self.doc_patterns = [
            r'/documents?/',
            r'/minutes/',
            r'/rfp/',
            r'/press/',
            r'/reports?/',
            r'/publications?/',
            r'/research/',
            r'/studies/',
            r'/data/',
            r'/datasets?/',
        ]
        
        # Suspicious TLDs (small penalty)
        self.suspicious_tlds = {
            'tk', 'ml', 'ga', 'cf', 'tk', 'ml', 'ga', 'cf'
        }
        
        # Adult/for-sale keywords (safety penalty)
        self.safety_penalty_keywords = {
            'adult', 'porn', 'xxx', 'sex', 'dating', 'escort',
            'for-sale', 'forsale', 'buy-now', 'purchase'
        }
    
    def compute_discovery_score(self, url: str, host: str, tld: str, 
                              parking_score: float, novelty_score: float,
                              source: str, seen_at: datetime) -> Tuple[float, DiscoverySignals]:
        """Compute discovery score (0-100) for a URL."""
        signals = DiscoverySignals()
        
        # 1. Unseen Likelihood (0-1)
        signals.unseen_likelihood = self._compute_unseen_likelihood(
            host, tld, parking_score, novelty_score
        )
        
        # 2. Host Novelty (0-1)
        signals.host_novelty = self._compute_host_novelty(host, tld, novelty_score)
        
        # 3. Content Readiness (0-1)
        signals.content_readiness = self._compute_content_readiness(
            url, parking_score, host
        )
        
        # 4. Link Yield Potential (0-1)
        signals.link_yield = self._compute_link_yield(url, host)
        
        # 5. Source Reliability (0-1)
        signals.source_reliability = self._compute_source_reliability(source)
        
        # 6. Freshness/Recency (0-1)
        signals.freshness = self._compute_freshness(seen_at)
        
        # 7. Quality/Safety (0-1)
        signals.safety = self._compute_safety(url, host, tld)
        
        # 8. Topic Boost (0-1) - optional
        signals.topic_boost = self._compute_topic_boost(url, host)
        
        # Weighted score calculation
        score = (
            signals.unseen_likelihood * self.config.rank_weights_unseen +
            signals.host_novelty * self.config.rank_weights_host_novelty +
            signals.content_readiness * self.config.rank_weights_content_ready +
            signals.link_yield * self.config.rank_weights_link_yield +
            signals.source_reliability * self.config.rank_weights_source_rel +
            signals.freshness * self.config.rank_weights_freshness +
            signals.safety * self.config.rank_weights_safety +
            signals.topic_boost * self.config.rank_weights_topic
        ) * 100  # Convert to 0-100 scale
        
        # Clamp to 0-100
        score = max(0.0, min(100.0, score))
        
        return score, signals
    
    def _compute_unseen_likelihood(self, host: str, tld: str, 
                                 parking_score: float, novelty_score: float) -> float:
        """Compute how likely this is to be unseen content."""
        score = 0.0
        
        # High novelty score indicates unseen content
        score += novelty_score * 0.4
        
        # Low parking score indicates real content
        score += (1.0 - parking_score) * 0.3
        
        # New TLDs often have fresh content
        if tld in ['app', 'dev', 'io', 'ai', 'co']:
            score += 0.2
        
        # Subdomains often indicate new projects
        if host.count('.') >= 2:
            score += 0.1
        
        return min(1.0, score)
    
    def _compute_host_novelty(self, host: str, tld: str, novelty_score: float) -> float:
        """Compute host novelty score."""
        score = 0.0
        
        # Direct novelty score
        score += novelty_score * 0.5
        
        # Rare TLDs
        if tld in ['app', 'dev', 'io', 'ai', 'co', 'tech', 'online']:
            score += 0.3
        
        # Subdomain patterns
        if any(pattern in host for pattern in ['new', 'beta', 'test', 'staging']):
            score += 0.2
        
        return min(1.0, score)
    
    def _compute_content_readiness(self, url: str, parking_score: float, host: str) -> float:
        """Compute content readiness score."""
        score = 0.0
        
        # Low parking score = real content
        score += (1.0 - parking_score) * 0.6
        
        # Document-like paths
        if any(re.search(pattern, url, re.IGNORECASE) for pattern in self.doc_patterns):
            score += 0.3
        
        # File extensions
        if any(url.lower().endswith(f'.{ext}') for ext in config.doc_extensions):
            score += 0.2
        
        # Sitemap presence (heuristic based on common patterns)
        if any(pattern in host for pattern in ['docs', 'documentation', 'help', 'support']):
            score += 0.1
        
        return min(1.0, score)
    
    def _compute_link_yield(self, url: str, host: str) -> float:
        """Compute link yield potential."""
        score = 0.0
        
        # Document-like paths
        if any(re.search(pattern, url, re.IGNORECASE) for pattern in self.doc_patterns):
            score += 0.4
        
        # File extensions
        if any(url.lower().endswith(f'.{ext}') for ext in config.doc_extensions):
            score += 0.3
        
        # Government/org patterns
        if any(pattern in host for pattern in ['.gov', '.org', '.edu', '.mil']):
            score += 0.2
        
        # News/media patterns
        if any(pattern in host for pattern in ['news', 'media', 'press', 'journal']):
            score += 0.1
        
        return min(1.0, score)
    
    def _compute_source_reliability(self, source: str) -> float:
        """Compute source reliability score."""
        reliability_map = {
            'ct': 1.0,    # Certificate Transparency - highest
            'rss': 0.9,   # RSS feeds - very high
            'cc': 0.7,    # Common Crawl - good
            'seed': 0.8,  # Seed URLs - high
        }
        return reliability_map.get(source, 0.5)
    
    def _compute_freshness(self, seen_at: datetime) -> float:
        """Compute freshness score based on when URL was seen."""
        now = datetime.now(seen_at.tzinfo) if seen_at.tzinfo else datetime.now()
        hours_ago = (now - seen_at).total_seconds() / 3600
        
        if hours_ago <= 1:
            return 1.0
        elif hours_ago <= 6:
            return 0.9
        elif hours_ago <= 24:
            return 0.7
        elif hours_ago <= 72:
            return 0.5
        else:
            return 0.2
    
    def _compute_safety(self, url: str, host: str, tld: str) -> float:
        """Compute safety score."""
        score = 1.0
        
        # Check for safety penalty keywords
        url_lower = url.lower()
        host_lower = host.lower()
        
        for keyword in self.safety_penalty_keywords:
            if keyword in url_lower or keyword in host_lower:
                score -= 0.3
        
        # Suspicious TLD penalty
        if tld in self.suspicious_tlds:
            score -= 0.1
        
        # Malware-like patterns
        if any(pattern in url_lower for pattern in ['malware', 'virus', 'trojan']):
            score -= 0.5
        
        return max(0.0, score)
    
    def _compute_topic_boost(self, url: str, host: str) -> float:
        """Compute topic boost score (optional)."""
        # This can be customized based on your focus areas
        boost_keywords = {
            'government', 'policy', 'research', 'data', 'transparency',
            'civic', 'public', 'open', 'democracy', 'accountability'
        }
        
        url_lower = url.lower()
        host_lower = host.lower()
        
        boost = 0.0
        for keyword in boost_keywords:
            if keyword in url_lower or keyword in host_lower:
                boost += 0.1
        
        return min(1.0, boost)
    
    def map_to_priority_class(self, score: float) -> int:
        """Map discovery score to priority class."""
        if score >= 80:
            return 0  # P0
        elif score >= 60:
            return 1  # P1
        elif score >= 40:
            return 2  # P2
        else:
            return 3  # P3
    
    def compute_next_check_at(self, priority_class: int, current_time: datetime) -> Optional[datetime]:
        """Compute next check time for P2/P3 items."""
        if priority_class in [0, 1]:  # P0/P1 don't need backoff
            return None
        
        # P2/P3 backoff schedule
        if priority_class == 2:  # P2
            hours = self.config.backoff_start_hours
        else:  # P3
            hours = self.config.backoff_start_hours * self.config.backoff_multiplier
        
        # Cap at max hours
        hours = min(hours, self.config.backoff_max_hours)
        
        return current_time + timedelta(hours=hours)
    
    async def rank_urls(self, min_publish_score: float = None, 
                       profile_score: float = None) -> Dict[str, int]:
        """Rank all URLs in discovered_kept table."""
        if min_publish_score is None:
            min_publish_score = self.config.min_publish_score
        if profile_score is None:
            profile_score = self.config.profile_score
        
        # Get all URLs that need ranking
        session = db.get_session()
        try:
            urls = session.query(DiscoveredKept).filter(
                DiscoveredKept.discovery_score == 0.0  # Only rank unranked URLs
            ).all()
            
            print(f"Ranking {len(urls)} URLs...")
            
            # Process each URL
            for url_record in urls:
                score, signals = self.compute_discovery_score(
                    url_record.url,
                    url_record.host,
                    url_record.tld or '',
                    url_record.parking_score,
                    url_record.novelty_score,
                    'unknown',  # Source not stored in discovered_kept
                    url_record.picked_at
                )
                
                priority_class = self.map_to_priority_class(score)
                next_check_at = self.compute_next_check_at(priority_class, datetime.now())
                
                # Update the record
                url_record.discovery_score = score
                url_record.priority_class = priority_class
                url_record.signals = {
                    'unseen_likelihood': signals.unseen_likelihood,
                    'host_novelty': signals.host_novelty,
                    'content_readiness': signals.content_readiness,
                    'link_yield': signals.link_yield,
                    'source_reliability': signals.source_reliability,
                    'freshness': signals.freshness,
                    'safety': signals.safety,
                    'topic_boost': signals.topic_boost,
                }
                url_record.next_check_at = next_check_at
            
            session.commit()
            
            # Count by priority class
            counts = {
                'P0': session.query(DiscoveredKept).filter(DiscoveredKept.priority_class == 0).count(),
                'P1': session.query(DiscoveredKept).filter(DiscoveredKept.priority_class == 1).count(),
                'P2': session.query(DiscoveredKept).filter(DiscoveredKept.priority_class == 2).count(),
                'P3': session.query(DiscoveredKept).filter(DiscoveredKept.priority_class == 3).count(),
            }
            
            # Compute average score
            avg_score = session.query(db.func.avg(DiscoveredKept.discovery_score)).scalar() or 0.0
            
            print(f"Ranking complete:")
            print(f"  P0 (≥80): {counts['P0']} URLs")
            print(f"  P1 (60-79): {counts['P1']} URLs")
            print(f"  P2 (40-59): {counts['P2']} URLs")
            print(f"  P3 (<40): {counts['P3']} URLs")
            print(f"  Average score: {avg_score:.2f}")
            
            return counts
            
        finally:
            session.close()
    
    async def get_publishable_urls(self, min_score: float = None) -> List[DiscoveredKept]:
        """Get URLs that should be published (P0/P1)."""
        if min_score is None:
            min_score = self.config.min_publish_score
        
        session = db.get_session()
        try:
            urls = session.query(DiscoveredKept).filter(
                DiscoveredKept.discovery_score >= min_score,
                DiscoveredKept.priority_class.in_([0, 1])  # P0 and P1 only
            ).order_by(DiscoveredKept.discovery_score.desc()).all()
            
            return urls
        finally:
            session.close()
    
    async def update_run_manifest(self, run_date: str, counts: Dict[str, int], avg_score: float):
        """Update run manifest with ranking metrics."""
        session = db.get_session()
        try:
            manifest = session.query(RunManifest).filter(
                RunManifest.run_date == run_date
            ).first()
            
            if manifest:
                manifest.p0_count = counts['P0']
                manifest.p1_count = counts['P1']
                manifest.p2_count = counts['P2']
                manifest.p3_count = counts['P3']
                manifest.avg_score = avg_score
                session.commit()
        finally:
            session.close()


# Global ranker instance
ranker = DiscoveryRanker()
