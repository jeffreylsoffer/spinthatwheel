"use client";
import React, { forwardRef } from 'react';

// One continuous arrow: a fixed rear body and a front tip wedge that share the
// same userSpaceOnUse gradient (so the seam is invisible at rest). Only the
// front tip hinges — the parent flicks it via the forwarded ref on each tick.
const WheelPointer = forwardRef<SVGGElement>((_props, flapRef) => {
  return (
    <div className="absolute left-full top-1/2 -translate-y-1/2 -ml-7 h-16 w-24 z-20">
      <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]">
        <defs>
          <linearGradient id="ptr" gradientUnits="userSpaceOnUse" x1="12" y1="0" x2="112" y2="0">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="55%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
        </defs>
        {/* rear body (fixed) */}
        <polygon points="46,29 112,8 112,72 46,51" fill="url(#ptr)" />
        {/* front tip (hinges around the seam at x=46) */}
        <g ref={flapRef} style={{ transformBox: 'fill-box', transformOrigin: '100% 50%' }}>
          <polygon points="12,40 46,29 46,51" fill="url(#ptr)" />
        </g>
      </svg>
    </div>
  );
});

WheelPointer.displayName = 'WheelPointer';

export default WheelPointer;
