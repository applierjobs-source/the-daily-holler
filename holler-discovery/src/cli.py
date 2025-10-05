"""Command-line interface for holler-discovery."""

import asyncio
import click
from datetime import datetime, date
from pathlib import Path

from .config import config
from .db import migrate_db, reset_db, db
from .ingest.ct import ingest_ct
from .ingest.rss import ingest_rss
from .ingest.commoncrawl import ingest_cc
from .pipeline.filters import filter_raw_urls
from .pipeline.html_writer import HTMLWriter
from .pipeline.sitemap_writer import SitemapWriter
from .pipeline.manifest import create_run_manifest, get_run_stats, get_daily_stats


@click.group()
@click.option('--config-file', help='Configuration file path')
def main(config_file):
    """Holler Discovery Feed CLI."""
    if config_file:
        # TODO: Load config from file
        pass
    
    try:
        config.validate()
    except ValueError as e:
        click.echo(f"Configuration error: {e}", err=True)
        raise click.Abort()


@main.command()
@click.option('--reset', is_flag=True, help='Reset database (drop all tables)')
def migrate_db_cmd(reset):
    """Apply database migrations."""
    async def _migrate():
        if reset:
            await reset_db()
        else:
            await migrate_db()
    
    asyncio.run(_migrate())
    click.echo("Database migration completed")


@main.command()
@click.option('--hours', default=None, type=int, help='Hours to look back (default from config)')
def ingest_ct_cmd(hours):
    """Ingest URLs from Certificate Transparency logs."""
    async def _ingest():
        count = await ingest_ct(hours)
        click.echo(f"CT ingestion completed: {count} URLs inserted")
    
    asyncio.run(_ingest())


@main.command()
@click.option('--feeds', default=None, help='Path to RSS feeds file (default from config)')
def ingest_rss_cmd(feeds):
    """Ingest URLs from RSS feeds."""
    async def _ingest():
        count = await ingest_rss(feeds)
        click.echo(f"RSS ingestion completed: {count} URLs inserted")
    
    asyncio.run(_ingest())


@main.command()
@click.option('--limit', default=None, type=int, help='Maximum URLs to fetch (default from config)')
def ingest_cc_cmd(limit):
    """Ingest URLs from Common Crawl Index."""
    async def _ingest():
        count = await ingest_cc(limit)
        click.echo(f"Common Crawl ingestion completed: {count} URLs inserted")
    
    asyncio.run(_ingest())


@main.command()
@click.option('--host-cap', default=None, type=int, help='Maximum URLs per host (default from config)')
def filter_cmd(host_cap):
    """Filter raw URLs and move good ones to discovered_kept."""
    count = filter_raw_urls(host_cap)
    click.echo(f"Filtering completed: {count} URLs moved to discovered_kept")


@main.command()
@click.option('--date', default=None, help='Date to generate pages for (YYYY-MM-DD, default: today)')
@click.option('--out', default='../public', help='Output directory (default: ../public)')
@click.option('--links-per-page', default=None, type=int, help='Links per page (default from config)')
def generate_cmd(date, out, links_per_page):
    """Generate discovery pages for a specific date."""
    if date is None:
        date = datetime.now().strftime('%Y-%m-%d')
    
    # Validate date format
    try:
        datetime.strptime(date, '%Y-%m-%d')
    except ValueError:
        click.echo("Error: Invalid date format. Use YYYY-MM-DD", err=True)
        raise click.Abort()
    
    # Override config if specified
    if links_per_page:
        config.links_per_page = links_per_page
    
    writer = HTMLWriter(output_dir=out)
    generated_files = writer.generate_discovery_pages(date)
    
    click.echo(f"Generated {len(generated_files)} files for {date}")
    for file_path in generated_files:
        click.echo(f"  {file_path}")


@main.command()
@click.option('--root', default='../public', help='Root directory for sitemaps (default: ../public)')
@click.option('--base-url', default=None, help='Base URL for sitemaps (default from config)')
def sitemaps_cmd(root, base_url):
    """Generate sitemaps."""
    if base_url:
        config.base_url = base_url
    
    writer = SitemapWriter(output_dir=root, base_url=config.base_url)
    generated_files = writer.generate_sitemaps()
    
    click.echo(f"Generated {len(generated_files)} sitemap files")
    for file_path in generated_files:
        click.echo(f"  {file_path}")


@main.command()
@click.option('--branch', default='main', help='Git branch to commit to (default: main)')
@click.option('--paths', default='../public/discover ../public/sitemaps ../public/sitemap-index.xml', 
              help='Paths to commit (space-separated)')
def commit_artifacts_cmd(branch, paths):
    """Commit generated artifacts to git repository."""
    import subprocess
    import os
    
    # Check if we're in a git repository
    try:
        subprocess.run(['git', 'status'], check=True, capture_output=True)
    except subprocess.CalledProcessError:
        click.echo("Error: Not in a git repository", err=True)
        raise click.Abort()
    
    # Check for changes
    try:
        result = subprocess.run(['git', 'status', '--porcelain'], 
                              capture_output=True, text=True, check=True)
        if not result.stdout.strip():
            click.echo("No changes to commit")
            return
    except subprocess.CalledProcessError as e:
        click.echo(f"Error checking git status: {e}", err=True)
        raise click.Abort()
    
    # Add files
    path_list = paths.split()
    for path in path_list:
        if os.path.exists(path):
            try:
                subprocess.run(['git', 'add', path], check=True)
                click.echo(f"Added {path}")
            except subprocess.CalledProcessError as e:
                click.echo(f"Error adding {path}: {e}", err=True)
        else:
            click.echo(f"Warning: Path does not exist: {path}")
    
    # Commit changes
    commit_message = f"Update discovery feed - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    try:
        subprocess.run(['git', 'commit', '-m', commit_message], check=True)
        click.echo(f"Committed changes: {commit_message}")
    except subprocess.CalledProcessError as e:
        click.echo(f"Error committing: {e}", err=True)
        raise click.Abort()
    
    # Push changes
    try:
        subprocess.run(['git', 'push', 'origin', branch], check=True)
        click.echo(f"Pushed changes to origin/{branch}")
    except subprocess.CalledProcessError as e:
        click.echo(f"Error pushing: {e}", err=True)
        raise click.Abort()


@main.command()
@click.option('--root', default='../public', help='Root directory to upload (default: ../public)')
@click.option('--provider', type=click.Choice(['s3', 'r2']), default='s3', help='Upload provider (default: s3)')
@click.option('--bucket', required=True, help='Bucket name')
@click.option('--prefix', default='/', help='Prefix for uploaded files (default: /)')
def upload_cmd(root, provider, bucket, prefix):
    """Upload artifacts to S3 or R2 (future feature)."""
    click.echo(f"Upload to {provider} not yet implemented")
    click.echo(f"Would upload from {root} to {provider}://{bucket}{prefix}")


@main.command()
@click.option('--date', default=None, help='Date to get stats for (YYYY-MM-DD, default: latest)')
def stats_cmd(date):
    """Show run statistics."""
    if date:
        stats = get_run_stats(date)
        daily_stats = get_daily_stats(date)
    else:
        stats = get_run_stats()
        daily_stats = get_daily_stats()
    
    if stats:
        click.echo("Run Statistics:")
        click.echo(f"  Run ID: {stats.get('run_id', 'N/A')}")
        click.echo(f"  Date: {stats.get('run_date', 'N/A')}")
        click.echo(f"  Candidates: {stats.get('candidates', 0)}")
        click.echo(f"  Kept: {stats.get('kept', 0)}")
        click.echo(f"  Pages: {stats.get('pages', 0)}")
        click.echo(f"  Filter Rate: {stats.get('filter_rate', 0):.2%}")
        click.echo(f"  Created: {stats.get('created_at', 'N/A')}")
    
    if daily_stats:
        click.echo("\nDaily Statistics:")
        click.echo(f"  Date: {daily_stats.get('date', 'N/A')}")
        click.echo(f"  Raw Count: {daily_stats.get('raw_count', 0)}")
        click.echo(f"  Kept Count: {daily_stats.get('kept_count', 0)}")
        click.echo(f"  Filter Rate: {daily_stats.get('filter_rate', 0):.2%}")
        
        if daily_stats.get('source_breakdown'):
            click.echo("  Source Breakdown:")
            for source, count in daily_stats['source_breakdown'].items():
                click.echo(f"    {source}: {count}")
        
        if daily_stats.get('top_hosts'):
            click.echo("  Top Hosts:")
            for host_info in daily_stats['top_hosts'][:5]:
                click.echo(f"    {host_info['host']}: {host_info['count']}")


@main.command()
def full_pipeline_cmd():
    """Run the complete discovery pipeline."""
    async def _run_pipeline():
        date_str = datetime.now().strftime('%Y-%m-%d')
        
        click.echo(f"Running full discovery pipeline for {date_str}")
        
        # Step 1: Ingest from all sources
        click.echo("Step 1: Ingesting from Certificate Transparency...")
        ct_count = await ingest_ct()
        
        click.echo("Step 2: Ingesting from RSS feeds...")
        rss_count = await ingest_rss()
        
        click.echo("Step 3: Ingesting from Common Crawl...")
        cc_count = await ingest_cc()
        
        total_candidates = ct_count + rss_count + cc_count
        click.echo(f"Total candidates ingested: {total_candidates}")
        
        # Step 2: Filter URLs
        click.echo("Step 4: Filtering URLs...")
        kept_count = filter_raw_urls()
        
        # Step 3: Generate HTML pages
        click.echo("Step 5: Generating discovery pages...")
        writer = HTMLWriter(output_dir='../public')
        generated_files = writer.generate_discovery_pages(date_str)
        
        # Step 4: Generate sitemaps
        click.echo("Step 6: Generating sitemaps...")
        sitemap_writer = SitemapWriter(output_dir='../public')
        sitemap_files = sitemap_writer.generate_sitemaps()
        
        # Step 5: Create manifest
        click.echo("Step 7: Creating run manifest...")
        pages = len([f for f in generated_files if f.endswith('.html')])
        run_id = create_run_manifest(date_str, total_candidates, kept_count, pages)
        
        click.echo(f"Pipeline completed successfully!")
        click.echo(f"  Candidates: {total_candidates}")
        click.echo(f"  Kept: {kept_count}")
        click.echo(f"  Pages: {pages}")
        click.echo(f"  HTML files: {len(generated_files)}")
        click.echo(f"  Sitemap files: {len(sitemap_files)}")
        click.echo(f"  Run ID: {run_id}")
    
    asyncio.run(_run_pipeline())


if __name__ == '__main__':
    main()
