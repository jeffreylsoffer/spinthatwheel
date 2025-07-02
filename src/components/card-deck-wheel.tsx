
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Wheel from './wheel';
import ResultModal from './result-modal';
import CheatSheetModal from './cheatsheet-modal';
import Scoreboard from './scoreboard';
import { Button } from '@/components/ui/button';
import { ruleGroups as defaultRuleGroups, prompts as defaultPrompts, modifiers as defaultModifiers } from '@/lib/data';
import { createSessionDeck, populateWheel, CARD_STYLES, SEGMENT_COLORS } from '@/lib/game-logic';
import type { SessionRule, WheelItem, Rule, WheelItemType, Prompt, Modifier } from '@/lib/types';
import type { Player } from '@/app/page';
import { RefreshCw, BookOpen } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import WheelPointer from './wheel-pointer';

interface CardDeckWheelProps {
  players: Player[];
  onScoreChange: (playerId: number, delta: number) => void;
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

const CardDeckWheel = ({ players, onScoreChange, onResetGame }: CardDeckWheelProps) => {
  const [sessionRules, setSessionRules] = useState<SessionRule[]>([]);
  const [activeRules, setActiveRules] = useState<SessionRule[]>([]);
  const [wheelItems, setWheelItems] = useState<WheelItem[]>([]);
  const [availableItems, setAvailableItems] = useState<WheelItem[]>([]);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<WheelItem | null>(null);
  const [winningItem, setWinningItem] = useState<WheelItem | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isCheatSheetModalOpen, setIsCheatSheetModalOpen] = useState(false);
  const [spinDuration, setSpinDuration] = useState(0);
  const [isBuzzerRuleActive, setIsBuzzerRuleActive] = useState(false);

  const [gameData, setGameData] = useState({
    rules: defaultRuleGroups,
    prompts: defaultPrompts,
    modifiers: defaultModifiers,
  });

  const dragStartRef = useRef<{ y: number | null, time: number | null }>({ y: null, time: null });
  const buzzerTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isMobile = useIsMobile();
  const segmentHeight = isMobile ? 120 : 192;

  const playSound = (sound: 'prompt' | 'rule' | 'modifier' | 'end' | 'buzzer') => {
    // This will try to play sounds from public/sounds.
    // The actual audio files need to be added to that directory.
    const audio = new Audio(`/sounds/${sound}.mp3`);
    audio.play().catch(e => console.error(`Could not play sound: ${sound}.mp3`, e));
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
    setAvailableItems(items.filter(i => i.type !== 'END')); // Can't land on END
    setRotation(0);
    setIsSpinning(false);
    setResult(null);
    setActiveRules([]);
  }, [gameData]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);
  
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
      
      return () => {
        if (buzzerTimerRef.current) clearTimeout(buzzerTimerRef.current);
      };
    } else {
      if (buzzerTimerRef.current) clearTimeout(buzzerTimerRef.current);
    }
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
    setAvailableItems(prevAvailable => prevAvailable.map(updateItem));
  };

  const handleSpinClick = (velocity: number) => {
    if (isSpinning || availableItems.length === 0 || wheelItems.length === 0) return;

    // Prevent landing on a modifier if no rules are active yet
    const selectableItems = activeRules.length === 0 
      ? availableItems.filter(item => item.type !== 'MODIFIER')
      : availableItems;
      
    if (selectableItems.length === 0) return;

    const targetItem = selectableItems[Math.floor(Math.random() * selectableItems.length)];
    setWinningItem(targetItem);
    const targetIndex = wheelItems.findIndex(item => item.id === targetItem.id);

    if (targetIndex === -1) return;

    const segmentAngle = 360 / wheelItems.length;
    
    const direction = Math.sign(velocity) || 1;
    
    const baseRevolutions = 5;
    const velocityMultiplier = Math.min(Math.abs(velocity) * 20, 30);
    const additionalRevolutions = Math.round(baseRevolutions + velocityMultiplier);

    const duration = 4000 + additionalRevolutions * 200;
    setSpinDuration(duration);
    
    const spinAmount = additionalRevolutions * 360;
    const currentAngle = (rotation % 360 + 360) % 360;
    
    const targetSliceAngle = targetIndex * segmentAngle;
    
    let desiredRotation = rotation - currentAngle;
    desiredRotation += (spinAmount * direction);
    desiredRotation -= targetSliceAngle;
    
    const randomOffset = (Math.random() - 0.5) * segmentAngle * 0.8;

    setIsSpinning(true);
    setRotation(desiredRotation + randomOffset);
  };
  
  const handleSpinEnd = () => {
    if (winningItem) {
      playSound((winningItem.type.toLowerCase() as any) || 'end');
      setResult(winningItem);
      setIsResultModalOpen(true);

      if (winningItem.type === 'RULE') {
        const ruleData = winningItem.data as Rule;
        const sessionRule = sessionRules.find(sr => sr.primary.id === ruleData.id || sr.flipped.id === ruleData.id);
        if (sessionRule && !activeRules.some(ar => ar.id === sessionRule.id)) {
          setActiveRules(prev => [...prev, sessionRule]);
        }
      }

      setWinningItem(null);
    }
    setIsSpinning(false);
  };

  const handleModalOpenChange = (open: boolean) => {
    if (!open && result) {
      let evolvedItem: WheelItem | null = null;
      const resultIndex = wheelItems.findIndex(item => item.id === result.id);

      if (result.type === 'RULE') {
          if (Math.random() < 0.5 && gameData.prompts.length > 0) {
              const prompt = shuffle([...gameData.prompts])[0];
              evolvedItem = {
                  id: `prompt-evolved-${prompt.id}-${resultIndex}`,
                  type: 'PROMPT',
                  label: 'Prompt',
                  data: prompt,
                  color: {
                      segment: SEGMENT_COLORS[resultIndex % SEGMENT_COLORS.length],
                      ...CARD_STYLES.PROMPT,
                  }
              };
          } else if (gameData.modifiers.length > 0) {
              const modifier = shuffle([...gameData.modifiers])[0];
              evolvedItem = {
                  id: `modifier-evolved-${modifier.id}-${resultIndex}`,
                  type: 'MODIFIER',
                  label: 'Modifier',
                  data: modifier,
                  color: {
                      segment: SEGMENT_COLORS[resultIndex % SEGMENT_COLORS.length],
                      ...CARD_STYLES.MODIFIER,
                  }
              };
          }
      } else if (result.type === 'PROMPT' || result.type === 'MODIFIER') {
           evolvedItem = {
              id: `used-${result.id}`,
              type: 'END',
              label: 'END',
              data: { name: 'END', description: 'This slot has been used.' },
              color: { segment: '#111827', ...CARD_STYLES.END }
          };
      }
      
      if (evolvedItem && resultIndex !== -1) {
        const newWheelItems = [...wheelItems];
        newWheelItems[resultIndex] = evolvedItem;
        setWheelItems(newWheelItems);
        
        setAvailableItems(prev => {
            const afterRemoval = prev.filter(i => i.id !== result.id);
            if (evolvedItem!.type !== 'END') {
                return [...afterRemoval, evolvedItem!];
            }
            return afterRemoval;
        });
      }
    }
    setIsResultModalOpen(open);
  };

  const handleReset = () => {
    onResetGame();
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

    if (dragDuration < 1000 && Math.abs(dragDistance) > 20) {
        const velocity = dragDistance / dragDuration;
        handleSpinClick(velocity);
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
        <div className="max-w-sm mx-auto w-full flex flex-col gap-6">
            <Scoreboard players={players} onScoreChange={onScoreChange} />
            <Button 
              variant="outline"
              size="lg"
              onClick={() => setIsCheatSheetModalOpen(true)}
              className="w-full"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Flip Cheat Sheet
            </Button>
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
          <Wheel items={wheelItems} rotation={rotation} isSpinning={isSpinning} onSpinEnd={handleSpinEnd} spinDuration={spinDuration} segmentHeight={segmentHeight} />
          <WheelPointer />
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
    </div>
  );
};

export default CardDeckWheel;
