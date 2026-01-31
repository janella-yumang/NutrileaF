import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ChevronRight } from 'lucide-react';
import HeaderNav from '../components/HeaderNav';
import { Footer } from '../components/Footer';
import { useNavigate } from 'react-router-dom';

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const API_BASE = process.env.REACT_APP_API_URL || 'https://webhook.site/token-id-here/api';

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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
    console.log('Mobile login - Form data:', formData);
    console.log('Mobile login - API_BASE:', API_BASE);
    
    if (!validateForm()) {
      console.log('Mobile login - Validation failed');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Mobile login - Sending request to:', `${API_BASE}/auth/login`);
      
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      console.log('Mobile login - Response status:', response.status);
      
      const data = await response.json();
      console.log('Mobile login - Response data:', data);

      if (!response.ok || !data.success) {
        const message = data?.message || 'Login failed. Please check your credentials.';
        setApiError(message);
        return;
      }

      // Store auth data
      localStorage.setItem('nutrileaf_token', data.token);
      localStorage.setItem('nutrileaf_user', JSON.stringify(data.user));
      
      console.log('Mobile login - Login successful, navigating to home');
      // Navigate to home after successful login
      navigate('/');
    } catch (error) {
      console.error('Mobile login error:', error);
      
      // Show more detailed error for debugging
      let errorMessage = 'Something went wrong while signing in. Please try again.';
      
      if (error instanceof TypeError) {
        errorMessage = `Network error: ${error.message}`;
      } else if (error instanceof SyntaxError) {
        errorMessage = `Response error: ${error.message}`;
      } else {
        errorMessage = `Login error: ${error}`;
      }
      
      setApiError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="screen login-page">
      <div className="login-hero">
        <div className="login-hero-content">
          <h1 className="login-hero-title">Welcome Back</h1>
          <p className="login-hero-subtitle">
            Sign in to your account to continue using NutriLeaf
          </p>
        </div>
      </div>

      <div className="login-container">
        <div className="login-form-wrapper">
          <form className="login-form" onSubmit={handleSubmit}>
            {apiError && (
              <div className="form-error" style={{ marginBottom: '12px' }}>
                {apiError}
              </div>
            )}
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
                  placeholder="Enter your password"
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

            <div className="form-checkbox">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <label htmlFor="rememberMe" className="checkbox-label">
                Remember me
              </label>
              <button type="button" className="forgot-password-link">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="login-btn"
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ChevronRight size={20} />
                </>
              )}
            </button>

            <p className="form-footer-text">
              Don't have an account?{' '}
              <a href="/register" className="form-footer-link">
                Create one
              </a>
            </p>
          </form>
        </div>

        <div className="login-benefits">
          <h3 className="benefits-title">Get Started Today</h3>
          <div className="benefits-list">
            <div className="benefit-item">
              <span className="benefit-icon">✓</span>
              <span className="benefit-text">Instant AI analysis</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">✓</span>
              <span className="benefit-text">Track your history</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">✓</span>
              <span className="benefit-text">Save your preferences</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">✓</span>
              <span className="benefit-text">Access expert insights</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <HeaderNav />
    </div>
  );
};

export default LoginScreen;
