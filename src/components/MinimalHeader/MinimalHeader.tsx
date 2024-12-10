import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './MinimalHeader.css';

const MinimalHeader: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="minimal-header">
      <Link to="/" className="minimal-header-logo">UrjaShakti</Link>
      {location.pathname === '/login' ? (
        <Link to="/signup" className="minimal-header-link">Sign Up</Link>
      ) : (
        <Link to="/login" className="minimal-header-link">Login</Link>
      )}
    </nav>
  );
};

export default MinimalHeader;
