import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, UserPlus } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/NavBar.css';

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('token'); // Check if user is authenticated

  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

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

  useEffect(() => {
    const closeDropdowns = (e) => {
      if (!e.target.closest('.user-navbar-profile')) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('click', closeDropdowns);
    return () => document.removeEventListener('click', closeDropdowns);
  }, []);

  useEffect(() => {
    // Fetch user data from localStorage or authService if needed
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  return (
    <nav className="navbar navbar-expand-lg user-navbar-custom sticky-top">
      <div className="container">
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            <span>SkillTribe</span>
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
          <span className="navbar-toggler-icon user-navbar-toggler-icon"></span>
        </button>
        
        <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse user-navbar-collapse`} id="navbarContent">
          <ul className="navbar-nav user-navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item user-navbar-item">
              <a className="nav-link user-navbar-link active" aria-current="page" href="/">Home</a>
            </li>
            
            <li className="nav-item dropdown user-navbar-dropdown">
              <a 
                className="nav-link dropdown-toggle user-navbar-dropdown-toggle" 
                href="#" 
                id="learningDropdown" 
                role="button"
              >
                Learning Plans
              </a>
              <ul className="dropdown-menu user-navbar-dropdown-menu" aria-labelledby="learningDropdown">
                <li><a className="dropdown-item user-navbar-dropdown-item" href="/learning-plan/add">Add Learning Plan</a></li>
                <li><a className="dropdown-item user-navbar-dropdown-item" href="/view-learning-plans">View Learning Plans</a></li>
              </ul>
            </li>
            
            <li className="nav-item dropdown user-navbar-dropdown">
              <a 
                className="nav-link dropdown-toggle user-navbar-dropdown-toggle" 
                href="#" 
                id="postsDropdown" 
                role="button"
              >
                Posts
              </a>
              <ul className="dropdown-menu user-navbar-dropdown-menu" aria-labelledby="postsDropdown">
                <li><a className="dropdown-item user-navbar-dropdown-item" href="/add-post">Add Posts</a></li>
                <li><a className="dropdown-item user-navbar-dropdown-item" href="/PostsListrandomuser">View Posts</a></li>
              </ul>
            </li>
          </ul>
          
          <div className="navbar-auth">
            {!isAuthenticated ? (
              <>
                <button 
                  className="btn btn-outline-light" 
                  onClick={handleSignIn}
                >
                  Sign In
                </button>
                <button 
                  className="btn btn-accent" 
                  onClick={handleSignUp}
                >
                  Sign Up
                </button>
                {/* Profile image displayed to the right of Sign Up button */}
                {user && user.profilePicture && (
                  <div className="navbar-profile-image-container">
                    <img
                      src={user.profilePicture || '/ProfailIcon.jpg'}
                      alt={user.username}
                      className="navbar-profile-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/ProfailIcon.jpg';
                      }}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="user-navbar-user-section">
                {user ? (
                  <div className="user-navbar-profile" onClick={(e) => e.stopPropagation()}>
                    <div className="user-navbar-user">
                      <div className="user-navbar-profile-icon" onClick={toggleProfileDropdown}>
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt={user.username}
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
                        <div className="user-navbar-dropdown">
                          <div className="user-navbar-dropdown-header">
                            <span className="user-navbar-greeting">Hello, {user.username || 'User'}!</span>
                          </div>
                          <ul className="user-navbar-dropdown-menu">
                            <li className="user-navbar-dropdown-item">
                              <Link to="/profile" className="user-navbar-dropdown-link">
                                <User size={16} /> Profile
                              </Link>
                            </li>
                            <li className="user-navbar-dropdown-divider"></li>
                            <li className="user-navbar-dropdown-item">
                              <button className="user-navbar-logout-btn" onClick={handleLogout}>
                                <LogOut size={16} /> Logout
                              </button>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="user-navbar-auth-buttons">
                    <Link to="/login" className="user-navbar-login-btn">Login</Link>
                    <Link to="/register" className="user-navbar-signup-btn">
                      <UserPlus size={16} className="user-navbar-signup-icon" />
                      <span>Sign Up</span>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav> 
  );
};

export default NavBar;
