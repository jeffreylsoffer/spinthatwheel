
"use client";

import { useState } from 'react';
import CardDeckWheel from '@/components/card-deck-wheel';
import StartScreen from '@/components/start-screen';

export interface Player {
  id: number;
  name: string;
  score: number;
}

export default function Home() {
  const [gameState, setGameState] = useState<'start' | 'playing'>('start');
  const [players, setPlayers] = useState<Player[]>([]);

  const handleStartGame = (playerCount: number) => {
    const newPlayers = Array.from({ length: playerCount }, (_, i) => ({
      id: i + 1,
      name: `Player ${i + 1}`,
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
  
  const handleNameChange = (playerId: number, newName: string) => {
    setPlayers(currentPlayers =>
      currentPlayers.map(p =>
        p.id === playerId ? { ...p, name: newName } : p
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
