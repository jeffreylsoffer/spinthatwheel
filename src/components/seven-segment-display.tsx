"use client";

import { cn } from "@/lib/utils";

const SEGMENT_MAP = {
  "0": ["a", "b", "c", "d", "e", "f"],
  "1": ["b", "c"],
  "2": ["a", "b", "g", "e", "d"],
  "3": ["a", "b", "g", "c", "d"],
  "4": ["f", "g", "b", "c"],
  "5": ["a", "f", "g", "c", "d"],
  "6": ["a", "f", "g", "e", "c", "d"],
  "7": ["a", "b", "c"],
  "8": ["a", "b", "c", "d", "e", "f", "g"],
  "9": ["a", "b", "c", "d", "f", "g"],
};

type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

const SevenSegmentDigit = ({ digit }: { digit: Digit }) => {
  const activeSegments = SEGMENT_MAP[digit] || [];

  return (
    <div className="segment-container">
      {["a", "b", "c", "d", "e", "f", "g"].map((seg) => (
        <div
          key={seg}
          className={cn(
            "segment",
            `segment-${seg}`,
            activeSegments.includes(seg) && "on"
          )}
        />
      ))}
    </div>
  );
};

export const SevenSegmentDisplay = ({ score }: { score: number }) => {
  const isNegative = score < 0;
  const absScore = Math.abs(score);
  
  // Clamp score to two digits for display purposes
  const clampedScore = Math.min(absScore, 99);

  const scoreStr = String(clampedScore).padStart(2, "0");
  const digit1 = scoreStr[0] as Digit;
  const digit2 = scoreStr[1] as Digit;

  return (
    <div className="flex items-center justify-center gap-1.5 p-2 bg-black/50 rounded-lg border border-white/10">
      <div className="relative w-4 h-14 flex justify-center items-center">
        {isNegative && <div className="bg-primary shadow-[0_0_5px_hsl(var(--primary)/0.7)] w-4 h-2 rounded-[2px]" />}
      </div>
      <SevenSegmentDigit digit={digit1} />
      <SevenSegmentDigit digit={digit2} />
    </div>
  );
};
