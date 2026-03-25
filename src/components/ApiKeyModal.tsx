import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Key } from 'lucide-react';

interface ApiKeyModalProps {
  open: boolean;
  onSubmit: (key: string) => void;
}

export function ApiKeyModal({ open, onSubmit }: ApiKeyModalProps) {
  const [key, setKey] = useState('');

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2 text-foreground">
            <Key className="h-5 w-5 text-rp-green" />
            Connect Gemini AI
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter your Google Gemini API key to power AI features. Your key stays in session memory only.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Input
            placeholder="AIza..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="bg-background border-border text-foreground placeholder:text-muted-foreground"
          />
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-rp-blue hover:underline block"
          >
            Get your free API key from Google AI Studio →
          </a>
          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display"
            disabled={!key.startsWith('AIza')}
            onClick={() => onSubmit(key)}
          >
            Connect & Launch
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
