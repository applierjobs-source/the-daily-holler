import React, { useState, useEffect } from 'react';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);
  const [stats, setStats] = useState(null);

  const JOBS_PER_PAGE = 20;

  useEffect(() => {
    fetchJobs();
    fetchStats();
  }, [page, searchTerm, locationFilter, categoryFilter, sourceFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: JOBS_PER_PAGE.toString()
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (locationFilter) params.append('location', locationFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      if (sourceFilter) params.append('source', sourceFilter);
      
      const response = await fetch(`/api/jobs?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
        setTotalPages(data.totalPages || 0);
        setTotalJobs(data.total || 0);
      } else {
        setError('Failed to load jobs');
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/jobs/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handleLocationFilter = (e) => {
    setLocationFilter(e.target.value);
    setPage(1);
  };

  const handleCategoryFilter = (e) => {
    setCategoryFilter(e.target.value);
    setPage(1);
  };

  const handleSourceFilter = (e) => {
    setSourceFilter(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0); // Scroll to top when changing pages
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSourceBadge = (source) => {
    const badges = {
      'indeed': { text: 'Indeed', class: 'source-indeed' },
      'glassdoor': { text: 'Glassdoor', class: 'source-glassdoor' },
      'craigslist': { text: 'Craigslist', class: 'source-craigslist' },
      'linkedin': { text: 'LinkedIn', class: 'source-linkedin' }
    };
    
    const badge = badges[source] || { text: source || 'Unknown', class: 'source-unknown' };
    return <span className={`source-badge ${badge.class}`}>{badge.text}</span>;
  };

  // Get unique categories and sources for filter dropdowns
  const categories = [...new Set(jobs.map(job => job.category).filter(Boolean))];
  const sources = [...new Set(jobs.map(job => job.source).filter(Boolean))];

  if (loading) {
    return (
      <div className="jobs-page">
        <div className="loading">
          <h2>Loading Jobs...</h2>
          <p>Finding the best local opportunities</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="jobs-page">
        <div className="error">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="jobs-page">
      <div className="jobs-header">
        <h1>Local Jobs & Opportunities</h1>
        <p>Find meaningful work in your community with The Daily Holler's job board</p>
        
        {stats && (
          <div className="jobs-stats">
            <div className="stat-item">
              <span className="stat-number">{stats.totalJobs.toLocaleString()}</span>
              <span className="stat-label">Total Jobs</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.citiesWithJobs}</span>
              <span className="stat-label">Cities Covered</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.coverage}</span>
              <span className="stat-label">Coverage</span>
            </div>
            {stats.lastUpdated && (
              <div className="stat-item">
                <span className="stat-number">Updated</span>
                <span className="stat-label">{formatDate(stats.lastUpdated)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="jobs-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search jobs, companies, or keywords..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <input
            type="text"
            placeholder="Filter by location..."
            value={locationFilter}
            onChange={handleLocationFilter}
            className="location-input"
          />
        </div>
        
        <div className="filter-group">
          <select
            value={categoryFilter}
            onChange={handleCategoryFilter}
            className="category-select"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select
            value={sourceFilter}
            onChange={handleSourceFilter}
            className="source-select"
          >
            <option value="">All Sources</option>
            {sources.map(source => (
              <option key={source} value={source}>{source.charAt(0).toUpperCase() + source.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="jobs-results">
        <div className="results-header">
          <h3>{totalJobs.toLocaleString()} Job{totalJobs !== 1 ? 's' : ''} Found</h3>
          {totalPages > 1 && (
            <div className="pagination-info">
              Page {page} of {totalPages}
            </div>
          )}
        </div>

        {loading ? (
          <div className="loading">
            <p>Loading jobs...</p>
          </div>
        ) : error ? (
          <div className="error">
            <p>{error}</p>
            <button onClick={fetchJobs} className="retry-btn">Retry</button>
          </div>
        ) : (
          <>
            <div className="jobs-list">
              {jobs.length === 0 ? (
                <div className="no-jobs">
                  <p>No jobs found matching your criteria. Try adjusting your filters.</p>
                  {stats && stats.totalJobs === 0 && (
                    <p className="no-data-message">
                      No jobs have been scraped yet. Check back later or contact us to add job sources.
                    </p>
                  )}
                </div>
              ) : (
                jobs.map(job => (
                  <div key={job.id} className="job-card">
                    <div className="job-header">
                      <h3 className="job-title">{job.title}</h3>
                      <div className="job-meta">
                        <span className="job-company">{job.company || 'Company not specified'}</span>
                        <span className="job-location">📍 {job.location}</span>
                        {job.type && <span className="job-type">{job.type}</span>}
                        {getSourceBadge(job.source)}
                      </div>
                    </div>
                    
                    <div className="job-details">
                      {job.salary && <p className="job-salary">💰 {job.salary}</p>}
                      <p className="job-description">{job.description}</p>
                      
                      {job.requirements && job.requirements.length > 0 && (
                        <div className="job-requirements">
                          <h4>Requirements:</h4>
                          <ul>
                            {job.requirements.map((req, index) => (
                              <li key={index}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="job-footer">
                      <span className="job-posted">Posted: {formatDate(job.postedDate)}</span>
                      <div className="job-actions">
                        {job.url && (
                          <a href={job.url} target="_blank" rel="noopener noreferrer" className="apply-btn">
                            View Job
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="pagination-btn"
                >
                  Previous
                </button>
                
                <div className="pagination-pages">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, page - 2) + i;
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`pagination-page ${pageNum === page ? 'active' : ''}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button 
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="jobs-cta">
        <h2>Looking to Hire?</h2>
        <p>Post your job openings and reach local talent in your community.</p>
        <button className="post-job-btn">Post a Job</button>
      </div>
    </div>
  );
};

export default Jobs;
