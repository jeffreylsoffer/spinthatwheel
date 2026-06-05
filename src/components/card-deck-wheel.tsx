
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Wheel from './wheel';
import ResultModal from './result-modal';
import CheatSheetModal from './cheatsheet-modal';
import GameOverModal from './game-over-modal';
import Scoreboard from './scoreboard';
import { Button } from '@/components/ui/button';
import { createSessionDeck, populateWheel, CARD_STYLES, MODIFIER_CARD_COLORS, resolvePromptText } from '@/lib/game-logic';
import type { SessionRule, WheelItem, Rule, WheelItemType, Prompt, Modifier, RuleGroup } from '@/lib/types';
import type { Player } from '@/app/page';
import { RefreshCw, BookOpen, Megaphone, Check, Keyboard, Volume2, VolumeX } from 'lucide-react';
import { MdMusicOff } from "react-icons/md";
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import WheelPointer from './wheel-pointer';
import GoldenRuleModal from './golden-rule-modal';
import SpinLights from './spin-lights';
import GoldenRuleCard from './golden-rule-card';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface CardDeckWheelProps {
  players: Player[];
  gameData: {
    ruleGroups: RuleGroup[];
    prompts: Prompt[];
    modifiers: Modifier[];
    buzzerCountdown: number;
    goldenRule: RuleGroup | null;
  };
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

const CardDeckWheel = ({ players, gameData, onScoreChange, onNameChange, onResetGame }: CardDeckWheelProps) => {
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
  const [buzzerCountdown, setBuzzerCountdown] = useState(gameData.buzzerCountdown);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [evolutionDeck, setEvolutionDeck] = useState<(Prompt | Modifier)[]>([]);
  const [soundMode, setSoundMode] = useState<'on' | 'sfx' | 'off'>('on');
  const [goldenRule, setGoldenRule] = useState<SessionRule | null>(null);
  const [isGoldenRuleModalOpen, setIsGoldenRuleModalOpen] = useState(false);
  const [promptScoring, setPromptScoring] = useState<'flat' | 'perRule'>('perRule');
  const [mobileView, setMobileView] = useState<'scoreboard' | 'golden'>('scoreboard');

  const isSpinningRef = useRef(isSpinning);
  isSpinningRef.current = isSpinning;

  const spinCountRef = useRef(0);
  const { toast } = useToast();
  const dragStartRef = useRef<{ y: number | null, time: number | null }>({ y: null, time: null });
  const tickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tickRafRef = useRef<number | null>(null);
  const flapRef = useRef<SVGGElement>(null);
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
    const savedScoring = localStorage.getItem('cms_prompt_scoring');
    if (savedScoring) setPromptScoring(JSON.parse(savedScoring));
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
        audio.play().catch(e => { if (e?.name !== 'AbortError') console.error(`Could not play sound: ${sound}.mp3.`, e); });
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

  const initializeGame = useCallback(() => {
    const { ruleGroups, prompts, modifiers } = gameData;
    const isBuzzerEnabled = JSON.parse(localStorage.getItem('cms_is_buzzer_enabled') || 'true');
    let finalRuleGroups = ruleGroups;

    if (!isBuzzerEnabled) {
      finalRuleGroups = ruleGroups.filter((rg: any) => rg.primary_rule.special !== 'BUZZER');
    }

    spinCountRef.current = 0;
    // Randomly include only N rule groups per game (0 or unset = all). Legacy shares get 0.
    // The special Buzzer rule is always kept (when enabled) so the buzzer can still fire.
    const ruleCount = JSON.parse(localStorage.getItem('cms_wheel_rule_count') || '18');
    if (ruleCount > 0 && ruleCount < finalRuleGroups.length) {
      const buzzer = finalRuleGroups.filter((rg: any) => rg.primary_rule.special === 'BUZZER');
      const regular = finalRuleGroups.filter((rg: any) => rg.primary_rule.special !== 'BUZZER');
      const picked = [...regular].sort(() => Math.random() - 0.5).slice(0, Math.max(0, ruleCount - buzzer.length));
      finalRuleGroups = [...buzzer, ...picked];
    }
    const rules = createSessionDeck(finalRuleGroups);
    const items = populateWheel(rules);

    // --- Golden Rule Initialization ---
    if (gameData.goldenRule) {
      setGoldenRule({
        id: gameData.goldenRule.id,
        groupName: gameData.goldenRule.name,
        primary: gameData.goldenRule.primary_rule,
        flipped: gameData.goldenRule.flipped_rule,
        isFlipped: false,
      });
    } else {
      setGoldenRule(null);
    }
    
    // --- Create and shuffle a deck of evolution cards (new logic) ---
    const numRules = finalRuleGroups.length;

    // 1. Generate prompts (roughly 50% of the deck)
    const numPromptsToGenerate = Math.floor(numRules / 2);
    const generatedPrompts: Prompt[] = [];
    if (prompts.length > 0) {
      const availablePrompts = shuffle([...prompts]);
      for (let i = 0; i < numPromptsToGenerate; i++) {
        const p = availablePrompts[i % availablePrompts.length];
        generatedPrompts.push({ ...p, text: resolvePromptText(p.text) });
      }
    }

    // 2. Generate modifiers (the other 50%)
    const numModifiersToGenerate = numRules - numPromptsToGenerate;
    const generatedModifiers: Modifier[] = [];
    if (modifiers.length > 0) {
      const availableModifiers = [...modifiers];
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
        const availableModifiersShuffled = shuffle([...modifiers]);
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
    setBuzzerCountdown(gameData.buzzerCountdown);
  }, [gameData]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);
  
  const handleSpinEnd = useCallback((finalRotation: number) => {
    stopMusic();
    if (tickRafRef.current) { cancelAnimationFrame(tickRafRef.current); tickRafRef.current = null; }
    if (tickTimeoutRef.current) {
      clearTimeout(tickTimeoutRef.current);
      tickTimeoutRef.current = null;
    }

    const segmentAngle = 360 / wheelItems.length;
    const normalizedAngle = ((-finalRotation) % 360 + 360) % 360;
    const effectiveAngle = (normalizedAngle + (segmentAngle / 2)) % 360;
    const winningIndex = Math.floor(effectiveAngle / segmentAngle);
    const itemThatWon = wheelItems[winningIndex];
    
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
    
    processResult(itemThatWon);
  }, [wheelItems, activeRules.length, gameData, evolutionDeck, playSound, stopMusic, players]);

  const handleSpinClick = useCallback(() => {
    if (isSpinning || wheelItems.length === 0) return;
    
    spinCountRef.current += 1;
    playMusic();
    resultProcessed.current = false;
    setIsSpinning(true);

    const segCount = wheelItems.length;
    const segAngle = 360 / segCount;

    // --- Pre-pick a valid target ---
    const mustBeRule = spinCountRef.current <= players.length && wheelItems.some(i => i.type === 'RULE');
    let validIndices: number[];
    if (mustBeRule) {
      validIndices = wheelItems.map((item, i) => item.type === 'RULE' ? i : -1).filter(i => i !== -1);
    } else {
      const hasActiveCards = wheelItems.some(item => item.type !== 'END');
      const isFirstSpin = activeRules.length === 0;
      validIndices = wheelItems.map((item, i) => {
        if (item.type === 'END' && hasActiveCards) return -1;
        if (isFirstSpin && item.type === 'MODIFIER') return -1;
        return i;
      }).filter(i => i !== -1);
    }
    if (validIndices.length === 0) validIndices = [0]; // fallback

    const targetIndex = validIndices[Math.floor(Math.random() * validIndices.length)];

    // Reverse the handleSpinEnd formula to find the rotation that lands on targetIndex:
    //   normalizedAngle = ((-finalRotation) % 360 + 360) % 360
    //   effectiveAngle = (normalizedAngle + segAngle/2) % 360
    //   winningIndex = Math.floor(effectiveAngle / segAngle)
    // So we need normalizedAngle such that winningIndex == targetIndex.
    // The center of the winning zone: normalizedAngle = targetIndex * segAngle
    // Add jitter within safe bounds (avoid crossing into adjacent segment)
    const jitter = (Math.random() - 0.5) * segAngle * 0.5;
    const desiredNormalizedAngle = ((targetIndex * segAngle + jitter) % 360 + 360) % 360;
    
    // We need: ((-newRotation) % 360 + 360) % 360 == desiredNormalizedAngle
    // newRotation = rotation - delta, where delta > 0 (spinning forward)
    // (-(rotation - delta)) % 360 = (-rotation + delta) % 360 = desiredNormalizedAngle (mod 360)
    // So delta % 360 = (desiredNormalizedAngle + rotation) % 360 ... but modular arithmetic with negatives is tricky.
    // Simpler: compute how much total negative rotation we need from zero:
    // We want (-newRotation) % 360 == desiredNormalizedAngle
    // So -newRotation = desiredNormalizedAngle + k*360 for some large k
    // newRotation = -(desiredNormalizedAngle + k*360)
    // We want newRotation < rotation (wheel keeps spinning in same direction) and at least 5 full revs from current.
    const minDelta = 5 * 360;
    const maxDelta = 10 * 360;
    // delta = rotation - newRotation = rotation + desiredNormalizedAngle + k*360
    // We need delta >= minDelta, so k >= (minDelta - rotation - desiredNormalizedAngle) / 360
    const baseTarget = -(desiredNormalizedAngle); // newRotation without extra revolutions
    const rawDelta = rotation - baseTarget;
    const revsNeeded = Math.ceil((minDelta - rawDelta) / 360);
    const extraRevs = revsNeeded + Math.floor(Math.random() * 5);
    const newRotation = baseTarget - extraRevs * 360;
    const delta = rotation - newRotation;
    
    const duration = 5000 + Math.random() * 2000;
    setSpinDuration(duration);
    setRotation(newRotation);

    if (tickRafRef.current) cancelAnimationFrame(tickRafRef.current);
    // Compute the exact time each segment boundary (peg) passes the pointer,
    // using the spin's easing — so we get one tick + flap flick per peg.
    const bez = (a: number, b: number, s: number) => { const mt = 1 - s; return 3 * mt * mt * s * a + 3 * mt * s * s * b + s * s * s; };
    const bezX = (s: number) => bez(0.25, 0.5, s); // cubic-bezier(0.25, 1, 0.5, 1)
    const bezY = (s: number) => bez(1, 1, s);
    const tickTimes: number[] = [];
    const pegCount = Math.floor(delta / segAngle);
    for (let k = 1; k <= pegCount; k++) {
      const yv = (k * segAngle) / delta; // output (rotation) fraction, 0..1
      let lo = 0, hi = 1;
      for (let i = 0; i < 22; i++) { const mid = (lo + hi) / 2; if (bezY(mid) < yv) lo = mid; else hi = mid; }
      tickTimes.push(bezX((lo + hi) / 2) * duration);
    }
    let fired = 0;
    const startTs = performance.now();
    const flick = () => flapRef.current?.animate(
      [{ transform: 'rotate(0deg)' }, { transform: 'rotate(26deg)', offset: 0.3 }, { transform: 'rotate(0deg)' }],
      { duration: 220, easing: 'cubic-bezier(0.2, 1.5, 0.5, 1)' }
    );
    const tickLoop = () => {
      const el = performance.now() - startTs;
      while (fired < tickTimes.length && tickTimes[fired] <= el) { playSound('tick'); flick(); fired++; }
      if (el < duration) tickRafRef.current = requestAnimationFrame(tickLoop);
      else tickRafRef.current = null;
    };
    tickRafRef.current = requestAnimationFrame(tickLoop);

    setTimeout(() => {
        handleSpinEnd(newRotation);
    }, duration);
  }, [isSpinning, wheelItems, rotation, handleSpinEnd, playSound, playMusic, players, activeRules.length]);

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

        // --- AUSTRALIA: flip is now triggered by a button in the result modal ---
        
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

  const handleFlipGoldenRule = useCallback(() => {
    setGoldenRule(prev => prev ? { ...prev, isFlipped: !prev.isFlipped } : null);
  }, []);

  const handleAustralia = useCallback(() => {
    // Close the result modal, open the flip sheet, then cascade-flip everything.
    setIsResultModalOpen(false);
    setTimeout(() => {
      setIsCheatSheetModalOpen(true);
      setTimeout(() => {
        setGoldenRule(prev => prev ? { ...prev, isFlipped: !prev.isFlipped } : null);
      }, 400);
      activeRules.forEach((r, i) => {
        setTimeout(() => {
          setActiveRules(prev => prev.map(ar => ar.id === r.id ? { ...ar, isFlipped: !ar.isFlipped } : ar));
          setSessionRules(prev => prev.map(sr => sr.id === r.id ? { ...sr, isFlipped: !sr.isFlipped } : sr));
        }, 600 + i * 180);
      });
    }, 200);
  }, [activeRules]);

  const handleSwapWithGoldenRule = useCallback((ruleId: number) => {
    if (!goldenRule) return;
    const playerRule = activeRules.find(r => r.id === ruleId);
    if (!playerRule) return;

    // The player's rule becomes the new golden rule
    setGoldenRule({ ...playerRule, isFlipped: false });
    // The old golden rule becomes the player's personal rule
    const newPersonalRule: SessionRule = {
      ...goldenRule,
      isFlipped: false,
      color: playerRule.color,
    };
    setActiveRules(prev => prev.map(ar => ar.id === ruleId ? newPersonalRule : ar));
    setSessionRules(prev => prev.map(sr => sr.id === ruleId ? newPersonalRule : sr));
  }, [goldenRule, activeRules]);

  const handleReset = useCallback(() => {
    if (tickRafRef.current) { cancelAnimationFrame(tickRafRef.current); tickRafRef.current = null; }
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
    <div className="relative flex flex-col lg:flex-row min-h-screen lg:h-screen lg:overflow-hidden lg:p-8 lg:gap-8 lg:justify-center">
      <SpinLights active={isSpinning} />
      
      {/* Wheel Column */}
      <div
        className="flex-1 lg:flex-none lg:w-[clamp(420px,44vw,600px)] flex items-center justify-center lg:justify-start relative pt-16 lg:pt-0 overflow-hidden"
        style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 13%, #000 87%, transparent 100%)', maskImage: 'linear-gradient(to bottom, transparent 0%, #000 13%, #000 87%, transparent 100%)' }}
      >
        <div 
          className="relative w-[calc(100%-4rem)] max-w-[20rem] mx-auto -translate-x-8 lg:max-w-none lg:w-[calc(100%-5rem)] lg:mx-0 lg:translate-x-0 cursor-grab active:cursor-grabbing touch-none select-none"
          style={{ height: `${segmentHeight}px` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          <Wheel items={wheelItems} rotation={rotation} isSpinning={isSpinning} spinDuration={spinDuration} segmentHeight={segmentHeight} />
          <WheelPointer ref={flapRef} />
        </div>
        {/* graduated out-of-focus + fade to background at the top/bottom edges */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[22%] z-10 lg:backdrop-blur-[2px]"
          style={{ background: 'linear-gradient(to bottom, hsl(var(--background)), transparent)', WebkitMaskImage: 'linear-gradient(to top, transparent, #000)', maskImage: 'linear-gradient(to top, transparent, #000)' }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[22%] z-10 lg:backdrop-blur-[2px]"
          style={{ background: 'linear-gradient(to top, hsl(var(--background)), transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000)', maskImage: 'linear-gradient(to bottom, transparent, #000)' }}
        />
      </div>

      {/* Scoreboard & Controls Column */}
      <div className="flex-shrink-0 lg:w-[420px] flex flex-col justify-start lg:justify-center relative z-10 lg:mt-0">
        <div className="w-full max-w-sm mx-auto flex flex-col gap-3 lg:gap-5 p-3 lg:p-0">
            {goldenRule && (
              <div className="hidden lg:block">
                <GoldenRuleCard
                  name={goldenRule.isFlipped ? goldenRule.flipped.name : goldenRule.primary.name}
                  bg={goldenRule.isFlipped ? '#000000' : goldenRule.color?.labelBg}
                  textColor={goldenRule.isFlipped ? (goldenRule.color?.labelBg || '#e8835f') : goldenRule.color?.labelColor}
                  onClick={() => setIsGoldenRuleModalOpen(true)}
                />
              </div>
            )}
            <Scoreboard
              players={players}
              onScoreChange={onScoreChange}
              onNameChange={onNameChange}
              mobileView={mobileView}
              onMobileViewChange={setMobileView}
              goldenRuleCard={goldenRule ? (
                <button
                  onClick={() => setIsGoldenRuleModalOpen(true)}
                  className="relative w-full rounded-xl overflow-hidden p-4 flex items-center justify-center shadow-lg ring-1 ring-amber-200/50 active:scale-[0.99] transition"
                  style={{ backgroundImage: 'url(/glitter.webp)', backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                  <span className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #f6d77c, #b8860b)', mixBlendMode: 'color' }} />
                  <div
                    className="relative aspect-video w-[70%] rounded-2xl border-[8px] border-black flex items-center justify-center p-3 text-center"
                    style={{
                      backgroundColor: goldenRule.isFlipped ? '#111827' : (goldenRule.color?.labelBg || '#CCAA4F'),
                      color: goldenRule.isFlipped ? '#e8835f' : (goldenRule.color?.labelColor || '#1F2937'),
                    }}
                  >
                    <span className="font-card text-2xl uppercase leading-none break-words">
                      {goldenRule.isFlipped ? goldenRule.flipped.name : goldenRule.primary.name}
                    </span>
                  </div>
                </button>
              ) : undefined}
            />
             <div className="grid grid-cols-2 gap-3">
               <Button 
                variant="outline"
                size="lg"
                onClick={() => setIsCheatSheetModalOpen(true)}
                className="w-full h-12 rounded-xl border-white/15 bg-white/5 hover:bg-white/10 active:scale-[0.98] transition shadow-lg shadow-black/30"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Flip Sheet
              </Button>
              <Button 
                variant="destructive"
                size="lg"
                onClick={handleWhistleClick}
                className="w-full h-12 rounded-xl font-headline tracking-wider text-lg bg-gradient-to-b from-[#58b3b8] to-[#3f9298] hover:from-[#62bcc1] hover:to-[#368a90] active:scale-[0.98] transition shadow-lg shadow-[#3f9298]/40"
              >
                <Megaphone className="mr-2 h-5 w-5" />
                WHISTLE!
              </Button>
            </div>
            <div className="flex items-center justify-center gap-1 pt-1 border-t border-white/10 mt-1">
              <Button variant="ghost" onClick={() => setIsResetConfirmOpen(true)} className="self-center text-muted-foreground hover:text-foreground rounded-lg">
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
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                            <Keyboard className="h-5 w-5" />
                            <span className="sr-only">Show Keyboard Shortcuts</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle className="text-center">Keyboard Shortcuts</DialogTitle>
                        </DialogHeader>
                        <ul className="space-y-1 text-sm">
                            <li className="flex justify-between"><span>Add 1 pt for Player</span> <span className="font-mono bg-muted px-1.5 py-0.5 rounded">1-8</span></li>
                            <li className="flex justify-between"><span>Remove 1 pt for Player</span> <span className="font-mono bg-muted px-1.5 py-0.5 rounded">Shift + 1-8</span></li>
                            <li className="flex justify-between"><span>Spin Wheel</span> <span className="font-mono bg-muted px-1.5 py-0.5 rounded">Space</span></li>
                            <li className="flex justify-between"><span>Flip Sheet</span> <span className="font-mono bg-muted px-1.5 py-0.5 rounded">C</span></li>
                            <li className="flex justify-between"><span>Referee Whistle</span> <span className="font-mono bg-muted px-1.5 py-0.5 rounded">W</span></li>
                            <li className="flex justify-between"><span>New Game</span> <span className="font-mono bg-muted px-1.5 py-0.5 rounded">R</span></li>
                            <li className="flex justify-between"><span>Close Window</span> <span className="font-mono bg-muted px-1.5 py-0.5 rounded">Esc</span></li>
                        </ul>
                    </DialogContent>
                </Dialog>
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
        onAustralia={handleAustralia}
        promptScoring={promptScoring}
      />
      <CheatSheetModal 
        isOpen={isCheatSheetModalOpen} 
        onOpenChange={setIsCheatSheetModalOpen}
        rules={activeRules}
        onFlipRule={handleFlipRule}
        goldenRule={goldenRule}
        onFlipGoldenRule={handleFlipGoldenRule}
      />
      <GoldenRuleModal
        isOpen={isGoldenRuleModalOpen}
        onOpenChange={setIsGoldenRuleModalOpen}
        goldenRule={goldenRule}
        activeRules={activeRules}
        onSwapWithGoldenRule={handleSwapWithGoldenRule}
        onFlipGoldenRule={handleFlipGoldenRule}
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
