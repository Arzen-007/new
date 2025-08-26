import React, { useEffect, useRef } from 'react';
import '../App.css';

const MatrixRain = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Matrix characters including eco-themed symbols
    const matrixChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン🌱🌿🍃🌳💧♻️⚡🔋🌍🌊🌞🌾';
    const ecoIcons = ['🌱', '🌿', '🍃', '🌳', '💧', '♻️', '⚡', '🔋', '🌍', '🌊', '🌞', '🌾'];
    
    const columns = Math.floor(window.innerWidth / 20);
    const drops = [];

    // Initialize drops
    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    const createColumn = (index) => {
      const column = document.createElement('div');
      column.className = 'matrix-column';
      column.style.left = `${index * 20}px`;
      column.style.animationDuration = `${Math.random() * 3 + 2}s`;
      column.style.animationDelay = `${Math.random() * 2}s`;
      
      // Create character string for this column
      let text = '';
      const length = Math.floor(Math.random() * 20) + 10;
      
      for (let j = 0; j < length; j++) {
        if (Math.random() < 0.05) {
          // 5% chance for eco icon
          text += ecoIcons[Math.floor(Math.random() * ecoIcons.length)];
        } else {
          // Regular matrix character
          text += matrixChars[Math.floor(Math.random() * matrixChars.length)];
        }
        text += '\n';
      }
      
      column.textContent = text;
      
      // Add special glow effect to eco icons
      if (text.includes('🌱') || text.includes('🌿') || text.includes('🍃')) {
        column.style.textShadow = '0 0 15px rgba(0, 255, 136, 0.8)';
      }
      
      return column;
    };

    // Create initial columns
    const columnElements = [];
    for (let i = 0; i < columns; i++) {
      const column = createColumn(i);
      columnElements.push(column);
      container.appendChild(column);
    }

    // Animation loop to recreate columns
    const animationInterval = setInterval(() => {
      columnElements.forEach((column, index) => {
        if (Math.random() < 0.02) { // 2% chance to recreate column
          container.removeChild(column);
          const newColumn = createColumn(index);
          columnElements[index] = newColumn;
          container.appendChild(newColumn);
        }
      });
    }, 100);

    // Handle window resize
    const handleResize = () => {
      const newColumns = Math.floor(window.innerWidth / 20);
      if (newColumns !== columns) {
        // Clear and recreate all columns
        container.innerHTML = '';
        columnElements.length = 0;
        
        for (let i = 0; i < newColumns; i++) {
          const column = createColumn(i);
          columnElements.push(column);
          container.appendChild(column);
        }
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(animationInterval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <div ref={containerRef} className="matrix-rain" />;
};

export default MatrixRain;

