"""URL normalization utilities."""

import re
from urllib.parse import urlparse, urlunparse, parse_qs, urlencode
from typing import Optional, Set


class URLNormalizer:
    """URL normalization utilities."""
    
    # Common parking page indicators
    PARKING_KEYWORDS = {
        'for-sale', 'parking', 'parked', 'coming-soon', 'hello-world',
        'under-construction', 'website-coming-soon', 'site-coming-soon',
        'this-site-is-under-construction', 'page-not-found', '404',
        'domain-for-sale', 'buy-this-domain', 'domain-parking'
    }
    
    # Common parking providers (nameservers/ASNs)
    PARKING_PROVIDERS = {
        'parkingcrew.com', 'sedoparking.com', 'parkingpanel.com',
        'parklogic.com', 'above.com', 'domainapps.com', 'parking-service.net'
    }
    
    # Document-like extensions
    DOC_EXTENSIONS = {'.pdf', '.doc', '.docx', '.csv', '.json', '.txt', '.xml', '.rtf'}
    
    # Paths that suggest documents/content
    DOC_PATHS = {
        '/documents/', '/minutes/', '/rfp/', '/press/', '/reports/',
        '/publications/', '/research/', '/data/', '/downloads/',
        '/files/', '/media/', '/resources/', '/library/'
    }
    
    @staticmethod
    def normalize_url(url: str) -> Optional[str]:
        """Normalize a URL to a canonical form."""
        if not url or not isinstance(url, str):
            return None
        
        url = url.strip()
        if not url:
            return None
        
        try:
            # Parse URL
            parsed = urlparse(url)
            
            # Must have a netloc
            if not parsed.netloc:
                return None
            
            # Convert to lowercase
            netloc = parsed.netloc.lower()
            
            # Remove www. prefix
            if netloc.startswith('www.'):
                netloc = netloc[4:]
            
            # Clean path
            path = parsed.path or '/'
            
            # Remove trailing slash unless it's the root
            if path != '/' and path.endswith('/'):
                path = path[:-1]
            
            # Clean query parameters - remove common tracking params
            query_params = parse_qs(parsed.query)
            clean_params = {}
            
            for key, values in query_params.items():
                key_lower = key.lower()
                # Skip common tracking parameters
                if key_lower not in {
                    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
                    'fbclid', 'gclid', 'ref', 'source', 'campaign'
                }:
                    clean_params[key] = values
            
            # Rebuild query string
            clean_query = urlencode(clean_params, doseq=True) if clean_params else ''
            
            # Rebuild URL
            normalized = urlunparse((
                parsed.scheme.lower() if parsed.scheme else 'https',
                netloc,
                path,
                parsed.params,
                clean_query,
                ''  # Remove fragment
            ))
            
            return normalized
            
        except Exception:
            return None
    
    @staticmethod
    def extract_domain_parts(url: str) -> tuple:
        """Extract host, domain, and TLD from URL."""
        try:
            parsed = urlparse(url)
            netloc = parsed.netloc.lower()
            
            # Remove port if present
            if ':' in netloc:
                netloc = netloc.split(':')[0]
            
            # Split domain parts
            parts = netloc.split('.')
            if len(parts) >= 2:
                tld = parts[-1]
                domain = parts[-2]
                subdomain = '.'.join(parts[:-2]) if len(parts) > 2 else ''
                return netloc, domain, tld, subdomain
            else:
                return netloc, '', '', netloc
                
        except Exception:
            return '', '', '', ''
    
    @staticmethod
    def calculate_parking_score(url: str) -> float:
        """Calculate parking score (0-1, higher = more likely parked)."""
        if not url:
            return 1.0
        
        url_lower = url.lower()
        score = 0.0
        
        # Check for parking keywords in URL
        for keyword in URLNormalizer.PARKING_KEYWORDS:
            if keyword in url_lower:
                score += 0.3
        
        # Check for parking providers in domain
        for provider in URLNormalizer.PARKING_PROVIDERS:
            if provider in url_lower:
                score += 0.5
        
        # Check for common parking patterns
        parking_patterns = [
            r'parking\..*\.com',
            r'.*\.parking\.',
            r'parked-.*\.',
            r'domain-.*\.parking',
        ]
        
        for pattern in parking_patterns:
            if re.search(pattern, url_lower):
                score += 0.4
        
        # Check for short domains (often parked)
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            if len(domain) < 8:  # Very short domains
                score += 0.2
        except Exception:
            pass
        
        return min(score, 1.0)
    
    @staticmethod
    def calculate_novelty_score(url: str) -> float:
        """Calculate novelty score (0-1, higher = more interesting)."""
        if not url:
            return 0.0
        
        url_lower = url.lower()
        score = 0.0
        
        try:
            parsed = urlparse(url)
            path = parsed.path.lower()
            query = parsed.query.lower()
            
            # Boost for document extensions
            for ext in URLNormalizer.DOC_EXTENSIONS:
                if url_lower.endswith(ext):
                    score += 0.8
                    break
            
            # Boost for document-like paths
            for doc_path in URLNormalizer.DOC_PATHS:
                if doc_path in path:
                    score += 0.6
                    break
            
            # Boost for longer, more complex paths (more content)
            if len(path) > 20:
                score += 0.3
            elif len(path) > 10:
                score += 0.2
            
            # Boost for query parameters (more dynamic content)
            if query:
                param_count = len(parse_qs(query))
                score += min(param_count * 0.1, 0.4)
            
            # Boost for path depth
            path_depth = path.count('/')
            if path_depth > 2:
                score += min(path_depth * 0.1, 0.3)
            
            # Boost for high entropy in path (more unique content)
            if path:
                unique_chars = len(set(path))
                total_chars = len(path)
                if total_chars > 0:
                    entropy = unique_chars / total_chars
                    if entropy > 0.6:
                        score += 0.3
                    elif entropy > 0.4:
                        score += 0.2
            
        except Exception:
            pass
        
        return min(score, 1.0)
    
    @staticmethod
    def should_keep_url(url: str, parking_threshold: float = 0.3, 
                       novelty_threshold: float = 0.5) -> bool:
        """Determine if URL should be kept based on scores."""
        parking_score = URLNormalizer.calculate_parking_score(url)
        novelty_score = URLNormalizer.calculate_novelty_score(url)
        
        # Always keep if parking score is low
        if parking_score < parking_threshold:
            return True
        
        # Keep if novelty score is high enough
        if novelty_score >= novelty_threshold:
            return True
        
        # Keep if it's a document regardless of other scores
        url_lower = url.lower()
        for ext in URLNormalizer.DOC_EXTENSIONS:
            if url_lower.endswith(ext):
                return True
        
        return False
