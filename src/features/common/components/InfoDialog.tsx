import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface InfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
}

export function InfoDialog({ open, onOpenChange, title, content }: InfoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {/* ScrollArea takes up available space. Padding for content should be inside. */}
        <ScrollArea className="flex-grow my-4">
          {/* Using whitespace-pre-line to respect newlines. pr-6 to avoid content touching scrollbar. */}
          <div className="pr-6" style={{ whiteSpace: 'pre-line' }}>
            {content}
          </div>
        </ScrollArea>
        <DialogFooter className="mt-auto"> {/* mt-auto pushes footer to bottom if content is short */}
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
