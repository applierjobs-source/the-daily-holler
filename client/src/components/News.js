import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { generateArticleUrl, generateCitySlug } from '../utils/slugUtils';

const News = () => {
  const [articles, setArticles] = useState([]);
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
          setArticles(prev => [...prev, ...data.articles]);
        } else {
          setArticles(data.articles);
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
        <h1>📰 Today's Latest News</h1>
        <p>Find Local Events and Things to Do in Your City</p>
        {totalArticles > 0 && (
          <div className="news-stats">
            <span>{totalArticles} articles available</span>
          </div>
        )}
      </div>

      {loading && articles.length === 0 && (
        <div className="loading">Loading articles...</div>
      )}

      {error && (
        <div className="error">Error: {error}</div>
      )}

      {!loading && !error && articles.length === 0 && (
        <div className="no-articles">
          <h3>No articles available yet</h3>
          <p>Check back later for the latest local events and activities!</p>
        </div>
      )}

      {articles.length > 0 && (
        <div className="articles-stream">
          {articles.map((article, index) => (
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

          {!hasMore && articles.length > 0 && (
            <div className="end-of-articles">
              <p>You've reached the end! That's all {totalArticles} articles.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default News;
