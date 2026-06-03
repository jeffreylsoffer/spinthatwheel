
"use client";

import { useState, useCallback, useEffect } from 'react';
import CardDeckWheel from '@/components/card-deck-wheel';
import StartScreen from '@/components/start-screen';
import { useToast } from '@/hooks/use-toast';
import { ruleGroups, prompts, modifiers, defaultBuzzerCountdown, defaultGoldenRule } from '@/lib/data';
import { smartQuotes } from '@/lib/utils';
import type { RuleGroup, Prompt, Modifier } from '@/lib/types';

export interface Player {
  id: number;
  name: string;
  score: number;
}

interface GameData {
  ruleGroups: RuleGroup[];
  prompts: Prompt[];
  modifiers: Modifier[];
  buzzerCountdown: number;
  goldenRule: RuleGroup | null;
}

export default function Home() {
  const [gameState, setGameState] = useState<'start' | 'playing'>('start');
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const { toast } = useToast();

  const loadGameData = useCallback(async () => {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get('share');

    let finalData: GameData = {
      ruleGroups: ruleGroups,
      prompts: prompts,
      modifiers: modifiers,
      buzzerCountdown: defaultBuzzerCountdown,
      goldenRule: null,
    };

    if (shareId) {
      try {
        const response = await fetch(`/api/shares/${shareId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch shared data: ${response.statusText}`);
        }
        const data = await response.json();

        // Overwrite defaults with shared data
        finalData.ruleGroups = data.rules || ruleGroups;
        finalData.prompts = data.prompts || prompts;
        finalData.modifiers = data.modifiers || modifiers;
        finalData.buzzerCountdown = data.buzzerCountdown || defaultBuzzerCountdown;
        
        // Save the loaded data to localStorage for persistence
        localStorage.setItem('cms_rules', JSON.stringify(finalData.ruleGroups));
        localStorage.setItem('cms_prompts', JSON.stringify(finalData.prompts));
        localStorage.setItem('cms_modifiers', JSON.stringify(finalData.modifiers));
        localStorage.setItem('cms_is_buzzer_enabled', JSON.stringify(data.isBuzzerEnabled ?? true));
        localStorage.setItem('cms_buzzer_countdown', JSON.stringify(finalData.buzzerCountdown));
        localStorage.setItem('cms_prompt_scoring', JSON.stringify(data.promptScoring ?? 'flat'));
        localStorage.setItem('cms_wheel_rule_count', JSON.stringify(data.wheelRuleCount ?? 0));
        // Golden Rule is newer than most links — legacy shares (no field) default to OFF.
        localStorage.setItem('cms_is_golden_rule_enabled', JSON.stringify(data.isGoldenRuleEnabled ?? false));
        if (data.goldenRule) localStorage.setItem('cms_golden_rule', JSON.stringify(data.goldenRule));

        toast({
          title: "Shared Content Loaded!",
          description: "A new set of game cards has been loaded from the link.",
        });
        
        // Clean the URL
        window.history.replaceState({}, document.title, "/");

      } catch (error) {
        console.error("Failed to parse share data:", error);
        toast({
          variant: "destructive",
          title: "Failed to Load Shared Content",
          description: "The provided share link was invalid or corrupted. Loading default game.",
        });
        // If fetching fails, fall back to localStorage or defaults
        const savedRules = localStorage.getItem('cms_rules');
        const savedPrompts = localStorage.getItem('cms_prompts');
        const savedModifiers = localStorage.getItem('cms_modifiers');
        const savedBuzzerCountdown = localStorage.getItem('cms_buzzer_countdown');

        finalData.ruleGroups = savedRules ? JSON.parse(savedRules) : ruleGroups;
        finalData.prompts = savedPrompts ? JSON.parse(savedPrompts) : prompts;
        finalData.modifiers = savedModifiers ? JSON.parse(savedModifiers) : modifiers;
        finalData.buzzerCountdown = savedBuzzerCountdown ? JSON.parse(savedBuzzerCountdown) : defaultBuzzerCountdown;
      }
    } else {
      // No shareId, load from localStorage or use defaults
      const savedRules = localStorage.getItem('cms_rules');
      const savedPrompts = localStorage.getItem('cms_prompts');
      const savedModifiers = localStorage.getItem('cms_modifiers');
      const savedBuzzerCountdown = localStorage.getItem('cms_buzzer_countdown');

      finalData.ruleGroups = savedRules ? JSON.parse(savedRules) : ruleGroups;
      finalData.prompts = savedPrompts ? JSON.parse(savedPrompts) : prompts;
      finalData.modifiers = savedModifiers ? JSON.parse(savedModifiers) : modifiers;
      finalData.buzzerCountdown = savedBuzzerCountdown ? JSON.parse(savedBuzzerCountdown) : defaultBuzzerCountdown;
    }
    // --- Golden Rule ---
    const isGoldenRuleEnabled = JSON.parse(localStorage.getItem('cms_is_golden_rule_enabled') || 'true');
    if (isGoldenRuleEnabled) {
      const savedGoldenRule = localStorage.getItem('cms_golden_rule');
      finalData.goldenRule = savedGoldenRule ? JSON.parse(savedGoldenRule) : defaultGoldenRule;
    }

    // Curl straight quotes/apostrophes across all dynamic game text.
    const eRule = (r: any) => r ? { ...r, name: smartQuotes(r.name), description: smartQuotes(r.description) } : r;
    const eGroup = (g: any) => g ? { ...g, name: smartQuotes(g.name), primary_rule: eRule(g.primary_rule), flipped_rule: eRule(g.flipped_rule) } : g;
    finalData = {
      ...finalData,
      prompts: finalData.prompts.map((p: any) => ({ ...p, text: smartQuotes(p.text) })),
      ruleGroups: finalData.ruleGroups.map(eGroup),
      modifiers: finalData.modifiers.map((m: any) => ({ ...m, name: smartQuotes(m.name), description: smartQuotes(m.description) })),
      goldenRule: eGroup(finalData.goldenRule),
    };

    setGameData(finalData);
  }, [toast]);

  useEffect(() => {
    loadGameData();
  }, [loadGameData]);


  const handleStartGame = useCallback((playerCount: number) => {
    const newPlayers = Array.from({ length: playerCount }, (_, i) => ({
      id: i + 1,
      name: `Player ${i + 1}`,
      score: 0,
    }));
    setPlayers(newPlayers);
    setGameState('playing');
  }, []);

  const handleScoreChange = useCallback((playerId: number, delta: number) => {
    setPlayers(currentPlayers =>
      currentPlayers.map(p =>
        p.id === playerId ? { ...p, score: p.score + delta } : p
      )
    );
  }, []);
  
  const handleNameChange = useCallback((playerId: number, newName: string) => {
    setPlayers(currentPlayers =>
      currentPlayers.map(p =>
        p.id === playerId ? { ...p, name: newName } : p
      )
    );
  }, []);

  const handleResetGame = useCallback(() => {
    setGameState('start');
    setPlayers([]);
  }, []);

  if (gameState === 'start') {
    return <StartScreen onStartGame={handleStartGame} />;
  }

  if (!gameData) {
    // You can return a loading spinner here while gameData is being fetched
    return <div>Loading Game...</div>;
  }

  return (
    <main>
      <CardDeckWheel 
        players={players} 
        gameData={gameData}
        onScoreChange={handleScoreChange}
        onNameChange={handleNameChange}
        onResetGame={handleResetGame}
      />
    </main>
  );
}
