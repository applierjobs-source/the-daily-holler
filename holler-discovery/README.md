# Holler Discovery Feed

A comprehensive discovery feed system that ingests URLs from multiple sources, filters them for quality, and generates static HTML pages and sitemaps for SEO-optimized content discovery.

## Features

- **Multi-source ingestion**: Certificate Transparency logs, RSS feeds, and Common Crawl Index
- **Intelligent filtering**: Removes parking pages, spam, and low-quality content
- **Static HTML generation**: SEO-optimized pages with JSON-LD structured data
- **Sitemap generation**: Automated sitemap creation with proper indexing
- **GitHub Actions integration**: Nightly automated builds and deployment
- **Future-ready**: Easy switching between Railway (Phase 1) and S3/CDN (Phase 2)

## Quick Start

### 1. Setup Database

Add your Railway Postgres URL to GitHub Secrets:
```
RAILWAY_DATABASE_URL=postgresql://user:pass@host:port/dbname
```

### 2. Configure RSS Feeds

Edit `config/feeds.txt` to add your RSS feed URLs:
```
https://feeds.bbci.co.uk/news/rss.xml
https://feeds.reuters.com/reuters/topNews
# Add your own feeds here...
```

### 3. Run the Pipeline

#### Option A: Full Pipeline (Recommended)
```bash
cd holler-discovery
hndisc full-pipeline
```

#### Option B: Step by Step
```bash
cd holler-discovery

# 1. Setup database
hndisc migrate-db

# 2. Ingest from all sources
hndisc ingest-ct --hours 24
hndisc ingest-rss --feeds config/feeds.txt
hndisc ingest-cc --limit 10000

# 3. Filter and deduplicate
hndisc filter --host-cap 500

# 4. Generate pages and sitemaps
hndisc generate --date 2024-01-01 --out ../public
hndisc sitemaps --root ../public --base-url https://holler.news

# 5. Commit to repository (Phase 1)
hndisc commit-artifacts --branch main
```

### 4. GitHub Actions Setup

The workflow will run automatically every night at 4 AM UTC. You can also trigger it manually:

1. Go to Actions tab in your GitHub repository
2. Select "Discovery Feed Nightly Build"
3. Click "Run workflow"

## Configuration

All settings can be configured via environment variables:

### Database
- `DATABASE_URL`: PostgreSQL connection string (required)

### Ingestion
- `CT_LOOKBACK_HOURS`: Hours to look back in CT logs (default: 24)
- `RSS_FEEDS_PATH`: Path to RSS feeds file (default: config/feeds.txt)
- `CC_DATASETS_RECENT`: Number of recent CC datasets (default: 3)
- `CC_URL_LIMIT`: Maximum URLs from Common Crawl (default: 10000)

### Filtering
- `HOST_CAP`: Maximum URLs per host (default: 500)
- `PARKING_THRESHOLD`: Parking score threshold (default: 0.3)
- `NOVELTY_THRESHOLD`: Novelty score threshold (default: 0.5)
- `DOC_EXTENSIONS`: Document extensions to prioritize (default: pdf,csv,json,txt)

### Generation
- `LINKS_PER_PAGE`: Links per discovery page (default: 200)
- `SITEMAP_URLS_PER_FILE`: URLs per sitemap file (default: 50000)
- `BASE_URL`: Base URL for generated content (default: https://holler.news)

### Publishing
- `OUTPUT_MODE`: Publish mode - commit|s3|r2 (default: commit)

## CLI Commands

### Database Management
```bash
hndisc migrate-db              # Apply database migrations
hndisc migrate-db --reset      # Reset database (drop all tables)
```

### Ingestion
```bash
hndisc ingest-ct --hours 24                    # Certificate Transparency
hndisc ingest-rss --feeds config/feeds.txt     # RSS feeds
hndisc ingest-cc --limit 10000                 # Common Crawl Index
```

### Processing
```bash
hndisc filter --host-cap 500                   # Filter and deduplicate URLs
```

### Generation
```bash
hndisc generate --date 2024-01-01 --out ../public --links-per-page 200
hndisc sitemaps --root ../public --base-url https://holler.news
```

### Publishing
```bash
# Phase 1: Commit to repository
hndisc commit-artifacts --branch main --paths "../public/discover ../public/sitemaps ../public/sitemap-index.xml"

# Phase 2: Upload to S3/R2 (future)
hndisc upload --root ../public --provider s3 --bucket my-bucket --prefix /
```

### Statistics
```bash
hndisc stats                    # Latest run statistics
hndisc stats --date 2024-01-01  # Specific date statistics
```

### Full Pipeline
```bash
hndisc full-pipeline           # Run complete pipeline end-to-end
```

## Project Structure

```
holler-discovery/
├── README.md                  # This file
├── pyproject.toml            # Python package configuration
├── src/
│   ├── config.py             # Configuration management
│   ├── db.py                 # Database models and connection
│   ├── cli.py                # Command-line interface
│   ├── ingest/               # Data ingestion modules
│   │   ├── ct.py             # Certificate Transparency
│   │   ├── rss.py            # RSS feeds
│   │   ├── commoncrawl.py    # Common Crawl Index
│   │   └── normalize.py      # URL normalization
│   └── pipeline/             # Processing pipeline
│       ├── filters.py        # URL filtering and scoring
│       ├── chunker.py        # URL chunking and pagination
│       ├── html_writer.py    # HTML page generation
│       ├── sitemap_writer.py # Sitemap generation
│       └── manifest.py       # Run tracking and statistics
├── templates/                # Jinja2 templates
│   ├── discovery_page.html.j2
│   └── day_index.html.j2
├── config/
│   └── feeds.txt             # RSS feeds configuration
└── tests/                    # Test suite
    ├── test_filters.py
    ├── test_chunker.py
    └── test_sitemaps.py
```

## Database Schema

### discovered_raw
Raw URLs from all ingestion sources:
- `id`: Primary key
- `url`: Full URL (unique)
- `host`: Domain name
- `tld`: Top-level domain
- `source`: Source type (ct|rss|cc|seed)
- `seen_at`: Timestamp when discovered

### discovered_kept
Filtered URLs that passed quality checks:
- `id`: Primary key
- `url`: Full URL (unique)
- `host`: Domain name
- `tld`: Top-level domain
- `parking_score`: Parking likelihood (0-1)
- `novelty_score`: Content novelty (0-1)
- `picked_at`: Timestamp when filtered

### run_manifest
Metadata about each discovery run:
- `run_id`: Unique run identifier
- `run_date`: Date of the run
- `candidates`: Number of raw URLs processed
- `kept`: Number of URLs that passed filtering
- `pages`: Number of HTML pages generated
- `links_per_page`: Links per page configuration
- `created_at`: Run timestamp

## Generated Content

### HTML Pages
- **Discovery pages**: `/discover/YYYY-MM-DD/page-000001.html`
  - ~200 curated links per page
  - SEO-optimized with JSON-LD structured data
  - Navigation between pages and dates
  - Mobile-responsive design

- **Day index**: `/discover/YYYY-MM-DD/index.html`
  - Overview of all pages for a date
  - Navigation to previous/next days
  - Statistics and sample content

### Sitemaps
- **Sitemap shards**: `/sitemaps/sitemap-discover-001.xml.gz`
  - Up to 50,000 URLs per file
  - Gzipped for efficiency
  - Proper XML structure

- **Sitemap index**: `/sitemap-index.xml`
  - Points to all sitemap shards
  - Updated with each run

## SEO and Search Console Setup

### 1. Add to robots.txt
```
User-agent: *
Allow: /discover/
Sitemap: https://holler.news/sitemap-index.xml
```

### 2. Google Search Console
1. Add your property: `https://holler.news`
2. Submit sitemap: `https://holler.news/sitemap-index.xml`
3. Monitor indexing status

### 3. Verify Pages
Check that pages load correctly:
- `https://holler.news/discover/2024-01-01/`
- `https://holler.news/discover/2024-01-01/page-000001.html`
- `https://holler.news/sitemap-index.xml`

## Railway Deployment

Your existing Railway app should automatically serve the generated static files from the `public/` directory. If not, ensure your app is configured to serve static files from the public directory.

### Static File Serving
Most frameworks support this out of the box:
- **Express.js**: `app.use(express.static('public'))`
- **FastAPI**: `app.mount("/", StaticFiles(directory="public"), name="static")`
- **Flask**: `app = Flask(__name__, static_folder='public')`

## Phase 2: S3/CDN Migration

When ready to switch to S3/CDN:

1. Set environment variables:
   ```
   OUTPUT_MODE=s3
   S3_BUCKET=your-bucket-name
   S3_PREFIX=/
   S3_REGION=us-east-1
   ```

2. Configure AWS credentials in GitHub Secrets:
   ```
   AWS_ACCESS_KEY_ID=your-key
   AWS_SECRET_ACCESS_KEY=your-secret
   ```

3. The system will automatically upload to S3 instead of committing to the repository.

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Verify `RAILWAY_DATABASE_URL` is correct
   - Check Railway service is running
   - Ensure database permissions

2. **No URLs ingested**
   - Check RSS feeds in `config/feeds.txt`
   - Verify CT and CC APIs are accessible
   - Check rate limiting

3. **GitHub Actions failures**
   - Verify all required secrets are set
   - Check workflow logs for specific errors
   - Ensure repository has write permissions

4. **Pages not loading**
   - Verify Railway serves static files from `public/`
   - Check file paths and permissions
   - Ensure proper base URL configuration

### Debug Mode
Run with verbose logging:
```bash
export PYTHONPATH=src
python -m holler_discovery.cli --help
```

## Development

### Setup Development Environment
```bash
cd holler-discovery
pip install -e ".[dev]"
```

### Run Tests
```bash
pytest tests/
```

### Code Quality
```bash
black src/ tests/
isort src/ tests/
mypy src/
```

## License

This project is part of the Holler.News platform.

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review GitHub Actions logs
3. Check database connectivity and configuration
4. Verify all environment variables are set correctly
