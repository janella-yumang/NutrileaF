import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, ChevronRight } from 'lucide-react';
import HeaderNav from '../components/HeaderNav';
import { Footer } from '../components/Footer';
import { useNavigate } from 'react-router-dom';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  [key: string]: string;
}

const RegisterScreen: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const API_BASE = process.env.REACT_APP_API_URL || 'https://orange-bushes-pick.loca.lt/api';

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

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError(null);
    
    // Debug: Log form data
    console.log('Mobile register - Form data:', formData);
    console.log('Mobile register - API_BASE:', API_BASE);
    
    if (!validateForm()) {
      console.log('Mobile register - Validation failed');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Mobile register - Sending request to:', `${API_BASE}/auth/register`);
      
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          password: formData.password,
        }),
      });

      console.log('Mobile register - Response status:', response.status);
      
      const data = await response.json();
      console.log('Mobile register - Response data:', data);

      if (!response.ok || !data.success) {
        const message = data?.message || 'Registration failed. Please try again.';
        setApiError(message);

        // Attach error to specific field if provided
        if (data?.field) {
          setFormErrors(prev => ({
            ...prev,
            [data.field]: message,
          }));
        }
        return;
      }

      // Registration succeeded – redirect to login page
      // User will need to login to access the app
      console.log('Mobile register - Registration successful, redirecting to login');
      navigate('/login');
    } catch (error) {
      console.error('Mobile register error:', error);
      setApiError('Something went wrong while creating your account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="screen register-page">
      <div className="register-hero">
        <div className="register-hero-content">
          <h1 className="register-hero-title">Create Your Account</h1>
          <p className="register-hero-subtitle">
            Join our community and start using AI-powered moringa analysis today
          </p>
        </div>
      </div>

      <div className="register-container">
        <div className="register-form-wrapper">
          <form className="register-form" onSubmit={handleSubmit}>
            {apiError && (
              <div className="form-error" style={{ marginBottom: '12px' }}>
                {apiError}
              </div>
            )}
            <div className="form-section">
              <h2 className="form-section-title">Personal Information</h2>
              
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">
                  <User size={18} />
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={`form-input ${formErrors.fullName ? 'form-input--error' : ''}`}
                />
                {formErrors.fullName && (
                  <span className="form-error">{formErrors.fullName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  <Mail size={18} />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className={`form-input ${formErrors.email ? 'form-input--error' : ''}`}
                />
                {formErrors.email && (
                  <span className="form-error">{formErrors.email}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    <Phone size={18} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+63 9XX XXX XXXX"
                    className={`form-input ${formErrors.phone ? 'form-input--error' : ''}`}
                  />
                  {formErrors.phone && (
                    <span className="form-error">{formErrors.phone}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="address" className="form-label">
                    <MapPin size={18} />
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Your location"
                    className={`form-input ${formErrors.address ? 'form-input--error' : ''}`}
                  />
                  {formErrors.address && (
                    <span className="form-error">{formErrors.address}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2 className="form-section-title">Security</h2>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  <Lock size={18} />
                  Password
                </label>
                <div className="form-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className={`form-input ${formErrors.password ? 'form-input--error' : ''}`}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {formErrors.password && (
                  <span className="form-error">{formErrors.password}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  <Lock size={18} />
                  Confirm Password
                </label>
                <div className="form-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className={`form-input ${formErrors.confirmPassword ? 'form-input--error' : ''}`}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <span className="form-error">{formErrors.confirmPassword}</span>
                )}
              </div>
            </div>

            <div className="form-footer">
              <button
                type="submit"
                disabled={isSubmitting}
                className="register-btn"
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ChevronRight size={20} />
                  </>
                )}
              </button>

              <p className="form-footer-text">
                Already have an account?{' '}
                <a href="/login" className="form-footer-link">
                  Sign In
                </a>
              </p>
            </div>
          </form>
        </div>

        <div className="register-benefits">
          <h3 className="benefits-title">Why Join Us?</h3>
          <div className="benefits-list">
            <div className="benefit-item">
              <span className="benefit-icon">✓</span>
              <span className="benefit-text">AI-powered moringa analysis</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">✓</span>
              <span className="benefit-text">Real-time quality detection</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">✓</span>
              <span className="benefit-text">Disease identification</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">✓</span>
              <span className="benefit-text">Processing recommendations</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">✓</span>
              <span className="benefit-text">Support local farmers</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <HeaderNav />
    </div>
  );
};

export default RegisterScreen;
