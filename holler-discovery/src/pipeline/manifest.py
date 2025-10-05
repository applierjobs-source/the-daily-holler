"""Run manifest and statistics tracking."""

import json
from datetime import datetime, date
from typing import Dict, Any, Optional
from uuid import uuid4

from ..config import config
from ..db import db, RunManifest, DiscoveredRaw, DiscoveredKept
from sqlalchemy import func


class ManifestManager:
    """Manages run manifests and statistics."""
    
    def create_run_manifest(self, run_date: str, candidates: int, kept: int, 
                          pages: int, links_per_page: int = None) -> str:
        """Create a new run manifest."""
        if links_per_page is None:
            links_per_page = config.links_per_page
        
        session = db.get_session()
        
        try:
            manifest = RunManifest(
                run_date=run_date,
                candidates=candidates,
                kept=kept,
                pages=pages,
                links_per_page=links_per_page
            )
            
            session.add(manifest)
            session.commit()
            
            print(f"Created run manifest: {manifest.run_id} for {run_date}")
            return str(manifest.run_id)
            
        except Exception as e:
            session.rollback()
            print(f"Error creating run manifest: {e}")
            raise
        finally:
            session.close()
    
    def get_run_stats(self, run_date: str = None) -> Dict[str, Any]:
        """Get statistics for a specific run or latest run."""
        session = db.get_session()
        
        try:
            if run_date:
                # Get stats for specific date
                manifest = session.query(RunManifest).filter(
                    RunManifest.run_date == run_date
                ).first()
            else:
                # Get latest run
                manifest = session.query(RunManifest).order_by(
                    RunManifest.created_at.desc()
                ).first()
            
            if not manifest:
                return {}
            
            return {
                'run_id': str(manifest.run_id),
                'run_date': manifest.run_date,
                'candidates': manifest.candidates,
                'kept': manifest.kept,
                'pages': manifest.pages,
                'links_per_page': manifest.links_per_page,
                'created_at': manifest.created_at.isoformat(),
                'filter_rate': manifest.kept / manifest.candidates if manifest.candidates > 0 else 0
            }
            
        finally:
            session.close()
    
    def get_daily_stats(self, date_str: str = None) -> Dict[str, Any]:
        """Get daily statistics."""
        if date_str is None:
            date_str = datetime.now().strftime('%Y-%m-%d')
        
        session = db.get_session()
        
        try:
            # Get counts for the date
            raw_count = session.query(DiscoveredRaw).filter(
                func.date(DiscoveredRaw.seen_at) == date_str
            ).count()
            
            kept_count = session.query(DiscoveredKept).filter(
                func.date(DiscoveredKept.picked_at) == date_str
            ).count()
            
            # Get source breakdown
            source_stats = session.query(
                DiscoveredRaw.source,
                func.count(DiscoveredRaw.id).label('count')
            ).filter(
                func.date(DiscoveredRaw.seen_at) == date_str
            ).group_by(DiscoveredRaw.source).all()
            
            source_breakdown = {source: count for source, count in source_stats}
            
            # Get top hosts
            top_hosts = session.query(
                DiscoveredKept.host,
                func.count(DiscoveredKept.id).label('count')
            ).filter(
                func.date(DiscoveredKept.picked_at) == date_str
            ).group_by(DiscoveredKept.host).order_by(
                func.count(DiscoveredKept.id).desc()
            ).limit(10).all()
            
            return {
                'date': date_str,
                'raw_count': raw_count,
                'kept_count': kept_count,
                'filter_rate': kept_count / raw_count if raw_count > 0 else 0,
                'source_breakdown': source_breakdown,
                'top_hosts': [{'host': host, 'count': count} for host, count in top_hosts]
            }
            
        finally:
            session.close()
    
    def get_overall_stats(self) -> Dict[str, Any]:
        """Get overall statistics."""
        session = db.get_session()
        
        try:
            # Total counts
            total_raw = session.query(DiscoveredRaw).count()
            total_kept = session.query(DiscoveredKept).count()
            total_runs = session.query(RunManifest).count()
            
            # Source breakdown
            source_stats = session.query(
                DiscoveredRaw.source,
                func.count(DiscoveredRaw.id).label('count')
            ).group_by(DiscoveredRaw.source).all()
            
            source_breakdown = {source: count for source, count in source_stats}
            
            # Recent activity
            recent_runs = session.query(RunManifest).order_by(
                RunManifest.created_at.desc()
            ).limit(7).all()
            
            recent_activity = []
            for run in recent_runs:
                recent_activity.append({
                    'run_date': run.run_date,
                    'candidates': run.candidates,
                    'kept': run.kept,
                    'pages': run.pages,
                    'created_at': run.created_at.isoformat()
                })
            
            return {
                'total_raw': total_raw,
                'total_kept': total_kept,
                'total_runs': total_runs,
                'overall_filter_rate': total_kept / total_raw if total_raw > 0 else 0,
                'source_breakdown': source_breakdown,
                'recent_activity': recent_activity
            }
            
        finally:
            session.close()
    
    def export_manifest(self, run_date: str, output_path: str = None) -> str:
        """Export run manifest to JSON file."""
        stats = self.get_run_stats(run_date)
        daily_stats = self.get_daily_stats(run_date)
        
        manifest_data = {
            'run_stats': stats,
            'daily_stats': daily_stats,
            'exported_at': datetime.utcnow().isoformat(),
            'config': {
                'links_per_page': config.links_per_page,
                'host_cap': config.host_cap,
                'parking_threshold': config.parking_threshold,
                'novelty_threshold': config.novelty_threshold
            }
        }
        
        if output_path is None:
            output_path = f"manifest-{run_date}.json"
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(manifest_data, f, indent=2, default=str)
        
        print(f"Exported manifest to: {output_path}")
        return output_path


def create_run_manifest(run_date: str, candidates: int, kept: int, pages: int) -> str:
    """Convenience function to create a run manifest."""
    manager = ManifestManager()
    return manager.create_run_manifest(run_date, candidates, kept, pages)


def get_run_stats(run_date: str = None) -> Dict[str, Any]:
    """Convenience function to get run statistics."""
    manager = ManifestManager()
    return manager.get_run_stats(run_date)


def get_daily_stats(date_str: str = None) -> Dict[str, Any]:
    """Convenience function to get daily statistics."""
    manager = ManifestManager()
    return manager.get_daily_stats(date_str)
