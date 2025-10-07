import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { generateArticleUrl, generateCitySlug } from '../utils/slugUtils';

const Home = () => {
  const [todayArticles, setTodayArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalArticles, setTotalArticles] = useState(0);

  const ARTICLES_PER_PAGE = 20;

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/news?limit=${ARTICLES_PER_PAGE}&offset=${(pageNum - 1) * ARTICLES_PER_PAGE}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (append) {
          setTodayArticles(prev => [...prev, ...data.articles]);
        } else {
          setTodayArticles(data.articles);
        }
        
        setTotalArticles(data.total);
        setHasMore(data.articles.length === ARTICLES_PER_PAGE);
        setPage(pageNum);
      } else {
        setError('Failed to load articles');
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadArticles(page + 1, true);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  return (
    <div className="news-page">
      
      <div className="news-header">
        <h1>📰 The Daily Holler - Local Events & Activities</h1>
        <p>Find Local Events and Things to Do in 1,690+ US Cities</p>
        <p>Discover hidden gems, community activities, and local happenings in your area. Updated every 10 seconds with fresh content.</p>
        {totalArticles > 0 && (
          <div className="news-stats">
            <span>{totalArticles} articles available</span>
          </div>
        )}
      </div>

      {/* SEO-friendly content that's always visible */}
      <div className="seo-content">
        <h2>What is The Daily Holler?</h2>
        <p>The Daily Holler is your go-to platform for discovering local events and activities across 1,690+ American cities. We help you find community events, entertainment, workshops, and local happenings in your area.</p>
        
        <h3>Popular Categories</h3>
        <div className="category-grid">
          <div className="category-item">🎪 Community Events</div>
          <div className="category-item">🎵 Entertainment</div>
          <div className="category-item">🏃‍♀️ Sports & Fitness</div>
          <div className="category-item">🎨 Arts & Culture</div>
          <div className="category-item">🍽️ Food & Dining</div>
          <div className="category-item">👨‍💼 Business & Networking</div>
        </div>
        
        <h3>How It Works</h3>
        <p>Our platform continuously scans for local events and activities, providing you with up-to-date information about what's happening in your city. Whether you're looking for weekend activities, professional networking events, or family-friendly entertainment, we've got you covered.</p>
      </div>

      {loading && todayArticles.length === 0 && (
        <div className="loading">
          <h3>Loading Latest Events...</h3>
          <p>Fetching the most recent local activities and events for you.</p>
        </div>
      )}

      {error && (
        <div className="error">
          <h3>Unable to Load Events</h3>
          <p>We're having trouble loading the latest events. Please try refreshing the page.</p>
          <button className="btn" onClick={() => window.location.reload()}>Refresh Page</button>
        </div>
      )}
      
      {!loading && !error && todayArticles.length === 0 && (
        <div className="no-articles">
          <h3>No Recent Events Available</h3>
          <p>We're currently updating our event database. Check back in a few minutes for the latest local activities and events!</p>
          <p>In the meantime, you can browse our city directory to explore events in specific locations.</p>
        </div>
      )}

      {todayArticles.length > 0 && (
        <div className="articles-stream">
          {todayArticles.map((article, index) => (
            <React.Fragment key={article.id}>
              
              <div className="article-card">
                <div className="article-meta">
                  <span 
                    className="article-category"
                    style={{ backgroundColor: getCategoryColor(article.category) }}
                  >
                    {article.category || 'General'}
                  </span>
                  <span className="article-location">📍 {article.city}, {article.state}</span>
                  <span className="article-time">{formatDate(article.publishedAt)}</span>
                </div>
                
                <h2 className="article-headline">
                  <Link to={generateArticleUrl(article)}>
                    {article.title}
                  </Link>
                </h2>
                
                <p className="article-excerpt">
                  {article.content ? article.content.substring(0, 300) + '...' : 'Read more about this story.'}
                </p>
                
                <div className="article-footer">
                  <span className="article-author">By {article.author || 'The Daily Holler'}</span>
                  {article.city && (
                    <Link 
                      to={`/cities/${generateCitySlug(article.city, article.state)}`}
                      className="city-link"
                    >
                      View {article.city} News →
                    </Link>
                  )}
                </div>
              </div>
            </React.Fragment>
          ))}

          {hasMore && (
            <div className="load-more-container">
              <button 
                onClick={loadMore}
                disabled={loading}
                className="btn btn-outline load-more-btn"
              >
                {loading ? 'Loading...' : 'Load More Articles'}
              </button>
            </div>
          )}

          {!hasMore && todayArticles.length > 0 && (
            <div className="end-of-articles">
              <p>You've reached the end! That's all {totalArticles} articles.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
