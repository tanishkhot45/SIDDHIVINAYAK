// src/components/Features/Features.tsx
import React from 'react';
import './Features.css';

const Features = () => {
  const features = [
    {
      title: 'Rooftop Analysis',
      description:
        'Accurately measure your rooftop area for optimal solar panel placement.',
      icon: '🏠',
    },
    {
      title: 'Electricity Consumption Analysis',
      description:
        'Analyze your energy usage patterns for personalized recommendations.',
      icon: '⚡',
    },
    {
      title: 'Solar System Recommendation',
      description:
        'Get detailed suggestions for the perfect solar setup for your needs.',
      icon: '☀️',
    },
    {
      title: 'Local Vendor Network',
      description: 'Connect with trusted solar installers in your area.',
      icon: '🤝',
    },
  ];

  return (
    <section id="features" className="features">
      <div className="features-container">
        <h2>Our Features</h2>
        <div className="feature-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
