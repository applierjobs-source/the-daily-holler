import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { parseCitySlug, generateCitySlug } from '../utils/slugUtils';
import { InContentAd } from './AdBanner';

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
          // New URL format: /cities/city-slug/article/article-slug
          const cityInfo = parseCitySlug(citySlug);
          if (!cityInfo) {
            setError('Invalid city in URL');
            setLoading(false);
            return;
          }
          
          // For now, we'll use the ID-based approach since we don't have slug-based lookup yet
          // This would need to be implemented on the backend
          articleData = await fetch(`/api/articles/by-slug/${articleSlug}`).then(res => res.json());
        } else if (id) {
          // Legacy URL format: /article/id
          articleData = await fetch(`/api/articles/${id}`).then(res => res.json());
        } else {
          setError('Invalid article URL');
          setLoading(false);
          return;
        }
        
        if (articleData.error) {
          setError(articleData.error);
        } else {
          setArticle(articleData);
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
            // Add ad after 2nd paragraph
            if (index === 2) {
              return (
                <React.Fragment key={index}>
                  <p className="article-paragraph">
                    {paragraph}
                  </p>
                  <InContentAd />
                </React.Fragment>
              );
            }
            return (
              <p key={index} className="article-paragraph">
                {paragraph}
              </p>
            );
          })}
        </div>
        
        <div className="article-footer">
          <div className="article-tags">
            <span className="tag">Satirical News</span>
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
    </div>
  );
};

export default PostDetail;
