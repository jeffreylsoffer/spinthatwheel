
"use client";

import { useState, useCallback, useEffect } from 'react';
import CardDeckWheel from '@/components/card-deck-wheel';
import StartScreen from '@/components/start-screen';
import { useToast } from '@/hooks/use-toast';
import { ruleGroups, prompts, modifiers, defaultBuzzerCountdown } from '@/lib/data';
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
