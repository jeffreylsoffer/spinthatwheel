
"use client";
import React, { useState, useEffect } from 'react';

const CabaretBorder = () => {
  // Define the desired spacing between bulbs in pixels
  const BULB_SPACING_PX = 50;

  const [bulbCounts, setBulbCounts] = useState({ h: 0, v: 0 });

  useEffect(() => {
    const calculateBulbs = () => {
      const hCount = Math.floor(window.innerWidth / BULB_SPACING_PX);
      const vCount = Math.floor(window.innerHeight / BULB_SPACING_PX);
      setBulbCounts({ h: hCount, v: vCount });
    };

    // Calculate on initial mount
    calculateBulbs();

    // Recalculate on window resize
    window.addEventListener('resize', calculateBulbs);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('resize', calculateBulbs);
    };
  }, []); // Empty dependency array ensures this effect runs only once on the client side

  const bulbs: React.ReactNode[] = [];
  const { h: hBulbs, v: vBulbs } = bulbCounts;

  if (hBulbs === 0 || vBulbs === 0) {
    return null; // Don't render anything until counts are calculated
  }
  
  const bulbSpacingH = 100 / hBulbs;
  const bulbSpacingV = 100 / vBulbs;
  const totalBulbs = (hBulbs * 2) + (vBulbs * 2);
  const animDuration = 4; // seconds

  let index = 0;

  // Top edge
  for (let i = 0; i < hBulbs; i++) {
    bulbs.push(<div key={`t-${i}`} className="bulb" style={{ top: '0%', left: `${(i + 0.5) * bulbSpacingH}%`, animationDelay: `${(index++ / totalBulbs) * animDuration}s` }} />);
  }
  // Right edge
  for (let i = 0; i < vBulbs; i++) {
    bulbs.push(<div key={`r-${i}`} className="bulb" style={{ top: `${(i + 0.5) * bulbSpacingV}%`, right: '0%', left: 'auto', animationDelay: `${(index++ / totalBulbs) * animDuration}s` }} />);
  }
  // Bottom edge
  for (let i = hBulbs - 1; i >= 0; i--) {
    bulbs.push(<div key={`b-${i}`} className="bulb" style={{ top: '100%', bottom: 'auto', left: `${(i + 0.5) * bulbSpacingH}%`, animationDelay: `${(index++ / totalBulbs) * animDuration}s` }} />);
  }
  // Left edge
  for (let i = vBulbs - 1; i >= 0; i--) {
    bulbs.push(<div key={`l-${i}`} className="bulb" style={{ top: `${(i + 0.5) * bulbSpacingV}%`, left: '0%', animationDelay: `${(index++ / totalBulbs) * animDuration}s` }} />);
  }

  return <div className="absolute inset-0 z-[-1] pointer-events-none">{bulbs}</div>;
};

export default CabaretBorder;
