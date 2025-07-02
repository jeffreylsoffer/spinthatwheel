
"use client";

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Siren } from 'lucide-react';
import type { Rule } from '@/lib/types';

interface BuzzerToastProps {
  rule: Rule;
  countdownSeconds: number;
}

export function BuzzerToast({ rule, countdownSeconds }: BuzzerToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Animate progress from 100 to 0 over the countdown duration
    const intervalTime = 100; // update every 100ms
    const totalSteps = countdownSeconds * 1000 / intervalTime;
    const decrement = 100 / totalSteps;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - decrement;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [countdownSeconds]);

  return (
    <div className="flex w-full items-start gap-4 p-2">
      <Siren className="h-8 w-8 shrink-0 text-accent animate-pulse" />
      <div className="flex-grow space-y-1">
        <h3 className="font-headline text-xl text-accent tracking-widest">BUZZER!</h3>
        <p className="font-semibold text-card-foreground">{rule.name}</p>
        <p className="text-sm text-muted-foreground">{rule.description}</p>
        <Progress value={progress} className="h-1.5 mt-2 [&>div]:bg-accent" />
      </div>
    </div>
  );
}
