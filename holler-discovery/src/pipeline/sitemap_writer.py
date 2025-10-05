"""Sitemap generation utilities."""

import gzip
import os
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom import minidom

from ..config import config
from ..db import db, DiscoveredKept, RunManifest
from sqlalchemy import func


class SitemapWriter:
    """Sitemap generator."""
    
    def __init__(self, output_dir: str = "public", base_url: str = None):
        self.output_dir = Path(output_dir)
        self.base_url = base_url or config.base_url
        self.urls_per_file = config.sitemap_urls_per_file
        
        # Ensure output directory exists
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.sitemaps_dir = self.output_dir / "sitemaps"
        self.sitemaps_dir.mkdir(parents=True, exist_ok=True)
    
    def create_sitemap_entry(self, url: str, lastmod: datetime = None, 
                           changefreq: str = "daily", priority: str = "0.8") -> Element:
        """Create a single sitemap entry."""
        if lastmod is None:
            lastmod = datetime.utcnow()
        
        url_elem = Element("url")
        
        loc_elem = SubElement(url_elem, "loc")
        loc_elem.text = url
        
        lastmod_elem = SubElement(url_elem, "lastmod")
        lastmod_elem.text = lastmod.strftime("%Y-%m-%dT%H:%M:%SZ")
        
        changefreq_elem = SubElement(url_elem, "changefreq")
        changefreq_elem.text = changefreq
        
        priority_elem = SubElement(url_elem, "priority")
        priority_elem.text = priority
        
        return url_elem
    
    def create_sitemap(self, urls: List[Dict[str, Any]]) -> str:
        """Create a sitemap XML for a list of URLs."""
        # Create root element
        urlset = Element("urlset")
        urlset.set("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9")
        
        for url_data in urls:
            url = url_data['url']
            lastmod = url_data.get('lastmod', datetime.utcnow())
            
            url_entry = self.create_sitemap_entry(url, lastmod)
            urlset.append(url_entry)
        
        # Convert to pretty XML
        rough_string = tostring(urlset, encoding='unicode')
        reparsed = minidom.parseString(rough_string)
        pretty_xml = reparsed.toprettyxml(indent="  ")
        
        # Remove empty lines
        lines = [line for line in pretty_xml.split('\n') if line.strip()]
        return '\n'.join(lines)
    
    def create_sitemap_index(self, sitemap_files: List[str]) -> str:
        """Create sitemap index XML."""
        # Create root element
        sitemapindex = Element("sitemapindex")
        sitemapindex.set("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9")
        
        for sitemap_file in sitemap_files:
            sitemap_elem = Element("sitemap")
            
            loc_elem = SubElement(sitemap_elem, "loc")
            loc_elem.text = f"{self.base_url}/{sitemap_file}"
            
            lastmod_elem = SubElement(sitemap_elem, "lastmod")
            lastmod_elem.text = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
            
            sitemapindex.append(sitemap_elem)
        
        # Convert to pretty XML
        rough_string = tostring(sitemapindex, encoding='unicode')
        reparsed = minidom.parseString(rough_string)
        pretty_xml = reparsed.toprettyxml(indent="  ")
        
        # Remove empty lines
        lines = [line for line in pretty_xml.split('\n') if line.strip()]
        return '\n'.join(lines)
    
    def get_discovery_urls(self, date_str: str = None) -> List[Dict[str, Any]]:
        """Get URLs for discovery pages."""
        session = db.get_session()
        
        try:
            # Get URLs from discovered_kept table
            if date_str:
                query = session.query(DiscoveredKept).filter(
                    func.date(DiscoveredKept.picked_at) == date_str
                )
            else:
                # Get all URLs
                query = session.query(DiscoveredKept)
            
            records = query.all()
            
            urls = []
            for record in records:
                # Create discovery page URL
                discovery_url = f"{self.base_url}/discover/{date_str}/"
                if date_str:
                    # For specific date, we'll need to determine which page this URL appears on
                    # For now, just include the day index
                    urls.append({
                        'url': discovery_url,
                        'lastmod': record.picked_at
                    })
            
            return urls
            
        finally:
            session.close()
    
    def get_all_discovery_urls(self) -> List[Dict[str, Any]]:
        """Get all discovery page URLs."""
        session = db.get_session()
        
        try:
            # Get unique dates from discovered_kept
            dates = session.query(
                func.date(DiscoveredKept.picked_at).label('date')
            ).distinct().order_by(
                func.date(DiscoveredKept.picked_at).desc()
            ).all()
            
            urls = []
            for date_record in dates:
                date_str = date_record.date.strftime('%Y-%m-%d')
                discovery_url = f"{self.base_url}/discover/{date_str}/"
                
                # Get the latest picked_at time for this date
                latest_time = session.query(
                    func.max(DiscoveredKept.picked_at)
                ).filter(
                    func.date(DiscoveredKept.picked_at) == date_record.date
                ).scalar()
                
                urls.append({
                    'url': discovery_url,
                    'lastmod': latest_time or datetime.utcnow()
                })
            
            return urls
            
        finally:
            session.close()
    
    def generate_sitemaps(self, output_dir: str = None) -> List[str]:
        """Generate sitemap files."""
        if output_dir:
            self.output_dir = Path(output_dir)
            self.sitemaps_dir = self.output_dir / "sitemaps"
            self.sitemaps_dir.mkdir(parents=True, exist_ok=True)
        
        print("Generating sitemaps...")
        
        # Get all discovery URLs
        urls = self.get_all_discovery_urls()
        print(f"Found {len(urls)} discovery URLs")
        
        if not urls:
            print("No URLs found for sitemap generation")
            return []
        
        # Split URLs into chunks
        sitemap_files = []
        for i in range(0, len(urls), self.urls_per_file):
            chunk = urls[i:i + self.urls_per_file]
            chunk_num = (i // self.urls_per_file) + 1
            
            # Create sitemap XML
            sitemap_xml = self.create_sitemap(chunk)
            
            # Write sitemap file
            sitemap_filename = f"sitemap-discover-{chunk_num:03d}.xml.gz"
            sitemap_path = self.sitemaps_dir / sitemap_filename
            
            with gzip.open(sitemap_path, 'wt', encoding='utf-8') as f:
                f.write(sitemap_xml)
            
            sitemap_files.append(f"sitemaps/{sitemap_filename}")
            print(f"Generated sitemap: {sitemap_path}")
        
        # Create sitemap index
        sitemap_index_xml = self.create_sitemap_index(sitemap_files)
        sitemap_index_path = self.output_dir / "sitemap-index.xml"
        
        with open(sitemap_index_path, 'w', encoding='utf-8') as f:
            f.write(sitemap_index_xml)
        
        print(f"Generated sitemap index: {sitemap_index_path}")
        
        return [str(sitemap_index_path)] + [str(self.sitemaps_dir / f) for f in sitemap_files]
