import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, UserPlus, Menu, X, ChevronDown } from 'lucide-react';
import NotificationBell from './notification/NotificationBell';
import { useNotifications } from '../context/NotificationContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/NavBar.css';

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [learningDropdownOpen, setLearningDropdownOpen] = useState(false);
  const [postsDropdownOpen, setPostsDropdownOpen] = useState(false);
  const [meetingsDropdownOpen, setMeetingsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('token'); // Check if user is authenticated

  const handleScroll = () => {
    if (window.scrollY > 10) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleNavCollapse = () => {
    setIsNavCollapsed(!isNavCollapsed);
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSignIn = () => {
    navigate('/Login');
  };

  const handleSignUp = () => {
    navigate('/Register');
  };

  const handleLogout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setUser(null);
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  const toggleProfileDropdown = (e) => {
    e.stopPropagation();
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const toggleLearningDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLearningDropdownOpen(!learningDropdownOpen);
    if (window.innerWidth <= 991.98) {
      setPostsDropdownOpen(false);
      setMeetingsDropdownOpen(false);
    }
  };

  const togglePostsDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPostsDropdownOpen(!postsDropdownOpen);
    if (window.innerWidth <= 991.98) {
      setLearningDropdownOpen(false);
      setMeetingsDropdownOpen(false);
    }
  };

  const toggleMeetingsDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMeetingsDropdownOpen(!meetingsDropdownOpen);
    if (window.innerWidth <= 991.98) {
      setLearningDropdownOpen(false);
      setPostsDropdownOpen(false);
    }
  };

  useEffect(() => {
    const closeDropdowns = (e) => {
      if (!e.target.closest('.user-navbar-profile')) {
        setIsProfileDropdownOpen(false);
      }
      if (!e.target.closest('.learning-dropdown') && window.innerWidth <= 991.98) {
        setLearningDropdownOpen(false);
      }
      if (!e.target.closest('.posts-dropdown') && window.innerWidth <= 991.98) {
        setPostsDropdownOpen(false);
      }
      if (!e.target.closest('.meetings-dropdown') && window.innerWidth <= 991.98) {
        setMeetingsDropdownOpen(false);
      }
    };

    document.addEventListener('click', closeDropdowns);
    return () => document.removeEventListener('click', closeDropdowns);
  }, []);

  useEffect(() => {
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
    setIsNavCollapsed(true);
    
    // Fetch user data from localStorage if needed
    const storedUser = JSON.parse(localStorage.getItem('userData'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, [location.pathname]);

  return (
    <nav className={`navbar navbar-expand-lg user-navbar-custom sticky-top ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            <span className="skill-text">Skill</span>
            <span className="tribe-text">Tribe</span>
          </Link>
        </div>
        
        <button 
          className="navbar-toggler user-navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarContent" 
          aria-controls="navbarContent" 
          aria-expanded={!isNavCollapsed ? true : false} 
          aria-label="Toggle navigation"
          onClick={handleNavCollapse}
        >
          {isMobileMenuOpen ? (
            <X size={24} color="white" />
          ) : (
            <Menu size={24} color="white" />
          )}
        </button>
        
        <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse user-navbar-collapse`} id="navbarContent">
          <ul className="navbar-nav user-navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item user-navbar-item">
              <Link 
                className={`nav-link user-navbar-link ${location.pathname === '/' ? 'active' : ''}`} 
                aria-current="page" 
                to="/"
              >
                Home
              </Link>
            </li>
            
            <li className="nav-item dropdown user-navbar-dropdown learning-dropdown">
              <a 
                className={`nav-link dropdown-toggle user-navbar-dropdown-toggle ${learningDropdownOpen ? 'show' : ''}`}
                href="#" 
                id="learningDropdown" 
                role="button"
                onClick={toggleLearningDropdown}
              >
                Learning Plans
                
              </a>
              <ul 
                className={`dropdown-menu user-navbar-dropdown-menu ${learningDropdownOpen ? 'show' : ''}`} 
                aria-labelledby="learningDropdown"
              >
                <li>
                  <Link className="dropdown-item user-navbar-dropdown-item" to="/learning-plan/add">
                    Add Learning Plan
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item user-navbar-dropdown-item" to="/view-learning-plans">
                    View Learning Plans
                  </Link>
                </li>
              </ul>
            </li>
            
            <li className="nav-item dropdown user-navbar-dropdown posts-dropdown">
              <a 
                className={`nav-link dropdown-toggle user-navbar-dropdown-toggle ${postsDropdownOpen ? 'show' : ''}`}
                href="#" 
                id="postsDropdown" 
                role="button"
                onClick={togglePostsDropdown}
              >
                Posts
                
              </a>
              <ul 
                className={`dropdown-menu user-navbar-dropdown-menu ${postsDropdownOpen ? 'show' : ''}`} 
                aria-labelledby="postsDropdown"
              >
                <li>
                  <Link className="dropdown-item user-navbar-dropdown-item" to="/add-post">
                    Add Posts
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item user-navbar-dropdown-item" to="/PostsListrandomuser">
                    View Posts
                  </Link>
                </li>
              </ul>
            </li>

            <li className="nav-item dropdown user-navbar-dropdown meetings-dropdown">
              <a 
                className={`nav-link dropdown-toggle user-navbar-dropdown-toggle ${meetingsDropdownOpen ? 'show' : ''}`}
                href="#" 
                id="meetingsDropdown" 
                role="button"
                onClick={toggleMeetingsDropdown}
              >
                Meetings
                
              </a>
              <ul 
                className={`dropdown-menu user-navbar-dropdown-menu ${meetingsDropdownOpen ? 'show' : ''}`} 
                aria-labelledby="meetingsDropdown"
              >
                <li>
                  <Link className="dropdown-item user-navbar-dropdown-item" to="/schedule">
                    Schedule
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item user-navbar-dropdown-item" to="/sessions">
                    Join Now
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
          
          <div className="navbar-auth">
            {!isAuthenticated ? (
              <>
                <button 
                  className="btn btn-outline-light signin-btn" 
                  onClick={handleSignIn}
                >
                  Sign In
                </button>
                <button 
                  className="btn btn-accent signup-btn" 
                  onClick={handleSignUp}
                >
                  <UserPlus size={16} className="signup-icon" />
                  <span>Sign Up</span>
                </button>
              </>
            ) : (
              <div className="user-navbar-user-section">
                {/* Notification Bell */}
                <NotificationBell />
                
                <div className="user-navbar-profile" onClick={(e) => e.stopPropagation()}>
                  <div className="user-navbar-user">
                    <div className="user-navbar-profile-icon" onClick={toggleProfileDropdown}>
                      {user && user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user ? user.username : 'User'}
                          className="navbar-profile-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/ProfailIcon.jpg';
                          }}
                        />
                      ) : (
                        <div className="user-navbar-avatar-placeholder">
                          <User size={20} />
                        </div>
                      )}
                    </div>
                    {isProfileDropdownOpen && (
                      <div className="user-navbar-dropdown-profile">
                        <div className="user-navbar-dropdown-header">
                          <span className="user-navbar-greeting">Hello, {user ? user.username : 'User'}!</span>
                        </div>
                        <ul className="user-navbar-dropdown-menu-profile">
                          <li className="user-navbar-dropdown-item-profile">
                            <Link to="/profile" className="user-navbar-dropdown-link">
                              <User size={16} /> Profile
                            </Link>
                          </li>
                          <li className="user-navbar-dropdown-divider"></li>
                          <li className="user-navbar-dropdown-item-profile">
                            <button className="user-navbar-logout-btn" onClick={handleLogout}>
                              <LogOut size={16} /> Logout
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav> 
  );
};

export default NavBar;