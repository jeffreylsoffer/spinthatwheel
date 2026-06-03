"use client";
import React from 'react';

const SevenSegmentDisplayComponent = ({ score }: { score: number }) => {
  const clampedScore = Math.max(-99, Math.min(score, 99));
  const scoreStr = String(clampedScore).padStart(3, ' ');

  return (
    <div
      className="relative flex items-center justify-end px-3 rounded-md h-12 w-[84px] font-digital-7 text-4xl overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 50% 30%, #1a0606, #000)',
        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(255,255,255,0.06), 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* ghosted "off" segments */}
      <span className="absolute right-3 tracking-[.1em] text-primary/15 select-none">888</span>
      {/* lit value */}
      <span className="relative tracking-[.1em] text-primary" style={{ textShadow: '0 0 8px hsl(var(--primary) / 0.9), 0 0 2px hsl(var(--primary))' }}>
        {scoreStr}
      </span>
    </div>
  );
};

export const SevenSegmentDisplay = React.memo(SevenSegmentDisplayComponent);
