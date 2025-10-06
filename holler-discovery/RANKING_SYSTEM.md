# Discovery Feed Ranking System

## Overview

The holler-discovery pipeline has been extended with a comprehensive scoring and prioritization layer that runs after filtering and before generation. This system computes a DiscoveryScore (0-100) for each URL and classifies them into priority queues (P0/P1/P2/P3) with explicit actions.

## Key Features

### 1. DiscoveryScore Computation
- **Unseen Likelihood (28%)**: CT age, NS/ASN changes, WHOIS age, zero backlinks
- **Host Novelty (20%)**: First-time hosts, rare TLDs, subdomain patterns
- **Content Readiness (16%)**: Inverse parking score, document paths, file extensions
- **Link Yield Potential (14%)**: Document-like paths, file extensions, vendor fingerprints
- **Source Reliability (10%)**: CT/RSS > CC > social sources
- **Freshness/Recency (6%)**: 0-24h best, then decay
- **Quality/Safety (4%)**: Malware/adult/for-sale penalties, suspicious TLDs
- **Topic Boost (2%)**: Optional booster for focus niches

### 2. Priority Classification
- **P0 (≥80)**: Crawl now, profile + list
- **P1 (60-79)**: List on daily discovery page
- **P2 (40-59)**: Watchlist, recrawl on signals
- **P3 (<40)**: Defer, weekly tiny sample

### 3. Backoff Scheduling
- **P2**: 6h → 12h → 24h → 48h (reset on NS/ASN change)
- **P3**: 12h → 24h → 48h → 96h
- **P0/P1**: No backoff needed

## Database Schema Changes

### New Columns in `discovered_kept`:
```sql
discovery_score REAL NOT NULL DEFAULT 0.0
priority_class SMALLINT NOT NULL DEFAULT 2  -- 0=P0, 1=P1, 2=P2, 3=P3
signals JSONB  -- Sub-scores and booleans used
next_check_at TIMESTAMPTZ  -- For P2/P3 backoff
```

### New Columns in `run_manifest`:
```sql
p0_count INTEGER NOT NULL DEFAULT 0
p1_count INTEGER NOT NULL DEFAULT 0
p2_count INTEGER NOT NULL DEFAULT 0
p3_count INTEGER NOT NULL DEFAULT 0
avg_score REAL NOT NULL DEFAULT 0.0
```

### New Indexes:
```sql
CREATE INDEX idx_discovered_kept_priority_picked ON discovered_kept (priority_class, picked_at);
CREATE INDEX idx_discovered_kept_next_check ON discovered_kept (next_check_at);
```

## Configuration

### Environment Variables:
```bash
# Ranking weights (must sum to 1.0)
RANK_WEIGHTS_UNSEEN=0.28
RANK_WEIGHTS_HOST_NOVELTY=0.20
RANK_WEIGHTS_CONTENT_READY=0.16
RANK_WEIGHTS_LINK_YIELD=0.14
RANK_WEIGHTS_SOURCE_REL=0.10
RANK_WEIGHTS_FRESHNESS=0.06
RANK_WEIGHTS_SAFETY=0.04
RANK_WEIGHTS_TOPIC=0.02

# Thresholds
MIN_PUBLISH_SCORE=60.0
PROFILE_SCORE=80.0

# Backoff settings
BACKOFF_START_HOURS=6
BACKOFF_MAX_HOURS=48
BACKOFF_MULTIPLIER=2.0
```

## CLI Commands

### New Commands:
```bash
# Rank URLs and assign priority classes
hndisc rank --min-publish-score 60 --profile-score 80

# Show statistics with ranking info
hndisc stats --ranking

# Show detailed ranking statistics
hndisc stats --date 2024-01-05 --ranking
```

### Updated Commands:
- `hndisc generate` now only processes P0/P1 URLs
- `hndisc stats` shows ranking metrics when available

## Workflow Integration

The GitHub Actions workflow now includes a ranking step:

```yaml
- name: Rank URLs and assign priority classes
  env:
    DATABASE_URL: ${{ secrets.RAILWAY_DATABASE_URL }}
    MIN_PUBLISH_SCORE: 60
    PROFILE_SCORE: 80
  run: |
    cd holler-discovery
    python -c "
    import asyncio
    from src.pipeline.ranker import ranker
    # ... ranking logic
    "
```

## Generator Updates

### URL Filtering:
- Only P0/P1 URLs are published (configurable via `MIN_PUBLISH_SCORE`)
- URLs are ordered by `discovery_score` DESC
- Source badges and priority labels are added to HTML output

### Enhanced Template Data:
```python
{
    'url': 'https://example.com/page',
    'host': 'example.com',
    'discovery_score': 75.5,
    'priority_class': 1,
    'source': 'CT',
    'priority_label': 'P1 (Medium)',
    'signals': {
        'unseen_likelihood': 0.8,
        'host_novelty': 0.7,
        # ... other signals
    }
}
```

## Metrics & Logging

### Run Manifest Metrics:
- P0/P1/P2/P3 counts
- Average discovery score
- Priority distribution
- Score distribution by ranges

### CLI Statistics:
```bash
$ hndisc stats --ranking
Run Statistics:
  P0 (≥80): 15 URLs
  P1 (60-79): 45 URLs
  P2 (40-59): 30 URLs
  P3 (<40): 10 URLs
  Average Score: 65.2

Detailed Ranking Statistics:
  Priority Distribution:
    P0: 15
    P1: 45
    P2: 30
    P3: 10
  Score Distribution:
    0-20: 5
    20-40: 5
    40-60: 30
    60-80: 45
    80-100: 15
```

## Testing

Comprehensive test suite in `tests/test_ranker.py`:
- Unit tests for each scoring component
- Integration tests for full ranking process
- Boundary condition testing
- Priority mapping validation
- Backoff scheduling tests

## Backward Compatibility

- All existing functionality remains unchanged
- New columns have sensible defaults
- Existing URLs get default P2 priority until ranked
- Generator falls back to old behavior if no scores available

## Usage Examples

### 1. Run Full Pipeline with Ranking:
```bash
cd holler-discovery
hndisc migrate-db
hndisc ingest-ct
hndisc ingest-rss
hndisc ingest-cc
hndisc filter
hndisc rank
hndisc generate --date 2024-01-05
hndisc sitemaps
```

### 2. Check Ranking Statistics:
```bash
hndisc stats --ranking
hndisc stats --date 2024-01-05 --ranking
```

### 3. Adjust Ranking Weights:
```bash
export RANK_WEIGHTS_UNSEEN=0.35
export RANK_WEIGHTS_HOST_NOVELTY=0.25
export MIN_PUBLISH_SCORE=70
hndisc rank
```

## Future Enhancements

1. **Profile Pages**: P0 URLs can generate `/site/{domain}/` profile pages
2. **Machine Learning**: Use historical data to tune weights automatically
3. **Real-time Updates**: Update scores based on user engagement
4. **A/B Testing**: Test different weight configurations
5. **Dashboard**: Web interface for monitoring ranking performance

## Troubleshooting

### Common Issues:

1. **Weights don't sum to 1.0**: Check environment variables
2. **No P0/P1 URLs**: Lower `MIN_PUBLISH_SCORE` or adjust weights
3. **All URLs P3**: Check if scoring signals are working correctly
4. **Database errors**: Run `hndisc migrate-db` to add new columns

### Debug Commands:
```bash
# Check database schema
hndisc stats --ranking

# Test scoring with specific URL
python -c "
from src.pipeline.ranker import DiscoveryRanker
ranker = DiscoveryRanker()
score, signals = ranker.compute_discovery_score(
    'https://example.com/page', 'example.com', 'com', 0.1, 0.9, 'ct', datetime.now()
)
print(f'Score: {score}, Signals: {signals}')
"
```
