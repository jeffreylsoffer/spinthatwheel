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
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isCheatSheetModalOpen, setIsCheatSheetModalOpen] = useState(false);

  const { toast } = useToast();
  const dragStartRef = useRef<{ y: number | null }>({ y: null });


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

  const handleSpinClick = () => {
    if (isSpinning || availableItems.length === 0 || wheelItems.length === 0) return;

    const targetItem = availableItems[Math.floor(Math.random() * availableItems.length)];
    const targetIndex = wheelItems.findIndex(item => item.id === targetItem.id);

    if (targetIndex === -1) return;

    const segmentAngle = 360 / wheelItems.length;
    const targetAngle = targetIndex * segmentAngle;
    const currentRevolutions = Math.floor(rotation / 360);
    const newRotation = (currentRevolutions + 5) * 360 + targetAngle;
    
    const randomOffset = (Math.random() - 0.5) * segmentAngle * 0.8;
    
    setIsSpinning(true);
    setRotation(newRotation + randomOffset);

    setTimeout(() => {
      setResult(targetItem);
      setIsResultModalOpen(true);
      setAvailableItems(prev => prev.filter(item => item.id !== targetItem.id));
      setIsSpinning(false);
    }, 7000); 
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
    dragStartRef.current.y = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    if (isSpinning || dragStartRef.current.y === null) return;
    
    const dragDistance = Math.abs(e.clientY - dragStartRef.current.y);
    if (dragDistance > 20) {
      handleSpinClick();
    }
    dragStartRef.current.y = null;
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    dragStartRef.current.y = null;
  };

  return (
    <div className="w-full flex flex-col items-center gap-8">
       <div className="text-center">
         <h1 className="font-headline text-5xl md:text-7xl text-primary-foreground" style={{textShadow: '2px 2px 4px hsl(var(--primary))'}}>
           Card Deck Wheel
         </h1>
        <p className="text-lg text-foreground/80 mt-2">Flick the wheel up or down to spin!</p>
      </div>
      
      <div 
        className="w-full cursor-grab active:cursor-grabbing touch-none select-none"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <Wheel items={wheelItems} rotation={rotation} isSpinning={isSpinning} />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center mt-4">
        <Button 
          variant="outline"
          size="lg"
          onClick={() => setIsCheatSheetModalOpen(true)}
        >
          <BookOpen className="mr-2 h-5 w-5" />
          Flip Cheat Sheet
        </Button>
      </div>
      
      <Card className="w-full max-w-2xl mt-4">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Game Status</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row justify-around gap-4">
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
           <Button variant="ghost" onClick={handleReset} className="mt-4 sm:mt-0 self-center">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset Game
          </Button>
        </CardContent>
      </Card>

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
