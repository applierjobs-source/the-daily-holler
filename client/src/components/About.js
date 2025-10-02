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
              Your trusted source for local events, community happenings, and stories about what's happening in America's cities.
            </p>
          </div>

          <div className="about-sections">
            <section className="about-section">
              <h2>Our Mission</h2>
              <p>
                The Daily Holler is dedicated to bringing you the most interesting and engaging local events, 
                community activities, and stories from cities across the United States. We believe that 
                every city has its own unique character, and we're here to celebrate the people, places, 
                and events that make each community special.
              </p>
              <p>
                Whether you're looking for real events to attend in your area or want to stay informed about 
                what's happening in your community, The Daily Holler connects you with the local stories that matter.
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
                  <h3>📰 Local Stories</h3>
                  <p>
                    Read engaging stories about local events, community happenings, and the people 
                    who make each city unique. We bring you the real stories behind local events.
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
                celebrates the unique character of every American city by highlighting the real events 
                and stories that matter to local communities? We started with a handful of cities and 
                a dream to make local news more engaging and accessible.
              </p>
              <p>
                Today, we're proud to serve communities across all 50 states, bringing you stories about 
                real local events, community activities, and the people who make each city special. 
                We believe that staying connected to your local community is essential, and we're here 
                to help you discover the events and stories happening right in your neighborhood.
              </p>
            </section>

            <section className="about-section">
              <h2>Our Content Philosophy</h2>
              <div className="philosophy-points">
                <div className="philosophy-point">
                  <h4>📖 Stories with Heart</h4>
                  <p>
                    Our content is created with genuine care for the communities we serve. We tell stories 
                    that celebrate local people, events, and the unique character of each place.
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
                    through shared experiences and local events that strengthen neighborhood connections.
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
                that would benefit our readers and community members.
              </p>
              <p>
                Our team regularly searches for events across the country, but if you have something 
                special happening in your community, feel free to reach out. We're particularly interested 
                in events that showcase local culture, community spirit, or bring people together for 
                meaningful experiences.
              </p>
            </section>

            <section className="about-section">
              <h2>Disclaimer</h2>
              <div className="disclaimer-box">
                <p>
                  <strong>Important:</strong> The Daily Holler focuses on real local events and community stories. 
                  We strive to provide accurate information about events and happenings in your area, but we 
                  always recommend verifying event details directly with organizers before attending.
                </p>
                <p>
                  Our content is created to inform and connect communities through real local events and stories. 
                  We respect all communities and individuals, and our goal is to celebrate the unique character 
                  of each place we cover.
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
