import React from 'react';
import './CallToAction.css';

const CallToAction = () => {
  return (
    <section className="cta">
      <h2>Ready to Harness the Power of the Sun?</h2>
      <p>Start your solar journey today and discover how much you can save.</p>
      <a href="/calculator">
        <button className="cta-button">Get Started</button>
      </a>
    </section>
  );
};

export default CallToAction;
