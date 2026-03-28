import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { validateGoogleClientId } from '@/services/googleSheets';
import { FileSpreadsheet, Globe, Settings } from 'lucide-react';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (apiKey: string, clientId: string, masterSheetId: string, selectionEodSheetId: string) => void;
}

export function SettingsModal({ open, onClose, onSave }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState(sessionStorage.getItem('groq_api_key') || '');
  const [clientId, setClientId] = useState(sessionStorage.getItem('gp_client_id') || '');
  const [masterSheetId, setMasterSheetId] = useState(sessionStorage.getItem('gp_master_sheet_id') || '');
  const [selectionEodSheetId, setSelectionEodSheetId] = useState(sessionStorage.getItem('gp_selection_eod_sheet_id') || '');
  const [clientIdError, setClientIdError] = useState<string | null>(null);

  const handleSave = () => {
    const validationError = validateGoogleClientId(clientId);
    if (validationError) {
      setClientIdError(validationError);
      return;
    }

    if (apiKey.trim() && clientId.trim() && masterSheetId.trim() && selectionEodSheetId.trim()) {
      setClientIdError(null);
      onSave(apiKey.trim(), clientId.trim(), masterSheetId.trim(), selectionEodSheetId.trim());
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2 text-foreground">
            <Settings className="h-5 w-5 text-primary" />
            Settings
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            View or update your API key and Sheet IDs.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Groq API Key</label>
            <Input
              placeholder="gsk_..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              type="password"
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              Google OAuth Client ID
            </label>
            <Input
              placeholder="xxxx.apps.googleusercontent.com"
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                if (clientIdError) setClientIdError(null);
              }}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground text-xs"
            />
            {clientIdError && <p className="text-[11px] text-destructive">{clientIdError}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Master Tracker Sheet ID
              </label>
              <Input
                placeholder="Spreadsheet ID..."
                value={masterSheetId}
                onChange={(e) => setMasterSheetId(e.target.value)}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Selection & EOD Sheet ID
              </label>
              <Input
                placeholder="Spreadsheet ID..."
                value={selectionEodSheetId}
                onChange={(e) => setSelectionEodSheetId(e.target.value)}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground text-xs"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} className="border-border text-foreground">Cancel</Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-display"
              disabled={!apiKey.trim() || !clientId.trim() || !masterSheetId.trim() || !selectionEodSheetId.trim()}
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
