import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMemo, useState } from 'react';
import { TrendingUp, Users, AlertTriangle, ShieldAlert, Sparkles } from 'lucide-react';
import type { EODSheetRow, MasterTrackerRow, SelectionSheetRow } from '@/types/recruitment';

interface DashboardTabProps {
  masterData: MasterTrackerRow[];
  selectionData: SelectionSheetRow[];
  eodData: EODSheetRow[];
  onAiAnalyze: (prompt: string) => Promise<string | null>;
  aiLoading: boolean;
  aiError: string | null;
}

const stageColor: Record<string, string> = {
  'Feedback Pending': 'bg-rp-orange',
  'CV Shortlisted': 'bg-rp-blue',
  'Process': 'bg-rp-purple',
  'Offered': 'bg-rp-green',
  'Joined': 'bg-rp-teal',
};

const daysSince = (s: string) => Math.floor((Date.now() - new Date(s).getTime()) / 86400000);
const currentMonthName = new Date().toLocaleString('default', { month: 'long' });

export default function DashboardTab({ masterData, selectionData, eodData, onAiAnalyze, aiLoading, aiError }: DashboardTabProps) {
  const [insight, setInsight] = useState('');
  const [monthFilter, setMonthFilter] = useState(currentMonthName);

  const months = useMemo(() => [...new Set(masterData.map(r => r.month).filter(Boolean))], [masterData]);

  const filteredMaster = useMemo(() =>
    monthFilter === 'all' ? masterData : masterData.filter(r => r.month === monthFilter),
    [masterData, monthFilter]
  );
  const filteredSelection = useMemo(() =>
    monthFilter === 'all' ? selectionData : selectionData.filter(r => r.month === monthFilter),
    [selectionData, monthFilter]
  );

  const metrics = useMemo(() => ({
    activePipeline: filteredMaster.filter(r => r.stage === 'Process' || r.stage === 'Feedback Pending').length,
    joinedThisMonth: filteredSelection.filter(r => r.candidateStatus === 'Joined').length,
    stuckCandidates: filteredMaster.filter(r => daysSince(r.date) >= 5 && r.stage !== 'Joined').length,
    backoutRisk: filteredSelection.filter(r => ['Backout', 'Dropout'].includes(r.candidateStatus)).length,
  }), [filteredMaster, filteredSelection]);

  const funnel = useMemo(() => {
    const stages = ['Feedback Pending', 'CV Shortlisted', 'Process', 'Offered', 'Joined'];
    const counts = stages.map(s => s === 'Offered' ? filteredSelection.filter(r => r.candidateStatus === 'OL released').length : filteredMaster.filter(r => r.stage === s).length);
    const max = Math.max(...counts, 1);
    return stages.map((s, i) => ({ stage: s, count: counts[i], width: (counts[i] / max) * 100, drop: i ? Math.round((((counts[i - 1] || 1) - counts[i]) / (counts[i - 1] || 1)) * 100) : 0 }));
  }, [filteredMaster, filteredSelection]);

  const statusBreakdown = useMemo(() => Object.entries(filteredMaster.reduce((acc, r) => ({ ...acc, [r.clientStatus]: (acc[r.clientStatus] || 0) + 1 }), {} as Record<string, number>)).sort((a, b) => b[1] - a[1]), [filteredMaster]);

  const leaderboard = useMemo(() => [...eodData].map(r => ({ ...r, score: r.totalCallsMade * 0.2 + r.lineupsDone * 2 + r.selections * 4 })).sort((a, b) => b.score - a.score), [eodData]);

  const urgent = useMemo(() => filteredMaster.filter(r => r.stage === 'Feedback Pending' && daysSince(r.date) >= 7).sort((a, b) => daysSince(b.date) - daysSince(a.date)), [filteredMaster]);

  const runAnalyze = async () => {
    const prompt = `Analyze recruitment funnel ${JSON.stringify(funnel)} and recruiter stats ${JSON.stringify(leaderboard)}. Give concise actionable insights.`;
    const res = await onAiAnalyze(prompt);
    if (res) setInsight(res);
  };

  return <div className="space-y-6 animate-fade-in">
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-display font-bold text-foreground">Dashboard</h2>
      <Select value={monthFilter} onValueChange={setMonthFilter}>
        <SelectTrigger className="w-40 bg-card border-border text-foreground">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          <SelectItem value="all">All Months</SelectItem>
          {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>

    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {[['Total Active Pipeline', metrics.activePipeline, <Users className="h-4 w-4 text-primary" />], ['Joined This Month', metrics.joinedThisMonth, <TrendingUp className="h-4 w-4 text-rp-green" />], ['Stuck Candidates', metrics.stuckCandidates, <AlertTriangle className="h-4 w-4 text-rp-yellow" />], ['Backout Risk', metrics.backoutRisk, <ShieldAlert className="h-4 w-4 text-rp-orange" />]].map(([label, value, icon]) => <Card key={String(label)} className="border-border bg-card"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">{label}</p><p className="text-2xl font-display font-bold">{String(value)}</p></div>{icon}</div></CardContent></Card>)}
    </div>

    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border-border bg-card"><CardHeader><CardTitle className="text-sm font-display">Hiring Funnel</CardTitle></CardHeader><CardContent className="space-y-3">{funnel.map(f => <div key={f.stage}><div className="flex justify-between text-xs"><span>{f.stage}</span><span className="text-muted-foreground">{f.count}{f.drop ? ` · Drop ${f.drop}%` : ''}</span></div><div className="h-2 rounded-full bg-secondary overflow-hidden"><div className={`h-full ${stageColor[f.stage]}`} style={{ width: `${f.width}%` }} /></div></div>)}<Button onClick={runAnalyze} disabled={aiLoading} className="w-full bg-primary text-primary-foreground"><Sparkles className="mr-2 h-4 w-4"/>🤖 AI Analyze</Button>{aiLoading && <div className="mx-auto h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin-glow" />}{aiError && <p className="text-xs text-destructive">{aiError}</p>}{insight && <div className="rounded border border-primary/30 bg-primary/5 p-3 text-xs whitespace-pre-wrap">{insight}</div>}</CardContent></Card>
      <Card className="border-border bg-card"><CardHeader><CardTitle className="text-sm font-display">Client Status Breakdown</CardTitle></CardHeader><CardContent className="space-y-2">{statusBreakdown.slice(0, 10).map(([s, c]) => <div key={s} className="flex justify-between text-xs"><span className="text-muted-foreground">{s}</span><Badge variant="outline" className="border-border">{c}</Badge></div>)}</CardContent></Card>
    </div>

    <Card className="border-border bg-card"><CardHeader><CardTitle className="text-sm font-display">Recruiter Leaderboard</CardTitle></CardHeader><CardContent><table className="w-full text-xs"><thead><tr className="border-b border-border text-muted-foreground"><th className="py-2 text-left">Recruiter</th><th className="py-2 text-left">Calls</th><th className="py-2 text-left">Lineups</th><th className="py-2 text-left">Selections</th><th className="py-2 text-left">Score</th></tr></thead><tbody>{leaderboard.map(r => <tr key={r.recruiterName} className="border-b border-border/40"><td className="py-2">{r.recruiterName}</td><td>{r.totalCallsMade}</td><td>{r.lineupsDone}</td><td>{r.selections}</td><td className="text-primary">{r.score.toFixed(1)}</td></tr>)}</tbody></table></CardContent></Card>

    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-sm font-display flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-rp-orange" />
          Urgent Attention Candidates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {urgent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No urgent candidates 🎉</p>
        ) : (
          urgent.map(c => (
            <div key={c.candidateName + c.date} className="rounded border border-rp-orange/40 bg-rp-orange/10 p-2 text-xs flex items-center justify-between">
              <div>
                <span className="text-foreground font-medium">{c.candidateName}</span>
                <span className="text-muted-foreground ml-2">{c.role} @ {c.organisation}</span>
              </div>
              <span className={`font-display font-bold ${daysSince(c.date) > 7 ? 'text-rp-red' : 'text-rp-yellow'}`}>
                {daysSince(c.date)}d stuck
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  </div>;
}
