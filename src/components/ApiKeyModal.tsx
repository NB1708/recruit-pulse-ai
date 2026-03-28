import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { validateGoogleClientId, cleanGoogleClientId } from '@/services/googleSheets';
import { Key, FileSpreadsheet, Globe, Lightbulb } from 'lucide-react';

interface ApiKeyModalProps {
  open: boolean;
  onSubmit: (apiKey: string, clientId: string, masterSheetId: string, selectionEodSheetId: string) => void;
}

export function ApiKeyModal({ open, onSubmit }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [clientId, setClientId] = useState(sessionStorage.getItem('gp_client_id') || '');
  const [masterSheetId, setMasterSheetId] = useState(sessionStorage.getItem('gp_master_sheet_id') || '');
  const [eodSheetId, setEodSheetId] = useState(sessionStorage.getItem('gp_selection_eod_sheet_id') || '');
  const [clientIdError, setClientIdError] = useState<string | null>(null);

  const handleSubmit = () => {
    const validationError = validateGoogleClientId(clientId);
    if (validationError) {
      setClientIdError(validationError);
      return;
    }

    setClientIdError(null);
    onSubmit(apiKey, clientId.trim(), masterSheetId.trim(), eodSheetId.trim());
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2 text-foreground">
            <Key className="h-5 w-5 text-primary" />
            Connect RecruitPulse AI
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter your credentials and Spreadsheet IDs to get started. Keys stay in session memory only.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Groq API Key</label>
            <Input
              placeholder="gsk_..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline block"
            >
              Get your free API key from Groq Console →
            </a>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              Google OAuth Client ID
            </label>
            <Input
              placeholder="123456789-abc.apps.googleusercontent.com"
              value={clientId}
              onChange={(e) => {
                setClientId(cleanGoogleClientId(e.target.value));
                if (clientIdError) setClientIdError(null);
              }}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground text-xs"
            />
            <p className="text-[11px] text-muted-foreground">Do not include https:// — just paste the ID directly</p>
            {clientIdError && <p className="text-[11px] text-destructive">{clientIdError}</p>}
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Master Tracker &amp; Selection Sheet ID
              </label>
              <Input
                placeholder="Enter Sheet ID containing MASTER TRACKER and SELECTION SHEET tabs"
                value={masterSheetId}
                onChange={(e) => setMasterSheetId(e.target.value)}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                This sheet must have 'MASTER TRACKER' and 'SELECTION SHEET' tabs
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2">
              <Lightbulb className="h-3.5 w-3.5 text-primary shrink-0" />
              <p className="text-[11px] text-primary">
                If all 3 tabs are in the same Google Sheet, enter the same Sheet ID in both fields above
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <FileSpreadsheet className="h-3.5 w-3.5" />
                EOD Sheet ID
              </label>
              <Input
                placeholder="Enter Sheet ID containing EOD SHEET tab"
                value={eodSheetId}
                onChange={(e) => setEodSheetId(e.target.value)}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                This sheet must have 'EOD SHEET' tab. If your EOD sheet is in the same file as Master Tracker, enter the same ID here.
              </p>
            </div>
          </div>
          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display"
            disabled={!apiKey.startsWith('gsk_') || !clientId.trim() || !masterSheetId.trim() || !eodSheetId.trim()}
            onClick={handleSubmit}
          >
            Connect &amp; Launch
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
