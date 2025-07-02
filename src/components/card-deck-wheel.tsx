
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Wheel from './wheel';
import ResultModal from './result-modal';
import CheatSheetModal from './cheatsheet-modal';
import Scoreboard from './scoreboard';
import { Button } from '@/components/ui/button';
import { ruleGroups as defaultRuleGroups, prompts as defaultPrompts, modifiers as defaultModifiers } from '@/lib/data';
import { createSessionDeck, populateWheel, CARD_STYLES, MODIFIER_CARD_COLORS } from '@/lib/game-logic';
import type { SessionRule, WheelItem, Rule, WheelItemType, Prompt, Modifier } from '@/lib/types';
import type { Player } from '@/app/page';
import { RefreshCw, BookOpen, Siren } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import WheelPointer from './wheel-pointer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CardDeckWheelProps {
  players: Player[];
  onScoreChange: (playerId: number, delta: number) => void;
  onNameChange: (playerId: number, newName: string) => void;
  onResetGame: () => void;
}

// Shuffles an array using the Fisher-Yates algorithm
function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length;
  let randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

const CardDeckWheel = ({ players, onScoreChange, onNameChange, onResetGame }: CardDeckWheelProps) => {
  const [sessionRules, setSessionRules] = useState<SessionRule[]>([]);
  const [activeRules, setActiveRules] = useState<SessionRule[]>([]);
  const [wheelItems, setWheelItems] = useState<WheelItem[]>([]);
  const [availableItems, setAvailableItems] = useState<WheelItem[]>([]);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<WheelItem | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isCheatSheetModalOpen, setIsCheatSheetModalOpen] = useState(false);
  const [isRefereeModalOpen, setIsRefereeModalOpen] = useState(false);
  const [spinDuration, setSpinDuration] = useState(0);
  const [isBuzzerRuleActive, setIsBuzzerRuleActive] = useState(false);
  const [spinCycle, setSpinCycle] = useState(0);

  const [gameData, setGameData] = useState({
    rules: defaultRuleGroups,
    prompts: defaultPrompts,
    modifiers: defaultModifiers,
  });

  const dragStartRef = useRef<{ y: number | null, time: number | null }>({ y: null, time: null });
  const buzzerTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isMobile = useIsMobile();
  const segmentHeight = isMobile ? 120 : 192;

  const playSound = (sound: 'prompt' | 'rule' | 'modifier' | 'end' | 'buzzer' | 'tick' | 'whistle') => {
    // This function plays a sound effect.
    // It expects to find the corresponding .mp3 file in the `public/audio/` directory.
    // For example, calling playSound('rule') will attempt to play `/audio/rule.mp3`.
    // Ensure your audio files (e.g., `rule.mp3`, `prompt.mp3`, `whistle.mp3`, etc.) are in that folder.
    const audio = new Audio(`/audio/${sound}.mp3`);
    audio.play().catch(e => console.error(`Could not play sound: ${sound}.mp3. Make sure the file exists in public/audio/.`, e));
  };

  useEffect(() => {
    const savedRulesJSON = localStorage.getItem('cms_rules');
    const savedPromptsJSON = localStorage.getItem('cms_prompts');
    const savedModifiersJSON = localStorage.getItem('cms_modifiers');
    const savedIsBuzzerEnabledJSON = localStorage.getItem('cms_is_buzzer_enabled');

    let ruleGroups = savedRulesJSON ? JSON.parse(savedRulesJSON) : defaultRuleGroups;
    const prompts = savedPromptsJSON ? JSON.parse(savedPromptsJSON) : defaultPrompts;
    const modifiers = savedModifiersJSON ? JSON.parse(savedModifiersJSON) : defaultModifiers;
    
    const isBuzzerEnabled = savedIsBuzzerEnabledJSON ? JSON.parse(savedIsBuzzerEnabledJSON) : true;
    
    if (!isBuzzerEnabled) {
      ruleGroups = ruleGroups.filter((rg: any) => rg.primary_rule.special !== 'BUZZER');
    }

    setGameData({
      rules: ruleGroups,
      prompts: prompts,
      modifiers: modifiers,
    });
  }, []);

  const initializeGame = useCallback(() => {
    const rules = createSessionDeck(gameData.rules);
    const items = populateWheel(rules);
    
    setSessionRules(rules);
    setWheelItems(items);
    setRotation(0);
    setIsSpinning(false);
    setResult(null);
    setActiveRules([]);
  }, [gameData]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);
  
  // This effect ensures `availableItems` is always in sync with `wheelItems`
  useEffect(() => {
    setAvailableItems(wheelItems.filter(item => item.type !== 'END'));
  }, [wheelItems]);
  
  useEffect(() => {
    const hasBuzzerRule = activeRules.some(sessionRule => {
        const currentRule = sessionRule.isFlipped ? sessionRule.flipped : sessionRule.primary;
        return currentRule.special === 'BUZZER';
    });
    setIsBuzzerRuleActive(hasBuzzerRule);
  }, [activeRules]);
  
  useEffect(() => {
    if (isBuzzerRuleActive) {
      const setRandomBuzzer = () => {
        if (buzzerTimerRef.current) clearTimeout(buzzerTimerRef.current);
        const randomTime = (Math.random() * 45 + 15) * 1000; // 15-60 seconds
        buzzerTimerRef.current = setTimeout(() => {
          playSound('buzzer');
          setRandomBuzzer();
        }, randomTime);
      };
      setRandomBuzzer();
    } else {
      if (buzzerTimerRef.current) clearTimeout(buzzerTimerRef.current);
    }
    
    // Cleanup for both buzzer and spinning tick sounds on component unmount
    return () => {
      if (buzzerTimerRef.current) clearTimeout(buzzerTimerRef.current);
      if (tickTimeoutRef.current) clearTimeout(tickTimeoutRef.current);
    };
  }, [isBuzzerRuleActive]);


  const handleFlipRule = (ruleId: number) => {
    const ruleToFlip = sessionRules.find(r => r.id === ruleId);
    if (!ruleToFlip) return;

    const fromRule = ruleToFlip.isFlipped ? ruleToFlip.flipped : ruleToFlip.primary;
    const toRule = ruleToFlip.isFlipped ? ruleToFlip.primary : ruleToFlip.flipped;

    const newSessionRules = sessionRules.map(r =>
      r.id === ruleId ? { ...r, isFlipped: !r.isFlipped } : r
    );
    setSessionRules(newSessionRules);

    setActiveRules(prevActiveRules => prevActiveRules.map(ar =>
      ar.id === ruleId ? newSessionRules.find(nr => nr.id === ruleId)! : ar
    ));
    
    const updateItem = (item: WheelItem): WheelItem => {
      if (item.type === 'RULE' && (item.data as Rule).id === fromRule.id) {
        const oldIdParts = item.id.split('-');
        const newId = `${oldIdParts[0]}-${oldIdParts[1]}-${toRule.id}`;
        return { ...item, data: toRule, id: newId };
      }
      return item;
    };
    
    setWheelItems(prevItems => prevItems.map(updateItem));
  };

  const handleSpinClick = (velocity: number) => {
    if (isSpinning || availableItems.length === 0 || wheelItems.length === 0) return;

    console.log('--- SPIN START ---');

    // Prevent landing on a modifier if no rules are active yet
    const selectableItems = activeRules.length === 0 
      ? availableItems.filter(item => item.type !== 'MODIFIER')
      : availableItems;
      
    if (selectableItems.length === 0) {
      console.warn("No selectable items available to spin to.");
      return;
    }

    console.log(`Selectable items: ${selectableItems.length}/${availableItems.length}`);

    const targetItem = selectableItems[Math.floor(Math.random() * selectableItems.length)];
    const targetIndex = wheelItems.findIndex(item => item.id === targetItem.id);

    if (targetIndex === -1) {
      console.error("Target item not found in wheel, cannot spin.", { targetItem, wheelItems });
      return;
    }
    
    console.log('Chosen winning item:', { id: targetItem.id, type: targetItem.type, label: targetItem.label });
    console.log('Target index in wheelItems:', targetIndex);

    const segmentAngle = 360 / wheelItems.length;
    
    // The final angle we want the wheel to point to. We subtract because rotation is counter-clockwise.
    const finalAngle = -(targetIndex * segmentAngle);

    // Get the current angle of the wheel, normalized to be between 0 and -360.
    const currentAngle = rotation % 360;
    
    // Add a random number of full revolutions for visual effect.
    const revolutions = (3 + Math.random() * 3) * 360;

    // Calculate how far we need to rotate to get from the current angle to the final angle.
    // We add 360 to handle negative angles and ensure we always spin forward.
    const spinDistance = (360 + finalAngle - currentAngle) % 360;
    
    // The new rotation is the current rotation plus the full revolutions and the spin distance.
    const newRotation = rotation - revolutions - spinDistance;
    
    // Add a slight random offset to make it not land perfectly every time
    const randomOffset = (Math.random() - 0.5) * segmentAngle * 0.8;
    const finalRotationWithOffset = newRotation - randomOffset;

    const duration = 4000 + (revolutions / 360) * 300;
    setSpinDuration(duration);

    console.log('Calculated rotation:', finalRotationWithOffset);

    setIsSpinning(true);
    setRotation(finalRotationWithOffset);

    if (tickTimeoutRef.current) {
      clearTimeout(tickTimeoutRef.current);
    }
    
    const scheduleTicks = () => {
      let elapsed = 0;
      const minDelay = 20;
      const maxDelay = 250; 

      function tick() {
        if (elapsed >= duration) {
          clearTimeout(tickTimeoutRef.current!);
          tickTimeoutRef.current = null;
          return;
        }

        const ticksPerSegment = 3;
        const totalTicksInSpin = (360 / segmentAngle) * ticksPerSegment * (revolutions / 360);
        const averageDelay = duration / totalTicksInSpin;

        playSound('tick');
        
        const progress = elapsed / duration;
        const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);
        const currentDelay = minDelay + (maxDelay - minDelay) * easeOutQuart(progress);
        
        elapsed += currentDelay;
        
        tickTimeoutRef.current = setTimeout(tick, currentDelay);
      }
      
      tick();
    };

    scheduleTicks();

    // Use setTimeout to handle spin end, which is more reliable than onTransitionEnd
    setTimeout(() => {
        handleSpinEnd(targetItem);
    }, duration);
  };
  
  const handleSpinEnd = (itemThatWon: WheelItem | null) => {
    console.log('--- SPIN END ---');
    if (tickTimeoutRef.current) {
      clearTimeout(tickTimeoutRef.current);
      tickTimeoutRef.current = null;
    }

    setSpinCycle(c => c + 1);
    setIsSpinning(false);

    if (itemThatWon) {
      console.log('Landed on (from handleSpinEnd param):', { id: itemThatWon.id, type: itemThatWon.type, label: itemThatWon.label });
      playSound((itemThatWon.type.toLowerCase() as any) || 'end');
      setResult(itemThatWon);
      setIsResultModalOpen(true);

      if (itemThatWon.type === 'RULE') {
        const ruleData = itemThatWon.data as Rule;
        const sessionRule = sessionRules.find(sr => sr.primary.id === ruleData.id || sr.flipped.id === ruleData.id);
        if (sessionRule && !activeRules.some(ar => ar.id === sessionRule.id)) {
           const ruleWithColor = { ...sessionRule, color: itemThatWon.color };
           setActiveRules(prev => [...prev, ruleWithColor]);
        }
      }
    } else {
        console.warn("handleSpinEnd called with no winning item.");
    }
  };

  const handleModalOpenChange = (open: boolean) => {
    if (!open && result) {
      const landedItem = result;
      // Immediately clear the result to prevent this block from running again on a double-invocation from Strict Mode.
      setResult(null);

      console.log('--- MODAL CLOSE ---');
      console.log('Result item being processed:', { id: landedItem.id, type: landedItem.type, label: landedItem.label });


      setWheelItems(currentWheelItems => {
        console.log('Wheel items BEFORE update:', currentWheelItems.map(i => i.id));
        const indexToUpdate = currentWheelItems.findIndex(item => item.id === landedItem.id);

        if (indexToUpdate === -1) {
            console.error("Landed item not found in wheel during update. Aborting update.", { landedItemId: landedItem.id });
            return currentWheelItems;
        }

        console.log(`Found item to update at index: ${indexToUpdate}`);

        let evolvedItem: WheelItem | null = null;

        if (landedItem.type === 'RULE') {
            if (Math.random() < 0.5 && gameData.prompts.length > 0) {
                const prompt = shuffle([...gameData.prompts])[0];
                evolvedItem = {
                    id: `prompt-evolved-${prompt.id}-${landedItem.id}`,
                    type: 'PROMPT',
                    label: 'Prompt',
                    data: prompt,
                    color: {
                        segment: landedItem.color.segment, // Keep original segment color
                        ...CARD_STYLES.PROMPT,
                    }
                };
            } else if (gameData.modifiers.length > 0) {
                const modifier = shuffle([...gameData.modifiers])[0];
                const modifierStyle = MODIFIER_CARD_COLORS[Math.floor(Math.random() * MODIFIER_CARD_COLORS.length)];
                evolvedItem = {
                    id: `modifier-evolved-${modifier.id}-${landedItem.id}`,
                    type: 'MODIFIER',
                    label: 'Modifier',
                    data: modifier,
                    color: {
                        segment: landedItem.color.segment, // Keep segment color
                        labelBg: modifierStyle.bg,
                        labelColor: modifierStyle.text,
                    }
                };
            }
        } else if (landedItem.type === 'PROMPT' || landedItem.type === 'MODIFIER') {
            evolvedItem = {
                id: `used-${landedItem.id}`,
                type: 'END',
                label: 'END',
                data: { name: 'END', description: 'This slot has been used.' },
                color: { 
                    segment: CARD_STYLES.END.labelBg, 
                    ...CARD_STYLES.END 
                }
            };
        }

        if (evolvedItem) {
          const newWheelItems = [...currentWheelItems];
          newWheelItems[indexToUpdate] = evolvedItem;
          console.log('Wheel items AFTER update:', newWheelItems.map(i => i.id));
          return newWheelItems;
        }
        
        console.log('Item did not evolve, returning current items.');
        return currentWheelItems;
      });
    }
    setIsResultModalOpen(open);
  };

  const handleReset = () => {
    if (tickTimeoutRef.current) {
        clearTimeout(tickTimeoutRef.current);
        tickTimeoutRef.current = null;
    }
    onResetGame();
  }

  const handleWhistleClick = () => {
    playSound('whistle');
    setIsRefereeModalOpen(true);
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isSpinning || availableItems.length === 0) return;
    dragStartRef.current = { y: e.clientY, time: Date.now() };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current.y) return;
    const dragY = e.clientY;
    const deltaY = dragStartRef.current.y - dragY;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    if (isSpinning || dragStartRef.current.y === null || dragStartRef.current.time === null) return;
    
    const dragEndY = e.clientY;
    const dragEndTime = Date.now();
    
    const dragDistance = dragStartRef.current.y - dragEndY;
    const dragDuration = dragEndTime - dragStartRef.current.time;

    if (dragDuration < 1000 && Math.abs(dragDistance) > 20) { // A flick gesture
        const velocity = dragDistance / dragDuration;
        handleSpinClick(velocity);
    } else if (dragDuration < 250 && Math.abs(dragDistance) < 20) { // A click/tap gesture
        handleSpinClick(1); // Spin with a default medium velocity
    }
    
    dragStartRef.current = { y: null, time: null };
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    dragStartRef.current = { y: null, time: null };
  };
  
  return (
    <div className="flex flex-col-reverse lg:flex-row h-screen overflow-hidden p-4 lg:p-8 gap-4 lg:gap-8">
      
      {/* Left Column: Scoreboard & Controls */}
      <div className="lg:w-2/5 flex flex-col gap-6 justify-center overflow-y-auto">
        <div className="max-w-sm mx-auto w-full flex flex-col gap-4">
            <Scoreboard players={players} onScoreChange={onScoreChange} onNameChange={onNameChange} />
             <div className="grid grid-cols-2 gap-4">
               <Button 
                variant="outline"
                size="lg"
                onClick={() => setIsCheatSheetModalOpen(true)}
                className="w-full"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Flip Sheet
              </Button>
              <Button 
                variant="destructive"
                size="lg"
                onClick={handleWhistleClick}
                className="w-full"
              >
                <Siren className="mr-2 h-5 w-5" />
                WHISTLE!
              </Button>
            </div>
            <Button variant="ghost" onClick={handleReset} className="self-center">
                <RefreshCw className="mr-2 h-4 w-4" />
                New Game
            </Button>
        </div>
      </div>

      {/* Right Column: Wheel */}
      <div className="lg:w-3/5 flex-1 lg:flex-auto flex items-center justify-center relative">
        <div 
          className="relative w-full max-w-[12rem] lg:max-w-lg mx-auto cursor-grab active:cursor-grabbing touch-none select-none"
          style={{ height: `${segmentHeight}px` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          <Wheel items={wheelItems} rotation={rotation} isSpinning={isSpinning} spinDuration={spinDuration} segmentHeight={segmentHeight} />
          <WheelPointer key={spinCycle} />
        </div>
      </div>

      <ResultModal 
        isOpen={isResultModalOpen} 
        onOpenChange={handleModalOpenChange} 
        result={result} 
        onOpenCheatSheet={() => {
          setIsResultModalOpen(false);
          setIsCheatSheetModalOpen(true);
        }}
      />
      <CheatSheetModal 
        isOpen={isCheatSheetModalOpen} 
        onOpenChange={setIsCheatSheetModalOpen}
        rules={activeRules}
        onFlipRule={handleFlipRule}
      />
       <AlertDialog open={isRefereeModalOpen} onOpenChange={setIsRefereeModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-5xl font-headline tracking-widest">REFEREE'S CALL</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => setIsRefereeModalOpen(false)}>Close</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CardDeckWheel;
