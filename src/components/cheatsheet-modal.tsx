"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronDown, RefreshCw, X } from "lucide-react";
import type { SessionRule } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CheatSheetModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  rules: SessionRule[];
  onFlipRule: (ruleId: number) => void;
  goldenRule: SessionRule | null;
  onFlipGoldenRule: () => void;
}

interface FlipCardProps {
  label?: string;
  isFlipped: boolean;
  onFlip: () => void;
  front: { name: string; description: string };
  back: { name: string; description: string };
  frontStyle: React.CSSProperties;
  backStyle: React.CSSProperties;
}

/** A single rule card that rotates in 3D between its primary and flipped face. */
const FlipCard = ({ label, isFlipped, onFlip, front, back, frontStyle, backStyle }: FlipCardProps) => {
  const face = (
    side: "front" | "back",
    content: { name: string; description: string },
    style: React.CSSProperties
  ) => (
    <div
      className={cn(
        "absolute w-full h-full [backface-visibility:hidden]",
        side === "back" && "[transform:rotateY(180deg)]"
      )}
    >
      <div className="w-full h-full flex flex-col p-4 rounded-lg" style={style}>
        <div className={cn("flex items-start", label ? "justify-between" : "justify-end")}>
          {label && <span className="text-xs uppercase tracking-wider font-bold">{label}</span>}
          <Button
            variant="ghost"
            size="sm"
            onClick={onFlip}
            aria-label={`Flip ${content.name}`}
            className={cn(
              "bg-black text-white hover:bg-zinc-800",
              side === "back" && "border border-white/30"
            )}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Flip
          </Button>
        </div>
        <div className="flex-grow flex flex-col justify-center text-center">
          <h4 className="font-card text-3xl uppercase">{content.name}</h4>
          <p className="text-sm mt-1 font-body normal-case opacity-80">{content.description}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full aspect-video shrink-0 snap-start [perspective:1000px]">
      <div
        className={cn(
          "relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d]",
          isFlipped && "[transform:rotateY(180deg)]"
        )}
      >
        {face("front", front, frontStyle)}
        {face("back", back, backStyle)}
      </div>
    </div>
  );
};

const GOLDEN = "#CCAA4F";
const CARD_BORDER = "14px solid black";

const CheatSheetModal = ({ isOpen, onOpenChange, rules, onFlipRule, goldenRule, onFlipGoldenRule }: CheatSheetModalProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState({ scrollable: false, atTop: true, atBottom: true });

  const cardCount = rules.length + (goldenRule ? 1 : 0);

  const syncScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const slack = 8;
    setScroll({
      scrollable: scrollHeight - clientHeight > slack,
      atTop: scrollTop <= slack,
      atBottom: scrollTop + clientHeight >= scrollHeight - slack,
    });
  }, []);

  // Re-measure when the modal opens, when cards change, and when the box resizes
  // (cards are aspect-ratio based, so width changes change total height).
  useEffect(() => {
    if (!isOpen) return;
    const el = scrollRef.current;
    if (!el) return;

    const raf = requestAnimationFrame(syncScrollState);
    const observer = new ResizeObserver(syncScrollState);
    observer.observe(el);
    Array.from(el.children).forEach((child) => observer.observe(child));

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [isOpen, cardCount, syncScrollState]);

  const scrollByPage = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ top: el.clientHeight * 0.85, behavior: "smooth" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card text-card-foreground flex flex-col gap-4 max-h-[88dvh] overflow-hidden">
        <DialogHeader className="shrink-0 pr-10">
          <DialogTitle className="font-headline text-3xl">Flip Cheat Sheet</DialogTitle>
          <DialogDescription>
            These are your active rules. Flip them to see their alternate versions.
          </DialogDescription>
          {cardCount > 0 && (
            <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
              <span className="rounded-full border border-border bg-background/60 px-2 py-0.5 font-semibold tabular-nums">
                {cardCount} card{cardCount === 1 ? "" : "s"}
              </span>
              {scroll.scrollable && <span>Scroll for more</span>}
            </div>
          )}
        </DialogHeader>

        <div className="relative flex min-h-0 flex-1 flex-col">
          <div
            ref={scrollRef}
            onScroll={syncScrollState}
            tabIndex={scroll.scrollable ? 0 : -1}
            role="region"
            aria-label="Active rule cards"
            className={cn(
              // min-h-0 + flex-1 (not h-full) — a percentage height can't resolve
              // against a flex item whose height comes from flex distribution,
              // so h-full would collapse to content height and never scroll.
              "themed-scrollbar flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain",
              "snap-y snap-proximity scroll-py-1 p-1 pr-3",
              "rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            {goldenRule && (
              <FlipCard
                label="★ Golden Rule ★"
                isFlipped={goldenRule.isFlipped}
                onFlip={onFlipGoldenRule}
                front={goldenRule.primary}
                back={goldenRule.flipped}
                frontStyle={{ backgroundColor: GOLDEN, color: "#1F2937", border: CARD_BORDER }}
                backStyle={{ backgroundColor: "black", color: GOLDEN, border: CARD_BORDER }}
              />
            )}

            {rules.length === 0 ? (
              <div className="text-center text-muted-foreground p-8">
                <p className="font-semibold">You haven&apos;t collected any rules yet.</p>
                <p className="text-sm mt-2">Land on a RULE segment on the wheel to add it to your cheat sheet!</p>
              </div>
            ) : (
              rules.map((rule) => {
                const labelBg = rule.color?.labelBg || GOLDEN;
                return (
                  <FlipCard
                    key={rule.id}
                    isFlipped={rule.isFlipped}
                    onFlip={() => onFlipRule(rule.id)}
                    front={rule.primary}
                    back={rule.flipped}
                    frontStyle={{
                      backgroundColor: labelBg,
                      color: rule.color?.labelColor || "#1F2937",
                      border: CARD_BORDER,
                    }}
                    backStyle={{ backgroundColor: "black", color: labelBg, border: CARD_BORDER }}
                  />
                );
              })
            )}
          </div>

          {/* Edge fades: signal that content continues past the visible box.
              Stop short of the right edge so the scrollbar stays readable. */}
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute left-0 right-3 top-0 h-8 bg-gradient-to-b from-card to-transparent transition-opacity duration-200",
              scroll.atTop ? "opacity-0" : "opacity-100"
            )}
          />
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute left-0 right-3 bottom-0 h-14 bg-gradient-to-t from-card via-card/80 to-transparent transition-opacity duration-200",
              scroll.atBottom ? "opacity-0" : "opacity-100"
            )}
          />

          {/* Tap target that pages down, doubling as the "there's more" hint. */}
          <button
            type="button"
            onClick={scrollByPage}
            tabIndex={-1}
            aria-hidden={scroll.atBottom}
            className={cn(
              "absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full",
              "border border-border bg-background/90 px-3 py-1 text-xs font-semibold shadow-lg backdrop-blur-sm",
              "transition-all duration-200 hover:bg-background hover:text-primary",
              scroll.scrollable && !scroll.atBottom
                ? "opacity-100"
                : "pointer-events-none translate-y-1 opacity-0"
            )}
          >
            <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
            More cards
          </button>
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
