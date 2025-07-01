"use client";

import { useState } from 'react';
import CardDeckWheel from '@/components/card-deck-wheel';
import StartScreen from '@/components/start-screen';

export interface Player {
  id: number;
  score: number;
}

export default function Home() {
  const [gameState, setGameState] = useState<'start' | 'playing'>('start');
  const [players, setPlayers] = useState<Player[]>([]);

  const handleStartGame = (playerCount: number) => {
    const newPlayers = Array.from({ length: playerCount }, (_, i) => ({
      id: i + 1,
      score: 0,
    }));
    setPlayers(newPlayers);
    setGameState('playing');
  };

  const handleScoreChange = (playerId: number, delta: number) => {
    setPlayers(currentPlayers =>
      currentPlayers.map(p =>
        p.id === playerId ? { ...p, score: p.score + delta } : p
      )
    );
  };
  
  const handleResetGame = () => {
    setGameState('start');
    setPlayers([]);
  };

  if (gameState === 'start') {
    return <StartScreen onStartGame={handleStartGame} />;
  }

  return (
    <main className="overflow-hidden">
      <CardDeckWheel 
        players={players} 
        onScoreChange={handleScoreChange}
        onResetGame={handleResetGame}
      />
    </main>
  );
}
