import React, { useEffect } from 'react';
import "./LoggedInHome.css";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const LoggedInHome: React.FC = () => {
  const features = [
    {
      icon: <span className="emoji-icon">🔢</span>,
      title: "Solar Calculator",
      description: "Accurately estimate your solar potential and savings with our AI-powered calculator.",
    },
    {
      icon: <span className="emoji-icon">☀️</span>,
      title: "Smart Roof Analysis",
      description: "Get precise roof measurements for optimal solar panel placement.",
    },
    {
      icon: <span className="emoji-icon">⚡</span>,
      title: "Energy Insights",
      description: "Understand your consumption patterns for personalized recommendations.",
    },
    {
      icon: <span className="emoji-icon">👨‍🔧</span>,
      title: "Expert Network",
      description: "Connect with certified local solar panel installers.",
    },
  ];

  // These cards differ from the initial features and represent the user's journey after they log in:
  const journeySteps = [
    {
      emoji: "🏠",
      title: "Measure Your Rooftop",
      description: "Utilize advanced technology to accurately measure your roof area and determine optimal solar panel placements.",
    },
    {
      emoji: "💡",
      title: "Assess Your Consumption",
      description: "Input your device usage or electricity bill details to determine your monthly or yearly energy consumption.",
    },
    {
      emoji: "⚙️",
      title: "Combine Data & Compute",
      description: "Integrate solar production estimates with your consumption patterns, ensuring an accurate forecast of potential savings.",
    },
    {
      emoji: "📑",
      title: "Get Your Detailed Report",
      description: "Receive a comprehensive report with panel size, number of panels, expected production, and recommended configurations.",
    },
  ];

  // Scroll to the top when the component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="logged-in-home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div>
            <h1 className="hero-title">
              Harness the Sun's Power with <span className="gradient-text">UrjaShakti</span>
            </h1>
            <p className="hero-description">
              Discover how solar energy can transform your home, reduce your bills, and help the environment.
            </p>
            <div className="hero-buttons">
              <Link to="/calculator" className="btn btn-primary">
                Calculate Savings <ChevronRight className="btn-icon" />
              </Link>
            </div>
          </div>
          <div className="hero-image-wrapper">
            <img
              src="/images/house.jpg"
              alt="Solar panel setup"
              className="hero-image"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">Our Innovative Features</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                {feature.icon}
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Section (4 Cards with Emojis) */}
      <section id="journey" className="journey-section">
        <div className="container">
          <h2 className="journey-title">Your Solar Journey</h2>
          <p className="journey-subtitle">
            From measuring your rooftop to getting a detailed report, here's how UrjaShakti assists you every step of the way.
          </p>
          <div className="journey-grid">
            {journeySteps.map((step, index) => (
              <div key={index} className="journey-card">
                <div className="journey-emoji">{step.emoji}</div>
                <h3 className="journey-card-title">{step.title}</h3>
                <p className="journey-card-description">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2 className="cta-title">Ready to Embrace Solar Energy?</h2>
          <p className="cta-description">
            Take the first step towards energy independence. Get your personalized solar plan today.
          </p>
          <Link to="/calculator" className="btn btn-primary">
            Get Your Free Solar Estimate <ChevronRight className="btn-icon" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LoggedInHome;
