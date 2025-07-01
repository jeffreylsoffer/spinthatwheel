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
  
  const radius = Math.round((224 / 2) / Math.tan(Math.PI / segmentCount));

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName === 'transform' && isSpinning) {
      onSpinEnd?.();
    }
  };

  return (
    <div 
      className="relative w-full h-full"
      style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
    >
      <div
        className={cn(
          "absolute w-full h-full",
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

          const segmentColor = item.color.segment;
          const r = parseInt(segmentColor.slice(1, 3), 16);
          const g = parseInt(segmentColor.slice(3, 5), 16);
          const b = parseInt(segmentColor.slice(5, 7), 16);
          const borderColor = item.type === 'END' ? 'rgb(0,0,0)' : `rgb(${r * 0.7}, ${g * 0.7}, ${b * 0.7})`;
          const highlightColor = `rgba(255, 255, 255, 0.2)`;

          return (
            <div
              key={item.id}
              className="absolute w-full h-56 flex items-center justify-center"
              style={{
                transform: `rotateX(${angle}deg) translateZ(${radius}px)`,
                backgroundColor: item.color.segment,
                backfaceVisibility: 'hidden',
                border: `8px solid ${borderColor}`,
                boxShadow: `inset 0 2px 2px ${highlightColor}, inset 0 -2px 2px rgba(0,0,0,0.2)`
              }}
            >
              <div 
                className="w-[50%] aspect-video rounded-2xl flex items-center justify-center shadow-lg px-4"
                style={{
                  backgroundColor: item.color.labelBg,
                  color: item.color.labelColor,
                  border: '2px solid #000',
                }}
              >
                <span 
                  className="font-headline text-5xl font-bold tracking-wider"
                  style={{
                    textShadow: item.type === 'END' ? 'none' : '1px 1px 3px rgba(0, 0, 0, 0.2)',
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
