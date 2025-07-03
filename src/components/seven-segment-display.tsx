"use client";
import React from 'react';

const SevenSegmentDisplayComponent = ({ score }: { score: number }) => {
  // Clamp score to fit within the display
  const clampedScore = Math.max(-99, Math.min(score, 99));
  // Pad with a non-breaking space to help alignment
  const scoreStr = String(clampedScore).padStart(3, ' '); 

  return (
    <div 
      className="flex items-center justify-end p-2 bg-black/50 rounded-lg border border-white/10 h-14 w-24 font-digital-7 text-primary text-5xl" 
      style={{ textShadow: '0 0 5px hsl(var(--primary) / 0.7)'}}
    >
      <span className="tracking-[.1em]">{scoreStr}</span>
    </div>
  );
};

export const SevenSegmentDisplay = React.memo(SevenSegmentDisplayComponent);
