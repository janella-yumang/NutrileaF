import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Menu } from 'lucide-react';

const HeaderNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [profileIcon, setProfileIcon] = useState<string | null>(null);
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
        console.log('HeaderNav - User data from localStorage:', userData);
        
        // Verify role from database instead of trusting localStorage
        const API_BASE = process.env.REACT_APP_API_URL || 'https://nutrilea-backend.onrender.com/api';
        const BASE_URL = API_BASE.replace('/api', '');
        
        fetch(`${BASE_URL}/auth/verify-role`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        .then(response => response.json())
        .then(roleData => {
          console.log('HeaderNav - Role verification from database:', roleData);
          
          if (roleData.success) {
            const freshUserData = {
              ...userData,
              role: roleData.user.role,
              status: roleData.user.status
            };
            
            // Update localStorage with fresh data
            localStorage.setItem('nutrileaf_user', JSON.stringify(freshUserData));
            
            setUserId(userData.id);
            setUserName(userData.name || userData.fullName);
            setUserEmail(userData.email);
            setUserPhone(userData.phone);
            setUserRole(roleData.user.role);
            
            console.log('HeaderNav - Set userRole from database:', roleData.user.role);
          } else {
            // Fallback to localStorage if verification fails
            setUserRole(userData.role || 'user');
            console.log('HeaderNav - Fallback to localStorage role:', userData.role || 'user');
          }
        })
        .catch(error => {
          console.error('HeaderNav - Role verification failed:', error);
          // Fallback to localStorage
          setUserRole(userData.role || 'user');
        });
        
        // Set profile image from backend user data
        if (userData.profileImage) {
          const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';
          const BASE_URL = API_BASE.replace('/api', '');
          const fullProfileImageUrl = userData.profileImage.startsWith('http') 
            ? userData.profileImage 
            : `${BASE_URL}${userData.profileImage}`;
          setUserProfileImage(fullProfileImageUrl);
        }
        
        // Load profile icon from localStorage (fallback)
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
        setUserRole(userData.role || 'user');
          
          // Set profile image from backend user data
          if (userData.profileImage) {
            const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';
            const BASE_URL = API_BASE.replace('/api', '');
            const fullProfileImageUrl = userData.profileImage.startsWith('http') 
              ? userData.profileImage 
              : `${BASE_URL}${userData.profileImage}`;
            setUserProfileImage(fullProfileImageUrl);
          }
          
          // Load profile icon from localStorage (fallback)
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
        setUserRole(null);
        setUserProfileImage(null);
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

  // Refresh user data from backend to get latest profile image
  useEffect(() => {
    if (!isLoggedIn || !userId) return;

    const refreshUserData = async () => {
      try {
        const token = localStorage.getItem('nutrileaf_token');
        if (!token) return;

        const API_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'https://nutrilea-backend.onrender.com';
        const response = await fetch(`${API_BASE}/auth/verify`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.error(`Auth verify failed: ${response.status}`);
          return;
        }

        const data = await response.json();
        if (data.success && data.user) {
          // Update localStorage with fresh user data
          localStorage.setItem('nutrileaf_user', JSON.stringify(data.user));
          
          // Update state with profile image
          if (data.user.profileImage) {
            const fullProfileImageUrl = data.user.profileImage.startsWith('http') 
              ? data.user.profileImage 
              : `${API_BASE}${data.user.profileImage}`;
            setUserProfileImage(fullProfileImageUrl);
          }
        }
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    };

    refreshUserData();
  }, [isLoggedIn, userId]);

  // Also refresh user data on initial mount if logged in
  useEffect(() => {
    const token = localStorage.getItem('nutrileaf_token');
    const user = localStorage.getItem('nutrileaf_user');
    
    if (token && user) {
      setIsLoggedIn(true);
      try {
        const userData = JSON.parse(user);
        setUserId(userData.id);
        setUserName(userData.name || userData.fullName);
        setUserEmail(userData.email);
        setUserPhone(userData.phone);
        setUserRole(userData.role || 'user');
        
        // Set profile image from backend user data
        if (userData.profileImage) {
          const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';
          const BASE_URL = API_BASE.replace('/api', '');
          const fullProfileImageUrl = userData.profileImage.startsWith('http') 
            ? userData.profileImage 
            : `${BASE_URL}${userData.profileImage}`;
          setUserProfileImage(fullProfileImageUrl);
        }
        
        // Load profile icon from localStorage (fallback)
        const userIcon = localStorage.getItem(`nutrileaf_profile_icon_${userData.id}`);
        if (userIcon) {
          setProfileIcon(userIcon);
        }
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
  }, []);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Scan', path: '/scan' },
    { label: 'Market', path: '/market' },
    { label: 'Chat', path: '/chat' },
    { label: 'Forum', path: '/forum' },
    ...(userRole === 'admin' ? [{ label: 'Admin Dashboard', path: '/admin' }] : []),
  ];

  console.log('HeaderNav - Current userRole:', userRole);
  console.log('HeaderNav - Nav items:', navItems);

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
    setUserRole(null);
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

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          type="button"
          title="Toggle menu"
        >
          <Menu size={20} color="#0f2419" />
        </button>

        <div className="header-actions">
          {isLoggedIn ? (
            <>
              <div className="user-greeting">
                Welcome, {userName}
                {userRole === 'admin' && (
                  <span className="user-role-badge admin-badge">Admin</span>
                )}
                {userRole === 'user' && (
                  <span className="user-role-badge user-badge">User</span>
                )}
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
                  {(userProfileImage || profileIcon) ? (
                    <img src={(userProfileImage || profileIcon)!} alt="Profile" className="header-profile-icon" />
                  ) : (
                    <div className="header-profile-icon-placeholder">
                      <User size={24} />
                    </div>
                  )}
                </button>
                
                {showProfileCard && (
                  <div className="profile-card-popup">
                    <div className="profile-card-icon">
                      {(userProfileImage || profileIcon) ? (
                        <img src={(userProfileImage || profileIcon)!} alt="Profile" />
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
                      {userRole === 'admin' && (
                        <button 
                          className="profile-card-admin-btn"
                          type="button"
                          onClick={() => {
                            setShowProfileCard(false);
                            navigate('/admin');
                          }}
                          style={{
                            marginTop: '8px',
                            width: '100%',
                            padding: '8px 12px',
                            background: '#6f42c1',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}
                        >
                          👑 Admin Dashboard
                        </button>
                      )}
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
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '64px',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
        }}>
          <nav style={{
            background: 'white',
            height: '100%',
            overflowY: 'auto',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
            position: 'relative',
            zIndex: 10000
          }}>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #eee',
              background: '#f8f9fa'
            }}>
              <div style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#333'
              }}>
                Menu
              </div>
            </div>
            
            {navItems.map((item) => (
              <button
                key={item.path}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid #eee',
                  textAlign: 'left',
                  fontSize: '16px',
                  color: location.pathname === item.path ? '#1a5f3a' : '#333',
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  position: 'relative',
                  zIndex: 10001
                }}
                onClick={() => {
                  handleNavigate(item.path);
                  setMobileMenuOpen(false);
                }}
                type="button"
              >
                {item.label}
              </button>
            ))}

            <div style={{
              padding: '12px 20px',
              background: '#f8f9fa',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#666',
              borderTop: '1px solid #eee'
            }}>
              About
            </div>
            
            {aboutItems.map((item) => (
              <button
                key={item.path}
                style={{
                  width: '100%',
                  padding: '16px 20px 16px 32px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid #eee',
                  textAlign: 'left',
                  fontSize: '15px',
                  color: location.pathname === item.path ? '#1a5f3a' : '#333',
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  position: 'relative',
                  zIndex: 10001
                }}
                onClick={() => {
                  handleNavigate(item.path);
                  setMobileMenuOpen(false);
                }}
                type="button"
              >
                {item.label}
              </button>
            ))}

            {/* Login/Register Section */}
            <div style={{
              padding: '12px 20px',
              background: '#f8f9fa',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#666',
              borderTop: '1px solid #eee'
            }}>
              Account
            </div>
            
            {isLoggedIn ? (
              <>
                <button
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #eee',
                    textAlign: 'left',
                    fontSize: '16px',
                    color: '#333',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    position: 'relative',
                    zIndex: 10001
                  }}
                  onClick={() => {
                    handleNavigate('/profile');
                    setMobileMenuOpen(false);
                  }}
                  type="button"
                >
                  Profile
                </button>
                <button
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #eee',
                    textAlign: 'left',
                    fontSize: '16px',
                    color: '#dc3545',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    position: 'relative',
                    zIndex: 10001
                  }}
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  type="button"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #eee',
                    textAlign: 'left',
                    fontSize: '16px',
                    color: '#1a5f3a',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    position: 'relative',
                    zIndex: 10001
                  }}
                  onClick={() => {
                    handleNavigate('/login');
                    setMobileMenuOpen(false);
                  }}
                  type="button"
                >
                  Login
                </button>
                <button
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #eee',
                    textAlign: 'left',
                    fontSize: '16px',
                    color: '#1a5f3a',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    position: 'relative',
                    zIndex: 10001
                  }}
                  onClick={() => {
                    handleNavigate('/register');
                    setMobileMenuOpen(false);
                  }}
                  type="button"
                >
                  Register
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default HeaderNav;
