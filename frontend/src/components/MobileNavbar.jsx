import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { clearAllAuth } from '../utils/auth';

const MobileNavbar = ({ userRole, userName, dashboardLinks = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAllAuth();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <nav className="navbar navbar-expand-lg" style={{
        background: 'linear-gradient(135deg, #D9A299, #DCC5B2)',
        padding: '0.75rem 1rem',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(217, 162, 153, 0.3)'
      }}>
        <div className="container-fluid">
          {/* Brand/Logo */}
          <Link className="navbar-brand text-white fw-bold" to={`/${userRole}`} style={{ fontSize: '1.5rem' }}>
            MedPal
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="navbar-toggler border-0"
            type="button"
            onClick={toggleMenu}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '0.5rem',
              minHeight: '44px',
              minWidth: '44px'
            }}
          >
            <span style={{
              display: 'block',
              width: '20px',
              height: '2px',
              backgroundColor: 'white',
              margin: '4px 0',
              transition: '0.3s',
              transform: isOpen ? 'rotate(-45deg) translate(-4px, 4px)' : 'none'
            }}></span>
            <span style={{
              display: 'block',
              width: '20px',
              height: '2px',
              backgroundColor: 'white',
              margin: '4px 0',
              transition: '0.3s',
              opacity: isOpen ? '0' : '1'
            }}></span>
            <span style={{
              display: 'block',
              width: '20px',
              height: '2px',
              backgroundColor: 'white',
              margin: '4px 0',
              transition: '0.3s',
              transform: isOpen ? 'rotate(45deg) translate(-4px, -4px)' : 'none'
            }}></span>
          </button>

          {/* User Welcome - Hidden on small screens */}
          <span className="text-white d-none d-md-block">
            Mirësevini, {userName}!
          </span>
        </div>
      </nav>

      {/* Mobile Slide-down Menu */}
      <div
        className={`mobile-menu ${isOpen ? 'mobile-menu-open' : ''}`}
        style={{
          position: 'fixed',
          top: '64px', // Height of navbar
          left: 0,
          right: 0,
          background: 'linear-gradient(135deg, #F0E4D3, #DCC5B2)',
          boxShadow: '0 4px 15px rgba(217, 162, 153, 0.3)',
          transform: isOpen ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.3s ease',
          zIndex: 999,
          padding: '1rem',
          maxHeight: 'calc(100vh - 64px)',
          overflowY: 'auto'
        }}
      >
        {/* User Welcome */}
        <div className="text-center mb-3 d-md-none">
          <h6 className="mb-1" style={{ color: '#D9A299', fontSize: '1.5rem' }}>Mirësevini,</h6>
          <p className="mb-0 fw-bold" style={{ color: '#2c3e50', fontSize: '1.5rem' }}>{userName}!</p>
        </div>

        {/* Navigation Links */}
        <div className="d-grid gap-2">
          {dashboardLinks.map((link, index) => (
            <Link
              key={index}
              to={link.to}
              className="btn text-start"
              onClick={closeMenu}
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(220, 197, 178, 0.5)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                color: '#2c3e50',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                minHeight: '48px',
                display: 'flex',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(217, 162, 153, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.8)';
              }}
            >
              <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>
                {link.icon}
              </span>
              <span>{link.title}</span>
            </Link>
          ))}

          {/* Divider */}
          <hr style={{ border: '1px solid rgba(220, 197, 178, 0.5)', margin: '1rem 0' }} />

          {/* Dashboard Link */}
          <Link
            to={`/${userRole}`}
            className="btn text-start"
            onClick={closeMenu}
            style={{
              background: 'rgba(217, 162, 153, 0.3)',
              border: '1px solid rgba(220, 197, 178, 0.5)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: '#2c3e50',
              textDecoration: 'none',
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>🏠</span>
            <span>Dashboard</span>
          </Link>

          {/* Logout Button */}
          <button
            onClick={() => { closeMenu(); handleLogout(); }}
            className="btn"
            style={{
              background: 'linear-gradient(135deg, #D9A299, #DCC5B2)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: 'white',
              fontWeight: 'bold',
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>🚪</span>
            <span>Dil</span>
          </button>
        </div>
      </div>

      {/* Overlay when menu is open */}
      {isOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={closeMenu}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.3)',
            zIndex: 998
          }}
        />
      )}
    </>
  );
};

export default MobileNavbar;
