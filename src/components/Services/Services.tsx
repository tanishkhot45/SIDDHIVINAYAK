// src/components/Services/Services.tsx
import React from 'react';
import { Calculator, Sun, BarChart, Users, Shield, Globe } from 'lucide-react';
import './Services.css';

const services = [
  {
    icon: <Calculator className="icon" />,
    title: 'Solar Calculator',
    description: 'Accurately estimate your solar potential and savings with our calculator.',
  },
  {
    icon: <Sun className="icon" />,
    title: 'System Design',
    description: 'Get personalized solar panel system designs optimized for your roof and energy needs.',
  },
  {
    icon: <BarChart className="icon" />,
    title: 'Energy Analysis',
    description: 'Detailed analysis of your energy consumption patterns to maximize solar efficiency.',
  },
  {
    icon: <Globe className="icon" />,
    title: 'Environmental Impact',
    description: 'Track your contribution to reducing carbon emissions and promoting sustainability.',
  },
];

const Services: React.FC = () => {
  return (
    <section id="services" className="-services">
      <div className="container">
        <h2 className="section-title">Our  Services</h2>
        <p className="section-description">
          Discover how UrjaShakti can help you harness the power of solar energy with our comprehensive suite of services.
        </p>
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
