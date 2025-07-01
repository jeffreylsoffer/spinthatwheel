
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import type { WheelItem, Modifier } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { RefreshCw } from "lucide-react";

interface ResultModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  result: WheelItem | null;
  onOpenCheatSheet: () => void;
}

const ResultModal = ({ isOpen, onOpenChange, result, onOpenCheatSheet }: ResultModalProps) => {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isOpen && result) {
      setShowDetails(false);
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
  const textColor = result.type === 'PROMPT' || result.type === 'RULE' ? 'black' : 'white';
  const isFlipModifier = result.type === 'MODIFIER' && (result.data as Modifier).type === 'FLIP';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-transparent border-none shadow-none p-0 data-[state=open]:animate-in data-[state=open]:zoom-in-75 w-auto">
        <div className={cn("relative", isFlipModifier && "pb-16")}>
          <div 
            style={{ backgroundColor: result.color.labelBg }}
            className="w-[480px] h-[270px] p-6 rounded-2xl border-[14px] border-black flex items-center justify-center text-center"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <h2 
                style={{ color: textColor }}
                className={cn(
                  "text-6xl lg:text-7xl font-headline uppercase break-words transition-opacity duration-300 ease-in-out absolute",
                  showDetails ? "opacity-0" : "opacity-100"
                )}
              >
                {initialLabel}
              </h2>
              
              <h2 
                style={{ color: textColor }}
                className={cn(
                  "text-5xl lg:text-6xl font-headline uppercase break-words transition-opacity duration-300 ease-in-out absolute",
                  showDetails ? "opacity-100 delay-300" : "opacity-0"
                )}
              >
                {cardText}
              </h2>
            </div>
          </div>
          {isFlipModifier && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
              <Button onClick={onOpenCheatSheet}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Open Flip Sheet
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResultModal;
