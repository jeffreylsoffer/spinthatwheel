
"use client";

import { useState } from 'react';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  return (
    <Card className="w-full">
      <CardHeader className="p-2 sm:p-4">
        <CardTitle className="font-headline text-xl sm:text-2xl">SCOREBOARD</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 p-2 sm:p-4 pt-0">
        {players.map((player) => {
          const isEditing = editingPlayerId === player.id;
          return (
            <div
              key={player.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
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
                    <span className="font-bold text-base sm:text-lg text-card-foreground truncate">{player.name}</span>
                    <Button variant="ghost" size="icon" className="w-8 h-8 shrink-0" onClick={() => handleEditClick(player)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
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

export default React.memo(Scoreboard);
