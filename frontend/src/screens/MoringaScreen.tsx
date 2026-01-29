import React from 'react';
import { Leaf, Heart, Zap, Award, TrendingUp, Users } from 'lucide-react';
import HeaderNav from '../components/HeaderNav';
import { Footer } from '../components/Footer';

interface BenefitItem {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  color: string;
}

const MoringaScreen: React.FC = () => {
  const benefits: BenefitItem[] = [
    {
      icon: Heart,
      title: 'Nutrient Rich',
      description: 'Contains vitamins A, B, C, minerals like iron, calcium, and potassium',
      color: 'red'
    },
    {
      icon: Zap,
      title: 'Energy Booster',
      description: 'Natural source of energy without caffeine jitters',
      color: 'yellow'
    },
    {
      icon: Leaf,
      title: 'Antioxidants',
      description: 'Packed with powerful antioxidants for immune support',
      color: 'green'
    },
    {
      icon: Award,
      title: 'Quality',
      description: 'Supports healthy skin, hair, and overall wellness',
      color: 'blue'
    },
  ];

  const nutritionFacts = [
    { label: 'Protein', value: '27%', daily: 'of daily value' },
    { label: 'Vitamin A', value: '21%', daily: 'of daily value' },
    { label: 'Vitamin C', value: '33%', daily: 'of daily value' },
    { label: 'Iron', value: '42%', daily: 'of daily value' },
    { label: 'Calcium', value: '19%', daily: 'of daily value' },
    { label: 'Potassium', value: '15%', daily: 'of daily value' },
  ];

  const uses = [
    {
      title: 'Culinary Uses',
      items: [
        'Smoothie bowls and protein shakes',
        'Tea and hot beverages',
        'Salad toppings and garnishes',
        'Soups and stews',
        'Baking and cooking'
      ]
    },
    {
      title: 'Health Benefits',
      items: [
        'Energy and vitality boost',
        'Immune system support',
        'Anti-inflammatory properties',
        'Skin and hair health',
        'Digestive wellness'
      ]
    },
  ];

  return (
    <div className="screen moringa-page">
      <div className="moringa-hero">
        <div className="moringa-hero-image">
          <img src="/images/moringa.jpg" alt="Moringa leaves" />
        </div>
        <div className="moringa-hero-content">
          <h1 className="moringa-hero-title">About Moringa</h1>
          <p className="moringa-hero-subtitle">
            The "Miracle Tree" - Discover the nutritional powerhouse from nature
          </p>
        </div>
      </div>

      <div className="moringa-container">
        {/* Introduction Section */}
        <section className="moringa-section">
          <div className="section-header">
            <Leaf size={48} className="section-icon" />
            <h2>What is Moringa?</h2>
          </div>
          <div className="section-content">
            <p>
              Moringa oleifera, commonly known as the "Miracle Tree," is a fast-growing tree native to India. 
              Every part of the moringa tree is beneficial - the leaves, pods, seeds, and roots are all used 
              for nutritional and medicinal purposes.
            </p>
            <p>
              In Filipino cuisine, moringa is known as "malunggay" and has been a staple vegetable for generations. 
              It's incredibly nutrient-dense, containing all nine essential amino acids, making it a complete protein source.
            </p>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="moringa-section moringa-section--benefits">
          <h2>Health Benefits</h2>
          <div className="benefits-grid">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="benefit-card">
                <div className={`benefit-icon benefit-icon--${benefit.color}`}>
                  <benefit.icon size={32} />
                </div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Nutrition Facts */}
        <section className="moringa-section moringa-section--nutrition">
          <div className="section-header">
            <TrendingUp size={48} className="section-icon" />
            <h2>Nutritional Profile</h2>
          </div>
          <p className="section-description">
            Per 100g of dried moringa powder, you get these impressive nutritional values:
          </p>
          <div className="nutrition-grid">
            {nutritionFacts.map((fact) => (
              <div key={fact.label} className="nutrition-card">
                <div className="nutrition-value">{fact.value}</div>
                <div className="nutrition-label">{fact.label}</div>
                <div className="nutrition-daily">{fact.daily}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Uses Section */}
        <section className="moringa-section moringa-section--uses">
          <h2>How to Use Moringa</h2>
          <div className="uses-grid">
            {uses.map((use) => (
              <div key={use.title} className="use-card">
                <h3>{use.title}</h3>
                <ul className="use-list">
                  {use.items.map((item) => (
                    <li key={item}>
                      <span className="check-icon">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Growing Section */}
        <section className="moringa-section">
          <div className="section-header">
            <Users size={48} className="section-icon" />
            <h2>Growing Moringa</h2>
          </div>
          <div className="section-content">
            <p>
              Moringa is incredibly easy to grow, making it perfect for home gardens and farms. The tree:
            </p>
            <ul className="moringa-list">
              <li>Grows rapidly in warm climates</li>
              <li>Requires minimal water and maintenance</li>
              <li>Produces leaves year-round in the Philippines</li>
              <li>Can be harvested multiple times per year</li>
              <li>Improves soil quality and prevents erosion</li>
              <li>Supports local farmers and communities</li>
            </ul>
          </div>
        </section>

        {/* Sustainability Section */}
        <section className="moringa-section moringa-section--highlight">
          <h2>Sustainability & Support</h2>
          <p>
            By choosing moringa from NutriLeaf, you're supporting:
          </p>
          <div className="sustainability-points">
            <div className="point">
              <span className="point-number">1</span>
              <div>
                <strong>Local Farmers:</strong> Fair trade practices and community development
              </div>
            </div>
            <div className="point">
              <span className="point-number">2</span>
              <div>
                <strong>Environment:</strong> Sustainable agriculture and soil preservation
              </div>
            </div>
            <div className="point">
              <span className="point-number">3</span>
              <div>
                <strong>Food Security:</strong> Nutrition for families and communities
              </div>
            </div>
            <div className="point">
              <span className="point-number">4</span>
              <div>
                <strong>Research:</strong> AI-powered quality analysis and best practices
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
      <HeaderNav />
    </div>
  );
};

export default MoringaScreen;
