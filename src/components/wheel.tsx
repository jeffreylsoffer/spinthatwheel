"use client";

import type { WheelItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import React from 'react';

interface WheelProps {
  items: WheelItem[];
  rotation: number;
  isSpinning: boolean;
}

const Wheel = ({ items, rotation, isSpinning }: WheelProps) => {
  const segmentCount = items.length;
  if (segmentCount === 0) return null; // Avoid division by zero
  
  const segmentAngle = 360 / segmentCount;
  // Adjust radius based on segment count to avoid overlap and maintain a good size
  const segmentHeight = 128; // h-32
  const radius = Math.round((segmentHeight / 2) / Math.tan(Math.PI / segmentCount));


  return (
    <div className="relative w-full h-96 flex items-center justify-center overflow-hidden">
      {/* Perspective container */}
      <div
        className="w-full h-full"
        style={{ perspective: '1000px' }}
      >
        {/* The spinning wheel element */}
        <div
          className={cn(
            "relative w-full h-full transition-transform duration-[7000ms]",
            isSpinning ? "ease-[cubic-bezier(0.22,1,0.36,1)]" : ""
          )}
          style={{
            transformStyle: 'preserve-3d',
            transform: `translateZ(${-radius}px) rotateX(${-rotation}deg)`,
          }}
        >
          {items.map((item, i) => {
            const angle = i * segmentAngle;
            return (
              <div
                key={item.id}
                className="absolute w-4/5 h-32 left-1/2 -translate-x-1/2 top-1/2 -mt-16 flex items-center justify-between p-4 border-2 border-black rounded-lg"
                style={{
                  transform: `rotateX(${angle}deg) translateZ(${radius}px)`,
                  backgroundColor: item.color,
                  backfaceVisibility: 'hidden', // Hide back of cards
                }}
              >
                <span 
                  className="text-2xl font-bold text-white"
                  style={{
                    textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000',
                  }}
                >
                  {item.label.toUpperCase()}
                </span>
                <div className="flex flex-col gap-y-3">
                  <div className="w-2 h-2 bg-black rounded-full" />
                  <div className="w-2 h-2 bg-black rounded-full" />
                  <div className="w-2 h-2 bg-black rounded-full" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ticker */}
      <div 
        className="absolute w-0 h-0 border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent border-l-[30px] border-l-black right-0 z-20"
        style={{ transform: 'translateX(25%)' }}
      ></div>

      {/* Fade overlays */}
      <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
    </div>
  );
};

export default Wheel;
