import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { Menu, X, User } from 'react-feather';
import { auth } from '../../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import './Header.css';

const Header: React.FC = () => {
  const [navActive, setNavActive] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  const toggleNav = () => setNavActive(!navActive);
  const closeNav = () => setNavActive(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const scrollWithOffset = (el: HTMLElement) => {
    const yOffset = -80; // Adjust for header height
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <header className="header">
      <nav className={`nav ${navActive ? 'active' : ''}`}>
        {/* Left Section - Logo */}
        <div className="logo">
          <Link to={user ? "/home" : "/"}>UrjaShakti</Link>
        </div>

        {/* Center Section - Navigation Links */}
        <ul className="nav-links">
          <li>
            <HashLink smooth to="/#features" scroll={(el) => scrollWithOffset(el)} onClick={closeNav}>
              Features
            </HashLink>
          </li>
          <li>
            <HashLink smooth to="/#services" scroll={(el) => scrollWithOffset(el)} onClick={closeNav}>
              Services
            </HashLink>
          </li>
          <li>
            <HashLink smooth to="/#about" scroll={(el) => scrollWithOffset(el)} onClick={closeNav}>
              About
            </HashLink>
          </li>
          {user && (
            <li>
              <Link to="/calculator" onClick={closeNav}>
                Calculator
              </Link>
            </li>
          )}
        </ul>

        {/* Right Section - Auth Buttons or User Icon */}
        <div className="auth-section">
          {user ? (
            <Link to="/dashboard" className="user-icon">
              <User size={24} />
            </Link>
          ) : (
            <div className="auth-buttons">
              <Link to="/login">
                <button className="login-btn">Login</button>
              </Link>
              <Link to="/signup">
                <button className="signup-btn">Sign Up</button>
              </Link>
            </div>
          )}
        </div>

        {/* Hamburger Menu */}
        <button className="nav-toggle" onClick={toggleNav}>
          {navActive ? <X size={32} /> : <Menu size={32} />}
        </button>

        {/* Mobile Menu */}
        <ul className={`nav-mobile ${navActive ? 'show' : ''}`}>
          <li>
            <HashLink smooth to="/#features" scroll={(el) => scrollWithOffset(el)} onClick={closeNav}>
              Features
            </HashLink>
          </li>
          <li>
            <HashLink smooth to="/#services" scroll={(el) => scrollWithOffset(el)} onClick={closeNav}>
              Services
            </HashLink>
          </li>
          <li>
            <HashLink smooth to="/#about" scroll={(el) => scrollWithOffset(el)} onClick={closeNav}>
              About
            </HashLink>
          </li>
          {user ? (
            <>
              <li>
                <Link to="/calculator" onClick={closeNav}>
                  Calculator
                </Link>
              </li>
              <li>
                <Link to="/dashboard" onClick={closeNav}>
                  Dashboard
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" onClick={closeNav}>
                  Login
                </Link>
              </li>
              <li>
                <Link to="/signup" onClick={closeNav}>
                  Sign Up
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
