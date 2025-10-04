import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { generateCitySlug } from '../utils/slugUtils';

const PostDetail = () => {
  const { id, citySlug, articleSlug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        let articleData;
        
        if (articleSlug && citySlug) {
          // New URL format: /cities/city-slug/events/article-slug
          // Fetch article by slug
          const response = await fetch(`/api/articles/by-slug/${articleSlug}`);
          
          if (response.ok) {
            articleData = await response.json();
          } else {
            const errorData = await response.json();
            setError(errorData.error || 'Article not found');
            setLoading(false);
            return;
          }
        } else if (id) {
          // Legacy URL format: /article/id
          const response = await fetch(`/api/articles/${id}`);
          
          if (response.ok) {
            articleData = await response.json();
          } else {
            const errorData = await response.json();
            setError(errorData.error || 'Article not found');
            setLoading(false);
            return;
          }
        } else {
          setError('Invalid article URL');
          setLoading(false);
          return;
        }
        
        if (articleData && articleData.error) {
          setError(articleData.error);
        } else if (articleData) {
          setArticle(articleData);
        } else {
          setError('Article not found');
        }
      } catch (err) {
        console.error('Failed to fetch article:', err);
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id, citySlug, articleSlug]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <h3>Loading article...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h3>Error</h3>
        <p>{error}</p>
        <Link to="/" className="btn">Back to Home</Link>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="error">
        <h3>Article Not Found</h3>
        <p>The article you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="btn">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="article-detail">
      <div className="breadcrumb">
        <Link to="/">Home</Link> → 
        <Link to={`/cities/${generateCitySlug(article.city, article.state)}`}>{article.cityName}, {article.state}</Link> → 
        <span>{article.headline}</span>
      </div>
      
      <div className="article-detail-header">
        <h1 className="article-detail-title">{article.headline}</h1>
        <div className="article-detail-meta">
          <span className="article-location">📍 {article.cityName}, {article.state}</span>
          <span className="article-time">{formatDate(article.publishedAt)}</span>
          <span className="article-author">By {article.author}</span>
          {article.wordCount && (
            <span className="article-word-count">{article.wordCount} words</span>
          )}
        </div>
      </div>
      
      <div className="article-detail-body">
        <div className="article-content">
          {article.content && article.content.split('\n').map((paragraph, index) => {
            return (
              <p key={index} className="article-paragraph">
                {paragraph}
              </p>
            );
          })}
        </div>
        
        <div className="article-footer">
          <div className="article-tags">
            <span className="tag">Events</span>
            <span className="tag">{article.cityName}</span>
            <span className="tag">{article.state}</span>
          </div>
          
          <div className="article-actions">
            <Link to={`/cities/${citySlug}`} className="btn btn-outline">
              More {article.cityName} News
            </Link>
            <Link to="/news" className="btn btn-outline">
              All News
            </Link>
          </div>
        </div>
      </div>
      
      {/* Sticky Get Tickets Button */}
      {article.eventbrite_url && (
        <div 
          className="sticky-tickets-button"
          style={{
            position: 'fixed',
            bottom: '0',
            left: '0',
            right: '0',
            width: '100%',
            backgroundColor: '#007bff !important',
            padding: '16px',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
            zIndex: 1000,
            textAlign: 'center'
          }}
        >
          <a 
            href={article.eventbrite_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{
              backgroundColor: '#007bff !important',
              color: 'white',
              border: '2px solid white',
              padding: '16px 32px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '18px',
              display: 'block',
              width: '100%',
              boxSizing: 'border-box',
              textAlign: 'center'
            }}
          >
            🎫 Get Tickets Here
          </a>
        </div>
      )}
      
      {/* Add bottom padding to prevent content from being hidden behind sticky button */}
      {article.eventbrite_url && (
        <div style={{ height: '100px' }}></div>
      )}
    </div>
  );
};

export default PostDetail;
