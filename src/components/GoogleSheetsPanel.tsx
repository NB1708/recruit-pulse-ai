import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link2, CheckCircle2 } from 'lucide-react';

interface GoogleSheetsPanelProps {
  connected: boolean;
  loading: boolean;
  error: string | null;
  onConnect: (clientId: string, masterSheetId: string, selectionEodSheetId: string) => Promise<void>;
}

export default function GoogleSheetsPanel({ connected, loading, error, onConnect }: GoogleSheetsPanelProps) {
  const [clientId, setClientId] = useState(sessionStorage.getItem('gp_client_id') || '');
  const [masterSheetId, setMasterSheetId] = useState(sessionStorage.getItem('gp_master_sheet_id') || '');
  const [selectionEodSheetId, setSelectionEodSheetId] = useState(sessionStorage.getItem('gp_selection_eod_sheet_id') || '');

  const connect = async () => {
    if (!clientId.trim() || !masterSheetId.trim() || !selectionEodSheetId.trim()) return;
    await onConnect(clientId.trim(), masterSheetId.trim(), selectionEodSheetId.trim());
  };

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <div className="grid gap-2 md:grid-cols-[1.3fr_1fr_1fr_auto]">
          <Input
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="Google OAuth Client ID"
            className="border-border bg-secondary text-foreground"
          />
          <Input
            value={masterSheetId}
            onChange={(e) => setMasterSheetId(e.target.value)}
            placeholder="Master Tracker Sheet ID"
            className="border-border bg-secondary text-foreground"
          />
          <Input
            value={selectionEodSheetId}
            onChange={(e) => setSelectionEodSheetId(e.target.value)}
            placeholder="Selection & EOD Sheet ID"
            className="border-border bg-secondary text-foreground"
          />
          <Button onClick={connect} disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link2 className="mr-2 h-4 w-4" />
            {loading ? 'Connecting...' : 'Connect Sheets'}
          </Button>
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs">
          {connected && <span className="inline-flex items-center gap-1 text-primary"><CheckCircle2 className="h-3.5 w-3.5" />Live Google Sheets connected</span>}
          {error && <span className="text-destructive">{error}</span>}
          <span className="text-muted-foreground">Uses OAuth + Google Sheets API (read-only)</span>
        </div>
      </CardContent>
    </Card>
  );
}
