
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
      <Card className="w-full max-w-2xl bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-2xl shadow-black/50">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-5xl lg:text-6xl tracking-wider text-card-foreground">SPIN THAT WHEEL</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Based on <a href="https://www.dropout.tv" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Dropout's Game Changer</a> episode <a href="https://www.dropout.tv/videos/rulette" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">"Rulette"</a>.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 items-center">
          
          <div className="text-left space-y-6 p-6 rounded-lg bg-background/50 max-w-prose">
            <div>
              <h3 className="font-headline text-3xl text-card-foreground">What You'll Need</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                <li><span className="font-bold text-card-foreground">Sticky Notes:</span> Write down rules and stick them on each player's chest.</li>
                <li><span className="font-bold text-card-foreground">A Referee:</span> To take notes and call out players who don't follow their rules.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-headline text-3xl text-card-foreground">How to Score</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                <li>Players get a point for successfully completing a <span className="font-bold text-accent">PROMPT</span> while following all their active rules. In addition to a point, you also get to shred one of your active rules.</li>
                <li>Players can also earn a point by calling out another player who isn't following one of their rules. They also get to give that player one of their own rules.</li>
              </ul>
            </div>
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

          <div className="flex items-center justify-center gap-4 mt-6">
            <Link href="/admin">
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
        </CardContent>
      </Card>
    </div>
  );
}
