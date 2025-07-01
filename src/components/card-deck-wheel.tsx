"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Wheel from './wheel';
import ResultModal from './result-modal';
import CheatSheetModal from './cheatsheet-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createSessionDeck, populateWheel } from '@/lib/game-logic';
import type { SessionRule, WheelItem, WheelItemType } from '@/lib/types';
import { RefreshCw, BookOpen } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"

const CardDeckWheel = () => {
  const [sessionRules, setSessionRules] = useState<SessionRule[]>([]);
  const [wheelItems, setWheelItems] = useState<WheelItem[]>([]);
  const [availableItems, setAvailableItems] = useState<WheelItem[]>([]);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<WheelItem | null>(null);
  const [winningItem, setWinningItem] = useState<WheelItem | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isCheatSheetModalOpen, setIsCheatSheetModalOpen] = useState(false);
  const [spinDuration, setSpinDuration] = useState(0);

  const { toast } = useToast();
  const dragStartRef = useRef<{ y: number | null, time: number | null }>({ y: null, time: null });


  const initializeGame = useCallback(() => {
    const rules = createSessionDeck();
    const items = populateWheel(rules);
    setSessionRules(rules);
    setWheelItems(items);
    setAvailableItems(items);
    setRotation(0);
    setIsSpinning(false);
    setResult(null);
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleFlipRule = (ruleId: number) => {
    setSessionRules(prevRules => {
      const newRules = prevRules.map(r => 
        r.id === ruleId ? { ...r, isFlipped: !r.isFlipped } : r
      );
      const newWheelItems = populateWheel(newRules);
      setWheelItems(newWheelItems);
      setAvailableItems(newWheelItems);

      toast({
        title: "Rules Flipped!",
        description: "The wheel has been updated with the new rule set.",
      })
      return newRules;
    });
  };

  const handleSpinClick = (velocity: number) => {
    if (isSpinning || availableItems.length === 0 || wheelItems.length === 0) return;

    const targetItem = availableItems[Math.floor(Math.random() * availableItems.length)];
    setWinningItem(targetItem);
    const targetIndex = wheelItems.findIndex(item => item.id === targetItem.id);

    if (targetIndex === -1) return;

    const segmentAngle = 360 / wheelItems.length;
    
    // Invert velocity because of the coordinate system
    const direction = -Math.sign(velocity) || -1;
    
    // Velocity-based spin dynamics
    const baseRevolutions = 5;
    const velocityMultiplier = 15;
    const additionalRevolutions = Math.abs(velocity) * velocityMultiplier;
    
    const totalRevolutions = baseRevolutions + additionalRevolutions;
    
    const newRevolutions = Math.round(Math.min(50, Math.max(5, totalRevolutions)));
    
    const duration = 5000 + newRevolutions * 300;
    setSpinDuration(duration);
    
    const spinAmount = newRevolutions * 360;
    const endRotation = rotation + (spinAmount * direction);
    
    const targetAngle = targetIndex * segmentAngle;
    
    const finalRotation = Math.round(endRotation / 360) * 360 - targetAngle;
    const randomOffset = (Math.random() - 0.5) * segmentAngle * 0.8;

    setIsSpinning(true);
    setRotation(finalRotation + randomOffset);
  };
  
  const handleSpinEnd = () => {
    if (winningItem) {
      setResult(winningItem);
      setIsResultModalOpen(true);
      setAvailableItems(prev => prev.filter(item => item.id !== winningItem.id));
      setWinningItem(null);
    }
    setIsSpinning(false);
  };

  const statusCounts = useMemo(() => {
    const count = (type: WheelItemType) => wheelItems.filter(item => item.type === type).length;
    const availableCount = (type: WheelItemType) => availableItems.filter(item => item.type === type).length;

    return {
      prompts: { total: count('PROMPT'), available: availableCount('PROMPT') },
      rules: { total: count('RULE'), available: availableCount('RULE') },
      modifiers: { total: count('MODIFIER'), available: availableCount('MODIFIER') },
    }
  }, [wheelItems, availableItems]);

  const handleReset = () => {
    initializeGame();
    toast({
      title: "Game Reset",
      description: "A new deck has been created and the wheel is ready to spin!",
    })
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isSpinning || availableItems.length === 0) return;
    dragStartRef.current = { y: e.clientY, time: Date.now() };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    if (isSpinning || dragStartRef.current.y === null || dragStartRef.current.time === null) return;
    
    const dragEndY = e.clientY;
    const dragEndTime = Date.now();
    
    const dragDistance = dragStartRef.current.y - dragEndY;
    const dragDuration = dragEndTime - dragStartRef.current.time;

    // A flick is a short, fast drag.
    if (dragDuration < 500 && Math.abs(dragDistance) > 30) {
      const velocity = dragDistance / dragDuration; // pixels per millisecond
      handleSpinClick(velocity);
    }
    
    dragStartRef.current = { y: null, time: null };
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    dragStartRef.current = { y: null, time: null };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 min-h-screen items-center p-4 lg:p-8 gap-8">
      {/* Main content: Wheel */}
      <div className="lg:col-span-3 w-full flex flex-col items-center justify-center gap-8">
        <div className="text-center">
          <h1 className="font-headline text-5xl md:text-7xl text-primary-foreground" style={{textShadow: '2px 2px 4px hsl(var(--primary))'}}>
            Card Deck Wheel
          </h1>
          <p className="text-lg text-foreground/80 mt-2">Flick the wheel up or down to spin!</p>
        </div>
        <div 
          className="w-full max-w-lg h-96 mx-auto cursor-grab active:cursor-grabbing touch-none select-none"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          <Wheel items={wheelItems} rotation={rotation} isSpinning={isSpinning} onSpinEnd={handleSpinEnd} spinDuration={spinDuration} />
        </div>
      </div>

      {/* Sidebar: Controls and Status */}
      <div className="lg:col-span-2 w-full flex flex-col gap-6 justify-center max-w-md mx-auto lg:max-w-none lg:mx-0">
        <Button 
          variant="outline"
          size="lg"
          onClick={() => setIsCheatSheetModalOpen(true)}
        >
          <BookOpen className="mr-2 h-5 w-5" />
          Flip Cheat Sheet
        </Button>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Game Status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap justify-around items-center gap-4">
            <div className="text-center">
              <h3 className="font-bold text-lg">Prompts</h3>
              <Badge variant="secondary" className="text-lg">{statusCounts.prompts.available} / {statusCounts.prompts.total}</Badge>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-lg">Rules</h3>
              <Badge variant="secondary" className="text-lg">{statusCounts.rules.available} / {statusCounts.rules.total}</Badge>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-lg">Modifiers</h3>
              <Badge variant="secondary" className="text-lg">{statusCounts.modifiers.available} / {statusCounts.modifiers.total}</Badge>
            </div>
            <Button variant="ghost" onClick={handleReset} className="mt-4 sm:mt-0">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset Game
            </Button>
          </CardContent>
        </Card>
      </div>

      <ResultModal 
        isOpen={isResultModalOpen} 
        onOpenChange={setIsResultModalOpen} 
        result={result} 
      />
      <CheatSheetModal 
        isOpen={isCheatSheetModalOpen} 
        onOpenChange={setIsCheatSheetModalOpen}
        sessionRules={sessionRules}
        onFlipRule={handleFlipRule}
      />
    </div>
  );
};

export default CardDeckWheel;
