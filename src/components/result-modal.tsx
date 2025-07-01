
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import type { WheelItem, Modifier } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { RefreshCw, X } from "lucide-react";

interface ResultModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  result: WheelItem | null;
  showRuleDescriptions?: boolean;
  onOpenCheatSheet: () => void;
}

const ResultModal = ({ isOpen, onOpenChange, result, showRuleDescriptions, onOpenCheatSheet }: ResultModalProps) => {
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

  const initialLabel = result.label;
  const isFlipModifier = result.type === 'MODIFIER' && (result.data as Modifier).type === 'FLIP';
  
  const textColor = result.type === 'PROMPT' || result.type === 'RULE' ? 'black' : 'white';
  const closeButtonColor = result.color.labelBg === '#FFFFFF' || result.color.labelBg === '#FFD262' ? 'text-black' : 'text-white';
  
  const showDescriptionForRule = result.type === 'RULE' && showRuleDescriptions && result.data.description;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-transparent border-none shadow-none p-0 data-[state=open]:animate-in data-[state=open]:zoom-in-75 w-auto">
        <div className={cn("relative", isFlipModifier && "pb-16")}>
          <div 
            style={{ backgroundColor: result.color.labelBg }}
            className="w-[640px] h-[360px] p-6 rounded-2xl border-[14px] border-black flex items-center justify-center text-center relative"
          >
            <DialogClose className="absolute top-4 right-4 rounded-full p-1 transition-colors hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white">
                <X className={cn("h-8 w-8", closeButtonColor)} />
                <span className="sr-only">Close</span>
            </DialogClose>

            <div className="relative w-full h-full flex items-center justify-center">
              <h2 
                style={{ color: textColor }}
                className={cn(
                  "text-7xl lg:text-8xl font-headline uppercase break-words transition-opacity duration-300 ease-in-out absolute",
                  showDetails ? "opacity-0" : "opacity-100"
                )}
              >
                {initialLabel}
              </h2>
              
              <div
                style={{ color: textColor }}
                className={cn(
                  "w-full text-center transition-opacity duration-300 ease-in-out absolute",
                  showDetails ? "opacity-100 delay-300" : "opacity-0"
                )}
              >
                {result.type === 'PROMPT' && (
                  <h2 className="text-6xl lg:text-7xl font-headline uppercase break-words">
                    {(result.data as any).text}
                  </h2>
                )}
                {result.type === 'RULE' && (
                  <>
                    <h2 className={cn(
                      "font-headline uppercase break-words",
                      showDescriptionForRule ? "text-5xl lg:text-6xl" : "text-6xl lg:text-7xl"
                    )}>
                      {result.data.name}
                    </h2>
                    {showDescriptionForRule && (
                      <p className="text-lg lg:text-xl mt-4 font-body normal-case max-w-lg mx-auto">
                        {result.data.description}
                      </p>
                    )}
                  </>
                )}
                {result.type === 'MODIFIER' && (
                  <h2 className="text-6xl lg:text-7xl font-headline uppercase break-words">
                    {result.data.name}
                  </h2>
                )}
                {result.type === 'END' && (
                  <h2 className="text-6xl lg:text-7xl font-headline uppercase break-words">
                    {result.data.name}
                  </h2>
                )}
              </div>
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
