import React from 'react';
import './Loading.css';
import { ReactComponent as SunIcon } from './sun.svg'; // Import the uploaded sun SVG

const Loading = () => {
  return (
    <div className="loading-container">
      <div className="sun-spinner">
        <SunIcon className="sun-icon" />
      </div>
    </div>
  );
};

export default Loading;
