
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import type { WheelItem, Modifier, Rule } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { RefreshCw, X, Timer, CheckCircle2, XCircle } from "lucide-react";

interface ResultModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  result: { landed: WheelItem; evolution: WheelItem | null } | null;
  onOpenCheatSheet: () => void;
}

const ResultModal = ({ isOpen, onOpenChange, result, onOpenCheatSheet }: ResultModalProps) => {
  const [showDetails, setShowDetails] = useState(false);

  // New state for prompt logic
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerFinished, setTimerFinished] = useState(false);
  const [promptOutcome, setPromptOutcome] = useState<'success' | 'fail' | null>(null);

  const landedItem = result?.landed;
  const isPrompt = landedItem?.type === 'PROMPT';

  const promptTimeDuration = useMemo(() => {
    if (!isPrompt || !landedItem?.data.text) return null;
    const match = (landedItem.data.text as string).match(/in (\d+)\s*seconds/i);
    return match ? parseInt(match[1], 10) : null;
  }, [isPrompt, landedItem]);
  
  useEffect(() => {
    if (isOpen && result) {
      // Reset all state when modal opens or result changes
      setShowDetails(false);
      setPromptOutcome(null);
      setIsTimerRunning(false);
      setTimerFinished(false);
      
      const duration = promptTimeDuration;
      setTimerSeconds(duration);
      if (duration) {
        setTimeRemaining(duration);
      }

      const timer = setTimeout(() => {
        setShowDetails(true);
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [isOpen, result, promptTimeDuration]);

  // Countdown effect
  useEffect(() => {
    if (!isTimerRunning || timeRemaining <= 0) {
      if (isTimerRunning && timeRemaining <= 0) {
        setIsTimerRunning(false);
        setTimerFinished(true);
      }
      return;
    }
    const interval = setInterval(() => setTimeRemaining(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemaining]);


  if (!result || !landedItem) return null;

  const handleStartTimer = () => {
    setIsTimerRunning(true);
  };
  
  const handleSetOutcome = (outcome: 'success' | 'fail') => {
    setIsTimerRunning(false);
    setPromptOutcome(outcome);
  };
  
  const initialLabel = landedItem.label;
  const isFlipModifier = landedItem.type === 'MODIFIER' && (landedItem.data as Modifier).type === 'FLIP';
  
  const closeButtonColor = landedItem.color.labelColor === '#1F2937' ? 'text-black' : 'text-white';
  
  const showDescriptionForRule = landedItem.type === 'RULE' && (landedItem.data as Rule).description;
  const showDescriptionForModifier = landedItem.type === 'MODIFIER' && (landedItem.data as Modifier).description;
  const showTimerButton = isPrompt && timerSeconds && !isTimerRunning && !timerFinished && !promptOutcome;
  const showSuccessFailButtons = isPrompt && !promptOutcome && (!timerSeconds || isTimerRunning || timerFinished);

  const renderContent = () => {
    // Phase 1: Show initial label (e.g., "PROMPT")
    if (!showDetails) {
      return (
        <h2 className="text-6xl md:text-8xl font-headline uppercase break-words animate-in fade-in">
          {initialLabel}
        </h2>
      );
    }
    
    // Phase 4: Show timer countdown
    if (isTimerRunning) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 animate-in fade-in">
                <h3 className="font-digital-7 text-9xl">{timeRemaining}</h3>
            </div>
        );
    }

    // Phase 5: Show outcome
    if (promptOutcome === 'success') {
      return (
        <div className="flex flex-col items-center justify-center gap-4 text-center animate-in fade-in">
          <CheckCircle2 className="h-24 w-24 text-green-400" />
          <h3 className="text-4xl font-headline">SUCCESS!</h3>
          <p className="text-lg max-w-sm">Award <span className="font-bold">+2 points</span> and shred one rule card.</p>
        </div>
      );
    }
    if (promptOutcome === 'fail') {
      return (
        <div className="flex flex-col items-center justify-center gap-4 text-center animate-in fade-in">
          <XCircle className="h-24 w-24 text-red-500" />
          <h3 className="text-4xl font-headline">FAILURE!</h3>
          <p className="text-lg max-w-sm">Deduct <span className="font-bold">-2 points</span>. Better luck next time!</p>
        </div>
      );
    }

    // Phase 2 & 3: Show detailed card content
    switch(landedItem.type) {
      case 'PROMPT':
        return (
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-headline uppercase break-words animate-in fade-in">
            {(landedItem.data as any).text}
          </h2>
        );
      case 'RULE':
        return (
          <div className="animate-in fade-in">
            <h2 className={cn(
              "font-headline uppercase break-words",
              showDescriptionForRule ? "text-3xl sm:text-4xl md:text-6xl" : "text-4xl sm:text-5xl md:text-7xl"
            )}>
              {landedItem.data.name}
            </h2>
            {showDescriptionForRule && (
              <p className="text-sm sm:text-base md:text-xl mt-4 font-body normal-case max-w-lg mx-auto">
                {landedItem.data.description}
              </p>
            )}
          </div>
        );
      case 'MODIFIER':
        return (
          <div className="animate-in fade-in">
            <h2 className={cn(
              "font-headline uppercase break-words",
              showDescriptionForModifier ? "text-3xl sm:text-4xl md:text-6xl" : "text-4xl sm:text-5xl md:text-7xl"
            )}>
              {landedItem.data.name}
            </h2>
            {showDescriptionForModifier && (
              <p className="text-sm sm:text-base md:text-xl mt-4 font-body normal-case max-w-lg mx-auto">
                {landedItem.data.description}
              </p>
            )}
          </div>
        );
      case 'END':
        return (
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-headline uppercase break-words animate-in fade-in">
            {landedItem.data.name}
          </h2>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-transparent border-none shadow-none p-0 data-[state=open]:animate-in data-[state=open]:zoom-in-75 w-[90vw] max-w-[640px]">
        <DialogHeader className="sr-only">
           <DialogTitle>{`${landedItem.label}: ${landedItem.data.name || (landedItem.data as any).text}`}</DialogTitle>
          <DialogDescription>
            {landedItem.data.description || 'Result from the wheel spin.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className={cn("relative pb-24 md:pb-20")}>
          <div 
            style={{ backgroundColor: landedItem.color.labelBg }}
            className="w-full aspect-video p-4 md:p-6 rounded-2xl border-[10px] md:border-[14px] border-black flex items-center justify-center text-center relative"
          >
            <DialogClose className="absolute top-4 right-4 z-10 hidden rounded-full p-1 transition-colors hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white md:block">
                <X className={cn("h-8 w-8", closeButtonColor)} />
                <span className="sr-only">Close</span>
            </DialogClose>
            <div className="relative w-full h-full flex items-center justify-center" style={{color: landedItem.color.labelColor}}>
              {renderContent()}
            </div>
          </div>
          
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col md:flex-row items-stretch justify-center gap-2 w-full px-4 md:gap-4 max-w-sm md:max-w-md mx-auto">
            {isFlipModifier && !isPrompt && (
              <Button onClick={onOpenCheatSheet} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Open Flip Sheet
              </Button>
            )}
            {showTimerButton && (
              <Button size="lg" onClick={handleStartTimer} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 animate-in fade-in">
                <Timer className="mr-2 h-5 w-5" />
                Start {timerSeconds}s Timer
              </Button>
            )}
            {showSuccessFailButtons && (
              <div className="flex gap-4 animate-in fade-in w-full">
                <Button size="lg" variant="destructive" onClick={() => handleSetOutcome('fail')} className="flex-1">
                  <XCircle className="mr-2 h-5 w-5" />
                  Fail
                </Button>
                <Button size="lg" className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleSetOutcome('success')}>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Success
                </Button>
              </div>
            )}
            <DialogClose asChild>
                <Button variant="outline" size="lg" className="md:hidden">Close</Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResultModal;
