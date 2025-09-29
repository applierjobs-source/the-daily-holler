import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div>
      <header className="header">
        <div className="container">
          <h1>The Daily Holler</h1>
        </div>
      </header>
      
      <nav className="nav">
        <div className="container">
          <ul>
            <li>
              <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
            </li>
            <li>
              <Link to="/cities" className={isActive('/cities') ? 'active' : ''}>Cities</Link>
            </li>
            <li>
              <Link to="/news" className={isActive('/news') ? 'active' : ''}>News</Link>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Header;
