import React, { useState, useEffect } from 'react';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    // For now, we'll use mock data since we don't have a jobs API yet
    // In the future, this could fetch from a jobs API
    const mockJobs = [
      {
        id: 1,
        title: "Event Coordinator",
        company: "Local Events Inc.",
        location: "Atlanta, GA",
        category: "Events",
        type: "Full-time",
        salary: "$45,000 - $55,000",
        description: "Coordinate local events and manage event logistics for community gatherings.",
        postedDate: "2025-10-03",
        requirements: ["Bachelor's degree", "2+ years event planning experience", "Strong communication skills"]
      },
      {
        id: 2,
        title: "Community Manager",
        company: "City Connect",
        location: "Austin, TX",
        category: "Community",
        type: "Full-time",
        salary: "$50,000 - $65,000",
        description: "Build and manage local community engagement programs and partnerships.",
        postedDate: "2025-10-02",
        requirements: ["Marketing or Communications degree", "Social media experience", "Community outreach experience"]
      },
      {
        id: 3,
        title: "Local News Reporter",
        company: "The Daily Holler",
        location: "Remote",
        category: "Journalism",
        type: "Part-time",
        salary: "$25 - $35/hour",
        description: "Write engaging articles about local events and community happenings.",
        postedDate: "2025-10-01",
        requirements: ["Journalism or English degree", "Writing portfolio", "Local knowledge preferred"]
      },
      {
        id: 4,
        title: "Marketing Specialist",
        company: "Local Business Solutions",
        location: "Denver, CO",
        category: "Marketing",
        type: "Full-time",
        salary: "$55,000 - $70,000",
        description: "Develop marketing strategies for local businesses and community events.",
        postedDate: "2025-09-30",
        requirements: ["Marketing degree", "3+ years experience", "Digital marketing skills"]
      },
      {
        id: 5,
        title: "Event Photographer",
        company: "Capture Moments",
        location: "Miami, FL",
        category: "Photography",
        type: "Contract",
        salary: "$150 - $300/event",
        description: "Photograph local events, festivals, and community gatherings.",
        postedDate: "2025-09-29",
        requirements: ["Professional photography experience", "Portfolio required", "Equipment provided"]
      }
    ];

    // Simulate API call
    setTimeout(() => {
      setJobs(mockJobs);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = !locationFilter || job.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    const matchesCategory = !categoryFilter || job.category === categoryFilter;

    return matchesSearch && matchesLocation && matchesCategory;
  });

  const categories = [...new Set(jobs.map(job => job.category))];

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
      </div>

      <div className="jobs-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search jobs, companies, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <input
            type="text"
            placeholder="Filter by location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="location-input"
          />
        </div>
        
        <div className="filter-group">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="category-select"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="jobs-results">
        <div className="results-header">
          <h3>{filteredJobs.length} Job{filteredJobs.length !== 1 ? 's' : ''} Found</h3>
        </div>

        <div className="jobs-list">
          {filteredJobs.length === 0 ? (
            <div className="no-jobs">
              <p>No jobs found matching your criteria. Try adjusting your filters.</p>
            </div>
          ) : (
            filteredJobs.map(job => (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <h3 className="job-title">{job.title}</h3>
                  <div className="job-meta">
                    <span className="job-company">{job.company}</span>
                    <span className="job-location">📍 {job.location}</span>
                    <span className="job-type">{job.type}</span>
                  </div>
                </div>
                
                <div className="job-details">
                  <p className="job-salary">💰 {job.salary}</p>
                  <p className="job-description">{job.description}</p>
                  
                  <div className="job-requirements">
                    <h4>Requirements:</h4>
                    <ul>
                      {job.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="job-footer">
                  <span className="job-posted">Posted: {new Date(job.postedDate).toLocaleDateString()}</span>
                  <button className="apply-btn">Apply Now</button>
                </div>
              </div>
            ))
          )}
        </div>
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
