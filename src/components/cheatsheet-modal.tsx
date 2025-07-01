"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import type { SessionRule } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CheatSheetModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  rules: SessionRule[];
  onFlipRule: (ruleId: number) => void;
}

const CheatSheetModal = ({ isOpen, onOpenChange, rules, onFlipRule }: CheatSheetModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline text-3xl">Flip Cheat Sheet</DialogTitle>
          <DialogDescription>
            These are your active rules. Flip them to see their alternate versions.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6 max-h-[60vh] overflow-y-auto p-1 -mr-2 pr-2">
          {rules.length === 0 ? (
            <div className="text-center text-muted-foreground p-8">
              <p className="font-semibold">You haven't collected any rules yet.</p>
              <p className="text-sm mt-2">Land on a RULE segment on the wheel to add it to your cheat sheet!</p>
            </div>
          ) : (
            rules.map((rule) => (
              <div key={rule.id} className="h-48 [perspective:1000px]">
                <div
                  className={cn(
                    "relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d]",
                    rule.isFlipped && "[transform:rotateY(180deg)]"
                  )}
                >
                  {/* Front Face */}
                  <div className="absolute w-full h-full [backface-visibility:hidden]">
                    <Card className="w-full h-full flex flex-col">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>{rule.groupName}</CardTitle>
                          <Button variant="outline" size="sm" onClick={() => onFlipRule(rule.id)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Flip
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <h4 className="font-bold text-lg">{rule.primary.name}</h4>
                        <p className="text-muted-foreground mt-1">{rule.primary.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  {/* Back Face */}
                  <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <Card className="w-full h-full flex flex-col">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>{rule.groupName}</CardTitle>
                          <Button variant="outline" size="sm" onClick={() => onFlipRule(rule.id)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Flip
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <h4 className="font-bold text-lg">{rule.flipped.name}</h4>
                        <p className="text-muted-foreground mt-1">{rule.flipped.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheatSheetModal;
