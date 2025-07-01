"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Plus, Minus } from 'lucide-react';

export default function StartScreen({ onStartGame }: { onStartGame: (playerCount: number) => void }) {
  const [playerCount, setPlayerCount] = useState(2);

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <Link href="/admin" className="absolute top-4 right-4" aria-label="Manage Prompts">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-foreground/50 hover:text-foreground"
        >
          <Settings className="h-6 w-6" />
        </Button>
      </Link>

      <Card className="w-full max-w-2xl bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-2xl shadow-black/50">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-5xl lg:text-6xl tracking-wider text-card-foreground">Card Deck Wheel</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            A game of chaotic improvisation.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 items-center">
          <div className="text-left space-y-4 p-6 rounded-lg bg-background/50 max-w-prose">
            <h3 className="font-headline text-3xl text-card-foreground">How to Play</h3>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Spin the wheel by clicking and dragging (or flicking on mobile).</li>
              <li>Whatever you land on, you must follow the instruction.</li>
              <li>Landing on a <span className="font-bold text-accent">RULE</span> adds it to your collection. Use the "Flip Cheat Sheet" to see and flip your active rules.</li>
              <li>Landing on a <span className="font-bold text-foreground">PROMPT</span> gives you a one-time challenge.</li>
              <li>Landing on a <span className="font-bold text-chart-2">MODIFIER</span> introduces a special action.</li>
              <li>Once a card is used, its slot becomes an <span className="font-bold text-muted-foreground/80">END</span> space.</li>
            </ol>
            <p className="text-center font-bold pt-4 text-card-foreground">Combine the rules and prompts for hilarious results!</p>
          </div>
          
          <div className="flex flex-col items-center gap-4 w-full max-w-xs pt-4 border-t border-primary/20">
            <h3 className="font-headline text-3xl text-card-foreground">Players</h3>
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" size="icon" onClick={() => setPlayerCount(p => Math.max(1, p - 1))} aria-label="Decrease player count">
                <Minus className="h-5 w-5" />
              </Button>
              <span className="font-bold text-5xl tabular-nums w-16 text-center text-card-foreground">{playerCount}</span>
              <Button variant="outline" size="icon" onClick={() => setPlayerCount(p => Math.min(8, p + 1))} aria-label="Increase player count">
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <Button size="lg" onClick={() => onStartGame(playerCount)} className="font-headline text-2xl tracking-wider animate-pulse mt-4">
            Start Game
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
