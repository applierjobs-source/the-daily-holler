"""Configuration management for holler-discovery."""

import os
from typing import List, Optional
from dataclasses import dataclass


@dataclass
class Config:
    """Configuration for the discovery system."""
    
    # Database
    database_url: str = os.getenv("DATABASE_URL", "")
    
    # Ingest settings
    ct_lookback_hours: int = int(os.getenv("CT_LOOKBACK_HOURS", "24"))
    rss_feeds_path: str = os.getenv("RSS_FEEDS_PATH", "config/feeds.txt")
    cc_datasets_recent: int = int(os.getenv("CC_DATASETS_RECENT", "3"))
    cc_url_limit: int = int(os.getenv("CC_URL_LIMIT", "10000"))
    cc_base: str = os.getenv("CC_BASE", "https://index.commoncrawl.org")
    
    # Filter settings
    host_cap: int = int(os.getenv("HOST_CAP", "500"))
    parking_threshold: float = float(os.getenv("PARKING_THRESHOLD", "0.3"))
    novelty_threshold: float = float(os.getenv("NOVELTY_THRESHOLD", "0.5"))
    doc_extensions: List[str] = None
    
    def __post_init__(self):
        if self.doc_extensions is None:
            self.doc_extensions = os.getenv("DOC_EXTENSIONS", "pdf,csv,json,txt").split(",")
    
    # Generate settings
    links_per_page: int = int(os.getenv("LINKS_PER_PAGE", "200"))
    
    # Sitemap settings
    sitemap_urls_per_file: int = int(os.getenv("SITEMAP_URLS_PER_FILE", "50000"))
    base_url: str = os.getenv("BASE_URL", "https://holler.news")
    
    # Publish mode
    output_mode: str = os.getenv("OUTPUT_MODE", "commit")  # commit|s3|r2
    
    # S3/R2 settings (for future use)
    s3_bucket: Optional[str] = os.getenv("S3_BUCKET")
    s3_prefix: str = os.getenv("S3_PREFIX", "/")
    s3_region: str = os.getenv("S3_REGION", "us-east-1")
    
    # GitHub settings
    github_token: Optional[str] = os.getenv("GITHUB_TOKEN")
    github_repo: str = os.getenv("GITHUB_REPO", "holler.news/indiesage")
    github_branch: str = os.getenv("GITHUB_BRANCH", "main")
    
    # Rate limiting
    request_delay: float = float(os.getenv("REQUEST_DELAY", "0.1"))
    max_retries: int = int(os.getenv("MAX_RETRIES", "3"))
    
    # Ranking weights (must sum to 1.0)
    rank_weights_unseen: float = float(os.getenv("RANK_WEIGHTS_UNSEEN", "0.28"))
    rank_weights_host_novelty: float = float(os.getenv("RANK_WEIGHTS_HOST_NOVELTY", "0.20"))
    rank_weights_content_ready: float = float(os.getenv("RANK_WEIGHTS_CONTENT_READY", "0.16"))
    rank_weights_link_yield: float = float(os.getenv("RANK_WEIGHTS_LINK_YIELD", "0.14"))
    rank_weights_source_rel: float = float(os.getenv("RANK_WEIGHTS_SOURCE_REL", "0.10"))
    rank_weights_freshness: float = float(os.getenv("RANK_WEIGHTS_FRESHNESS", "0.06"))
    rank_weights_safety: float = float(os.getenv("RANK_WEIGHTS_SAFETY", "0.04"))
    rank_weights_topic: float = float(os.getenv("RANK_WEIGHTS_TOPIC", "0.02"))
    
    # Ranking thresholds
    min_publish_score: float = float(os.getenv("MIN_PUBLISH_SCORE", "60.0"))
    profile_score: float = float(os.getenv("PROFILE_SCORE", "80.0"))
    
    # Backoff settings
    backoff_start_hours: int = int(os.getenv("BACKOFF_START_HOURS", "6"))
    backoff_max_hours: int = int(os.getenv("BACKOFF_MAX_HOURS", "48"))
    backoff_multiplier: float = float(os.getenv("BACKOFF_MULTIPLIER", "2.0"))
    
    def __post_init__(self):
        if self.doc_extensions is None:
            self.doc_extensions = os.getenv("DOC_EXTENSIONS", "pdf,csv,json,txt").split(",")
        
        # Validate ranking weights sum to 1.0
        total_weight = (
            self.rank_weights_unseen +
            self.rank_weights_host_novelty +
            self.rank_weights_content_ready +
            self.rank_weights_link_yield +
            self.rank_weights_source_rel +
            self.rank_weights_freshness +
            self.rank_weights_safety +
            self.rank_weights_topic
        )
        if abs(total_weight - 1.0) > 0.01:  # Allow small floating point errors
            raise ValueError(f"Ranking weights must sum to 1.0, got {total_weight}")
    
    def validate(self) -> None:
        """Validate configuration."""
        if not self.database_url:
            raise ValueError("DATABASE_URL is required")
        
        if self.output_mode not in ["commit", "s3", "r2"]:
            raise ValueError("OUTPUT_MODE must be one of: commit, s3, r2")
        
        if self.output_mode in ["s3", "r2"] and not self.s3_bucket:
            raise ValueError(f"{self.output_mode.upper()}_BUCKET is required when OUTPUT_MODE={self.output_mode}")


# Global config instance
config = Config()
