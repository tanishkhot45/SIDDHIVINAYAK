// src/components/About/About.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Target } from 'lucide-react'; // Import icons
import './About.css';
import { Eye } from 'react-feather';

const About: React.FC = () => {
  return (
    <section id="about" className="about">
      <div className="container">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          About UrjaShakti
        </motion.h2>

        <motion.p
          className="section-description"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Empowering a sustainable future through innovative solar solutions.
        </motion.p>

        <div className="about-tabs">
          <div className="about-grid">
            <motion.div
              className="about-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)', transition: { duration: 0.2 } }}
            >
              <div className="about-icon">
                <Target className="icon" />
              </div>
              <h3 className="about-title">Our Mission</h3>
              <p className="about-text">
                To accelerate the global transition to sustainable energy by making solar power accessible, affordable, and simple for everyone.
              </p>
            </motion.div>

            <motion.div
              className="about-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)', transition: { duration: 0.2 } }}
            >
              <div className="about-icon">
                <Eye className="icon" />
              </div>
              <h3 className="about-title">Our Vision</h3>
              <p className="about-text">
                A world where clean, renewable energy powers every home and business, creating a sustainable future for generations to come.
              </p>
            </motion.div>
          </div>
        </div>

        <motion.div
          className="core-values"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="values-title">Our Values</h3>
          <div className="values-grid">
            {['Innovation', 'Sustainability', 'Accessibility', 'Integrity'].map((value, index) => (
              <motion.div
                key={value}
                className="value-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              >
                {value}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
