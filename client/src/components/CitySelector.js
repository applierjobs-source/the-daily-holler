import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CitySelector = ({ cities, selectedCity, onCitySelect }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [displayCount, setDisplayCount] = useState(50); // Show more cities initially
  const [cityArticleCounts, setCityArticleCounts] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(false);

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.stateName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedCities = showAll ? filteredCities : filteredCities.slice(0, displayCount);

  // Load article counts for displayed cities
  useEffect(() => {
    if (displayedCities.length === 0) return;
    
    const loadArticleCounts = async () => {
      setLoadingCounts(true);
      const counts = {};
      
      // Load counts for first 20 cities to avoid overwhelming the server
      const citiesToLoad = displayedCities.slice(0, 20);
      
      try {
        await Promise.all(
          citiesToLoad.map(async (city) => {
            try {
              const response = await fetch(`/api/news/city/${city.id}`);
              if (response.ok) {
                const data = await response.json();
                counts[city.id] = data.count;
              } else {
                counts[city.id] = 0;
              }
            } catch (error) {
              console.error(`Error loading count for ${city.name}:`, error);
              counts[city.id] = 0;
            }
          })
        );
        
        setCityArticleCounts(counts);
      } catch (error) {
        console.error('Error loading article counts:', error);
      } finally {
        setLoadingCounts(false);
      }
    };

    loadArticleCounts();
  }, [displayedCities]);

  const handleCityClick = (city) => {
    // Navigate to the city's hub page with SEO-friendly URL
    const citySlug = `${city.name.toLowerCase().replace(/\s+/g, '-')}-${city.state.toLowerCase()}`;
    navigate(`/cities/${citySlug}`);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowAll(false);
    setDisplayCount(50); // Reset display count when searching
  };

  const loadMoreCities = () => {
    setDisplayCount(prev => Math.min(prev + 50, filteredCities.length));
  };

  return (
    <div className="city-selector">
      <h3>Select Your City</h3>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search 10,000+ cities by name or state..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <small className="text-muted">
          Search by city name (e.g., "New York") or state (e.g., "California")
        </small>
      </div>
      
      {selectedCity && (
        <div className="mb-3">
          <strong>Selected: {selectedCity.name}, {selectedCity.state}</strong>
        </div>
      )}
      
      <div className="city-grid">
        {displayedCities.map(city => {
          const articleCount = cityArticleCounts[city.id] || 0;
          return (
            <div
              key={city.id}
              className={`city-item ${selectedCity?.id === city.id ? 'selected' : ''}`}
              onClick={() => handleCityClick(city)}
            >
              <div className="city-name">{city.name}</div>
              <div className="city-state">{city.state}</div>
              <div className="city-articles">
                {loadingCounts ? (
                  <span className="loading-count">📰 Loading...</span>
                ) : (
                  <span className="article-count">
                    📰 {articleCount} {articleCount === 1 ? 'article' : 'articles'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredCities.length > displayCount && !showAll && (
        <div className="text-center mt-3">
          <button
            className="btn btn-secondary"
            onClick={loadMoreCities}
          >
            Load More Cities ({displayCount} of {filteredCities.length} shown)
          </button>
        </div>
      )}
      
      {filteredCities.length > 50 && (
        <div className="text-center mt-2">
          <button
            className="btn btn-secondary"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : `Show All ${filteredCities.length} Cities`}
          </button>
        </div>
      )}
      
      {filteredCities.length === 0 && searchTerm && (
        <div className="text-center text-muted">
          No cities found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default CitySelector;
