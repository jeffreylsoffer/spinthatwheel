"use client";
import React from 'react';

const WheelPointer = () => {
  return (
    <div className="absolute -right-3 top-1/2 -translate-y-1/2 h-14 w-14 z-20">
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]">
        <defs>
          <linearGradient id="ptr" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="55%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
        </defs>
        <polygon points="2,50 78,6 78,94" fill="url(#ptr)" stroke="#7f1d1d" strokeWidth="3" strokeLinejoin="round" />
        {/* highlight */}
        <polygon points="12,50 70,18 70,34" fill="rgba(255,255,255,0.35)" />
      </svg>
    </div>
  );
};

export default React.memo(WheelPointer);
