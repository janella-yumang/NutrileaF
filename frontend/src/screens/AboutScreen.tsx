import React from 'react';
import { 
  Leaf,
  Target,
  Search,
  TrendingUp,
  Users,
  BarChart3,
  Bug,
  Lightbulb,
  Heart,
  HandHeart,
  Sparkles
} from 'lucide-react';
import HeaderNav from '../components/HeaderNav';
import { Footer } from '../components/Footer';

const AboutScreen: React.FC = () => {
  return (
      <div className="screen about-page">
      <div 
        className="about-hero"
        style={{
          backgroundImage: `
            linear-gradient(135deg, rgba(2, 37, 15, 0.85) 0%, rgba(10, 82, 36, 0.7) 40%, rgba(10, 82, 36, 0.65) 100%),
            radial-gradient(circle at 20% 80%, rgba(184, 230, 208, 0.18) 0%, transparent 55%),
            radial-gradient(circle at 80% 20%, rgba(107, 201, 142, 0.18) 0%, transparent 55%),
            url('/images/showcase4.jpg')
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="about-hero-inner">
          <div className="about-hero-brand">
            <img
              src="/nutrileaf logo.png"
              alt="NutriLeaf logo"
              className="about-hero-logo-image"
            />
            <div className="about-hero-brand-text">
              <span className="about-hero-logo-label">NutriLeaf</span>
              <span className="about-hero-logo-tagline">
                Your AI companion for smarter moringa cultivation
              </span>
            </div>
          </div>
          <h1 className="about-hero-title">About NutriLeaf</h1>
          <p className="about-hero-subtitle">
            Empowering sustainable agriculture through AI‑driven moringa innovation
          </p>
        </div>
      </div>

      <div className="about-content">
        <section className="about-section">
          <div className="about-section-header">
            <span className="about-icon"><Leaf aria-hidden="true" /></span>
            <h2 className="about-section-title">What is NutriLeaf?</h2>
          </div>
          <p className="about-text">
            <span className="about-strong">NutriLeaf</span> is a smart, AI‑powered tool that helps farmers, processors, and consumers
            understand the health and quality of their moringa (malunggay) plants in seconds. By combining
            image recognition with practical farming insights, NutriLeaf turns everyday photos into
            <span className="about-strong"> clear, actionable recommendations</span>.
          </p>
          <p className="about-text">
            Behind NutriLeaf is a team of <span className="about-strong">3rd‑year IT students</span> passionate about agriculture,
            technology, and supporting local communities through smarter, more sustainable practices.
          </p>
        </section>

        <section className="about-section">
          <div className="about-section-header">
            <span className="about-icon about-icon--blue"><Target aria-hidden="true" /></span>
            <h2 className="about-section-title">Our Mission</h2>
          </div>
          <p className="about-text">
            Our mission is to <span className="about-strong">support sustainable agriculture and food security</span> by using artificial intelligence to:
          </p>
          <ul className="about-list">
            <li>Detect moringa <span className="about-strong">ripeness, dryness, and diseases</span> through images</li>
            <li>Improve <span className="about-strong">quality assurance</span> in moringa production</li>
            <li>Reduce crop losses and improve farmer income</li>
          </ul>
        </section>

        <section className="about-section">
          <div className="about-section-header">
            <span className="about-icon about-icon--purple"><Search aria-hidden="true" /></span>
            <h2 className="about-section-title">What We Do</h2>
          </div>
          <p className="about-text">
            We developed an <span className="about-strong">AI-driven image analysis system</span> that allows users to upload photos of moringa leaves, pods, and other parts.
            The system analyzes the images and provides:
          </p>

          <div className="about-cards">
            <div className="about-card">
              <span className="about-card-icon"><BarChart3 aria-hidden="true" /></span>
              <h3 className="about-card-title">Quality Classification</h3>
              <p className="about-card-text">Automated assessment of moringa quality and readiness</p>
            </div>
            <div className="about-card">
              <span className="about-card-icon about-card-icon--red"><Bug aria-hidden="true" /></span>
              <h3 className="about-card-title">Disease Detection</h3>
              <p className="about-card-text">Early identification of common moringa diseases and conditions</p>
            </div>
            <div className="about-card">
              <span className="about-card-icon about-card-icon--amber"><Lightbulb aria-hidden="true" /></span>
              <h3 className="about-card-title">Processing Recommendations</h3>
              <p className="about-card-text">Expert guidance on harvest timing and processing methods</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <div className="about-section-header">
            <span className="about-icon about-icon--emerald"><TrendingUp aria-hidden="true" /></span>
            <h2 className="about-section-title">Why Moringa?</h2>
          </div>
          <p className="about-text">
            Moringa is known as a <span className="about-strong">“miracle tree”</span> due to its high nutritional value and medicinal benefits.
            In the Philippines, it plays a key role in:
          </p>

          <div className="about-highlights">
            <div className="about-highlight">
              <Heart aria-hidden="true" />
              <span>Combating malnutrition</span>
            </div>
            <div className="about-highlight">
              <HandHeart aria-hidden="true" />
              <span>Supporting local farmers</span>
            </div>
            <div className="about-highlight">
              <Sparkles aria-hidden="true" />
              <span>Promoting health and wellness</span>
            </div>
          </div>

          <p className="about-text about-text--tight">
            Our project aims to strengthen this impact using modern technology.
          </p>
        </section>

        <section className="about-section about-section--last">
          <div className="about-section-header">
            <span className="about-icon about-icon--indigo"><Users aria-hidden="true" /></span>
            <h2 className="about-section-title">Our Team</h2>
          </div>
          <p className="about-text">
            We are <span className="about-strong">3rd-year IT students</span> passionate about agriculture, artificial intelligence, and social impact.
            This project is part of our academic research and system development in support of smart farming and digital agriculture.
          </p>
        </section>
      </div>

      <Footer />
      <HeaderNav />
    </div>
  );
};

export default AboutScreen;