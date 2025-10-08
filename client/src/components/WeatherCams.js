import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './WeatherCams.css';

const WeatherCams = () => {
  const [featuredCams, setFeaturedCams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading featured cameras
    setTimeout(() => {
      setFeaturedCams([
        {
          id: 1,
          location: "Downtown Seattle",
          state: "WA",
          earnings: "$247",
          viewers: "1,234",
          weather: "Rainy",
          thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
        },
        {
          id: 2,
          location: "Miami Beach",
          state: "FL",
          earnings: "$189",
          viewers: "892",
          weather: "Sunny",
          thumbnail: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop"
        },
        {
          id: 3,
          location: "Central Park",
          state: "NY",
          earnings: "$312",
          viewers: "1,567",
          weather: "Snowing",
          thumbnail: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop"
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getWeatherIcon = (weather) => {
    const icons = {
      'Sunny': '☀️',
      'Rainy': '🌧️',
      'Snowing': '❄️',
      'Cloudy': '☁️',
      'Stormy': '⛈️'
    };
    return icons[weather] || '🌤️';
  };

  const getWeatherColor = (weather) => {
    const colors = {
      'Sunny': '#f39c12',
      'Rainy': '#3498db',
      'Snowing': '#ecf0f1',
      'Cloudy': '#95a5a6',
      'Stormy': '#2c3e50'
    };
    return colors[weather] || '#95a5a6';
  };

  return (
    <div className="weather-cams">
      <Helmet>
        <title>Live Weather Cams - Earn Money from Your Window View | The Daily Holler</title>
        <meta name="description" content="Turn your window view into a money-making opportunity! Set up a weather camera and earn passive income from viewers worldwide. Join our community of weather cam operators." />
        <meta name="keywords" content="weather cams, live cameras, passive income, window view, weather streaming, camera setup, earn money online" />
        <meta property="og:title" content="Live Weather Cams - Earn Money from Your Window View" />
        <meta property="og:description" content="Turn your window view into a money-making opportunity! Set up a weather camera and earn passive income." />
        <meta property="og:url" content="https://holler.news/weather-cams" />
        <link rel="canonical" href="https://holler.news/weather-cams" />
      </Helmet>

      {/* Hero Section */}
      <div className="weather-cams-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">📹</span>
            <span>Live Weather Streaming</span>
          </div>
          
          <h1 className="hero-title">
            Turn Your Window Into a
            <span className="highlight"> Money-Making Machine</span>
          </h1>
          
          <p className="hero-description">
            Set up a simple camera by your window and earn passive income from people 
            around the world who want to see your local weather and scenery.
          </p>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">$2,847</div>
              <div className="stat-label">Average Monthly Earnings</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">1,247</div>
              <div className="stat-label">Active Camera Operators</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">2.3M</div>
              <div className="stat-label">Daily Viewers</div>
            </div>
          </div>

          <div className="hero-actions">
            <button className="btn btn-primary btn-large">
              <span className="btn-icon">🚀</span>
              Start Earning Today
            </button>
            <button className="btn btn-outline btn-large">
              <span className="btn-icon">📺</span>
              View Live Cams
            </button>
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="camera-setup-demo">
            <div className="window-frame">
              <div className="window-view">
                <div className="weather-overlay">
                  <span className="weather-icon">☀️</span>
                  <span className="weather-text">72°F Sunny</span>
                </div>
              </div>
              <div className="camera-mount">
                <div className="camera"></div>
              </div>
            </div>
            <div className="earnings-display">
              <span className="earnings-label">Live Earnings:</span>
              <span className="earnings-amount">$12.47</span>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Get started in just 3 simple steps</p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-icon">📱</div>
            <h3>Set Up Your Camera</h3>
            <p>Mount a simple webcam or use your phone to capture your window view. No special equipment needed!</p>
            <ul className="step-benefits">
              <li>Works with any smartphone</li>
              <li>Basic webcam support</li>
              <li>WiFi connection required</li>
            </ul>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-icon">🌐</div>
            <h3>Stream Live</h3>
            <p>Your camera feed goes live instantly on our platform. Viewers from around the world can watch your local weather.</p>
            <ul className="step-benefits">
              <li>24/7 live streaming</li>
              <li>Global audience reach</li>
              <li>Real-time weather data</li>
            </ul>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-icon">💰</div>
            <h3>Earn Money</h3>
            <p>Get paid for every viewer who watches your feed. The more popular your location, the more you earn!</p>
            <ul className="step-benefits">
              <li>Pay-per-view model</li>
              <li>Monthly payouts</li>
              <li>Transparent earnings</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Featured Cameras */}
      <div className="featured-cameras">
        <div className="section-header">
          <h2>Top Earning Cameras</h2>
          <p>See how much our operators are making</p>
        </div>

        {loading ? (
          <div className="loading-grid">
            {[1, 2, 3].map(i => (
              <div key={i} className="camera-card skeleton">
                <div className="camera-thumbnail"></div>
                <div className="camera-info">
                  <div className="location"></div>
                  <div className="earnings"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="cameras-grid">
            {featuredCams.map(cam => (
              <div key={cam.id} className="camera-card">
                <div className="camera-thumbnail">
                  <img src={cam.thumbnail} alt={`${cam.location} weather cam`} />
                  <div className="weather-overlay" style={{ backgroundColor: getWeatherColor(cam.weather) }}>
                    <span className="weather-icon">{getWeatherIcon(cam.weather)}</span>
                    <span className="weather-text">{cam.weather}</span>
                  </div>
                  <div className="live-indicator">
                    <span className="live-dot"></span>
                    LIVE
                  </div>
                </div>
                <div className="camera-info">
                  <h3 className="location">{cam.location}, {cam.state}</h3>
                  <div className="camera-stats">
                    <div className="stat">
                      <span className="stat-label">This Month</span>
                      <span className="stat-value earnings">${cam.earnings}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Viewers</span>
                      <span className="stat-value">{cam.viewers}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Earning Potential */}
      <div className="earning-potential">
        <div className="potential-content">
          <div className="potential-info">
            <h2>Your Earning Potential</h2>
            <p className="potential-description">
              Earnings vary based on location, weather conditions, and view popularity. 
              Here's what you can expect:
            </p>
            
            <div className="earning-tiers">
              <div className="tier-card">
                <div className="tier-header">
                  <h3>Basic Location</h3>
                  <div className="tier-amount">$50-150/month</div>
                </div>
                <ul className="tier-features">
                  <li>Residential area</li>
                  <li>Standard weather conditions</li>
                  <li>50-200 daily viewers</li>
                </ul>
              </div>

              <div className="tier-card featured">
                <div className="tier-badge">Most Popular</div>
                <div className="tier-header">
                  <h3>Prime Location</h3>
                  <div className="tier-amount">$150-400/month</div>
                </div>
                <ul className="tier-features">
                  <li>City center or landmark</li>
                  <li>Interesting weather patterns</li>
                  <li>200-800 daily viewers</li>
                </ul>
              </div>

              <div className="tier-card">
                <div className="tier-header">
                  <h3>Premium Location</h3>
                  <div className="tier-amount">$400+/month</div>
                </div>
                <ul className="tier-features">
                  <li>Tourist destination</li>
                  <li>Extreme weather events</li>
                  <li>800+ daily viewers</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="potential-visual">
            <div className="earnings-chart">
              <div className="chart-header">
                <h3>Monthly Earnings Trend</h3>
                <span className="chart-period">Last 6 months</span>
              </div>
              <div className="chart-bars">
                {[120, 180, 240, 320, 280, 350].map((amount, index) => (
                  <div key={index} className="chart-bar" style={{ height: `${(amount / 400) * 100}%` }}>
                    <span className="bar-amount">${amount}</span>
                  </div>
                ))}
              </div>
              <div className="chart-months">
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span>Oct</span>
                <span>Nov</span>
                <span>Dec</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Requirements */}
      <div className="requirements">
        <div className="section-header">
          <h2>What You Need</h2>
          <p>Minimal setup, maximum returns</p>
        </div>

        <div className="requirements-grid">
          <div className="requirement-card">
            <div className="requirement-icon">📱</div>
            <h3>Device</h3>
            <p>Smartphone or webcam</p>
            <div className="requirement-details">
              <span className="detail-item">• iPhone/Android</span>
              <span className="detail-item">• USB webcam</span>
              <span className="detail-item">• IP camera</span>
            </div>
          </div>

          <div className="requirement-card">
            <div className="requirement-icon">🌐</div>
            <h3>Internet</h3>
            <p>Stable WiFi connection</p>
            <div className="requirement-details">
              <span className="detail-item">• 5+ Mbps upload</span>
              <span className="detail-item">• Reliable connection</span>
              <span className="detail-item">• 24/7 availability</span>
            </div>
          </div>

          <div className="requirement-card">
            <div className="requirement-icon">🏠</div>
            <h3>Location</h3>
            <p>Window with outdoor view</p>
            <div className="requirement-details">
              <span className="detail-item">• Street view</span>
              <span className="detail-item">• Park/landscape</span>
              <span className="detail-item">• Weather visibility</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="cta-content">
          <h2>Ready to Start Earning?</h2>
          <p>Join thousands of camera operators who are already making money from their window views.</p>
          
          <div className="cta-actions">
            <button className="btn btn-primary btn-large">
              <span className="btn-icon">🚀</span>
              Get Started Free
            </button>
            <Link to="/cities" className="btn btn-outline btn-large">
              <span className="btn-icon">📍</span>
              Find Your City
            </Link>
          </div>

          <div className="cta-guarantee">
            <span className="guarantee-icon">✅</span>
            <span>No setup fees • Cancel anytime • 30-day money back guarantee</span>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq-section">
        <div className="section-header">
          <h2>Frequently Asked Questions</h2>
        </div>

        <div className="faq-grid">
          <div className="faq-item">
            <h3>How much can I really earn?</h3>
            <p>Earnings range from $50-500+ per month depending on your location and view popularity. Our top operators earn over $1,000 monthly.</p>
          </div>

          <div className="faq-item">
            <h3>Do I need special equipment?</h3>
            <p>No! A simple smartphone or webcam is all you need. We provide free streaming software that works with most devices.</p>
          </div>

          <div className="faq-item">
            <h3>Is my privacy protected?</h3>
            <p>Absolutely. We only stream your outdoor view, never your interior. All personal information is kept completely private.</p>
          </div>

          <div className="faq-item">
            <h3>How do I get paid?</h3>
            <p>Monthly payments via PayPal, bank transfer, or check. Minimum payout is just $25.</p>
          </div>

          <div className="faq-item">
            <h3>Can I control my camera?</h3>
            <p>Yes! You can start/stop streaming, adjust settings, and monitor your earnings through our simple dashboard.</p>
          </div>

          <div className="faq-item">
            <h3>What if I have bad weather?</h3>
            <p>Bad weather actually increases viewership! People love watching storms, snow, and dramatic weather conditions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCams;
