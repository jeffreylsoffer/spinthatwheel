"use client";
import React from 'react';

const CabaretBorder = () => {
  const bulbs: React.ReactNode[] = [];
  const hBulbs = 24; 
  const vBulbs = 14; 
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
