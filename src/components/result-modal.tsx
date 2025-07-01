"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { WheelItem } from "@/lib/types";

interface ResultModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  result: WheelItem | null;
}

const ResultModal = ({ isOpen, onOpenChange, result }: ResultModalProps) => {
  if (!result) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="text-left">
          <Badge 
            variant="secondary"
            className="w-fit mb-2"
          >
            {result.type}
          </Badge>
          <DialogTitle className="font-headline text-3xl">
            {result.type === 'PROMPT' ? 'New Prompt!' : result.data.name}
          </DialogTitle>
          <DialogDescription className="pt-4 text-base">
            {result.type === 'PROMPT' ? (result.data as any).text : (result.data as any).description}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default ResultModal;
