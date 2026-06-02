"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import type { SessionRule } from "@/lib/types";
import { cn } from "@/lib/utils";

interface GoldenRuleModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  goldenRule: SessionRule | null;
  activeRules: SessionRule[];
  onSwapWithGoldenRule: (ruleId: number) => void;
  onFlipGoldenRule: () => void;
}

const GoldenRuleModal = ({ isOpen, onOpenChange, goldenRule, activeRules, onSwapWithGoldenRule, onFlipGoldenRule }: GoldenRuleModalProps) => {
  if (!goldenRule) return null;

  const currentGoldenRuleName = goldenRule.isFlipped ? goldenRule.flipped.name : goldenRule.primary.name;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="font-headline text-3xl text-yellow-500">★ Golden Rule ★</DialogTitle>
          <DialogDescription>
            Current: <span className="font-bold text-foreground">{currentGoldenRuleName}</span>. Select a rule below to make it the new Golden Rule for all players.
          </DialogDescription>
        </DialogHeader>

        {/* Flip current golden rule */}
        <button
          onClick={onFlipGoldenRule}
          className="w-full rounded-lg border-2 border-yellow-500/50 bg-yellow-500/10 p-3 text-center hover:bg-yellow-500/20 transition-colors"
        >
          <p className="text-xs text-yellow-500 font-bold uppercase">Flip Golden Rule</p>
          <p className="font-headline text-lg mt-1">
            {goldenRule.isFlipped ? goldenRule.primary.name : goldenRule.flipped.name}
          </p>
        </button>

        {/* Grid of active rules to swap */}
        <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
          {activeRules.length === 0 ? (
            <p className="col-span-2 text-center text-muted-foreground py-8">No active rules to swap yet.</p>
          ) : (
            activeRules.map((rule) => {
              const name = rule.isFlipped ? rule.flipped.name : rule.primary.name;
              return (
                <button
                  key={rule.id}
                  onClick={() => {
                    onSwapWithGoldenRule(rule.id);
                    onOpenChange(false);
                  }}
                  style={{ backgroundColor: rule.color?.labelBg || '#CCAA4F', color: rule.color?.labelColor || '#1F2937' }}
                  className="rounded-lg border-[6px] border-black p-3 aspect-square flex items-center justify-center text-center hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <span className="font-headline text-sm uppercase leading-tight">{name}</span>
                </button>
              );
            })
          )}
        </div>

        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default GoldenRuleModal;
