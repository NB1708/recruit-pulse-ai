import { useCallback, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AiSpinner } from '@/components/AiSpinner';
import { fetchValues } from '@/services/googleSheets';

const DEFAULT_CLIENTS = [
  'IIFL North',
  'Rupeek',
  'Aavas',
  'Muthoot',
  'Equitas',
  'India Gold',
  'Manappuram',
  'IIFL South',
];

function sanitize(v: string) {
  return (v || '').trim().toLowerCase();
}

interface ClientMetrics {
  cvShared: number;
  selections: number;
  joined: number;
  successRate: number;
}

function computeMetrics(rows: string[][], headers: string[]): ClientMetrics {
  const hMap: Record<string, number> = {};
  headers.forEach((h, i) => { hMap[h.trim().toLowerCase()] = i; });

  const statusIdx = hMap['status'] ?? hMap['candidate status'] ?? hMap['5 stages'] ?? hMap['stage'] ?? -1;

  let cvShared = 0;
  let selections = 0;
  let joined = 0;

  rows.forEach(row => {
    cvShared++;
    if (statusIdx >= 0) {
      const s = sanitize(row[statusIdx] || '');
      if (s.includes('select') || s === 'selected') selections++;
      if (s === 'joined') joined++;
    }
  });

  return {
    cvShared,
    selections,
    joined,
    successRate: cvShared > 0 ? Math.round((joined / cvShared) * 100 * 10) / 10 : 0,
  };
}

interface Props {
  spreadsheetId: string;
  connected: boolean;
}

export default function ClientAnalysisTab({ spreadsheetId, connected }: Props) {
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [metrics, setMetrics] = useState<ClientMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accessToken = useMemo(() => sessionStorage.getItem('gp_access_token') || '', []);

  const handleClientChange = useCallback(async (client: string) => {
    setSelectedClient(client);
    setMetrics(null);
    setError(null);

    const token = sessionStorage.getItem('gp_access_token') || '';
    if (!token || !spreadsheetId) {
      setError('Please connect Google Sheets first.');
      return;
    }

    setLoading(true);
    try {
      const values = await fetchValues(spreadsheetId, client, token);
      if (!values.length || values.length < 2) {
        setMetrics({ cvShared: 0, selections: 0, joined: 0, successRate: 0 });
        return;
      }
      const [headers, ...rows] = values;
      const filteredRows = rows.filter(r => r.some(Boolean));
      setMetrics(computeMetrics(filteredRows, headers));
    } catch (e: any) {
      setError(e.message || 'Failed to fetch client data');
    } finally {
      setLoading(false);
    }
  }, [spreadsheetId]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-display font-bold text-foreground">Client Analysis</h2>
        <Select value={selectedClient} onValueChange={handleClientChange}>
          <SelectTrigger className="w-52 bg-card border-border text-foreground">
            <SelectValue placeholder="Select Client" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {DEFAULT_CLIENTS.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!connected && (
        <p className="text-sm text-muted-foreground">Connect Google Sheets to fetch live client data.</p>
      )}

      {loading && (
        <div className="flex items-center gap-2 py-8 justify-center">
          <AiSpinner /> <span className="text-sm text-muted-foreground">Fetching client data…</span>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">{error}</div>
      )}

      {metrics && !loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard title="CV Shared" value={metrics.cvShared} emoji="📄" />
          <MetricCard title="Selections" value={metrics.selections} emoji="✅" />
          <MetricCard title="Joined" value={metrics.joined} emoji="🎉" />
          <MetricCard title="Success Rate" value={`${metrics.successRate}%`} emoji="📈" />
        </div>
      )}

      {!selectedClient && !loading && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-3xl mb-2">🏢</p>
          <p className="text-sm">Select a client from the dropdown to view their recruitment metrics.</p>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, emoji }: { title: string; value: number | string; emoji: string }) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-1 pt-4 px-4">
        <CardTitle className="text-xs text-muted-foreground font-medium">{emoji} {title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <p className="text-2xl font-display font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
