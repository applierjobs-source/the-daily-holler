import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { generateArticleUrl, generateCitySlug } from '../utils/slugUtils';
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
      <HeaderAd />
      
      <div className="news-header">
        <h1>📰 Today's Latest News</h1>
        <p>All the latest satirical news from cities across America</p>
        {todayArticles.length > 0 && (
          <div className="news-stats">
            <span>{todayArticles.length} articles published today</span>
          </div>
        )}
      </div>

      {loading && <div className="loading">Loading today's articles...</div>}
      {error && <div className="error">Error: {error}</div>}
      
      {!loading && !error && todayArticles.length === 0 && (
        <div className="no-articles">
          <h3>No articles available yet</h3>
          <p>Check back later for the latest satirical news!</p>
        </div>
      )}

      {todayArticles.length > 0 && (
        <div className="articles-stream">
          {todayArticles.map((article, index) => (
            <React.Fragment key={article.id}>
              {index === 5 && <InContentAd />}
              {index === 15 && <InContentAd />}
              {index === 25 && <InContentAd />}
              
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
        </div>
      )}
    </div>
  );
};

export default Home;
