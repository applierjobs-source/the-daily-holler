import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateCitySlug } from '../utils/slugUtils';

const CitySelection = () => {
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [cityArticleCounts, setCityArticleCounts] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(false);
  
  const citiesPerPage = 50;
  const navigate = useNavigate();

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    filterCities();
  }, [cities, searchTerm, selectedState, selectedRegion]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (filteredCities.length > 0) {
      fetchArticleCounts();
    }
  }, [filteredCities, currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCities = async () => {
    try {
      const response = await fetch('/api/cities?limit=10000');
      if (response.ok) {
        const data = await response.json();
        setCities(data.cities);
      } else {
        setError('Failed to load cities');
      }
    } catch (err) {
      console.error('Error fetching cities:', err);
      setError('Failed to load cities');
    } finally {
      setLoading(false);
    }
  };

  const fetchArticleCounts = async () => {
    setLoadingCounts(true);
    try {
      const startIndex = (currentPage - 1) * citiesPerPage;
      const endIndex = startIndex + citiesPerPage;
      const citiesToFetch = filteredCities.slice(startIndex, endIndex);
      
      const countPromises = citiesToFetch.map(async (city) => {
        try {
          const response = await fetch(`/api/news/city/${city.id}?limit=1`);
          if (response.ok) {
            const data = await response.json();
            return { cityId: city.id, count: data.totalCount };
          }
        } catch (err) {
          console.error(`Error fetching article count for city ${city.id}:`, err);
        }
        return { cityId: city.id, count: 0 };
      });

      const counts = await Promise.all(countPromises);
      const countsMap = {};
      counts.forEach(({ cityId, count }) => {
        countsMap[cityId] = count;
      });
      
      setCityArticleCounts(prev => ({ ...prev, ...countsMap }));
    } catch (err) {
      console.error('Error fetching article counts:', err);
    } finally {
      setLoadingCounts(false);
    }
  };

  const filterCities = () => {
    let filtered = cities;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(city => 
        city.name.toLowerCase().includes(searchLower) ||
        city.stateName.toLowerCase().includes(searchLower)
      );
    }

    if (selectedState) {
      filtered = filtered.filter(city => city.state === selectedState);
    }

    if (selectedRegion) {
      filtered = filtered.filter(city => 
        city.region.toLowerCase() === selectedRegion.toLowerCase()
      );
    }

    setFilteredCities(filtered);
    setCurrentPage(1);
  };

  const handleCityClick = (city) => {
    const citySlug = generateCitySlug(city.name, city.state);
    navigate(`/cities/${citySlug}`);
  };

  const getStates = () => {
    const states = [...new Set(cities.map(city => city.state))].sort();
    return states;
  };

  const getRegions = () => {
    const regions = [...new Set(cities.map(city => city.region))].sort();
    return regions;
  };

  const getTotalPages = () => {
    return Math.ceil(filteredCities.length / citiesPerPage);
  };

  const getCurrentPageCities = () => {
    const startIndex = (currentPage - 1) * citiesPerPage;
    const endIndex = startIndex + citiesPerPage;
    return filteredCities.slice(startIndex, endIndex);
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading Cities...</h2>
        <p>Loading 10,000+ US cities</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h3>Error</h3>
        <p>{error}</p>
        <button className="btn" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="city-selection">
      <div className="city-selection-header">
        <h1>Select a City</h1>
        <p>Choose from over {cities.length.toLocaleString()} US cities to find local events and activities</p>
      </div>

      <div className="city-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search cities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="filter-select"
          >
            <option value="">All States</option>
            {getStates().map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="filter-select"
          >
            <option value="">All Regions</option>
            {getRegions().map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="city-results">
        <div className="results-header">
          <h3>
            {filteredCities.length.toLocaleString()} cities found
            {searchTerm && ` matching "${searchTerm}"`}
            {selectedState && ` in ${selectedState}`}
            {selectedRegion && ` in ${selectedRegion}`}
          </h3>
        </div>

        <div className="cities-grid">
          {getCurrentPageCities().map(city => {
            const articleCount = cityArticleCounts[city.id] || 0;
            return (
              <div
                key={city.id}
                className="city-card"
                onClick={() => handleCityClick(city)}
              >
                <div className="city-info">
                  <h4 className="city-name">{city.name}</h4>
                  <p className="city-state">{city.stateName}</p>
                  <p className="city-region">{city.region}</p>
                </div>
                
                <div className="city-stats">
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

        {getTotalPages() > 1 && (
          <div className="pagination">
            <button
              className="btn btn-outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            
            <span className="page-info">
              Page {currentPage} of {getTotalPages()}
            </span>
            
            <button
              className="btn btn-outline"
              onClick={() => setCurrentPage(prev => Math.min(getTotalPages(), prev + 1))}
              disabled={currentPage === getTotalPages()}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CitySelection;
