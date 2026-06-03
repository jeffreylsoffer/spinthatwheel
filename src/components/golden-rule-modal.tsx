"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw, X } from "lucide-react";
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

  const color = goldenRule.color?.labelBg || '#CCAA4F';
  const textColor = goldenRule.color?.labelColor || '#1F2937';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="font-headline text-3xl text-yellow-500">★ Golden Rule ★</DialogTitle>
        </DialogHeader>

        {/* Hero card with flip — styled like a normal rule */}
        <div className="w-full aspect-video [perspective:1000px]">
          <div
            className={cn(
              "relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d]",
              goldenRule.isFlipped && "[transform:rotateY(180deg)]"
            )}
          >
            {/* Front Face */}
            <div className="absolute w-full h-full [backface-visibility:hidden]">
              <div className="w-full h-full flex flex-col p-4 rounded-2xl border-[14px] border-black" style={{ backgroundColor: color, color: textColor }}>
                <div className="flex justify-end items-start">
                  <Button variant="ghost" size="sm" onClick={onFlipGoldenRule} className="bg-black text-white hover:bg-zinc-800">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Flip
                  </Button>
                </div>
                <div className="flex-grow flex flex-col justify-center text-center">
                  <h4 className="font-headline text-3xl uppercase">{goldenRule.primary.name}</h4>
                  <p className="text-sm mt-1 font-body normal-case opacity-80">{goldenRule.primary.description}</p>
                </div>
              </div>
            </div>
            {/* Back Face */}
            <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <div className="w-full h-full flex flex-col p-4 rounded-2xl border-[14px] border-black bg-black" style={{ color }}>
                <div className="flex justify-end items-start">
                  <Button variant="ghost" size="sm" onClick={onFlipGoldenRule} className="bg-black text-white border border-white/30 hover:bg-zinc-800">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Flip
                  </Button>
                </div>
                <div className="flex-grow flex flex-col justify-center text-center">
                  <h4 className="font-headline text-3xl uppercase">{goldenRule.flipped.name}</h4>
                  <p className="text-sm mt-1 font-body normal-case opacity-80">{goldenRule.flipped.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Select a rule below to make it the new Golden Rule for all players.
        </p>

        {/* Grid of active rules to swap */}
        <div className="grid grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto">
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
                  className="rounded-2xl border-[8px] border-black p-3 aspect-video flex items-center justify-center text-center hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <span className="font-headline text-2xl uppercase leading-none break-words">{name}</span>
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
