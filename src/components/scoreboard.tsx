"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import type { Player } from "@/app/page";

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
        {players.map((player, index) => (
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
              <div className="flex items-center justify-center bg-black/50 rounded-lg font-digital text-primary text-4xl font-bold tabular-nums w-24 h-14 border border-white/10">
                {player.score}
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
        ))}
      </CardContent>
    </Card>
  );
};

export default Scoreboard;
