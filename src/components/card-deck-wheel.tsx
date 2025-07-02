
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Wheel from './wheel';
import ResultModal from './result-modal';
import CheatSheetModal from './cheatsheet-modal';
import GameOverModal from './game-over-modal';
import Scoreboard from './scoreboard';
import { Button } from '@/components/ui/button';
import { ruleGroups as defaultRuleGroups, prompts as defaultPrompts, modifiers as defaultModifiers, defaultBuzzerCountdown } from '@/lib/data';
import { createSessionDeck, populateWheel, CARD_STYLES, MODIFIER_CARD_COLORS } from '@/lib/game-logic';
import type { SessionRule, WheelItem, Rule, WheelItemType, Prompt, Modifier } from '@/lib/types';
import type { Player } from '@/app/page';
import { RefreshCw, BookOpen, Siren, Check } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import WheelPointer from './wheel-pointer';
import { useToast } from '@/hooks/use-toast';
import { BuzzerToast } from './buzzer-toast';
import { ToastAction } from "@/components/ui/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
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
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<{ landed: WheelItem; evolution: WheelItem | null } | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isCheatSheetModalOpen, setIsCheatSheetModalOpen] = useState(false);
  const [isRefereeModalOpen, setIsRefereeModalOpen] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [spinDuration, setSpinDuration] = useState(0);
  const [buzzerCountdown, setBuzzerCountdown] = useState(defaultBuzzerCountdown);

  const [gameData, setGameData] = useState({
    rules: defaultRuleGroups,
    prompts: defaultPrompts,
    modifiers: defaultModifiers,
  });

  const { toast } = useToast();
  const dragStartRef = useRef<{ y: number | null, time: number | null }>({ y: null, time: null });
  const tickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resultProcessed = useRef(false);
  const buzzerAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const isMobile = useIsMobile();
  const segmentHeight = isMobile ? 120 : 192;

  const playSound = (sound: 'prompt' | 'rule' | 'modifier' | 'end' | 'tick' | 'whistle') => {
    // This function plays a sound effect.
    // It expects to find the corresponding .mp3 file in the `public/audio/` directory.
    // For example, calling playSound('rule') will attempt to play `/audio/rule.mp3`.
    // Ensure your audio files (e.g., `rule.mp3`, `prompt.mp3`, `whistle.mp3`, etc.) are in that folder.
    const audio = new Audio(`/audio/${sound}.mp3`);
    audio.play().catch(e => console.error(`Could not play sound: ${sound}.mp3. Make sure the file exists in public/audio/.`, e));
  };

  const playBuzzer = useCallback(() => {
    if (buzzerAudioRef.current) return; // Already playing
    const audio = new Audio(`/audio/buzzer.mp3`);
    audio.loop = true;
    audio.play().catch(e => console.error("Could not play buzzer sound.", e));
    buzzerAudioRef.current = audio;
  }, []);

  const stopBuzzer = useCallback(() => {
      if (buzzerAudioRef.current) {
          buzzerAudioRef.current.pause();
          buzzerAudioRef.current.currentTime = 0;
          buzzerAudioRef.current = null;
      }
  }, []);

  useEffect(() => {
    const savedRulesJSON = localStorage.getItem('cms_rules');
    const savedPromptsJSON = localStorage.getItem('cms_prompts');
    const savedModifiersJSON = localStorage.getItem('cms_modifiers');
    const savedIsBuzzerEnabledJSON = localStorage.getItem('cms_is_buzzer_enabled');
    const savedBuzzerCountdownJSON = localStorage.getItem('cms_buzzer_countdown');

    let ruleGroups = savedRulesJSON ? JSON.parse(savedRulesJSON) : defaultRuleGroups;
    const prompts = savedPromptsJSON ? JSON.parse(savedPromptsJSON) : defaultPrompts;
    const modifiers = savedModifiersJSON ? JSON.parse(savedModifiersJSON) : defaultModifiers;
    const isBuzzerEnabled = savedIsBuzzerEnabledJSON ? JSON.parse(savedIsBuzzerEnabledJSON) : true;
    const buzzerCountdownValue = savedBuzzerCountdownJSON ? JSON.parse(savedBuzzerCountdownJSON) : defaultBuzzerCountdown;
    
    if (!isBuzzerEnabled) {
      ruleGroups = ruleGroups.filter((rg: any) => rg.primary_rule.special !== 'BUZZER');
    }

    setGameData({
      rules: ruleGroups,
      prompts: prompts,
      modifiers: modifiers,
    });
    setBuzzerCountdown(buzzerCountdownValue);
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
    setIsGameOver(false);
  }, [gameData]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);
  
  // This effect handles processing the result after the modal closes.
  // It also now handles triggering the buzzer toast.
  useEffect(() => {
    if (result && !isResultModalOpen && !resultProcessed.current) {
        resultProcessed.current = true; // Mark as processed

        if (result.evolution) {
            setWheelItems(currentWheelItems => {
                const indexToUpdate = currentWheelItems.findIndex(item => item.id === result.landed.id);
                if (indexToUpdate === -1) {
                    console.error("Landed item not found in wheel during update. Aborting update.", { landedItemId: result.landed.id });
                    return currentWheelItems;
                }
                const newWheelItems = [...currentWheelItems];
                newWheelItems[indexToUpdate] = result.evolution;
                return newWheelItems;
            });
        }

        if (result.landed.type === 'RULE') {
            const ruleData = result.landed.data as Rule;
            const sessionRule = sessionRules.find(sr => sr.primary.id === ruleData.id || sr.flipped.id === ruleData.id);
            if (sessionRule && !activeRules.some(ar => ar.id === sessionRule.id)) {
                const ruleWithColor = { ...sessionRule, color: result.landed.color };
                setActiveRules(prev => [...prev, ruleWithColor]);
            }
        }
        
        // --- BUZZER LOGIC ---
        // After a turn, there is a chance for the buzzer to go off.
        const buzzerRule = activeRules.find(r => (r.isFlipped ? r.flipped : r.primary).special === 'BUZZER');
        if (buzzerRule && Math.random() < 0.33) {
            const delay = Math.random() * 2000 + 2000; // 2-4 second delay
            setTimeout(() => {
                const soundTimeoutId = setTimeout(playBuzzer, buzzerCountdown * 1000);

                const stopAndClear = () => {
                    clearTimeout(soundTimeoutId);
                    stopBuzzer();
                };

                const ruleData = buzzerRule.isFlipped ? buzzerRule.flipped : buzzerRule.primary;
                toast({
                    duration: buzzerCountdown * 1000 + 1000, // Give a little extra time
                    onOpenChange: (open) => {
                        if (!open) {
                            stopAndClear();
                        }
                    },
                    className: "w-full max-w-md p-0 border-accent shadow-lg shadow-accent/20 bg-card",
                    description: <BuzzerToast rule={ruleData} countdownSeconds={buzzerCountdown} />,
                    action: (
                        <ToastAction altText="Acknowledge" onClick={stopAndClear} className="text-green-400 hover:text-green-300 hover:bg-green-400/10 border-0">
                           <Check className="h-6 w-6" />
                        </ToastAction>
                    ),
                });
            }, delay);
        }

        // IMPORTANT: Clear the result so this effect doesn't run again with the same data
        setResult(null);
    }
  }, [result, isResultModalOpen, activeRules, buzzerCountdown, sessionRules, toast, wheelItems, playBuzzer, stopBuzzer]);

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

  const handleSpinClick = () => {
    if (isSpinning || wheelItems.length === 0) return;

    resultProcessed.current = false; // Reset processed flag for the next result
    setIsSpinning(true);

    const revolutions = (5 + Math.random() * 5) * 360;
    const randomExtraAngle = Math.random() * 360;
    
    const newRotation = rotation - revolutions - randomExtraAngle;
    const duration = 5000 + Math.random() * 2000;
    setSpinDuration(duration);
    setRotation(newRotation);

    // Start sound effects
    if (tickTimeoutRef.current) clearTimeout(tickTimeoutRef.current);
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

    setTimeout(() => {
        handleSpinEnd(newRotation);
    }, duration);
  };
  
  const handleSpinEnd = (finalRotation: number) => {
    if (tickTimeoutRef.current) {
      clearTimeout(tickTimeoutRef.current);
      tickTimeoutRef.current = null;
    }

    setIsSpinning(false);

    const segmentAngle = 360 / wheelItems.length;
    const normalizedAngle = ((-finalRotation) % 360 + 360) % 360;
    const effectiveAngle = (normalizedAngle + (segmentAngle / 2)) % 360;
    let winningIndex = Math.floor(effectiveAngle / segmentAngle);

    let itemThatWon = wheelItems[winningIndex];
    
    // Handle game over condition immediately
    if (itemThatWon.type === 'END') {
        playSound('end');
        setIsGameOver(true);
        return; // Stop processing
    }

    const isFirstSpin = activeRules.length === 0;

    // Handle invalid modifier on first spin
    if (isFirstSpin && itemThatWon.type === 'MODIFIER') {
        // Find the next non-modifier, non-end slot
        for (let i = 1; i < wheelItems.length; i++) {
            let newIndex = (winningIndex + i) % wheelItems.length;
            const potentialWinner = wheelItems[newIndex];
            if (potentialWinner.type !== 'MODIFIER' && potentialWinner.type !== 'END') {
                itemThatWon = potentialWinner;
                break;
            }
        }
    }
    
    playSound((itemThatWon.type.toLowerCase() as any) || 'end');

    let evolution: WheelItem | null = null;
    if (itemThatWon.type === 'RULE') {
      const rand = Math.random();
      if (rand < 0.5 && gameData.prompts.length > 0) {
          const prompt = shuffle([...gameData.prompts])[0];
          evolution = {
              id: `prompt-evolved-${prompt.id}-${itemThatWon.id}`,
              type: 'PROMPT', label: 'Prompt', data: prompt,
              color: { segment: itemThatWon.color.segment, ...CARD_STYLES.PROMPT }
          };
      } else if (gameData.modifiers.length > 0) {
          const modifier = shuffle([...gameData.modifiers])[0];
          const modifierStyle = MODIFIER_CARD_COLORS[Math.floor(Math.random() * MODIFIER_CARD_COLORS.length)];
          evolution = {
              id: `modifier-evolved-${modifier.id}-${itemThatWon.id}`,
              type: 'MODIFIER', label: 'Modifier', data: modifier,
              color: { segment: itemThatWon.color.segment, labelBg: modifierStyle.bg, labelColor: modifierStyle.text }
          };
      }
    } else if (itemThatWon.type === 'PROMPT' || itemThatWon.type === 'MODIFIER') {
      evolution = {
          id: `used-${itemThatWon.id}`, type: 'END', label: 'END',
          data: { name: 'END', description: 'This slot has been used.' },
          color: { segment: CARD_STYLES.END.labelBg, ...CARD_STYLES.END }
      };
    }
    
    setResult({ landed: itemThatWon, evolution });
    setIsResultModalOpen(true);
  };

  const handleReset = () => {
    if (tickTimeoutRef.current) {
        clearTimeout(tickTimeoutRef.current);
        tickTimeoutRef.current = null;
    }
    stopBuzzer();
    onResetGame();
  }

  const handleWhistleClick = () => {
    playSound('whistle');
    setIsRefereeModalOpen(true);
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isSpinning) return;
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
        handleSpinClick();
    } else if (dragDuration < 250 && Math.abs(dragDistance) < 20) { // A click/tap gesture
        handleSpinClick(); 
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
          <WheelPointer />
        </div>
      </div>

      <ResultModal 
        isOpen={isResultModalOpen} 
        onOpenChange={setIsResultModalOpen} 
        result={result} 
        onOpenCheatSheet={() => {
          setIsResultModalOpen(false);
          setTimeout(() => setIsCheatSheetModalOpen(true), 150);
        }}
      />
      <CheatSheetModal 
        isOpen={isCheatSheetModalOpen} 
        onOpenChange={setIsCheatSheetModalOpen}
        rules={activeRules}
        onFlipRule={handleFlipRule}
      />
      <GameOverModal
        isOpen={isGameOver}
        onOpenChange={setIsGameOver}
        players={players}
        onPlayAgain={handleReset}
      />
       <AlertDialog open={isRefereeModalOpen} onOpenChange={setIsRefereeModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-5xl font-headline tracking-widest">REFEREE'S CALL</AlertDialogTitle>
            <AlertDialogDescription className="sr-only">A call has been made by the referee.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => setIsRefereeModalOpen(false)}>Close</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CardDeckWheel;
