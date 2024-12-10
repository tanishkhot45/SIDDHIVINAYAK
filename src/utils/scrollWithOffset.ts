// src/utils/scrollWithOffset.ts
export const scrollWithOffset = (el: HTMLElement) => {
    const yCoordinate = el.getBoundingClientRect().top + window.pageYOffset;
    const yOffset = -80; // Adjust this value based on your header's height
    window.scrollTo({ top: yCoordinate + yOffset, behavior: 'smooth' });
  };
  
