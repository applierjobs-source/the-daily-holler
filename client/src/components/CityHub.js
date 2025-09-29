import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { generateArticleUrl, parseCitySlug } from '../utils/slugUtils';

const CityHub = ({ cities }) => {
  const { citySlug } = useParams();
  const [city, setCity] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalArticles: 0,
    recentArticles: 0,
    categories: []
  });


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
    loadCityData(foundCity);
  }, [citySlug, cities]);

  const loadCityData = async (cityData) => {
    try {
      setLoading(true);
      
      // Load articles for this city
      const response = await fetch(`/api/news/city/${cityData.id}`);
      if (response.ok) {
        const data = await response.json();
        const cityArticles = data.articles.filter(article => 
          article.cityId === cityData.id.toString()
        );
        
        setArticles(cityArticles);
        
        // Calculate stats
        const totalArticles = cityArticles.length;
        const recentArticles = cityArticles.filter(article => {
          const articleDate = new Date(article.publishedAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return articleDate > weekAgo;
        }).length;

        // Get unique categories from articles
        const categories = [...new Set(cityArticles.map(article => article.category || 'General'))];
        
        setStats({
          totalArticles,
          recentArticles,
          categories
        });
      }
    } catch (err) {
      console.error('Failed to load city data:', err);
      setError('Failed to load city data');
    } finally {
      setLoading(false);
    }
  };

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
      {/* City Header */}
      <div className="city-header">
        <div className="breadcrumb">
          <Link to="/">Home</Link> / <Link to="/cities">Cities</Link> / {city.name}
        </div>
        
        <h1 className="city-title">
          {city.name}, {city.stateName} News
        </h1>
        
        <p className="city-description">
          The latest satirical news and humor from {city.name}, {city.stateName}. 
          Stay informed with our unique take on local events, politics, and community happenings.
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
          <h2>Latest News from {city.name}</h2>
          <div className="articles-grid">
            {articles.slice(0, 6).map((article, index) => (
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
                    {article.headline}
                  </Link>
                </h3>
                
                <p className="article-excerpt">
                  {article.body ? article.body.substring(0, 150) + '...' : 'Read more about this story.'}
                </p>
                
                <div className="article-footer">
                  <span className="article-author">By {article.author}</span>
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

      {/* All Articles Link */}
      {articles.length > 6 && (
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
