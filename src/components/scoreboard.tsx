"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import type { Player } from "@/app/page";
import { cn } from "@/lib/utils";

interface ScoreboardProps {
  players: Player[];
  onScoreChange: (playerId: number, delta: number) => void;
}

const Scoreboard = ({ players, onScoreChange }: ScoreboardProps) => {

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Scoreboard</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {players.map((player, index) => {
          const scoreString = String(Math.abs(player.score)).padStart(2, '0');
          const hasLeadingZero = player.score >= 0 && player.score < 10;

          return (
            <div
              key={player.id}
              className="flex items-center justify-between"
            >
              <span className="font-bold text-lg text-card-foreground">Player {index + 1}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-8 h-8"
                  onClick={() => onScoreChange(player.id, -1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div 
                  className="flex items-center justify-center bg-black/50 rounded-lg font-digital text-destructive text-4xl font-bold tabular-nums h-14 w-24 border border-white/10"
                  style={{ textShadow: '0 0 5px hsl(var(--destructive) / 0.7)' }}
                >
                  {player.score < 0 && <span>-</span>}
                  <span className={cn(hasLeadingZero && "text-muted-foreground/70")}>{scoreString[0]}</span>
                  <span>{scoreString[1]}</span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-8 h-8"
                  onClick={() => onScoreChange(player.id, 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  );
};

export default Scoreboard;
