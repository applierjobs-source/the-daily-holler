import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { generateArticleUrl, parseCitySlug } from '../utils/slugUtils';
import { Helmet } from 'react-helmet';

const CityHub = ({ cities }) => {
  const { citySlug, category } = useParams();
  const [city, setCity] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalArticles: 0,
    recentArticles: 0,
    categories: []
  });
  const [showAllArticles, setShowAllArticles] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [articlesPerPage] = useState(20);

  const loadCityData = useCallback(async (cityData) => {
    try {
      setLoading(true);
      
      // Load articles for this city
      const response = await fetch(`/api/news/city/${cityData.id}`);
      
      if (response.ok) {
        const data = await response.json();
        let cityArticles = data.articles;
        
        // Filter by category if specified (and not 'all')
        if (category && category !== 'all') {
          cityArticles = cityArticles.filter(article => 
            (article.category || 'General').toLowerCase() === category.toLowerCase()
          );
        }
        
        setArticles(cityArticles);
        
        // Debug logging
        console.log('Debug loadCityData:', {
          category,
          showAllArticles: category === 'all',
          totalArticlesFromAPI: data.articles.length,
          filteredArticles: cityArticles.length,
          categoryFilter: category && category !== 'all' ? category : 'none'
        });
        
        // Calculate stats
        const totalArticles = cityArticles.length;
        const recentArticles = cityArticles.filter(article => {
          const articleDate = new Date(article.publishedAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return articleDate > weekAgo;
        }).length;

        // Get unique categories from all articles (not filtered)
        const allCategories = [...new Set(data.articles.map(article => article.category || 'General'))];
        
        setStats({
          totalArticles,
          recentArticles,
          categories: allCategories
        });
      }
    } catch (err) {
      console.error('Failed to load city data:', err);
      setError('Failed to load city data');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    if (!citySlug) return;

    const { cityName, state } = parseCitySlug(citySlug);
    if (!cityName || !state) {
      setError('Invalid city URL');
      setLoading(false);
      return;
    }

    // Find city by name and state
    const foundCity = cities.find(c => 
      c.name.toLowerCase() === cityName.toLowerCase() && 
      c.state === state
    );

    if (!foundCity) {
      setError('City not found');
      setLoading(false);
      return;
    }

    setCity(foundCity);
    setShowAllArticles(category === 'all');
    setCurrentPage(1);
    loadCityData(foundCity);
  }, [citySlug, cities, category, loadCityData]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Politics': '#e74c3c',
      'Business': '#3498db',
      'Sports': '#2ecc71',
      'Entertainment': '#9b59b6',
      'Technology': '#f39c12',
      'Health': '#1abc9c',
      'Education': '#34495e',
      'General': '#95a5a6'
    };
    return colors[category] || colors['General'];
  };

  // Pagination logic
  const getPaginatedArticles = () => {
    if (!showAllArticles) {
      return articles.slice(0, 6);
    }
    
    const startIndex = (currentPage - 1) * articlesPerPage;
    const endIndex = startIndex + articlesPerPage;
    const paginatedArticles = articles.slice(startIndex, endIndex);
    
    // Debug logging
    console.log('Debug pagination:', {
      showAllArticles,
      totalArticles: articles.length,
      currentPage,
      articlesPerPage,
      startIndex,
      endIndex,
      paginatedCount: paginatedArticles.length,
      totalPages: getTotalPages()
    });
    
    return paginatedArticles;
  };

  const getTotalPages = () => {
    return Math.ceil(articles.length / articlesPerPage);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="city-hub">
        <div className="loading">Loading {city?.name || 'city'}...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="city-hub">
        <div className="error">{error}</div>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    );
  }

  if (!city) {
    return (
      <div className="city-hub">
        <div className="error">City not found</div>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="city-hub">
      {city && (
        <Helmet>
          <title>{city.name}, {city.stateName} Events & Local News | The Daily Holler</title>
          <meta name="description" content={`Discover local events, activities, and community happenings in ${city.name}, ${city.stateName}. Stay informed about what's happening in your city with real-time updates and local insights.`} />
          <meta name="keywords" content={`${city.name} events, ${city.name} activities, ${city.stateName} local news, ${city.name} community events, things to do in ${city.name}`} />
          <meta property="og:title" content={`${city.name}, ${city.stateName} Events & Local News | The Daily Holler`} />
          <meta property="og:description" content={`Discover local events, activities, and community happenings in ${city.name}, ${city.stateName}. Stay informed about what's happening in your city.`} />
          <meta property="og:url" content={`https://holler.news/cities/${citySlug}`} />
          <link rel="canonical" href={`https://holler.news/cities/${citySlug}`} />
        </Helmet>
      )}
      
      {/* City Header */}
      <div className="city-header">
        <div className="breadcrumb">
          <Link to="/">Home</Link> / <Link to="/cities">Cities</Link> / {city.name}
        </div>
        
        <h1 className="city-title">
          {city.name}, {city.stateName} News
        </h1>
        
        <p className="city-description">
          Discover local events, activities, and community happenings in {city.name}, {city.stateName}. 
          Stay informed about what's happening in your city with real-time updates and local insights.
        </p>

        {/* City Stats */}
        <div className="city-stats">
          <div className="stat">
            <span className="stat-number">{stats.totalArticles}</span>
            <span className="stat-label">Total Articles</span>
          </div>
          <div className="stat">
            <span className="stat-number">{stats.recentArticles}</span>
            <span className="stat-label">This Week</span>
          </div>
          <div className="stat">
            <span className="stat-number">{stats.categories.length}</span>
            <span className="stat-label">Categories</span>
          </div>
        </div>
      </div>


      {/* Featured Articles */}
      {articles.length > 0 && (
        <div className="featured-articles">
          <h2>
            {showAllArticles ? `All Articles from ${city.name}` : `Latest News from ${city.name}`}
            {category && category !== 'all' && ` - ${category.charAt(0).toUpperCase() + category.slice(1)}`}
          </h2>
          <div className="articles-grid">
            {getPaginatedArticles().map((article, index) => (
              <div key={article.id} className={`article-card ${index === 0 ? 'featured' : ''}`}>
                <div className="article-meta">
                  <span 
                    className="article-category"
                    style={{ backgroundColor: getCategoryColor(article.category) }}
                  >
                    {article.category || 'General'}
                  </span>
                  <span className="article-date">
                    {formatDate(article.publishedAt)}
                  </span>
                </div>
                
                <h3 className="article-title">
                  <Link to={generateArticleUrl(article)}>
                    {article.title || article.headline}
                  </Link>
                </h3>
                
                <p className="article-excerpt">
                  {article.content ? article.content.substring(0, 150) + '...' : 
                   article.body ? article.body.substring(0, 150) + '...' : 'Read more about this story.'}
                </p>
                
                <div className="article-footer">
                  <span className="article-author">By {article.author || 'The Daily Holler'}</span>
                  <Link to={generateArticleUrl(article)} className="read-more">
                    Read More →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories Section */}
      {stats.categories.length > 0 && (
        <div className="city-categories">
          <h2>Browse by Category</h2>
          <div className="categories-grid">
            {stats.categories.map(category => {
              const categoryArticles = articles.filter(article => 
                (article.category || 'General') === category
              );
              
              return (
                <Link 
                  key={category}
                  to={`/cities/${citySlug}/${category.toLowerCase()}`}
                  className="category-card"
                >
                  <div 
                    className="category-icon"
                    style={{ backgroundColor: getCategoryColor(category) }}
                  >
                    {category.charAt(0)}
                  </div>
                  <h3>{category}</h3>
                  <p>{categoryArticles.length} articles</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Related Cities */}
      <div className="related-cities">
        <h2>More Cities in {city.stateName}</h2>
        <div className="cities-list">
          {cities
            .filter(c => c.state === city.state && c.id !== city.id)
            .slice(0, 6)
            .map(relatedCity => (
              <Link 
                key={relatedCity.id}
                to={`/cities/${relatedCity.name.toLowerCase().replace(/\s+/g, '-')}-${relatedCity.state.toLowerCase()}`}
                className="city-link"
              >
                {relatedCity.name}
              </Link>
            ))}
        </div>
      </div>

      {/* Pagination */}
      {showAllArticles && getTotalPages() > 1 && (
        <div className="pagination">
          <div className="pagination-info">
            Showing {((currentPage - 1) * articlesPerPage) + 1} to {Math.min(currentPage * articlesPerPage, articles.length)} of {articles.length} articles
          </div>
          <div className="pagination-controls">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn btn-outline"
            >
              Previous
            </button>
            <span className="pagination-pages">
              {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`btn ${currentPage === page ? 'btn-primary' : 'btn-outline'}`}
                >
                  {page}
                </button>
              ))}
            </span>
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === getTotalPages()}
              className="btn btn-outline"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* All Articles Link - only show on regular city page */}
      {!showAllArticles && articles.length > 6 && (
        <div className="view-all">
          <Link to={`/cities/${citySlug}/all`} className="btn btn-outline">
            View All {stats.totalArticles} Articles
          </Link>
        </div>
      )}
    </div>
  );
};

export default CityHub;
