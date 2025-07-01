"use client";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import type { WheelItem } from "@/lib/types";

interface ResultModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  result: WheelItem | null;
}

const ResultModal = ({ isOpen, onOpenChange, result }: ResultModalProps) => {
  if (!result) return null;

  const cardText = result.type === 'PROMPT' 
    ? (result.data as any).text 
    : result.data.name;

  const textColor = result.type === 'END' ? 'white' : 'black';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-transparent border-none shadow-none sm:max-w-md p-0">
        <div 
          style={{ backgroundColor: result.color.labelBg }}
          className="p-8 rounded-2xl border-[10px] border-gray-200"
        >
          <h2 
            style={{ color: textColor }}
            className="text-4xl lg:text-5xl font-headline uppercase text-center break-words"
          >
            {cardText}
          </h2>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResultModal;
