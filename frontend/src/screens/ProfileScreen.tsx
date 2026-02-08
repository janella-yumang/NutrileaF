import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Camera } from 'lucide-react';
import HeaderNav from '../components/HeaderNav';
import { Footer } from '../components/Footer';

interface UserData {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  role: string;
}

interface FormErrors {
  [key: string]: string;
}

const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<UserData>({
    id: 0,
    fullName: '',
    email: '',
    phone: '',
    address: '',
    role: '',
  });

  const [profileIcon, setProfileIcon] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';

  // Load user data on mount
  useEffect(() => {
    const userJson = localStorage.getItem('nutrileaf_user');
    if (!userJson) {
      navigate('/login');
      return;
    }

    try {
      const userData = JSON.parse(userJson);
      console.log('ProfileScreen - User data loaded:', userData);
      console.log('ProfileScreen - User role:', userData.role);
      
      setFormData({
        id: userData.id,
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        role: userData.role || 'user',
      });

      // Load profile icon from localStorage if it exists, otherwise check backend
      const savedIcon = localStorage.getItem(`profile_icon_${userData.id}`);
      if (savedIcon) {
        setProfileIcon(savedIcon);
      } else if (userData.profileImage) {
        // Use backend profile image if available
        const profileImageUrl = userData.profileImage.startsWith('http') 
          ? userData.profileImage 
          : `${API_BASE.replace('/api', '')}${userData.profileImage}`;
        setProfileIcon(profileImageUrl);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  }, [navigate, API_BASE]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleProfileIconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setApiError('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setApiError('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        const result = event.target?.result as string;
        setProfileIcon(result);
        
        // Save to localStorage as backup
        localStorage.setItem(`profile_icon_${formData.id}`, result);
        
        // Upload to backend
        await uploadProfileImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfileImage = async (file: File) => {
    try {
      const token = localStorage.getItem('nutrileaf_token');
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE}/forum/upload-profile-image`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        console.log('Profile image uploaded successfully');
        // Update user data in localStorage with new profile image
        const userJson = localStorage.getItem('nutrileaf_user');
        if (userJson) {
          const userData = JSON.parse(userJson);
          userData.profileImage = data.profileImage;
          localStorage.setItem('nutrileaf_user', JSON.stringify(userData));
        }
      } else {
        console.error('Failed to upload profile image:', data.message);
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('nutrileaf_token');
      if (!token) {
        setApiError('No authentication token found. Please login again.');
        setIsSubmitting(false);
        return;
      }

      console.log('Sending update request to:', `${API_BASE}/auth/update-profile`);
      console.log('Token:', token);
      
      const response = await fetch(`${API_BASE}/auth/update-profile`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok || !data.success) {
        const message = data?.message || 'Failed to update profile. Please try again.';
        setApiError(message);
        setIsSubmitting(false);
        return;
      }

      // Update localStorage with new user data
      localStorage.setItem('nutrileaf_user', JSON.stringify({
        ...formData,
        fullName: data.user.fullName,
        phone: data.user.phone,
        address: data.user.address,
      }));

      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Profile update error:', error);
      setApiError('Something went wrong while updating your profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="screen">
        <HeaderNav />
        <div className="profile-loading">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="screen profile-page">
      <HeaderNav />

      <div className="profile-container">
        <div className="profile-content">
          <h1 style={{textAlign: 'center', color: '#2d5016', marginBottom: '20px'}}>My Profile</h1>

          {/* Profile Icon Section */}
          <div className="profile-icon-section">
            <div className="profile-icon-wrapper">
              {profileIcon ? (
                <img src={profileIcon} alt="Profile" className="profile-icon" />
              ) : (
                <div className="profile-icon-placeholder">
                  <User size={40} />
                </div>
              )}
              <button
                type="button"
                className="profile-icon-change-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={16} />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfileIconChange}
              id="profile-icon-input"
            />
          </div>

          {/* Profile Form */}
          <form className="profile-form" onSubmit={handleSubmit}>
            {apiError && (
              <div className="profile-message error">
                {apiError}
              </div>
            )}

            {successMessage && (
              <div className="profile-message success">
                {successMessage}
              </div>
            )}

            <div className="profile-form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Your name"
              />
            </div>

            <div className="profile-form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
              />
            </div>

            <div className="profile-form-group">
              <label>Role</label>
              <div className="profile-role-display">
                <span className={`role-badge ${formData.role === 'admin' ? 'admin-role' : 'user-role'}`}>
                  {formData.role === 'admin' ? '👑 Admin' : '👤 User'}
                </span>
                <small style={{color: '#666', marginLeft: '10px'}}>
                  Debug: role = "{formData.role}"
                </small>
              </div>
            </div>

            <div className="profile-form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Your phone"
              />
            </div>

            <div className="profile-form-group">
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Your address"
              />
            </div>

            <button type="submit" className="profile-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProfileScreen;
