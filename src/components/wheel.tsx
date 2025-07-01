"use client";

import type { WheelItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import React from 'react';

interface WheelProps {
  items: WheelItem[];
  rotation: number;
  isSpinning: boolean;
  onSpinEnd?: () => void;
  spinDuration: number;
}

const Wheel = ({ items, rotation, isSpinning, onSpinEnd, spinDuration }: WheelProps) => {
  const segmentCount = items.length;
  if (segmentCount === 0) return null;
  
  // h-56 is 224px. This calculates the radius to keep the 3D wheel segments connected.
  const radius = Math.round((224 / 2) / Math.tan(Math.PI / segmentCount));

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName === 'transform' && isSpinning) {
      onSpinEnd?.();
    }
  };

  return (
    <div 
      className="relative w-full h-full"
      style={{ perspective: '1200px' }}
    >
      <div
        className={cn(
          "absolute w-full h-full",
          // Use a custom bezier for a more satisfying spin easing
          isSpinning ? "ease-[cubic-bezier(0.23,1,0.32,1)]" : ""
        )}
        style={{
          transformStyle: 'preserve-3d',
          transform: `translateZ(${-radius}px) rotateX(${rotation}deg)`,
          transitionProperty: 'transform',
          transitionDuration: `${spinDuration}ms`,
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {items.map((item, i) => {
          const segmentAngle = 360 / segmentCount;
          const angle = i * segmentAngle;
          const isEndCard = item.type === 'END';

          return (
            <div
              key={item.id}
              className="absolute w-full h-56 flex items-center justify-center"
              style={{
                transform: `rotateX(${angle}deg) translateZ(${radius}px)`,
                backgroundColor: item.color.segment,
                backfaceVisibility: 'hidden',
                // Add a subtle border to separate segments
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
              }}
            >
              <div 
                className="w-[70%] aspect-video rounded-2xl flex items-center justify-center shadow-lg px-4"
                style={{
                  backgroundColor: item.color.labelBg,
                  color: item.color.labelColor,
                  border: isEndCard ? '2px solid #000' : '2px solid rgba(255, 255, 255, 0.5)',
                }}
              >
                <span 
                  className="font-headline text-3xl font-bold tracking-wider"
                  style={{
                    textShadow: isEndCard ? 'none' : '1px 1px 3px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  {item.label.toUpperCase()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wheel;
