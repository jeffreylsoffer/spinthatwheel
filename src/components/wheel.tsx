
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
          isSpinning ? "ease-spin-ease" : ""
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

          return (
            <div
              key={item.id}
              className="absolute w-full flex items-center justify-center"
              style={{
                height: `${segmentHeight}px`,
                transform: `rotateX(${angle}deg) translateZ(${radius}px)`,
                backgroundColor: segmentColor,
                backfaceVisibility: 'hidden',
              }}
            >
              {/* glitter frame on all 4 sides (colorized texture, static) */}
              <div className="absolute inset-0" style={{ backgroundImage: 'url(/glitter.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
                <div className="absolute inset-0" style={{ backgroundColor: segmentColor, mixBlendMode: 'color' }} />
              </div>
              {/* inner panel leaves an 8px glitter border */}
              <div className="absolute inset-[8px]" style={{ backgroundColor: segmentColor, backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.18), rgba(255,255,255,0.10) 50%, rgba(0,0,0,0.18))' }} />
              {/* peg: one silver dot per section, inner top-right */}
              <div className="absolute right-3 top-3 h-3.5 w-3.5 rounded-full bg-gradient-to-br from-zinc-100 to-zinc-400 shadow-md ring-1 ring-black/20 z-10" />
              <div 
                className={cn(
                  "relative aspect-video rounded-2xl flex items-center justify-center shadow-lg overflow-hidden",
                  segmentHeight < 150 ? 'h-[70%] px-2' : 'h-[80%] px-4'
                )}
                style={{
                  backgroundColor: item.color.labelBg,
                  color: item.color.labelColor,
                  boxShadow: '0 6px 14px rgba(0,0,0,0.35), inset 0 2px 0 rgba(255,255,255,0.25)',
                }}
              >
                <span 
                  className={cn(
                    "relative font-headline font-bold tracking-wider",
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
