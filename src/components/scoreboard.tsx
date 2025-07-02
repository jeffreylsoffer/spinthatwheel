
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import type { Player } from "@/app/page";
import { SevenSegmentDisplay } from "./seven-segment-display";

interface ScoreboardProps {
  players: Player[];
  onScoreChange: (playerId: number, delta: number) => void;
}

const Scoreboard = ({ players, onScoreChange }: ScoreboardProps) => {

  return (
    <Card className="w-full">
      <CardHeader className="p-2 sm:p-4">
        <CardTitle className="font-headline text-xl sm:text-2xl">Scoreboard</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 p-2 sm:p-4 pt-0">
        {players.map((player, index) => {
          return (
            <div
              key={player.id}
              className="flex items-center justify-between"
            >
              <span className="font-bold text-base sm:text-lg text-card-foreground">Player {index + 1}</span>
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-7 h-7 sm:w-8 sm:h-8"
                  onClick={() => onScoreChange(player.id, -1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <SevenSegmentDisplay score={player.score} />
                <Button
                  variant="outline"
                  size="icon"
                  className="w-7 h-7 sm:w-8 sm:h-8"
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
