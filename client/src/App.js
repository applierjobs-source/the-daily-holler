import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import PostDetail from './components/PostDetail';
import News from './components/News';
import CityHub from './components/CityHub';
import CitySelection from './components/CitySelection';
import Footer from './components/Footer';
import Terms from './components/Terms';
import Privacy from './components/Privacy';
import About from './components/About';
import TestArticle from './components/TestArticle';
import './App.css';

function AppContent() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load cities
    fetch('/api/cities?limit=1000')
      .then(res => res.json())
      .then(citiesResponse => {
        setCities(citiesResponse.cities);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load initial data:', err);
        setError('Failed to load application data. Please refresh the page.');
        setLoading(false);
        // Don't crash the app, just show error
      });
  }, []);

  if (loading && cities.length === 0) {
    return (
      <div className="loading">
        <h2>Loading The Daily Holler...</h2>
        <p>Loading 10,000+ US cities</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">
          <h3>Error</h3>
          <p>{error}</p>
          <button className="btn" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Header />
      
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cities" element={<CitySelection />} />
          <Route path="/cities/:citySlug" element={<CityHub cities={cities} />} />
          <Route path="/cities/:citySlug/:category" element={<CityHub cities={cities} />} />
          <Route path="/cities/:citySlug/all" element={<CityHub cities={cities} />} />
          <Route path="/cities/:citySlug/article/:articleSlug" element={<PostDetail />} />
          <Route path="/:citySlug/article/:articleSlug" element={<PostDetail />} />
          <Route path="/article/:id" element={<PostDetail />} />
          <Route path="/test-article/:id" element={<TestArticle />} />
          <Route path="/news" element={<News cities={cities} />} />
          <Route path="/news/:cityId" element={<News cities={cities} />} />
          <Route path="/about" element={<About />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </div>
      
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
