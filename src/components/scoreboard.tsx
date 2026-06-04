"use client";

import { useState } from 'react';
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Pencil, Check } from "lucide-react";
import type { Player } from "@/app/page";
import { SevenSegmentDisplay } from "./seven-segment-display";
import { cn } from "@/lib/utils";

interface ScoreboardProps {
  players: Player[];
  onScoreChange: (playerId: number, delta: number) => void;
  onNameChange: (playerId: number, newName: string) => void;
  goldenRuleCard?: React.ReactNode;
  mobileView?: 'scoreboard' | 'golden';
  onMobileViewChange?: (v: 'scoreboard' | 'golden') => void;
}

const Scoreboard = ({ players, onScoreChange, onNameChange, goldenRuleCard, mobileView = 'scoreboard', onMobileViewChange }: ScoreboardProps) => {
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
  const showGolden = !!goldenRuleCard && mobileView === 'golden';

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] shadow-xl shadow-black/40 overflow-hidden">
      <div className="px-2.5 pt-2.5 pb-2">
        {/* mobile header: tabs if a golden rule exists, else title */}
        <div className="lg:hidden">
          {goldenRuleCard ? (
            <div className="flex rounded-lg bg-white/5 border border-white/10 p-0.5 text-sm">
              <button onClick={() => onMobileViewChange?.('scoreboard')} className={cn("flex-1 rounded-md py-1 font-headline tracking-wide transition-colors", mobileView === 'scoreboard' ? 'bg-white/15 text-foreground' : 'text-muted-foreground')}>SCOREBOARD</button>
              <button onClick={() => onMobileViewChange?.('golden')} className={cn("flex-1 rounded-md py-1 font-headline tracking-wide transition-colors", mobileView === 'golden' ? 'bg-white/15 text-foreground' : 'text-muted-foreground')}>GOLDEN RULE</button>
            </div>
          ) : (
            <span className="font-headline text-xl tracking-wide">SCOREBOARD</span>
          )}
        </div>
        {/* desktop header: title + light strip */}
        <div className="hidden lg:flex items-center gap-3">
          <span className="font-headline text-2xl tracking-wide">SCOREBOARD</span>
        </div>
      </div>

      {/* golden rule card in the body (mobile only, when selected) */}
      {goldenRuleCard && (
        <div className={cn("px-3 pb-3 lg:hidden", showGolden ? 'block' : 'hidden')}>{goldenRuleCard}</div>
      )}

      {/* scores */}
      <div className={cn("flex-col gap-0.5 p-2 pt-0", showGolden ? 'hidden lg:flex' : 'flex')}>
        {players.map((player) => {
          const isEditing = editingPlayerId === player.id;
          const isLeader = player.score === topScore && topScore > 0;
          return (
            <div key={player.id} className="flex items-center justify-between gap-2 rounded-xl px-2 py-1 transition-colors hover:bg-white/[0.04]">
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
                <Button variant="outline" size="icon" className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border-white/15 bg-white/5 hover:bg-white/10 active:scale-95 transition" onClick={() => onScoreChange(player.id, -1)}>
                  <Minus className="h-4 w-4" />
                </Button>
                <SevenSegmentDisplay score={player.score} />
                <Button variant="outline" size="icon" className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border-white/15 bg-white/5 hover:bg-white/10 active:scale-95 transition" onClick={() => onScoreChange(player.id, 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(Scoreboard);
