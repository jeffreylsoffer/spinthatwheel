
"use client";

import type { WheelItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import React from 'react';

interface WheelProps {
  items: WheelItem[];
  rotation: number;
  isSpinning: boolean;
  spinDuration: number;
  segmentHeight: number;
}

const Wheel = ({ items, rotation, isSpinning, spinDuration, segmentHeight }: WheelProps) => {
  const segmentCount = items.length;
  if (segmentCount === 0) return null;
  
  const radius = Math.round((segmentHeight / 2) / Math.tan(Math.PI / segmentCount));

  return (
    <div 
      className="relative w-full h-full"
      style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
    >
      <div
        className={cn(
          "absolute w-full h-full",
          // Use a custom cubic bezier for a strong ease-out effect.
          // This makes the wheel start fast and decelerate naturally.
          isSpinning ? "ease-[cubic-bezier(0.25,1,0.5,1)]" : ""
        )}
        style={{
          transformStyle: 'preserve-3d',
          transform: `translateZ(${-radius}px) rotateX(${rotation}deg)`,
          transitionProperty: 'transform',
          transitionDuration: `${spinDuration}ms`,
          willChange: 'transform',
        }}
      >
        {items.map((item, i) => {
          const segmentAngle = 360 / segmentCount;
          const angle = i * segmentAngle;

          const segmentColor = item.type === 'END' ? '#111827' : item.color.segment;
          // Calculate a darker border color for a cheap 3D effect
          const r = parseInt(segmentColor.slice(1, 3), 16);
          const g = parseInt(segmentColor.slice(3, 5), 16);
          const b = parseInt(segmentColor.slice(5, 7), 16);
          const borderColor = item.type === 'END' ? 'rgb(0,0,0)' : `rgb(${r * 0.7}, ${g * 0.7}, ${b * 0.7})`;

          return (
            <div
              key={item.id}
              className="absolute w-full flex items-center justify-center"
              style={{
                height: `${segmentHeight}px`,
                transform: `rotateX(${angle}deg) translateZ(${radius}px)`,
                backgroundColor: segmentColor,
                backfaceVisibility: 'hidden',
                border: `8px solid ${borderColor}`,
              }}
            >
              <div 
                className={cn(
                  "aspect-video rounded-2xl flex items-center justify-center shadow-lg",
                  segmentHeight < 150 ? 'h-[70%] px-2' : 'h-[80%] px-4'
                )}
                style={{
                  backgroundColor: item.color.labelBg,
                  color: item.color.labelColor,
                }}
              >
                <span 
                  className={cn(
                    "font-headline font-bold tracking-wider",
                    segmentHeight < 150 ? 'text-3xl' : 'text-5xl'
                  )}
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

export default React.memo(Wheel);
