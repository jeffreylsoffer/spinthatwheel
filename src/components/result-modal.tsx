"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import type { WheelItem } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ResultModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  result: WheelItem | null;
}

const ResultModal = ({ isOpen, onOpenChange, result }: ResultModalProps) => {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isOpen && result) {
      // Reset state on open to ensure the animation plays every time
      setShowDetails(false);
      
      // After a delay, trigger the text transition. 
      // This gives time for the card to animate in first.
      const timer = setTimeout(() => {
        setShowDetails(true);
      }, 700); 

      return () => clearTimeout(timer);
    }
  }, [isOpen, result]);

  if (!result) return null;

  const cardText = result.type === 'PROMPT' 
    ? (result.data as any).text 
    : result.data.name;

  const initialLabel = result.label;
  const textColor = result.type === 'END' ? 'white' : 'black';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-transparent border-none shadow-none p-0 data-[state=open]:animate-in data-[state=open]:zoom-in-75 w-auto">
        <div 
          style={{ backgroundColor: result.color.labelBg }}
          className="w-[480px] h-[270px] p-6 rounded-2xl border-[14px] border-black flex items-center justify-center text-center"
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Initial Label (e.g., RULE) */}
            <h2 
              style={{ color: textColor }}
              className={cn(
                "text-5xl lg:text-6xl font-headline uppercase break-words transition-opacity duration-300 ease-in-out absolute",
                showDetails ? "opacity-0" : "opacity-100"
              )}
            >
              {initialLabel}
            </h2>
            
            {/* Detailed Text */}
            <h2 
              style={{ color: textColor }}
              className={cn(
                "text-4xl lg:text-5xl font-headline uppercase break-words transition-opacity duration-300 ease-in-out absolute",
                showDetails ? "opacity-100 delay-300" : "opacity-0"
              )}
            >
              {cardText}
            </h2>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResultModal;
