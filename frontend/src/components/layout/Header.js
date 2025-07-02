import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineUser, HiOutlineLogout } from 'react-icons/hi';
import { AuthContext } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { userInfo, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    setShowProfileMenu(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <Link to="/" className="nav-brand">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="gradient-text">GiGy</span>
          <div className="gradient-line"></div>
        </motion.div>
      </Link>

      <div className="nav-section">
        <nav className="nav-links">
          <Link to="/gigs">Browse Gigs</Link>
          {userInfo && <Link to="/gigs/create">Post Gig</Link>}
        </nav>

        <div className="auth-buttons">
          {userInfo ? (
            <div className="profile-menu">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="profile-btn"
              >
                {userInfo.profilePicture ? (
                  <img 
                    src={userInfo.profilePicture} 
                    alt={userInfo.name} 
                    className="profile-picture"
                  />
                ) : (
                  <div className="profile-placeholder">
                    {userInfo.name.charAt(0)}
                  </div>
                )}
                <span>{userInfo.name}</span>
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="profile-dropdown"
                  >
                    <Link to="/profile" className="dropdown-item">
                      <HiOutlineUser className="icon" /> Profile
                    </Link>
                    <Link to="/my-gigs" className="dropdown-item">
                      My Gigs
                    </Link>
                    <Link to="/my-assignments" className="dropdown-item">
                      My Assignments
                    </Link>
                    <Link to="/my-applications" className="dropdown-item">
                      My Applications
                    </Link>
                    <Link to="/messages" className="dropdown-item">
                      Messages
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="dropdown-item logout-btn"
                    >
                      <HiOutlineLogout className="icon" /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link to="/login">
                <button className="login-btn">Login</button>
              </Link>
              <Link to="/register">
                <button className="register-btn">Register</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
