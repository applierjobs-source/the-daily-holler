import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div>
      <header className="header">
        <div className="container header-content">
          <h1>The Daily Holler</h1>
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>
      
      <nav className={`nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="container">
          <ul>
            <li>
              <Link 
                to="/" 
                className={isActive('/') ? 'active' : ''}
                onClick={closeMobileMenu}
              >
                🏠 Home
              </Link>
            </li>
            <li>
              <Link 
                to="/cities" 
                className={isActive('/cities') ? 'active' : ''}
                onClick={closeMobileMenu}
              >
                🏙️ Cities
              </Link>
            </li>
            <li>
              <Link 
                to="/news" 
                className={isActive('/news') ? 'active' : ''}
                onClick={closeMobileMenu}
              >
                📰 News
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Header;
