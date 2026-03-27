import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { MasterTrackerRow, SelectionSheetRow } from '@/types/recruitment';

function sanitize(v: string) {
  return (v || '').trim().toLowerCase();
}

function firstWord(v: string) {
  return sanitize(v).split(/[\s\-–]+/)[0];
}

function matchesClient(value: string, clientKey: string) {
  const fw = firstWord(value);
  return fw === clientKey;
}

interface Props {
  masterData: MasterTrackerRow[];
  selectionData: SelectionSheetRow[];
}

export default function ClientAnalysisTab({ masterData, selectionData }: Props) {
  const [selectedClient, setSelectedClient] = useState<string>('');

  const clientOptions = useMemo(() => {
    const set = new Set<string>();
    const addFirstWord = (v: string) => {
      const fw = (v || '').trim().split(/[\s\-–]+/)[0];
      if (fw) set.add(fw);
    };
    masterData.forEach(r => addFirstWord(r.organisation));
    selectionData.forEach(r => addFirstWord(r.company));
    return [...set].sort();
  }, [masterData, selectionData]);

  const metrics = useMemo(() => {
    if (!selectedClient) return null;
    const key = selectedClient.toLowerCase();

    const cvShared = masterData.filter(r => matchesClient(r.organisation, key)).length;

    let selections = 0;
    let joined = 0;
    selectionData.forEach(r => {
      if (!matchesClient(r.company, key)) return;
      const status = sanitize(r.candidateStatus);
      if (status.includes('select') || status === 'selected') selections++;
      if (status === 'joined') joined++;
    });

    const successRate = cvShared > 0 ? Math.round((joined / cvShared) * 1000) / 10 : 0;

    return { cvShared, selections, joined, successRate };
  }, [selectedClient, masterData, selectionData]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-display font-bold text-foreground">Client Analysis</h2>
        <Select value={selectedClient} onValueChange={setSelectedClient}>
          <SelectTrigger className="w-52 bg-card border-border text-foreground">
            <SelectValue placeholder="Select Client" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {clientOptions.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard title="CV Shared" value={metrics.cvShared} emoji="📄" />
          <MetricCard title="Selections" value={metrics.selections} emoji="✅" />
          <MetricCard title="Joined" value={metrics.joined} emoji="🎉" />
          <MetricCard title="Success Rate" value={`${metrics.successRate}%`} emoji="📈" />
        </div>
      )}

      {!selectedClient && (
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
