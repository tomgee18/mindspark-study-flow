
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
import { AlertCircle, Loader2 } from 'lucide-react';
import { encryptApiKey, decryptApiKey, removeApiKey } from '@/lib/utils';


interface AiSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AiSettingsDialog({ open, onOpenChange }: AiSettingsDialogProps) {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      decryptApiKey()
        .then(decryptedKey => {
          setApiKey(decryptedKey);
        })
        .catch(err => {
          console.error(err);
          toast.error("Could not load API key.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [open]);

  const handleSave = async () => {
    if (!apiKey) {
        toast.error('API Key cannot be empty.');
        return;
    }
    setIsLoading(true);
    try {
        await encryptApiKey(apiKey);
        toast.success('API Key saved successfully!');
        window.dispatchEvent(new Event('apiKeySet')); // Notify other components
        onOpenChange(false);
    } catch (err) {
        console.error(err);
        toast.error('Failed to save API key.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleRemove = () => {
    removeApiKey();
    setApiKey('');
    toast.success('API Key removed successfully!');
    window.dispatchEvent(new Event('apiKeySet'));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI Provider Settings</DialogTitle>
          <DialogDescription>
            Enter your Google AI API key to enable AI features.
          </DialogDescription>
           <div className="!mt-4 flex items-start space-x-2 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">
                Your API key is stored securely in your browser's local storage. This is safer, but do not use this on a shared computer.
            </p>
          </div>
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
              placeholder={isLoading ? "Loading..." : "Enter your Google AI API key"}
              type="password"
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="destructive" onClick={handleRemove} className="mr-auto" disabled={isLoading}>
              Remove Key
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : 'Save Key'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
