"use client";

import type { WheelItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Triangle } from 'lucide-react';

interface WheelProps {
  items: WheelItem[];
  rotation: number;
  isSpinning: boolean;
}

const Wheel = ({ items, rotation, isSpinning }: WheelProps) => {
  const segmentCount = items.length;
  const segmentAngle = 360 / segmentCount;

  const conicGradient = items.map((item, i) => {
    const startAngle = i * segmentAngle;
    const endAngle = (i + 1) * segmentAngle;
    return `${item.color} ${startAngle}deg ${endAngle}deg`;
  }).join(', ');

  return (
    <div className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[500px] md:h-[500px] flex items-center justify-center">
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%+20px)] z-10 text-primary"
        style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))' }}
      >
        <Triangle className="w-10 h-10 -rotate-90" fill="currentColor" strokeWidth={0} />
      </div>

      <div
        className={cn(
          "relative w-full h-full rounded-full border-8 border-primary-foreground shadow-2xl transition-transform duration-[7s]",
          isSpinning ? "ease-[cubic-bezier(0.1,0,0.2,1)]" : ""
        )}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{ background: `conic-gradient(${conicGradient})` }}
        />
        {items.map((item, i) => {
          const angle = i * segmentAngle + segmentAngle / 2;
          return (
            <div
              key={item.id}
              className="absolute w-full h-full"
              style={{ transform: `rotate(${angle}deg)` }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 origin-bottom-left flex items-start justify-center pt-4">
                 <span 
                   className="text-sm font-bold text-foreground/70 -rotate-90 select-none truncate" 
                   style={{
                     transform: 'rotate(-90deg) translateX(-10px) translateY(10px)',
                     maxWidth: '80px',
                    }}
                  >
                  {item.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="absolute w-16 h-16 bg-primary-foreground rounded-full border-4 border-primary shadow-inner" />
    </div>
  );
};

export default Wheel;
