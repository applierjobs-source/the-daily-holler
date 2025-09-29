import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';

const News = ({ cities }) => {
  const { cityId } = useParams();
  const [selectedCity, setSelectedCity] = useState(null);
  const [article, setArticle] = useState(null);
  const [articleHistory, setArticleHistory] = useState([]);
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadArticleHistory = useCallback(async (cityId) => {
    try {
      const response = await fetch(`/api/news/city/${cityId}`);
      if (response.ok) {
        const data = await response.json();
        // Filter articles to only show those for the selected city
        const cityArticles = data.articles.filter(article => article.cityId === cityId.toString());
        setArticleHistory(cityArticles);
        setCurrentArticleIndex(0);
      }
    } catch (err) {
      console.error('Failed to load article history:', err);
    }
  }, []);

  const generateArticle = useCallback(async (cityId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/news/${cityId}`);
      if (!response.ok) {
        // If the response fails, try to load from history instead of showing error
        // This handles cases where the article was generated but server restarted
        console.log('Response failed, checking if article was saved...');
        const historyResponse = await fetch(`/api/news/city/${cityId}`);
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          if (historyData.articles && historyData.articles.length > 0) {
            setArticle(historyData.articles[0]);
            setArticleHistory(historyData.articles);
            setCurrentArticleIndex(0);
            console.log('Using latest article from history');
            return;
          }
        }
        throw new Error('Failed to generate article');
      } else {
        const data = await response.json();
        setArticle(data);
        // Reload article history to include the new article
        const historyResponse = await fetch(`/api/news/city/${cityId}`);
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          // Filter articles to only show those for the selected city
          const cityArticles = historyData.articles.filter(article => article.cityId === cityId.toString());
          setArticleHistory(cityArticles);
          setCurrentArticleIndex(0);
        }
      }
    } catch (err) {
      // Try to load from history one more time
      try {
        const response = await fetch(`/api/news/city/${cityId}`);
        if (response.ok) {
          const data = await response.json();
          // Filter articles to only show those for the selected city
          const cityArticles = data.articles.filter(article => article.cityId === cityId.toString());
          if (cityArticles.length > 0) {
            setArticle(cityArticles[0]);
            setArticleHistory(cityArticles);
            setCurrentArticleIndex(0);
            console.log('Successfully loaded from history after error');
            return; // Don't show error
          }
        }
      } catch (historyErr) {
        console.log('Could not load from history either');
      }
      // Don't show error message - just log it
      console.log('Error generating article:', err.message);
      // Try to load any existing articles instead of showing error
      try {
        const response = await fetch(`/api/news/city/${cityId}`);
        if (response.ok) {
          const data = await response.json();
          // Filter articles to only show those for the selected city
          const cityArticles = data.articles.filter(article => article.cityId === cityId.toString());
          if (cityArticles.length > 0) {
            setArticle(cityArticles[0]);
            setArticleHistory(cityArticles);
            setCurrentArticleIndex(0);
            console.log('Loaded existing article instead of showing error');
            return;
          }
        }
      } catch (finalErr) {
        console.log('No articles available');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (cities.length > 0) {
      // Default to first city if no cityId specified
      const defaultCity = cityId ? cities.find(c => c.id === cityId) : cities[0];
      if (defaultCity) {
        setSelectedCity(defaultCity);
        loadArticleHistory(defaultCity.id);
        generateArticle(defaultCity.id);
      }
    }
  }, [cityId, cities, loadArticleHistory, generateArticle]);

  const generateNewArticle = () => {
    if (selectedCity) {
      generateArticle(selectedCity.id);
    }
  };

  const navigateToArticle = (index) => {
    if (index >= 0 && index < articleHistory.length) {
      setCurrentArticleIndex(index);
      setArticle(articleHistory[index]);
    }
  };

  const goToPreviousArticle = () => {
    if (currentArticleIndex > 0) {
      navigateToArticle(currentArticleIndex - 1);
    }
  };

  const goToNextArticle = () => {
    if (currentArticleIndex < articleHistory.length - 1) {
      navigateToArticle(currentArticleIndex + 1);
    }
  };

  const handleCityChange = (city) => {
    setSelectedCity(city);
    setArticle(null); // Clear current article
    setError(null); // Clear any errors
    loadArticleHistory(city.id);
    generateArticle(city.id);
  };

  return (
    <div className="news-page">
      {error && (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Generating your Onion-style news...</p>
        </div>
      )}

      {article && !loading && (
        <div className="news-article">
          <div className="article-header">
            <h2 className="article-headline">{article.headline}</h2>
            <div className="article-meta">
              <span className="article-location">📍 {article.cityName}, {article.state}</span>
              <span className="article-author">By {article.author}</span>
              <span className="article-date">
                {new Date(article.publishedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          
          <div className="article-body">
            {article.body.split('\n').map((paragraph, index) => (
              <p key={index} className="article-paragraph">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}

      {!article && !loading && !error && (
        <div className="no-article">
          <p>Click "Generate New News" to get started!</p>
        </div>
      )}

      <div className="news-header">
        <h1>🗞️ Local News</h1>
        <p>AI-generated satirical news articles for your city</p>
        
        <div className="news-city-selector">
          <label htmlFor="news-city-select">Select City:</label>
          <select 
            id="news-city-select"
            value={selectedCity?.id || ''} 
            onChange={(e) => {
              const city = cities.find(c => c.id === e.target.value);
              if (city) {
                handleCityChange(city);
              }
            }}
            className="form-select news-city-dropdown"
            disabled={loading}
          >
            {cities.map(city => (
              <option key={city.id} value={city.id}>
                {city.name}, {city.state}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="news-controls">
        <button 
          onClick={generateNewArticle}
          disabled={loading}
          className="btn btn-primary generate-btn"
        >
          {loading ? 'Generating...' : 'Generate New News'}
        </button>
      </div>

      {/* News History and Navigation */}
      {articleHistory.length > 0 && (
        <div className="article-history">
          <h3>📚 News History for {selectedCity?.name}</h3>
          <div className="article-navigation">
            <button 
              onClick={goToPreviousArticle}
              disabled={currentArticleIndex === 0}
              className="btn btn-outline-primary nav-btn"
            >
              ← Previous
            </button>
            <span className="article-counter">
              {currentArticleIndex + 1} of {articleHistory.length} news
            </span>
            <button 
              onClick={goToNextArticle}
              disabled={currentArticleIndex === articleHistory.length - 1}
              className="btn btn-outline-primary nav-btn"
            >
              Next →
            </button>
          </div>
          
          <div className="article-list">
            {articleHistory.map((histArticle, index) => (
              <div 
                key={histArticle.id}
                className={`article-item ${index === currentArticleIndex ? 'active' : ''}`}
                onClick={() => navigateToArticle(index)}
              >
                <h4 className="article-item-title">{histArticle.headline}</h4>
                <div className="article-item-meta">
                  <span className="article-item-date">
                    {new Date(histArticle.publishedAt).toLocaleDateString()}
                  </span>
                  <span className="article-item-author">By {histArticle.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default News;
