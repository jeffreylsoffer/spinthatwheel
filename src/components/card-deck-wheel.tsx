
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
import { RefreshCw, BookOpen, Megaphone, Check, Keyboard, Volume2, VolumeX } from 'lucide-react';
import { MdMusicOff } from "react-icons/md";
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import WheelPointer from './wheel-pointer';
import { useToast } from '@/hooks/use-toast';
import { BuzzerToast } from './buzzer-toast';
import { ToastAction } from "@/components/ui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
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

const musicTracks = [
  '/audio/wheelmusic.mp3',
  '/audio/wheelmusic2.mp3',
  '/audio/wheelmusic3.mp3',
  '/audio/wheelmusic4.mp3',
];

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
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [evolutionDeck, setEvolutionDeck] = useState<(Prompt | Modifier)[]>([]);
  const [soundMode, setSoundMode] = useState<'on' | 'sfx' | 'off'>('on');

  const [gameData, setGameData] = useState({
    rules: defaultRuleGroups,
    prompts: defaultPrompts,
    modifiers: defaultModifiers,
  });

  const isSpinningRef = useRef(isSpinning);
  isSpinningRef.current = isSpinning;

  const spinCountRef = useRef(0);
  const { toast } = useToast();
  const dragStartRef = useRef<{ y: number | null, time: number | null }>({ y: null, time: null });
  const tickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resultProcessed = useRef(false);
  const buzzerAudioRef = useRef<HTMLAudioElement | null>(null);
  const musicAudioRefs = useRef<HTMLAudioElement[]>([]);
  const currentMusicRef = useRef<HTMLAudioElement | null>(null);
  const isFirstMusicPlay = useRef(true);
  
  const audioRefs = {
      prompt: useRef<HTMLAudioElement | null>(null),
      rule: useRef<HTMLAudioElement | null>(null),
      modifier: useRef<HTMLAudioElement | null>(null),
      flip: useRef<HTMLAudioElement | null>(null),
      end: useRef<HTMLAudioElement | null>(null),
      tick: useRef<HTMLAudioElement | null>(null),
      whistle: useRef<HTMLAudioElement | null>(null),
  };

  const isMobile = useIsMobile();
  const segmentHeight = isMobile ? 120 : 192;

  useEffect(() => {
    const savedMode = localStorage.getItem('sound_mode') as 'on' | 'sfx' | 'off' | null;
    if (savedMode) {
      setSoundMode(savedMode);
    }
    // Preload audio
    if (typeof window !== "undefined") {
        (Object.keys(audioRefs) as Array<keyof typeof audioRefs>).forEach(sound => {
            audioRefs[sound].current = new Audio(`/audio/${sound}.mp3`);
        });

        musicAudioRefs.current = musicTracks.map(trackSrc => {
          const audio = new Audio(trackSrc);
          audio.loop = true;
          return audio;
        });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const playSound = useCallback((sound: keyof Omit<typeof audioRefs, 'wheelMusic'>) => {
    if (soundMode === 'off') return;
    if (soundMode === 'sfx' && sound === 'tick') return;
    
    const audio = audioRefs[sound]?.current;
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.error(`Could not play sound: ${sound}.mp3.`, e));
    }
  }, [soundMode, audioRefs]);

  const playMusic = useCallback(() => {
    if (soundMode !== 'on') return;

    if (currentMusicRef.current && !currentMusicRef.current.paused) {
      currentMusicRef.current.pause();
      currentMusicRef.current.currentTime = 0;
    }

    let trackToPlay: HTMLAudioElement;

    if (isFirstMusicPlay.current) {
        trackToPlay = musicAudioRefs.current[0];
        isFirstMusicPlay.current = false;
    } else {
        const trackPool = musicAudioRefs.current;
        trackToPlay = trackPool[Math.floor(Math.random() * trackPool.length)];
    }
    
    if (trackToPlay) {
      trackToPlay.currentTime = 0;
      trackToPlay.volume = 1;
      trackToPlay.play().catch(e => console.error('Could not play music.', e));
      currentMusicRef.current = trackToPlay;
    }
  }, [soundMode]);

  const stopMusic = useCallback(() => {
    const music = currentMusicRef.current;
    if (music && !music.paused) {
        let volume = music.volume;
        const fadeOutInterval = setInterval(() => {
            if (volume > 0.1) {
                volume -= 0.1;
                try {
                  music.volume = volume;
                } catch (e) {
                  clearInterval(fadeOutInterval);
                }
            } else {
                clearInterval(fadeOutInterval);
                music.pause();
                music.currentTime = 0;
                music.volume = 1; // Reset volume
            }
        }, 50);
    }
  }, []);

  const playBuzzer = useCallback(() => {
    if (soundMode === 'off') return;
    if (buzzerAudioRef.current) return; // Already playing
    const audio = new Audio(`/audio/buzzer.mp3`);
    audio.loop = true;
    audio.play().catch(e => console.error("Could not play buzzer sound.", e));
    buzzerAudioRef.current = audio;
  }, [soundMode]);

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
    spinCountRef.current = 0;
    const rules = createSessionDeck(gameData.rules);
    const items = populateWheel(rules);
    
    // --- Create and shuffle a deck of evolution cards (new logic) ---
    const numRules = gameData.rules.length;

    // 1. Generate prompts (roughly 50% of the deck)
    const numPromptsToGenerate = Math.floor(numRules / 2);
    const generatedPrompts: Prompt[] = [];
    if (gameData.prompts.length > 0) {
      const availablePrompts = shuffle([...gameData.prompts]);
      for (let i = 0; i < numPromptsToGenerate; i++) {
        generatedPrompts.push(availablePrompts[i % availablePrompts.length]);
      }
    }

    // 2. Generate modifiers (the other 50%)
    const numModifiersToGenerate = numRules - numPromptsToGenerate;
    const generatedModifiers: Modifier[] = [];
    if (gameData.modifiers.length > 0) {
      const availableModifiers = [...gameData.modifiers];
      const flipModifier = availableModifiers.find(m => m.type === 'FLIP');
      
      if (flipModifier) {
        let modifiersToCreate = numModifiersToGenerate;
        // Add full sets of all available modifiers
        while (modifiersToCreate >= availableModifiers.length) {
          generatedModifiers.push(...shuffle([...availableModifiers]));
          modifiersToCreate -= availableModifiers.length;
        }
        // Fill the rest of the slots with FLIP modifiers
        while (modifiersToCreate > 0) {
          generatedModifiers.push(flipModifier);
          modifiersToCreate--;
        }
      } else {
        // Fallback if no FLIP modifier exists: just cycle through available modifiers
        const availableModifiersShuffled = shuffle([...gameData.modifiers]);
        for (let i = 0; i < numModifiersToGenerate; i++) {
            generatedModifiers.push(availableModifiersShuffled[i % availableModifiersShuffled.length]);
        }
      }
    }
    
    const finalEvolutionDeck = shuffle([...generatedPrompts, ...generatedModifiers]);
    setEvolutionDeck(finalEvolutionDeck);

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
  
  const handleSpinEnd = useCallback((finalRotation: number) => {
    stopMusic();
    if (tickTimeoutRef.current) {
      clearTimeout(tickTimeoutRef.current);
      tickTimeoutRef.current = null;
    }

    const segmentAngle = 360 / wheelItems.length;
    const normalizedAngle = ((-finalRotation) % 360 + 360) % 360;
    const effectiveAngle = (normalizedAngle + (segmentAngle / 2)) % 360;
    let winningIndex = Math.floor(effectiveAngle / segmentAngle);

    let itemThatWon = wheelItems[winningIndex];
    let actualWinningIndex = winningIndex;
    
    const mustBeRule = spinCountRef.current <= players.length && wheelItems.some(i => i.type === 'RULE');

    if (mustBeRule) {
      // For the first spin for each player, force landing on a RULE
      if (itemThatWon.type !== 'RULE') {
        // Find the next available RULE card on the wheel
        for (let i = 1; i < wheelItems.length; i++) {
          const nextIndex = (winningIndex + i) % wheelItems.length;
          const potentialWinner = wheelItems[nextIndex];
          if (potentialWinner.type === 'RULE') {
            itemThatWon = potentialWinner;
            actualWinningIndex = nextIndex;
            break;
          }
        }
      }
    } else {
      // Regular logic for subsequent spins
      const hasActiveCards = wheelItems.some(item => item.type !== 'END');
      const isInvalidEnd = itemThatWon.type === 'END' && hasActiveCards;
      const isFirstSpin = activeRules.length === 0; // Still relevant if players = 0
      const isInvalidModifier = isFirstSpin && itemThatWon.type === 'MODIFIER';

      if (isInvalidEnd || isInvalidModifier) {
        for (let i = 1; i < wheelItems.length; i++) {
          const nextIndex = (winningIndex + i) % wheelItems.length;
          const potentialWinner = wheelItems[nextIndex];
          const isPotentialWinnerValid = potentialWinner.type !== 'END' && (!isFirstSpin || potentialWinner.type !== 'MODIFIER');
          if (isPotentialWinnerValid) {
            itemThatWon = potentialWinner;
            actualWinningIndex = nextIndex;
            break;
          }
        }
      }
    }
    
    const processResult = (landedItem: WheelItem) => {
      setIsSpinning(false);
      
      if (landedItem.type === 'END') {
          playSound('end');
          setIsGameOver(true);
          return;
      }
      
      const isFlipModifier = landedItem.type === 'MODIFIER' && (landedItem.data as Modifier).type === 'FLIP';
      
      if (isFlipModifier) {
        playSound('modifier');
        setTimeout(() => playSound('flip'), 1200); 
      } else {
        playSound((landedItem.type.toLowerCase() as any) || 'end');
      }

      let evolution: WheelItem | null = null;
      if (landedItem.type === 'RULE') {
        let evolutionCard: Prompt | Modifier | undefined;
        if (evolutionDeck.length > 0) {
          evolutionCard = evolutionDeck[0];
          setEvolutionDeck(prevDeck => prevDeck.slice(1));
        } else {
          evolutionCard = gameData.modifiers.find(m => m.type === 'FLIP');
        }

        if (evolutionCard) {
          if ('text' in evolutionCard) {
            const prompt = evolutionCard as Prompt;
            evolution = {
              id: `prompt-evolved-${prompt.id}-${landedItem.id}`, type: 'PROMPT', label: 'Prompt', data: prompt,
              color: { segment: landedItem.color.segment, ...CARD_STYLES.PROMPT },
            };
          } else {
            const modifier = evolutionCard as Modifier;
            const modifierStyle = MODIFIER_CARD_COLORS[Math.floor(Math.random() * MODIFIER_CARD_COLORS.length)];
            evolution = {
              id: `modifier-evolved-${modifier.id}-${landedItem.id}`, type: 'MODIFIER', label: 'Modifier', data: modifier,
              color: { segment: landedItem.color.segment, labelBg: modifierStyle.bg, labelColor: modifierStyle.text },
            };
          }
        } else {
          evolution = {
            id: `used-${landedItem.id}`, type: 'END', label: 'END', data: { name: 'END', description: 'This slot has been used.' },
            color: { segment: CARD_STYLES.END.labelBg, ...CARD_STYLES.END }
          };
        }
      } else if (landedItem.type === 'PROMPT' || landedItem.type === 'MODIFIER') {
        evolution = {
            id: `used-${landedItem.id}`, type: 'END', label: 'END', data: { name: 'END', description: 'This slot has been used.' },
            color: { segment: CARD_STYLES.END.labelBg, ...CARD_STYLES.END }
        };
      }
      
      setResult({ landed: landedItem, evolution });
      setIsResultModalOpen(true);
    };
    
    if (actualWinningIndex !== winningIndex) {
        // Correct the wheel's final position visually
        const rotationDifference = (actualWinningIndex - winningIndex) * segmentAngle;
        const correctedRotation = finalRotation - rotationDifference;
        const nudgeDuration = 800;

        setSpinDuration(nudgeDuration); 
        setRotation(correctedRotation);

        setTimeout(() => processResult(itemThatWon), nudgeDuration);
    } else {
        processResult(itemThatWon);
    }
  }, [wheelItems, activeRules.length, gameData, evolutionDeck, playSound, stopMusic, players]);

  const handleSpinClick = useCallback(() => {
    if (isSpinning || wheelItems.length === 0) return;
    
    spinCountRef.current += 1;
    playMusic();
    resultProcessed.current = false;
    setIsSpinning(true);

    const revolutions = 5 + Math.random() * 5;
    const totalRevolutions = revolutions * 360;
    const randomExtraAngle = Math.random() * 360;
    
    const newRotation = rotation - totalRevolutions - randomExtraAngle;
    const duration = 5000 + Math.random() * 2000;
    setSpinDuration(duration);
    setRotation(newRotation);

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
  }, [isSpinning, wheelItems.length, rotation, handleSpinEnd, playSound, playMusic]);

  // This effect handles processing the result after the modal closes.
  // It also now handles triggering the buzzer toast.
  useEffect(() => {
    if (result && !isResultModalOpen && !resultProcessed.current) {
        resultProcessed.current = true; // Mark as processed

        let finalWheelItems: WheelItem[] = wheelItems;
        if (result.evolution) {
            finalWheelItems = wheelItems.map(item => item.id === result.landed.id ? result.evolution! : item);
            setWheelItems(finalWheelItems);
        }

        if (result.landed.type === 'RULE') {
            const ruleData = result.landed.data as Rule;
            const sessionRule = sessionRules.find(sr => sr.primary.id === ruleData.id || sr.flipped.id === ruleData.id);
            if (sessionRule && !activeRules.some(ar => ar.id === sessionRule.id)) {
                const ruleWithColor = { ...sessionRule, color: result.landed.color };
                setActiveRules(prev => [...prev, ruleWithColor]);
            }
        }
        
        const hasPlayableCards = finalWheelItems.some(item => item.type !== 'END');

        // --- BUZZER LOGIC ---
        // After a turn, there is a chance for the buzzer to go off.
        const buzzerRule = activeRules.find(r => (r.isFlipped ? r.flipped : r.primary).special === 'BUZZER');

        if (buzzerRule && hasPlayableCards && Math.random() < 0.33) {
            const delay = Math.random() * 2000 + 2000; // 2-4 second delay
            setTimeout(() => {
                if (isSpinningRef.current) return;
                playBuzzer(); // Start sound immediately when toast appears

                const stopAndClear = () => {
                    stopBuzzer();
                };

                const ruleData = buzzerRule.isFlipped ? buzzerRule.flipped : buzzerRule.primary;
                toast({
                    duration: buzzerCountdown * 1000,
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

        // --- END GAME LOGIC ---
        if (!hasPlayableCards) {
            playSound('end');
            setIsGameOver(true);
        }

        // IMPORTANT: Clear the result so this effect doesn't run again with the same data
        setResult(null);
    }
  }, [result, isResultModalOpen, activeRules, buzzerCountdown, sessionRules, toast, playBuzzer, stopBuzzer, wheelItems, playSound]);
  
  const handleFlipRule = useCallback((ruleId: number) => {
    const ruleToFlip = sessionRules.find(r => r.id === ruleId);
    if (!ruleToFlip) return;

    // This only affects the player's state (active rules), not the wheel itself.
    setSessionRules(prev => prev.map(r => r.id === ruleId ? { ...r, isFlipped: !r.isFlipped } : r));
    setActiveRules(prev => prev.map(ar => ar.id === ruleId ? { ...ar, isFlipped: !ar.isFlipped } : ar));
  }, [sessionRules]);

  const handleReset = useCallback(() => {
    if (tickTimeoutRef.current) {
        clearTimeout(tickTimeoutRef.current);
        tickTimeoutRef.current = null;
    }
    stopMusic();
    stopBuzzer();
    isFirstMusicPlay.current = true;
    onResetGame();
    setIsResetConfirmOpen(false);
  }, [onResetGame, stopBuzzer, stopMusic]);

  const handleWhistleClick = useCallback(() => {
    playSound('whistle');
    setIsRefereeModalOpen(true);
  }, [playSound]);

  const handleSoundModeToggle = () => {
    setSoundMode(current => {
      const nextMode = current === 'on' ? 'sfx' : current === 'sfx' ? 'off' : 'on';
      localStorage.setItem('sound_mode', nextMode);
      // If toggling music off, stop it immediately.
      if (nextMode !== 'on' && currentMusicRef.current && !currentMusicRef.current.paused) {
          stopMusic();
      }
      return nextMode;
    });
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (isResultModalOpen || isCheatSheetModalOpen || isRefereeModalOpen || isGameOver || isResetConfirmOpen) {
             if (event.key.toLowerCase() === 'escape') {
                setIsResultModalOpen(false);
                setIsCheatSheetModalOpen(false);
                setIsRefereeModalOpen(false);
                setIsGameOver(false);
                setIsResetConfirmOpen(false);
            }
            return;
        }

        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            return;
        }
        
        let digit: number | null = null;
        if (event.code.startsWith('Digit')) {
            digit = parseInt(event.code.substring(5));
        } else if (event.code.startsWith('Numpad')) {
            digit = parseInt(event.code.substring(6));
        }

        if (digit !== null && !isNaN(digit) && digit > 0 && digit <= players.length) {
            const playerIndex = digit - 1;
            event.preventDefault();
            const delta = event.shiftKey ? -1 : 1;
            onScoreChange(players[playerIndex].id, delta);
            return;
        }
        
        const key = event.key.toLowerCase();
        
        switch (key) {
            case ' ':
                event.preventDefault();
                handleSpinClick();
                break;
            case 'w':
                event.preventDefault();
                handleWhistleClick();
                break;
            case 'c':
                event.preventDefault();
                setIsCheatSheetModalOpen(true);
                break;
            case 'r':
                event.preventDefault();
                setIsResetConfirmOpen(true);
                break;
        }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
        document.removeEventListener('keydown', handleKeyDown);
    };
  }, [
      players, 
      onScoreChange, 
      handleSpinClick, 
      handleWhistleClick,
      isResultModalOpen, 
      isCheatSheetModalOpen, 
      isRefereeModalOpen, 
      isGameOver,
      isResetConfirmOpen
  ]);

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
    <div className="flex flex-col lg:flex-row min-h-screen lg:p-8 lg:gap-8">
      
      {/* Wheel Column */}
      <div className="lg:w-2/3 flex-1 lg:flex-auto flex items-center justify-center relative pt-16 lg:pt-0">
        <div 
          className="relative w-full max-w-sm lg:max-w-[calc(100%-16rem)] mx-auto cursor-grab active:cursor-grabbing touch-none select-none"
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

      {/* Scoreboard & Controls Column */}
      <div className="flex-shrink-0 lg:w-[380px] flex flex-col justify-start lg:justify-center relative z-10 mt-[-6rem] lg:mt-0">
        <div className="w-full max-w-sm mx-auto flex flex-col gap-4 p-4 lg:p-0">
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
                <Megaphone className="mr-2 h-5 w-5" />
                WHISTLE!
              </Button>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Button variant="ghost" onClick={() => setIsResetConfirmOpen(true)} className="self-center">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  New Game
              </Button>
              <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={handleSoundModeToggle}>
                            {soundMode === 'on' && <Volume2 className="h-5 w-5" />}
                            {soundMode === 'sfx' && <MdMusicOff className="h-5 w-5" />}
                            {soundMode === 'off' && <VolumeX className="h-5 w-5" />}
                            <span className="sr-only">Toggle Sound</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent align="center">
                         <p>Sound Mode: {soundMode === 'on' ? 'All On' : soundMode === 'sfx' ? 'SFX Only' : 'All Off'}</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                            <Keyboard className="h-5 w-5" />
                            <span className="sr-only">Show Keyboard Shortcuts</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent align="center" className="p-4 w-64">
                        <h4 className="font-bold mb-2 text-center">Keyboard Shortcuts</h4>
                        <ul className="space-y-1 text-sm">
                            <li className="flex justify-between"><span>Add 1 pt for Player</span> <span className="font-mono bg-muted px-1.5 py-0.5 rounded">1-8</span></li>
                            <li className="flex justify-between"><span>Remove 1 pt for Player</span> <span className="font-mono bg-muted px-1.5 py-0.5 rounded">Shift + 1-8</span></li>
                            <li className="flex justify-between"><span>Spin Wheel</span> <span className="font-mono bg-muted px-1.5 py-0.5 rounded">Space</span></li>
                            <li className="flex justify-between"><span>Flip Sheet</span> <span className="font-mono bg-muted px-1.5 py-0.5 rounded">C</span></li>
                            <li className="flex justify-between"><span>Referee Whistle</span> <span className="font-mono bg-muted px-1.5 py-0.5 rounded">W</span></li>
                            <li className="flex justify-between"><span>New Game</span> <span className="font-mono bg-muted px-1.5 py-0.5 rounded">R</span></li>
                            <li className="flex justify-between"><span>Close Window</span> <span className="font-mono bg-muted px-1.5 py-0.5 rounded">Esc</span></li>
                        </ul>
                    </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
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
      <AlertDialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Start a new game?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will end the current game and reset all scores. This cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset}>Yes, New Game</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
