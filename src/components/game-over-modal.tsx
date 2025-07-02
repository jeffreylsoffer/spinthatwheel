
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trophy } from "lucide-react";
import type { Player } from "@/app/page";

interface GameOverModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  players: Player[];
  onPlayAgain: () => void;
}

const GameOverModal = ({ isOpen, onOpenChange, players, onPlayAgain }: GameOverModalProps) => {
  const getWinners = () => {
    if (players.length === 0) return [];
    const maxScore = Math.max(...players.map(p => p.score));
    if (maxScore < 0) return []; // No winner if all scores are negative
    return players.filter(p => p.score === maxScore);
  };

  const winners = getWinners();
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground border-4 border-primary shadow-primary/40 shadow-2xl">
        <DialogHeader className="items-center text-center">
          <Trophy className="h-20 w-20 text-primary" />
          <DialogTitle className="font-headline text-6xl text-primary tracking-widest mt-4">
            GAME OVER
          </DialogTitle>
          <DialogDescription className="text-muted-foreground pt-2">
            Final Scores:
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 py-4">
          {sortedPlayers.map(player => (
              <div key={player.id} className="flex justify-between items-center bg-background/50 p-3 rounded-lg">
                <span className="font-bold text-lg flex items-center gap-2">
                  {player.name} 
                  {winners.some(w => w.id === player.id) && <Trophy className="h-5 w-5 text-yellow-400" />}
                </span>
                <span className="font-digital-7 text-2xl text-primary">{player.score}</span>
              </div>
          ))}
        </div>
        <div className="flex justify-center pt-4">
          <Button onClick={onPlayAgain} size="lg">
            <RefreshCw className="mr-2 h-5 w-5" />
            Play Again
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GameOverModal;
