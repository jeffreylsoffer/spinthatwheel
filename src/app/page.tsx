"use client";

import { useState } from 'react';
import CardDeckWheel from '@/components/card-deck-wheel';
import StartScreen from '@/components/start-screen';

export default function Home() {
  const [isGameStarted, setIsGameStarted] = useState(false);

  if (!isGameStarted) {
    return <StartScreen onStartGame={() => setIsGameStarted(true)} />;
  }

  return (
    <main className="overflow-hidden">
      <CardDeckWheel />
    </main>
  );
}
