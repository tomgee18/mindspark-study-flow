
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AiSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AiSettingsDialog({ open, onOpenChange }: AiSettingsDialogProps) {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (open) {
      const storedApiKey = localStorage.getItem('googleAiApiKey');
      if (storedApiKey) {
        setApiKey(storedApiKey);
      }
    }
  }, [open]);

  const handleSave = () => {
    if (!apiKey) {
        toast.error('API Key cannot be empty.');
        return;
    }
    localStorage.setItem('googleAiApiKey', apiKey);
    toast.success('API Key saved successfully!');
    window.dispatchEvent(new Event('apiKeySet')); // Notify other components
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI Provider Settings</DialogTitle>
          <DialogDescription>
            Enter your Google AI API key to enable AI features. Your key is stored locally in your browser and not shared.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="api-key" className="text-right">
              API Key
            </Label>
            <Input
              id="api-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="col-span-3"
              placeholder="Enter your Google AI API key"
              type="password"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>
            Save Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
