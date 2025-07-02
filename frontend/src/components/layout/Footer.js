import React from 'react';
import { Link } from 'react-router-dom';
import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand-section">
            <Link to="/" className="brand-link">
              <span className="brand-text">GiGy</span>
            </Link>
            <p className="brand-tagline">
              The future of task marketplace. Connect with skilled individuals or find gigs that match your expertise.
            </p>
            <div className="social-icons-container">
              {socialLinks.map((link) => (
                <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" className="social-icon">
                  <link.icon />
                </a>
              ))}
            </div>
          </div>
          
          <div className="footer-links-section">
            <h3 className="footer-title">Explore</h3>
            <ul className="footer-links">
              <li><Link to="/gigs">Browse Gigs</Link></li>
              <li><Link to="/gigs/create">Post a Gig</Link></li>
              <li><Link to="/categories">Categories</Link></li>
              <li><Link to="/how-it-works">How It Works</Link></li>
            </ul>
          </div>
          
          <div className="footer-links-section">
            <h3 className="footer-title">Support</h3>
            <ul className="footer-links">
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/safety">Safety Tips</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>
          
          <div className="footer-newsletter">
            <h3 className="footer-title">Newsletter</h3>
            <p className="newsletter-text">Get the latest updates and news</p>
            <form className="newsletter-form">
              <input type="email" placeholder="Your email" className="newsletter-input" />
              <button type="submit" className="newsletter-button">Subscribe</button>
            </form>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} GiGy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

const socialLinks = [
  { name: 'Twitter', href: 'https://twitter.com', icon: FaTwitter },
  { name: 'Facebook', href: 'https://facebook.com', icon: FaFacebook },
  { name: 'Instagram', href: 'https://instagram.com', icon: FaInstagram },
  { name: 'LinkedIn', href: 'https://linkedin.com', icon: FaLinkedin },
];

export default Footer;
