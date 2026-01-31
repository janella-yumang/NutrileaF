import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  ShoppingBag,
  Users,
  Info,
  Scan,
  MessageSquare,
  BarChart2,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import HeaderNav from '../components/HeaderNav';
import { Footer } from '../components/Footer';

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();

  const carouselImages = [
    '/images/showcase1.jpg',
    '/images/showcase2.jpg',
    '/images/showcase3.jpg',
    '/images/showcase4.jpg',
  ];
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (carouselImages.length < 2) return undefined;
    const intervalId = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => window.clearInterval(intervalId);
  }, [carouselImages.length]);

  const quickActions = [
    { icon: BookOpen, title: 'About Moringa', subtitle: 'Learn more about moringa', path: '/moringa', tone: 'dark' },
    { icon: ShoppingBag, title: 'Moringa Products', subtitle: 'Market and product list', path: '/market' },
    { icon: Users, title: 'Community Forum', subtitle: 'Join the discussion', path: '/forum', tone: 'dark' },
    { icon: Info, title: 'About Us', subtitle: 'Learn about NutriLeaf', path: '/about' },
  ];

  const handleAction = (path?: string) => {
    if (!path) return;
    navigate(path);
  };

  return (
    <div className="screen">
      <div className="hero-section">
        {/* Video Background */}
        <div className="hero-video-wrapper">
          <video
            className="hero-video"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          >
            <source src="/videos/malunggay-plant.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="hero-content">
          <div className="welcome-text">Welcome to,</div>
          <h1 className="hero-title">
            Grow <span className="highlight">Smarter</span><br />
            with NutriLeaf
          </h1>
          <p className="hero-subtitle">
            Your AI-powered companion for smart malunggay cultivation
          </p>
        </div>
        <div className="hero-carousel" aria-label="NutriLeaf highlights">
          <div
            className="carousel-track"
            style={{ transform: `translateX(-${activeSlide * 100}%)` }}
          >
            {carouselImages.map((src, idx) => (
              <div className="carousel-slide" key={src}>
                <img src={src} alt={`NutriLeaf showcase ${idx + 1}`} />
              </div>
            ))}
          </div>
          <div className="carousel-dots">
            {carouselImages.map((_, idx) => (
              <button
                key={`dot-${idx}`}
                className={`carousel-dot ${idx === activeSlide ? 'active' : ''}`}
                onClick={() => setActiveSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <section className="quick-actions-section">
        <div className="quick-actions">
          {quickActions.map((action) => (
            <button
              key={action.title}
              className={`quick-action ${action.tone === 'dark' ? 'quick-action--dark' : ''}`}
              onClick={() => handleAction(action.path)}
              type="button"
            >
              <span className="quick-action-icon">
                <action.icon aria-hidden="true" />
              </span>

              <span className="quick-action-text">
                <span className="quick-action-title">{action.title}</span>
                <span className="quick-action-subtitle">{action.subtitle}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="main-content-area">
          <div className="news-section">
            <h2 className="news-title">News & Updates</h2>
            <div className="news-list">
              <a
                className="news-item"
                href="https://www.gmanetwork.com/lifestyle/health-fitness/128260/filipino-brand-champions-natural-wellness-through-moringa/story"
                target="_blank"
                rel="noreferrer"
              >
                <span className="news-item-title">
                  Filipino brand champions natural wellness through moringa
                </span>
                <span className="news-item-source">GMA Network</span>
              </a>
              <a
                className="news-item"
                href="https://www.abs-cbn.com/lifestyle/health-beauty-fashion/2025/11/12/chinoy-brand-brings-back-malunggay-trend-1747"
                target="_blank"
                rel="noreferrer"
              >
                <span className="news-item-title">
                  Chinoy brand brings back malunggay trend
                </span>
                <span className="news-item-source">ABS-CBN Lifestyle</span>
              </a>
              <a
                className="news-item"
                href="https://business.inquirer.net/477462/malunggay-for-food-security"
                target="_blank"
                rel="noreferrer"
              >
                <span className="news-item-title">
                  'Malunggay' for food security
                </span>
                <span className="news-item-source">Business Inquirer</span>
              </a>
              <a
                className="news-item"
                href="https://www.pna.gov.ph/articles/1239285"
                target="_blank"
                rel="noreferrer"
              >
                <span className="news-item-title">
                  'Malunggay' to boost PH economy, global standing in wellness industry
                </span>
                <span className="news-item-source">Philippine News Agency</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="big-buttons-section">
        <div className="big-buttons-grid">
          <button className="big-button big-button--scan" onClick={() => handleAction('/scan')}>
            <Scan className="big-button-icon" />
            <span className="big-button-text">Scan Plant</span>
            <span className="big-button-subtitle">Identify plant parts instantly</span>
          </button>
          <button className="big-button big-button--chat" onClick={() => handleAction('/chat')}>
            <MessageSquare className="big-button-icon" />
            <span className="big-button-text">AI Chatbot</span>
            <span className="big-button-subtitle">Get instant answers and insights</span>
          </button>
          <button className="big-button big-button--analytics" onClick={() => handleAction('/analytics')}>
            <BarChart2 className="big-button-icon" />
            <span className="big-button-text">Market Analytics</span>
            <span className="big-button-subtitle">Explore trends and data</span>
          </button>
        </div>
      </section>

      <Footer />

      <HeaderNav />
    </div>
  );
};

export default HomeScreen;