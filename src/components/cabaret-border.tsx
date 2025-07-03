
"use client";
import React, { useState, useEffect, useRef } from 'react';

const CabaretBorder = () => {
  const BULB_SPACING_PX = 30;
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const calculateBulbs = () => {
      // Only update state if the dimensions have actually changed to prevent infinite loops
      setDimensions(prevDims => {
        if (prevDims.width !== container.clientWidth || prevDims.height !== container.clientHeight) {
          return { width: container.clientWidth, height: container.clientHeight };
        }
        return prevDims;
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
  
  if (dimensions.width === 0 || dimensions.height === 0) {
    // Render the container div so the ref is always available for measurement.
    return (
      <div ref={containerRef} className="absolute inset-4 z-[-1] pointer-events-none" />
    );
  }

  const hBulbs = Math.floor(dimensions.width / BULB_SPACING_PX);
  const vBulbs = Math.floor(dimensions.height / BULB_SPACING_PX);

  const horizontalMargin = (dimensions.width - hBulbs * BULB_SPACING_PX) / 2;
  const verticalMargin = (dimensions.height - vBulbs * BULB_SPACING_PX) / 2;
  
  const totalBulbs = (hBulbs * 2) + (vBulbs * 2);
  const animDuration = 4; // seconds

  let index = 0;

  // Top edge
  for (let i = 0; i < hBulbs; i++) {
    bulbs.push(<div key={`t-${i}`} className="bulb" style={{ top: '0%', left: `${horizontalMargin + (i + 0.5) * BULB_SPACING_PX}px`, animationDelay: `${(index++ / totalBulbs) * animDuration}s` }} />);
  }
  // Right edge
  for (let i = 0; i < vBulbs; i++) {
    bulbs.push(<div key={`r-${i}`} className="bulb" style={{ top: `${verticalMargin + (i + 0.5) * BULB_SPACING_PX}px`, right: '0%', left: 'auto', animationDelay: `${(index++ / totalBulbs) * animDuration}s` }} />);
  }
  // Bottom edge
  for (let i = hBulbs - 1; i >= 0; i--) {
    bulbs.push(<div key={`b-${i}`} className="bulb" style={{ top: '100%', bottom: 'auto', left: `${horizontalMargin + (i + 0.5) * BULB_SPACING_PX}px`, animationDelay: `${(index++ / totalBulbs) * animDuration}s` }} />);
  }
  // Left edge
  for (let i = vBulbs - 1; i >= 0; i--) {
    bulbs.push(<div key={`l-${i}`} className="bulb" style={{ top: `${verticalMargin + (i + 0.5) * BULB_SPACING_PX}px`, left: '0%', animationDelay: `${(index++ / totalBulbs) * animDuration}s` }} />);
  }

  return <div ref={containerRef} className="absolute inset-4 z-[-1] pointer-events-none">{bulbs}</div>;
};

export default CabaretBorder;
