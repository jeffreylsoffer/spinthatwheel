"use client";

import { useState } from 'react';
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Pencil, Check } from "lucide-react";
import type { Player } from "@/app/page";
import { SevenSegmentDisplay } from "./seven-segment-display";

interface ScoreboardProps {
  players: Player[];
  onScoreChange: (playerId: number, delta: number) => void;
  onNameChange: (playerId: number, newName: string) => void;
}

const Scoreboard = ({ players, onScoreChange, onNameChange }: ScoreboardProps) => {
  const [editingPlayerId, setEditingPlayerId] = useState<number | null>(null);
  const [currentName, setCurrentName] = useState('');

  const handleEditClick = (player: Player) => {
    setEditingPlayerId(player.id);
    setCurrentName(player.name);
  };

  const handleSaveClick = (playerId: number) => {
    if (currentName.trim()) {
      onNameChange(playerId, currentName.trim());
    }
    setEditingPlayerId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, playerId: number) => {
    if (e.key === 'Enter') {
      handleSaveClick(playerId);
    }
  };

  const topScore = Math.max(0, ...players.map(p => p.score));

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] shadow-xl shadow-black/40 overflow-hidden">
      <div className="flex items-center gap-3 px-4 pt-3.5 pb-3">
        <span className="font-headline text-xl sm:text-2xl tracking-wide">SCOREBOARD</span>
        <span className="ml-auto flex items-center gap-1.5">
          {[0, 1, 2].map(i => (
            <span key={i} className="h-1.5 w-1.5 rounded-full bg-accent" style={{ boxShadow: '0 0 6px hsl(var(--accent) / 0.9)' }} />
          ))}
        </span>
      </div>
      <div className="h-px bg-white/10" />
      <div className="flex flex-col gap-0.5 p-2">
        {players.map((player) => {
          const isEditing = editingPlayerId === player.id;
          const isLeader = player.score === topScore && topScore > 0;
          return (
            <div
              key={player.id}
              className="flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/[0.04]"
            >
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                {isLeader && <span className="text-accent text-sm leading-none" title="Leader">★</span>}
                {isEditing ? (
                  <>
                    <Input 
                      value={currentName}
                      onChange={(e) => setCurrentName(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, player.id)}
                      className="h-8 text-base"
                      autoFocus
                    />
                    <Button variant="ghost" size="icon" className="w-8 h-8 shrink-0" onClick={() => handleSaveClick(player.id)}>
                      <Check className="h-5 w-5" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="font-bold text-base sm:text-lg text-card-foreground break-all">{player.name}</span>
                    <Button variant="ghost" size="icon" className="w-7 h-7 shrink-0 text-muted-foreground/60 hover:text-foreground" onClick={() => handleEditClick(player)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border-white/15 bg-white/5 hover:bg-white/10 active:scale-95 transition"
                  onClick={() => onScoreChange(player.id, -1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <SevenSegmentDisplay score={player.score} />
                <Button
                  variant="outline"
                  size="icon"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border-white/15 bg-white/5 hover:bg-white/10 active:scale-95 transition"
                  onClick={() => onScoreChange(player.id, 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default React.memo(Scoreboard);
