// src/components/Welcome/Welcome.tsx
import React from 'react';
import './Welcome.css';

const Welcome: React.FC = () => {
  return (
    <section className="welcome">
      <div className="welcome-container">
        <h1>Welcome to UrjaShakti</h1>
        <p>Simplifying solar energy adoption with cutting-edge technology</p>
        <div className="hero-image">
          <img
            src="/images/solar-panel-hero.jpg"
            alt="Solar panels on a modern house"
          />
        </div>
      </div>
    </section>
  );
};

export default Welcome;
