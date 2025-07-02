
"use client";
import React, { useState, useEffect, useRef } from 'react';

const CabaretBorder = () => {
  const BULB_SPACING_PX = 30;
  const [bulbCounts, setBulbCounts] = useState({ h: 0, v: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const calculateBulbs = () => {
      // Use the container's own dimensions. Since it's positioned with `inset-2`,
      // its size will correctly reflect the available space inside the body border.
      const hCount = Math.floor(container.clientWidth / BULB_SPACING_PX);
      const vCount = Math.floor(container.clientHeight / BULB_SPACING_PX);

      // Only update state if the counts have actually changed to prevent infinite loops
      setBulbCounts(prevCounts => {
        if (prevCounts.h !== hCount || prevCounts.v !== vCount) {
          return { h: hCount, v: vCount };
        }
        return prevCounts;
      });
    };

    // Use ResizeObserver to detect size changes of the body. This is more reliable
    // for content-driven height changes than the window's resize event.
    const resizeObserver = new ResizeObserver(calculateBulbs);
    resizeObserver.observe(document.body);

    // Initial calculation
    calculateBulbs();

    return () => {
      resizeObserver.disconnect();
    };
  }, []); // Empty dependency array ensures this effect runs once on mount.

  const bulbs: React.ReactNode[] = [];
  const { h: hBulbs, v: vBulbs } = bulbCounts;

  if (hBulbs === 0 || vBulbs === 0) {
    // Render the container div so the ref is always available for measurement.
    return (
      <div ref={containerRef} className="absolute inset-2 z-[-1] pointer-events-none" />
    );
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

  return <div ref={containerRef} className="absolute inset-2 z-[-1] pointer-events-none">{bulbs}</div>;
};

export default CabaretBorder;
