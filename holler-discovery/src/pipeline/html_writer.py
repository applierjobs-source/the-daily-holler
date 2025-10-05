"""HTML generation for discovery pages."""

import os
from pathlib import Path
from typing import List, Dict, Any
from jinja2 import Environment, FileSystemLoader, select_autoescape

from ..config import config
from .chunker import URLChunker


class HTMLWriter:
    """HTML page generator."""
    
    def __init__(self, template_dir: str = "templates", output_dir: str = "public"):
        self.template_dir = Path(template_dir)
        self.output_dir = Path(output_dir)
        self.chunker = URLChunker()
        
        # Setup Jinja2 environment
        self.env = Environment(
            loader=FileSystemLoader(self.template_dir),
            autoescape=select_autoescape(['html', 'xml'])
        )
        
        # Ensure output directories exist
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def generate_discovery_page(self, date_str: str, page_num: int, 
                               output_path: str = None) -> str:
        """Generate a discovery page for a specific date and page number."""
        # Get URLs for this page
        all_urls = self.chunker.get_urls_for_date(date_str)
        total_pages = self.chunker.get_page_count(len(all_urls))
        
        if page_num > total_pages or page_num < 1:
            raise ValueError(f"Invalid page number {page_num} (total pages: {total_pages})")
        
        # Get URLs for this page
        start_idx = (page_num - 1) * self.chunker.links_per_page
        end_idx = start_idx + self.chunker.links_per_page
        page_urls = all_urls[start_idx:end_idx]
        
        if not page_urls:
            raise ValueError(f"No URLs found for date {date_str}, page {page_num}")
        
        # Get navigation info
        nav_info = self.chunker.get_navigation_info(date_str, page_num)
        
        # Prepare template data
        template_data = {
            'date': date_str,
            'page_num': page_num,
            'total_pages': total_pages,
            'urls': page_urls,
            'sample_hosts': nav_info['sample_hosts'],
            'navigation': nav_info['page_info'],
            'base_url': config.base_url,
            'brand_name': 'Underlight by Holler.News'
        }
        
        # Render template
        template = self.env.get_template('discovery_page.html.j2')
        html_content = template.render(**template_data)
        
        # Determine output path
        if output_path is None:
            output_path = self.output_dir / "discover" / date_str / f"page-{page_num:06d}.html"
        
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Write file
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print(f"Generated discovery page: {output_path}")
        return str(output_path)
    
    def generate_day_index(self, date_str: str, output_path: str = None) -> str:
        """Generate day index page."""
        # Get navigation info
        nav_info = self.chunker.get_day_navigation(date_str)
        
        if nav_info.get('total_pages', 0) == 0:
            print(f"No pages found for date {date_str}")
            return None
        
        # Prepare template data
        template_data = {
            'date': date_str,
            'total_pages': nav_info['total_pages'],
            'total_urls': nav_info['total_urls'],
            'navigation': nav_info,
            'base_url': config.base_url,
            'brand_name': 'Underlight by Holler.News'
        }
        
        # Render template
        template = self.env.get_template('day_index.html.j2')
        html_content = template.render(**template_data)
        
        # Determine output path
        if output_path is None:
            output_path = self.output_dir / "discover" / date_str / "index.html"
        
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Write file
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print(f"Generated day index: {output_path}")
        return str(output_path)
    
    def generate_all_pages_for_date(self, date_str: str) -> List[str]:
        """Generate all pages for a specific date."""
        generated_files = []
        
        # Get URLs for this date
        urls = self.chunker.get_urls_for_date(date_str)
        if not urls:
            print(f"No URLs found for date {date_str}")
            return generated_files
        
        total_pages = self.chunker.get_page_count(len(urls))
        print(f"Generating {total_pages} pages for {date_str} ({len(urls)} URLs)")
        
        # Generate individual pages
        for page_num in range(1, total_pages + 1):
            try:
                page_path = self.generate_discovery_page(date_str, page_num)
                generated_files.append(page_path)
            except Exception as e:
                print(f"Error generating page {page_num} for {date_str}: {e}")
        
        # Generate day index
        try:
            index_path = self.generate_day_index(date_str)
            if index_path:
                generated_files.append(index_path)
        except Exception as e:
            print(f"Error generating day index for {date_str}: {e}")
        
        print(f"Generated {len(generated_files)} files for {date_str}")
        return generated_files
    
    def generate_discovery_pages(self, date_str: str, output_dir: str = None) -> List[str]:
        """Main entry point for generating discovery pages."""
        if output_dir:
            self.output_dir = Path(output_dir)
            self.output_dir.mkdir(parents=True, exist_ok=True)
        
        return self.generate_all_pages_for_date(date_str)
