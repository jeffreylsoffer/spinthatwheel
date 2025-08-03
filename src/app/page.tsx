
"use client";

import { useState, useCallback, useEffect } from 'react';
import CardDeckWheel from '@/components/card-deck-wheel';
import StartScreen from '@/components/start-screen';
import { useToast } from '@/hooks/use-toast';
import { ruleGroups, prompts, modifiers, defaultBuzzerCountdown } from '@/lib/data';

export interface Player {
  id: number;
  name: string;
  score: number;
}

export default function Home() {
  const [gameState, setGameState] = useState<'start' | 'playing'>('start');
  const [players, setPlayers] = useState<Player[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareData = params.get('share');

    if (shareData) {
      try {
        const decodedString = atob(decodeURIComponent(shareData));
        const data = JSON.parse(decodedString);

        if (data.rules && data.prompts && data.modifiers) {
          localStorage.setItem('cms_rules', JSON.stringify(data.rules));
          localStorage.setItem('cms_prompts', JSON.stringify(data.prompts));
          localStorage.setItem('cms_modifiers', JSON.stringify(data.modifiers));
          localStorage.setItem('cms_is_buzzer_enabled', JSON.stringify(data.isBuzzerEnabled ?? true));
          localStorage.setItem('cms_buzzer_countdown', JSON.stringify(data.buzzerCountdown ?? defaultBuzzerCountdown));

          toast({
            title: "Shared Content Loaded!",
            description: "A new set of game cards has been loaded from the link.",
          });
          
          // Clean the URL
          window.history.replaceState({}, document.title, "/");
        }
      } catch (error) {
        console.error("Failed to parse share data:", error);
        toast({
          variant: "destructive",
          title: "Failed to Load Shared Content",
          description: "The provided share link was invalid or corrupted.",
        });
      }
    }
  }, [toast]);


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

  return (
    <main>
      <CardDeckWheel 
        players={players} 
        onScoreChange={handleScoreChange}
        onNameChange={handleNameChange}
        onResetGame={handleResetGame}
      />
    </main>
  );
}
