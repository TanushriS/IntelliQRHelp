// src/pages/Home/Home.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  // Redirect to the Register page when "Get Started" is clicked
  const handleGetStarted = () => {
    navigate('/register');
  };

  return (
    <div className="home-container">
      {/* Header */}
      <header className="header">
        <div className="logo">IntelliQrHelp</div>
        <nav>
          <ul className="nav-list">
            <li><a href="#home">Home</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>
        <button className="btn-primary">
          <Link to="/login" className="link-button">Login</Link>
        </button>
      </header>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-text">
          <h1>Smart Emergency Response System</h1>
          <p>
            IntelliQrHelp provides instant emergency support through QR-based medical profiles and real-time alerts.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={handleGetStarted}>
              Get Started
            </button>
            <button className="btn-secondary">
              Learn More
            </button>
          </div>
        </div>
        <div className="hero-img">
          <img src="/images/hero.jpeg" alt="Smart Emergency Response" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <h2>Key Features</h2>
        <p>A cutting-edge solution for medical emergencies.</p>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Digital Emergency Card</h3>
            <p>
              A QR code containing vital medical details for quick access by healthcare professionals.
            </p>
          </div>
          <div className="feature-card">
            <h3>One-Click SOS</h3>
            <p>
              Instantly alerts emergency contacts and medical responders in critical situations.
            </p>
          </div>
          <div className="feature-card">
            <h3>Real-Time Location Sharing</h3>
            <p>
              Shares live location with emergency responders to reduce response time.
            </p>
          </div>
          <div className="feature-card">
            <h3>Medical History Access</h3>
            <p>
              Securely shares past medical records with authorized healthcare providers for better treatment.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="about" className="how-it-works">
        <h2>How It Works</h2>
        <p>IntelliQrHelp streamlines emergency response with three easy steps.</p>
        <div className="steps-container">
          <div className="step-card">
            <img src="/images/scan.png" alt="Scan QR Code" />
            <h4>Scan QR Code</h4>
            <p>Emergency responders scan your digital card.</p>
          </div>
          <div className="step-card">
            <img src="/images/alert.png" alt="Send Alerts" />
            <h4>Send Alerts</h4>
            <p>Instant notifications sent to contacts.</p>
          </div>
          <div className="step-card">
            <img src="/images/location.png" alt="Share Location" />
            <h4>Share Location</h4>
            <p>Real-time location sharing for quick response.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer">
        <div className="footer-wrapper">
          <div className="footer-section">
            <h3>IntelliQrHelp</h3>
            <p>
              Providing smart emergency healthcare solutions for enhanced safety and quick response.
            </p>
          </div>
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#features">Features</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Resources</h3>
            <ul>
              <li><a href="#resources">Resources</a></li>
              <li><a href="#user-guide">User Guide</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Support</h3>
            <ul>
              <li><a href="#contact">Contact Us</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;