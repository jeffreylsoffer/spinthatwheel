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
  
  const radius = Math.round((144 / 2) / Math.tan(Math.PI / segmentCount));

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
      {/* The spinning wheel element */}
      <div
        className={cn(
          "absolute w-full h-full transition-transform",
          isSpinning ? "ease-[cubic-bezier(0.23,1,0.32,1)]" : "" // easeOutQuint for a strong slowdown effect
        )}
        style={{
          transformStyle: 'preserve-3d',
          transform: `translateZ(${-radius}px) rotateX(${rotation}deg)`,
          transitionDuration: `${spinDuration}ms`,
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {items.map((item, i) => {
          const segmentAngle = 360 / segmentCount;
          const angle = i * segmentAngle;
          return (
            <div
              key={item.id}
              className="absolute w-full h-36 border-t-2 border-b-2 border-white/10 rounded-lg flex items-center justify-center"
              style={{
                transform: `rotateX(${angle}deg) translateZ(${radius}px)`,
                backgroundColor: item.color,
                backfaceVisibility: 'hidden',
                boxShadow: 'inset 0 0 15px rgba(0,0,0,0.5)',
              }}
            >
              <span 
                className="absolute inset-0 flex items-center justify-center font-headline text-5xl font-bold text-black tracking-wider"
                style={{
                  textShadow: '0 0 5px rgba(255, 255, 255, 0.7)',
                }}
              >
                {item.label.toUpperCase()}
              </span>
              {/* Pegs for the ticker to "hit" */}
              <div className="absolute right-6 top-0 flex flex-col justify-around h-full py-2">
                 <div className="w-3 h-6 bg-gradient-to-br from-gray-400 to-gray-600 rounded-sm shadow-md" style={{transform: 'rotate(15deg)'}}/>
                 <div className="w-3 h-6 bg-gradient-to-br from-gray-400 to-gray-600 rounded-sm shadow-md" style={{transform: 'rotate(15deg)'}}/>
                 <div className="w-3 h-6 bg-gradient-to-br from-gray-400 to-gray-600 rounded-sm shadow-md" style={{transform: 'rotate(15deg)'}}/>
              </div>
            </div>
          );
        })}
      </div>

      {/* Flexible 3D Ticker */}
      <div 
        className="absolute top-1/2 -translate-y-1/2 z-20"
        style={{
          right: -20,
          width: 160,
          height: 60,
          transformStyle: 'preserve-3d',
          transform: 'rotateY(-25deg) translateX(30px)'
        }}
      >
        <div
            className={cn(isSpinning && 'ticker-vibrating')}
            style={{
                width: '100%',
                height: '100%',
                transformStyle: 'preserve-3d',
            }}
        >
          <div
              className="absolute w-full h-full bg-red-600"
              style={{
                  transform: 'translateZ(4px)',
                  clipPath: 'polygon(0% 50%, 100% 0%, 100% 100%)'
              }}
          />
          <div
              className="absolute w-full h-full bg-red-800"
              style={{
                  transform: 'translateZ(-4px)',
                  clipPath: 'polygon(0% 50%, 100% 0%, 100% 100%)'
              }}
          />
        </div>
      </div>
    </div>
  );
};

export default Wheel;
