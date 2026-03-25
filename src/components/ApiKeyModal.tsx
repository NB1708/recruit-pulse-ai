import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Key, FileSpreadsheet } from 'lucide-react';

interface ApiKeyModalProps {
  open: boolean;
  onSubmit: (apiKey: string, spreadsheetId: string) => void;
}

export function ApiKeyModal({ open, onSubmit }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [sheetId, setSheetId] = useState(sessionStorage.getItem('gp_sheet_id') || '');

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2 text-foreground">
            <Key className="h-5 w-5 text-primary" />
            Connect RecruitPulse AI
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter your Gemini API key and Google Spreadsheet ID to get started. Keys stay in session memory only.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Gemini API Key</label>
            <Input
              placeholder="AIza..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline block"
            >
              Get your free API key from Google AI Studio →
            </a>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Google Spreadsheet ID
            </label>
            <Input
              placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
              value={sheetId}
              onChange={(e) => setSheetId(e.target.value)}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Must contain sheets: MASTER TRACKER, SELECTION SHEET, EOD SHEET
            </p>
          </div>
          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display"
            disabled={!apiKey.startsWith('AIza') || !sheetId.trim()}
            onClick={() => onSubmit(apiKey, sheetId.trim())}
          >
            Connect & Launch
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
