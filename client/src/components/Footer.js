import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>The Daily Holler</h4>
          <p>Your source for satirical news and local humor across America's cities.</p>
          <div className="social-links">
            <a href="https://twitter.com" className="social-link" target="_blank" rel="noopener noreferrer">Twitter</a>
            <a href="https://facebook.com" className="social-link" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://instagram.com" className="social-link" target="_blank" rel="noopener noreferrer">Instagram</a>
          </div>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/news">All News</Link></li>
            <li><Link to="/cities">Cities</Link></li>
            <li><Link to="/about">About</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Legal</h4>
          <ul className="footer-links">
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Newsletter</h4>
          <p>Get the latest satirical news delivered to your inbox.</p>
          <div className="newsletter-signup">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="newsletter-input"
            />
            <button className="newsletter-btn">Subscribe</button>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; {currentYear} The Daily Holler. All rights reserved.</p>
          <p className="disclaimer">
            <strong>Disclaimer:</strong> All content on this site is satirical and fictional. 
            Any resemblance to real events or persons is purely coincidental.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
