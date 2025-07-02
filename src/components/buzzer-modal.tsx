
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SevenSegmentDisplay } from "./seven-segment-display";
import { Siren } from "lucide-react";

interface BuzzerModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  countdownSeconds: number;
}

const BuzzerModal = ({ isOpen, onOpenChange, countdownSeconds }: BuzzerModalProps) => {
  const [remaining, setRemaining] = useState(countdownSeconds);

  useEffect(() => {
    if (isOpen) {
      setRemaining(countdownSeconds);
    }
  }, [isOpen, countdownSeconds]);

  useEffect(() => {
    if (!isOpen || remaining <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, remaining]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground border-4 border-accent shadow-accent/40 shadow-2xl">
        <DialogHeader className="items-center text-center">
          <Siren className="h-20 w-20 text-accent animate-pulse" />
          <DialogTitle className="font-headline text-6xl text-accent tracking-widest mt-4">
            BUZZER!
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Perform your buzzer action before the timer runs out!
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-8">
          <SevenSegmentDisplay score={remaining} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuzzerModal;
