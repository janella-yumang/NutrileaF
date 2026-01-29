import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from 'lucide-react';

const HeaderNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [profileIcon, setProfileIcon] = useState<string | null>(null);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const aboutRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  // Check login status on mount
  useEffect(() => {
    const token = localStorage.getItem('nutrileaf_token');
    const user = localStorage.getItem('nutrileaf_user');
    
    if (token && user) {
      setIsLoggedIn(true);
      try {
        const userData = JSON.parse(user);
        setUserId(userData.id);
        setUserName(userData.fullName);
        setUserEmail(userData.email);
        setUserPhone(userData.phone);
        
        // Load profile icon
        const userIcon = localStorage.getItem(`nutrileaf_profile_icon_${userData.id}`);
        if (userIcon) {
          setProfileIcon(userIcon);
        }
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
  }, []);

  // Listen for storage changes (login/logout in other tabs)
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('nutrileaf_token');
      const user = localStorage.getItem('nutrileaf_user');
      
      if (token && user) {
        setIsLoggedIn(true);
        try {
          const userData = JSON.parse(user);
          setUserId(userData.id);
          setUserName(userData.fullName);
          setUserEmail(userData.email);
          setUserPhone(userData.phone);
          
          // Load profile icon
          const userIcon = localStorage.getItem(`nutrileaf_profile_icon_${userData.id}`);
          if (userIcon) {
            setProfileIcon(userIcon);
          }
        } catch (error) {
          console.error('Failed to parse user data:', error);
        }
      } else {
        setIsLoggedIn(false);
        setUserName(null);
        setUserEmail(null);
        setUserPhone(null);
        setUserId(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Poll for profile icon updates every 500ms
  useEffect(() => {
    if (!userId || !isLoggedIn) return;

    const interval = setInterval(() => {
      const userIcon = localStorage.getItem(`nutrileaf_profile_icon_${userId}`);
      if (userIcon) {
        setProfileIcon(userIcon);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [userId, isLoggedIn]);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Scan', path: '/scan' },
    { label: 'Market', path: '/market' },
    { label: 'Chat', path: '/chat' },
    { label: 'Forum', path: '/forum' },
  ];

  const aboutItems = [
    { label: 'About us', path: '/about' },
    { label: 'About moringa', path: '/moringa' },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setAboutOpen(false);
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleLogout = () => {
    localStorage.removeItem('nutrileaf_token');
    localStorage.removeItem('nutrileaf_user');
    setIsLoggedIn(false);
    setUserName(null);
    navigate('/login');
  };

  return (
    <header className="header-nav">
      <div className="header-nav-container">
        {/* Logo */}
        <div className="header-logo" onClick={() => navigate('/')}>
          <img className="logo-image" src="/nutrileaf logo.png" alt="NutriLeaf logo" />
          <span className="logo-text">NutriLeaf</span>
        </div>

        {/* Navigation Links */}
        <nav className="header-nav-links">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`header-nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => handleNavigate(item.path)}
              type="button"
            >
              <span className="nav-label">{item.label}</span>
            </button>
          ))}

          {/* About dropdown */}
          <div
            ref={aboutRef}
            className={`header-nav-item header-nav-dropdown ${
              location.pathname === '/about' || location.pathname === '/moringa' ? 'active' : ''
            } ${aboutOpen ? 'open' : ''}`}
          >
            <button
              type="button"
              className="header-nav-dropdown-toggle"
              onClick={() => setAboutOpen((prev) => !prev)}
            >
              <span className="nav-label">About</span>
            </button>
            <div className="header-nav-dropdown-menu">
              {aboutItems.map((item) => (
                <button
                  key={item.path}
                  className="header-nav-dropdown-item"
                  onClick={() => handleNavigate(item.path)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="header-actions">
          {isLoggedIn ? (
            <>
              <div className="user-greeting">
                Welcome, {userName}
              </div>
              
              <div className="header-profile-wrapper" ref={profileRef}>
                <button 
                  className="header-profile-icon-btn" 
                  type="button"
                  onMouseEnter={() => setShowProfileCard(true)}
                  onMouseLeave={() => setShowProfileCard(false)}
                  onClick={handleProfile}
                  title="Go to profile"
                >
                  {profileIcon ? (
                    <img src={profileIcon} alt="Profile" className="header-profile-icon" />
                  ) : (
                    <div className="header-profile-icon-placeholder">
                      <User size={24} />
                    </div>
                  )}
                </button>
                
                {showProfileCard && (
                  <div className="profile-card-popup">
                    <div className="profile-card-icon">
                      {profileIcon ? (
                        <img src={profileIcon} alt="Profile" />
                      ) : (
                        <div className="profile-card-placeholder">
                          <User size={32} />
                        </div>
                      )}
                    </div>
                    <div className="profile-card-info">
                      <div className="profile-card-name">{userName}</div>
                      <div className="profile-card-email">{userEmail}</div>
                      {userPhone && <div className="profile-card-phone">{userPhone}</div>}
                      <button 
                        className="profile-card-edit-btn"
                        type="button"
                        onClick={() => {
                          setShowProfileCard(false);
                          handleProfile();
                        }}
                      >
                        Edit Profile
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                className="header-action-btn header-action-btn--danger" 
                type="button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button 
                className="header-action-btn header-action-btn--ghost" 
                type="button"
                onClick={handleLogin}
              >
                Login
              </button>
              <button 
                className="header-action-btn" 
                type="button"
                onClick={handleRegister}
              >
                Register
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={() => {
          const mobileNav = document.querySelector('.mobile-nav');
          mobileNav?.classList.toggle('open');
        }}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      <nav className="mobile-nav">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => handleNavigate(item.path)}
            type="button"
          >
            <span className="nav-label">{item.label}</span>
          </button>
        ))}

        {/* Mobile About dropdown items */}
        <div className="mobile-nav-about-group">
          <div className="mobile-nav-about-label">About</div>
          {aboutItems.map((item) => (
            <button
              key={item.path}
              className={`mobile-nav-item mobile-nav-about-item ${
                location.pathname === item.path ? 'active' : ''
              }`}
              onClick={() => {
                handleNavigate(item.path);
                const mobileNav = document.querySelector('.mobile-nav');
                mobileNav?.classList.remove('open');
              }}
              type="button"
            >
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default HeaderNav;
