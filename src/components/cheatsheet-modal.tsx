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
import { Separator } from "@/components/ui/separator";
import { RefreshCw } from "lucide-react";
import type { SessionRule } from "@/lib/types";

interface CheatSheetModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sessionRules: SessionRule[];
  onFlipRule: (ruleId: number) => void;
}

const CheatSheetModal = ({ isOpen, onOpenChange, sessionRules, onFlipRule }: CheatSheetModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-3xl">Flip Cheat Sheet</DialogTitle>
          <DialogDescription>
            View your current rules and flip them to their alternate versions.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto p-1">
          {sessionRules.map((rule, index) => (
            <div key={rule.id}>
              <Card className="border-none shadow-none">
                <CardHeader className="p-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-bold">{rule.groupName}</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => onFlipRule(rule.id)}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Flip
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className={!rule.isFlipped ? 'p-3 bg-primary/10 rounded-lg' : 'p-3'}>
                      <h4 className="font-bold">{rule.primary.name}</h4>
                      <p className="text-muted-foreground">{rule.primary.description}</p>
                    </div>
                    <div className={rule.isFlipped ? 'p-3 bg-primary/10 rounded-lg' : 'p-3'}>
                      <h4 className="font-bold">{rule.flipped.name}</h4>
                      <p className="text-muted-foreground">{rule.flipped.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {index < sessionRules.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheatSheetModal;
