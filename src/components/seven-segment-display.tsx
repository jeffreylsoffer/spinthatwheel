"use client";
import React from 'react';
import { cn } from "@/lib/utils";

const SevenSegmentDisplayComponent = ({ score, compactOnDesktop = false }: { score: number; compactOnDesktop?: boolean }) => {
  const clampedScore = Math.max(-99, Math.min(score, 99));
  const scoreStr = String(clampedScore).padStart(3, ' ');

  return (
    <div
      className={cn(
        "relative flex items-center justify-end px-3 rounded-md h-12 w-[84px] font-digital-7 text-4xl overflow-hidden",
        compactOnDesktop && "lg:h-9 lg:w-[76px] lg:px-2 lg:text-2xl"
      )}
      style={{
        background: 'radial-gradient(circle at 50% 30%, #1a0606, #000)',
        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(255,255,255,0.06), 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* ghosted "off" segments */}
      <span className={cn("absolute right-3 tracking-[.1em] text-[#fb3b3b]/15 select-none", compactOnDesktop && "lg:right-2")}>888</span>
      {/* lit value */}
      <span className="relative tracking-[.1em] text-[#fb3b3b]" style={{ textShadow: '0 0 8px rgba(251,59,59,0.9), 0 0 2px rgba(251,59,59,1)' }}>
        {scoreStr}
      </span>
    </div>
  );
};

export const SevenSegmentDisplay = React.memo(SevenSegmentDisplayComponent);
