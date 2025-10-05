"""Database connection and models for holler-discovery."""

import asyncio
from datetime import datetime, date
from typing import List, Optional
from uuid import UUID, uuid4

import asyncpg
from sqlalchemy import (
    BigInteger,
    Column,
    DateTime,
    Float,
    Integer,
    String,
    Text,
    UniqueConstraint,
    create_engine,
    func,
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import text

from .config import config

Base = declarative_base()


class DiscoveredRaw(Base):
    """Raw discovered URLs from all sources."""
    __tablename__ = "discovered_raw"
    
    id = Column(BigInteger, primary_key=True)
    url = Column(Text, unique=True, nullable=False, index=True)
    host = Column(String(255), nullable=False, index=True)
    tld = Column(String(100))
    source = Column(String(20), nullable=False)  # 'ct'|'rss'|'cc'|'seed'
    seen_at = Column(DateTime(timezone=True), nullable=False, default=func.now(), index=True)


class DiscoveredKept(Base):
    """Filtered URLs that passed quality checks."""
    __tablename__ = "discovered_kept"
    
    id = Column(BigInteger, primary_key=True)
    url = Column(Text, unique=True, nullable=False, index=True)
    host = Column(String(255), nullable=False, index=True)
    tld = Column(String(100))
    parking_score = Column(Float, nullable=False)
    novelty_score = Column(Float, nullable=False)
    picked_at = Column(DateTime(timezone=True), nullable=False, default=func.now())


class RunManifest(Base):
    """Metadata about each discovery run."""
    __tablename__ = "run_manifest"
    
    run_id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    run_date = Column(String(10), nullable=False)  # YYYY-MM-DD
    candidates = Column(Integer, nullable=False)
    kept = Column(Integer, nullable=False)
    pages = Column(Integer, nullable=False)
    links_per_page = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=func.now())


class Database:
    """Database connection manager."""
    
    def __init__(self):
        self.engine = None
        self.SessionLocal = None
    
    def connect(self):
        """Initialize database connection."""
        self.engine = create_engine(
            config.database_url,
            echo=False,
            pool_pre_ping=True,
            pool_recycle=300,
        )
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
    
    def get_session(self):
        """Get database session."""
        if not self.SessionLocal:
            self.connect()
        return self.SessionLocal()
    
    async def create_tables(self):
        """Create all tables."""
        if not self.engine:
            self.connect()
        Base.metadata.create_all(bind=self.engine)
    
    async def drop_tables(self):
        """Drop all tables."""
        if not self.engine:
            self.connect()
        Base.metadata.drop_all(bind=self.engine)
    
    async def get_stats(self) -> dict:
        """Get database statistics."""
        session = self.get_session()
        try:
            stats = {
                "raw_count": session.query(DiscoveredRaw).count(),
                "kept_count": session.query(DiscoveredKept).count(),
                "runs_count": session.query(RunManifest).count(),
                "latest_run": session.query(RunManifest).order_by(RunManifest.created_at.desc()).first(),
            }
            return stats
        finally:
            session.close()


# Global database instance
db = Database()


async def migrate_db():
    """Apply database migrations."""
    await db.create_tables()
    print("Database migrations applied successfully")


async def reset_db():
    """Reset database (drop and recreate all tables)."""
    await db.drop_tables()
    await db.create_tables()
    print("Database reset successfully")
