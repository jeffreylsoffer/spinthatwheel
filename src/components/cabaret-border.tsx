"use client";
import React, { useState, useEffect, useRef } from 'react';

const CabaretBorder = () => {
  const BULB_SPACING_PX = 30;
  const CHASE_SPEED_BULBS_PER_SEC = 30; // Speed of the chase effect
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleResize = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    };
    
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      if (container) {
        resizeObserver.unobserve(container);
      }
      resizeObserver.disconnect();
    };
  }, []);

  const bulbs: React.ReactNode[] = [];
  
  if (dimensions.width === 0 || dimensions.height === 0) {
    return (
      <div ref={containerRef} className="absolute inset-4 z-[-1] pointer-events-none" />
    );
  }

  // Calculate number of bulbs and margins for centering
  const hBulbs = Math.floor(dimensions.width / BULB_SPACING_PX);
  const vBulbs = Math.floor(dimensions.height / BULB_SPACING_PX);
  const horizontalMargin = (dimensions.width - hBulbs * BULB_SPACING_PX) / 2;
  const verticalMargin = (dimensions.height - vBulbs * BULB_SPACING_PX) / 2;
  
  const totalBulbs = (hBulbs * 2) + (vBulbs * 2);
  // Total duration of one animation loop depends on the number of bulbs and desired speed
  const animDuration = totalBulbs / CHASE_SPEED_BULBS_PER_SEC;

  let bulbIndex = 0;

  const getBulbStyle = (index: number, position: { top?: string, right?: string, bottom?: string, left?: string }): React.CSSProperties => ({
    ...position,
    animationName: 'bulb-chase',
    animationDuration: `${animDuration}s`,
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
    animationDelay: `${(index / CHASE_SPEED_BULBS_PER_SEC)}s`,
  });

  // Top edge
  for (let i = 0; i < hBulbs; i++) {
    const position = {
      top: '0px',
      left: `${horizontalMargin + (i + 0.5) * BULB_SPACING_PX}px`
    };
    bulbs.push(<div key={`t-${i}`} className="bulb" style={getBulbStyle(bulbIndex++, position)} />);
  }
  // Right edge
  for (let i = 0; i < vBulbs; i++) {
    const position = {
      top: `${verticalMargin + (i + 0.5) * BULB_SPACING_PX}px`,
      left: `${dimensions.width}px`,
    };
    bulbs.push(<div key={`r-${i}`} className="bulb" style={getBulbStyle(bulbIndex++, position)} />);
  }
  // Bottom edge
  for (let i = hBulbs - 1; i >= 0; i--) {
    const position = {
      top: `${dimensions.height}px`,
      left: `${horizontalMargin + (i + 0.5) * BULB_SPACING_PX}px`,
    };
    bulbs.push(<div key={`b-${i}`} className="bulb" style={getBulbStyle(bulbIndex++, position)} />);
  }
  // Left edge
  for (let i = vBulbs - 1; i >= 0; i--) {
    const position = {
      top: `${verticalMargin + (i + 0.5) * BULB_SPACING_PX}px`,
      left: '0px'
    };
    bulbs.push(<div key={`l-${i}`} className="bulb" style={getBulbStyle(bulbIndex++, position)} />);
  }

  return <div ref={containerRef} className="absolute inset-4 z-[-1] pointer-events-none">{bulbs}</div>;
};

export default CabaretBorder;
