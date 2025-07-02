
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Settings, Plus, Minus } from 'lucide-react';

export default function StartScreen({ onStartGame }: { onStartGame: (playerCount: number) => void }) {
  const [playerCount, setPlayerCount] = useState(3);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-12 gap-8">
      
      <div className="text-center">
        <h1 className="font-headline text-5xl lg:text-7xl tracking-wider">SPIN THAT WHEEL</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Based on <a href="https://www.dropout.tv" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Dropout's</a> <i>Game Changer</i> episode <a href="https://www.dropout.tv/videos/rulette" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">"Rulette"</a>.
        </p>
      </div>
      
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-x-12 gap-y-8">
        <div>
          <h3 className="font-headline text-3xl text-foreground">What You'll Need</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
            <li><span className="font-bold text-foreground">Sticky Notes:</span> When a player gets a rule, write it on a sticky note and put it on their chest. A dedicated person can do this, or players can write their own.</li>
            <li><span className="font-bold text-foreground">A Referee:</span> To keep score and call out players who don't follow their rules.</li>
          </ul>
        </div>
        <div>
          <h3 className="font-headline text-3xl text-foreground">How to Score</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
            <li>Completing a <span className="font-bold text-foreground">PROMPT</span> successfully earns you <span className="font-bold text-foreground">+2 points</span> AND you get to shred one of your active rules. Failing a prompt costs you <span className="font-bold text-foreground">-2 points</span>.</li>
            <li>Players can also earn a point by calling out another player who isn't following one of their rules. They also get to give that player one of their own rules.</li>
          </ul>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-4">
        <h3 className="font-headline text-3xl text-foreground">Players</h3>
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setPlayerCount(p => Math.max(1, p - 1))} aria-label="Decrease player count">
            <Minus className="h-5 w-5" />
          </Button>
          <span className="font-bold text-5xl tabular-nums w-16 text-center text-foreground">{playerCount}</span>
          <Button variant="outline" size="icon" onClick={() => setPlayerCount(p => Math.min(8, p + 1))} aria-label="Increase player count">
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <Link href="/admin" prefetch={false}>
          <Button 
            size="lg"
            variant="outline"
            className="font-headline text-2xl tracking-wider"
          >
            <Settings className="mr-2 h-5 w-5" />
            Manage Cards
          </Button>
        </Link>
        <Button size="lg" onClick={() => onStartGame(playerCount)} className="font-headline text-2xl tracking-wider">
          Start Game
        </Button>
      </div>

    </div>
  );
}
