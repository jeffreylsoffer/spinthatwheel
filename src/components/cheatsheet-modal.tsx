
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw, X, ArrowLeftRight } from "lucide-react";
import type { SessionRule } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CheatSheetModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  rules: SessionRule[];
  onFlipRule: (ruleId: number) => void;
  goldenRule: SessionRule | null;
  onFlipGoldenRule: () => void;
  onSwapWithGoldenRule: (ruleId: number) => void;
}

const CheatSheetModal = ({ isOpen, onOpenChange, rules, onFlipRule, goldenRule, onFlipGoldenRule, onSwapWithGoldenRule }: CheatSheetModalProps) => {

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="font-headline text-3xl">Flip Cheat Sheet</DialogTitle>
          <DialogDescription>
            These are your active rules. Flip them to see their alternate versions.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6 max-h-[60vh] overflow-y-auto p-1 -mr-2 pr-2">
          {goldenRule && (
            <div className="w-full aspect-video [perspective:1000px]">
              <div
                className={cn(
                  "relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d]",
                  goldenRule.isFlipped && "[transform:rotateY(180deg)]"
                )}
              >
                {/* Front Face */}
                <div className="absolute w-full h-full [backface-visibility:hidden]">
                  <div className="w-full h-full flex flex-col p-4 rounded-lg border-[14px] border-yellow-500/70 bg-yellow-500/10">
                    <div className="flex justify-between items-start">
                      <span className="text-xs uppercase tracking-wider text-yellow-500 font-bold">★ Golden Rule ★</span>
                      <Button variant="ghost" size="sm" onClick={onFlipGoldenRule} className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30">
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
                  <div className="w-full h-full flex flex-col p-4 rounded-lg border-[14px] border-yellow-500/70 bg-black">
                    <div className="flex justify-between items-start">
                      <span className="text-xs uppercase tracking-wider text-yellow-500 font-bold">★ Golden Rule ★</span>
                      <Button variant="ghost" size="sm" onClick={onFlipGoldenRule} className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Flip
                      </Button>
                    </div>
                    <div className="flex-grow flex flex-col justify-center text-center text-yellow-500">
                      <h4 className="font-headline text-3xl uppercase">{goldenRule.flipped.name}</h4>
                      <p className="text-sm mt-1 font-body normal-case opacity-80">{goldenRule.flipped.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {rules.length === 0 ? (
            <div className="text-center text-muted-foreground p-8">
              <p className="font-semibold">You haven't collected any rules yet.</p>
              <p className="text-sm mt-2">Land on a RULE segment on the wheel to add it to your cheat sheet!</p>
            </div>
          ) : (
            rules.map((rule) => {
              const ruleCardStyle = {
                backgroundColor: rule.color?.labelBg || '#CCAA4F',
                color: rule.color?.labelColor || '#1F2937',
                border: `14px solid black`
              };
              
              const flippedRuleCardStyle = {
                backgroundColor: "black",
                color: rule.color?.labelBg || '#CCAA4F',
                border: `14px solid black`
              };

              return (
                <div key={rule.id} className="w-full aspect-video [perspective:1000px]">
                  <div
                    className={cn(
                      "relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d]",
                      rule.isFlipped && "[transform:rotateY(180deg)]"
                    )}
                  >
                    {/* Front Face */}
                    <div className="absolute w-full h-full [backface-visibility:hidden]">
                      <div 
                        className="w-full h-full flex flex-col p-4 rounded-lg"
                        style={ruleCardStyle}
                      >
                        <div className="flex justify-end items-start gap-2">
                          {goldenRule && (
                            <Button variant="ghost" size="sm" onClick={() => onSwapWithGoldenRule(rule.id)} className="bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30">
                              <ArrowLeftRight className="h-4 w-4 mr-2" />
                              Swap
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => onFlipRule(rule.id)} className="bg-black text-white hover:bg-zinc-800">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Flip
                          </Button>
                        </div>
                        <div className="flex-grow flex flex-col justify-center text-center">
                          <h4 className="font-headline text-3xl uppercase">{rule.primary.name}</h4>
                          <p className="text-sm mt-1 font-body normal-case opacity-80">{rule.primary.description}</p>
                        </div>
                      </div>
                    </div>
                    {/* Back Face */}
                    <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
                      <div 
                        className="w-full h-full flex flex-col p-4 rounded-lg"
                        style={flippedRuleCardStyle}
                      >
                        <div className="flex justify-end items-start gap-2">
                          {goldenRule && (
                            <Button variant="ghost" size="sm" onClick={() => onSwapWithGoldenRule(rule.id)} className="bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30 border border-yellow-500/30">
                              <ArrowLeftRight className="h-4 w-4 mr-2" />
                              Swap
                            </Button>
                          )}
                           <Button variant="ghost" size="sm" onClick={() => onFlipRule(rule.id)} className="bg-black text-white border border-white/30 hover:bg-zinc-800">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Flip
                          </Button>
                        </div>
                        <div className="flex-grow flex flex-col justify-center text-center">
                          <h4 className="font-headline text-3xl uppercase">{rule.flipped.name}</h4>
                          <p className="text-sm mt-1 font-body normal-case opacity-80">{rule.flipped.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default CheatSheetModal;
