import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const About = () => {
  return (
    <div className="about-page">
      <Header />
      
      <div className="container">
        <div className="about-content">
          <div className="about-header">
            <h1>About The Daily Holler</h1>
            <p className="about-subtitle">
              Your trusted source for local events, community happenings, and satirical takes on life across America's cities.
            </p>
          </div>

          <div className="about-sections">
            <section className="about-section">
              <h2>Our Mission</h2>
              <p>
                The Daily Holler is dedicated to bringing you the most interesting and entertaining local events, 
                community activities, and satirical news from cities across the United States. We believe that 
                every city has its own unique character, and we're here to celebrate and poke fun at the quirks 
                that make each place special.
              </p>
              <p>
                Whether you're looking for real events to attend in your area or just want a good laugh at the 
                absurdities of modern life, The Daily Holler has something for everyone.
              </p>
            </section>

            <section className="about-section">
              <h2>What We Do</h2>
              <div className="features-grid">
                <div className="feature-card">
                  <h3>🏙️ Local Events</h3>
                  <p>
                    Discover real events happening in your city - from community festivals and art shows 
                    to business networking events and educational workshops.
                  </p>
                </div>
                <div className="feature-card">
                  <h3>📰 Satirical News</h3>
                  <p>
                    Enjoy our unique take on local happenings with satirical articles that blend humor 
                    with community insights. Remember: it's all in good fun!
                  </p>
                </div>
                <div className="feature-card">
                  <h3>🗺️ City Coverage</h3>
                  <p>
                    We cover over 10,000+ cities across the United States, ensuring that no matter where 
                    you are, you can find local content that speaks to your community.
                  </p>
                </div>
                <div className="feature-card">
                  <h3>🎯 Community Focus</h3>
                  <p>
                    Our content is created with local communities in mind, highlighting the people, 
                    places, and events that make each city unique.
                  </p>
                </div>
              </div>
            </section>

            <section className="about-section">
              <h2>Our Story</h2>
              <p>
                The Daily Holler was born from a simple idea: what if we could create a platform that 
                celebrates the unique character of every American city while having a little fun along the way? 
                We started with a handful of cities and a dream to make local news more engaging and entertaining.
              </p>
              <p>
                Today, we're proud to serve communities across all 50 states, bringing you everything from 
                legitimate local events to satirical takes on the quirks of modern life. We believe that 
                laughter is the best way to bring communities together, and we're here to provide that 
                laughter while keeping you informed about what's really happening in your area.
              </p>
            </section>

            <section className="about-section">
              <h2>Our Content Philosophy</h2>
              <div className="philosophy-points">
                <div className="philosophy-point">
                  <h4>🎭 Satire with Heart</h4>
                  <p>
                    Our satirical content is created with love for the communities we serve. We poke fun 
                    at the absurdities of life, not the people living it.
                  </p>
                </div>
                <div className="philosophy-point">
                  <h4>📍 Local First</h4>
                  <p>
                    Every piece of content is crafted with local communities in mind. We research real 
                    events and local culture to ensure our content resonates with residents.
                  </p>
                </div>
                <div className="philosophy-point">
                  <h4>🤝 Community Building</h4>
                  <p>
                    We believe in the power of community. Our platform is designed to bring people together 
                    through shared experiences and laughter.
                  </p>
                </div>
                <div className="philosophy-point">
                  <h4>🎯 Quality Over Quantity</h4>
                  <p>
                    While we cover thousands of cities, we focus on creating meaningful, engaging content 
                    for each community rather than churning out generic articles.
                  </p>
                </div>
              </div>
            </section>

            <section className="about-section">
              <h2>For Event Organizers</h2>
              <p>
                Are you organizing an event in your city? We'd love to hear about it! While we can't 
                guarantee coverage for every event, we're always looking for interesting local happenings 
                that would benefit our readers.
              </p>
              <p>
                Our team regularly searches for events across the country, but if you have something 
                special happening in your community, feel free to reach out. We're particularly interested 
                in events that showcase local culture, community spirit, or unique local traditions.
              </p>
            </section>

            <section className="about-section">
              <h2>Disclaimer</h2>
              <div className="disclaimer-box">
                <p>
                  <strong>Important:</strong> The Daily Holler publishes both real local events and satirical content. 
                  We make every effort to clearly distinguish between the two, but please use your best judgment 
                  when reading our articles. If you're looking for factual information about events, please 
                  verify details directly with event organizers.
                </p>
                <p>
                  Our satirical content is created for entertainment purposes only and should not be taken as 
                  factual news. We respect all communities and individuals, and our humor is intended to be 
                  light-hearted and inclusive.
                </p>
              </div>
            </section>

            <section className="about-section">
              <h2>Get Involved</h2>
              <p>
                The Daily Holler is always growing and evolving. We'd love to hear from you about what 
                you'd like to see more of, or if you have suggestions for improving our coverage of your city.
              </p>
              <div className="cta-buttons">
                <Link to="/cities" className="btn btn-primary">
                  Explore Your City
                </Link>
                <Link to="/news" className="btn btn-outline">
                  Read Latest Articles
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default About;
