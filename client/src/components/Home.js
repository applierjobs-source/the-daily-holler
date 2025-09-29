import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { generateArticleUrl } from '../utils/slugUtils';
import { HeaderAd, InContentAd } from './AdBanner';

const Home = () => {
  const [todayArticles, setTodayArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTodayArticles = async () => {
      try {
        const response = await fetch('/api/news/today');
        if (response.ok) {
          const data = await response.json();
          setTodayArticles(data.articles);
        } else {
          setError('Failed to load today\'s articles');
        }
      } catch (err) {
        console.error('Error fetching today\'s articles:', err);
        setError('Failed to load today\'s articles');
      } finally {
        setLoading(false);
      }
    };

    fetchTodayArticles();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCitySlug = (cityName, state) => {
    return `${cityName.toLowerCase().replace(/\s+/g, '-')}-${state.toLowerCase()}`;
  };

  return (
    <div className="home">
      <HeaderAd />
      <div className="welcome-message">
        <h2>Welcome to The Daily Holler</h2>
        <p>Your source for satirical news and local humor across America's cities.</p>
      </div>
      
      {/* Today's Articles Section */}
      <div className="todays-articles">
        <h3>📰 Today's Latest News</h3>
        {loading && <div className="loading">Loading today's articles...</div>}
        {error && <div className="error">Error: {error}</div>}
        
        {!loading && !error && todayArticles.length > 0 && (
          <div className="articles-scroll-container">
            <div className="articles-scroll">
              {todayArticles.slice(0, 20).map((article, index) => (
                <React.Fragment key={article.id}>
                  {index === 5 && <InContentAd />}
                  <div className="article-preview">
                    <div className="article-meta">
                    <span className="article-location">📍 {article.cityName}, {article.state}</span>
                    <span className="article-time">{formatDate(article.publishedAt)}</span>
                  </div>
                  
                  <h4 className="article-headline">
                    <Link to={generateArticleUrl(article)}>
                      {article.headline}
                    </Link>
                  </h4>
                  
                  <p className="article-excerpt">
                    {article.body ? article.body.substring(0, 200) + '...' : 'Read more about this story.'}
                  </p>
                  
                  <div className="article-footer">
                    <span className="article-author">By {article.author}</span>
                    <Link 
                      to={`/cities/${getCitySlug(article.cityName, article.state)}`}
                      className="city-link"
                    >
                      View {article.cityName} News →
                    </Link>
                  </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
            
            {todayArticles.length > 20 && (
              <div className="view-more">
                <Link to="/news" className="btn btn-outline">
                  View All {todayArticles.length} Articles Today
                </Link>
              </div>
            )}
          </div>
        )}
        
        {!loading && !error && todayArticles.length === 0 && (
          <div className="no-articles">
            <p>No articles published today yet. Check back later!</p>
          </div>
        )}
      </div>
      
      <div className="quick-links">
        <h3>Quick Links</h3>
        <div className="quick-links-grid">
          <Link to="/news" className="quick-link">
            <strong>📰 Latest News</strong>
            <span>Browse all satirical articles</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
