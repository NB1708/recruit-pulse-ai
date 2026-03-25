import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DEMO_MASTER_TRACKER, DEMO_SELECTION_SHEET, DEMO_EOD_SHEET, DEMO_DAILY_CALLING, getSourceBreakdown } from '@/data/demoData';
import { useMemo, useState } from 'react';
import { TrendingUp, Users, AlertTriangle, ShieldAlert, Sparkles } from 'lucide-react';
import { type EODSheetRow } from '@/types/recruitment';

interface DashboardTabProps {
  onAiAnalyze: (prompt: string) => Promise<string | null>;
  aiLoading: boolean;
  aiError: string | null;
}

function parseDate(str: string): Date {
  const d = new Date(str);
  return isNaN(d.getTime()) ? new Date() : d;
}

function daysSince(str: string): number {
  const d = parseDate(str);
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function DashboardTab({ onAiAnalyze, aiLoading, aiError }: DashboardTabProps) {
  const [insight, setInsight] = useState<string>('');

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

  const metrics = useMemo(() => {
    const activePipeline = DEMO_MASTER_TRACKER.filter(r => r.stage === 'Process' || r.stage === 'Feedback Pending').length;
    const joinedThisMonth = DEMO_SELECTION_SHEET.filter(r => r.candidateStatus === 'Joined' && r.month === currentMonth).length;
    const stuckCandidates = DEMO_MASTER_TRACKER.filter(r => daysSince(r.date) >= 5 && r.stage !== 'Joined').length;
    const backoutRisk = DEMO_SELECTION_SHEET.filter(r => r.candidateStatus === 'Backout' || r.candidateStatus === 'Dropout').length;
    return { activePipeline, joinedThisMonth, stuckCandidates, backoutRisk };
  }, [currentMonth]);

  const funnel = useMemo(() => {
    const stages = ['Feedback Pending', 'CV Shortlisted', 'Process', 'Offered', 'Joined'];
    const counts = stages.map(stage => {
      if (stage === 'Offered') {
        return DEMO_SELECTION_SHEET.filter(r => r.candidateStatus === 'OL released').length;
      }
      return DEMO_MASTER_TRACKER.filter(r => r.stage === stage).length;
    });

    const max = Math.max(...counts, 1);
    const drops = counts.map((count, idx) => {
      if (idx === 0 || counts[idx - 1] === 0) return 0;
      return Math.round(((counts[idx - 1] - count) / counts[idx - 1]) * 100);
    });

    return stages.map((stage, idx) => ({
      stage,
      count: counts[idx],
      width: (counts[idx] / max) * 100,
      drop: drops[idx],
    }));
  }, []);

  const clientStatusBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    DEMO_MASTER_TRACKER.forEach(r => {
      map[r.clientStatus] = (map[r.clientStatus] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, []);

  const recruiterLeaderboard = useMemo(() => {
    return [...DEMO_EOD_SHEET]
      .map((r: EODSheetRow) => ({ ...r, score: r.totalCallsMade * 0.2 + r.lineupsDone * 2 + r.selections * 4 }))
      .sort((a, b) => b.score - a.score);
  }, []);

  const urgentCandidates = useMemo(() => {
    return DEMO_MASTER_TRACKER
      .filter(r => r.stage === 'Feedback Pending' && daysSince(r.date) >= 7)
      .sort((a, b) => daysSince(b.date) - daysSince(a.date))
      .slice(0, 6);
  }, []);

  const sourceBreakdown = useMemo(() => getSourceBreakdown(DEMO_DAILY_CALLING), []);

  const runAnalyze = async () => {
    const prompt = `Analyze this recruitment funnel and recruiter performance:\n\nFunnel: ${JSON.stringify(funnel)}\nRecruiter stats: ${JSON.stringify(recruiterLeaderboard)}\n\nProvide concise actionable insights under 120 words with priorities.`;
    const result = await onAiAnalyze(prompt);
    if (result) setInsight(result);
  };

  const barColors = ['bg-rp-orange', 'bg-rp-blue', 'bg-rp-purple', 'bg-rp-green', 'bg-rp-teal'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="border-border bg-card"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Total Active Pipeline</p><p className="text-2xl font-display font-bold text-foreground">{metrics.activePipeline}</p></div><Users className="h-4 w-4 text-primary"/></div></CardContent></Card>
        <Card className="border-border bg-card"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Joined This Month</p><p className="text-2xl font-display font-bold text-foreground">{metrics.joinedThisMonth}</p></div><TrendingUp className="h-4 w-4 text-rp-green"/></div></CardContent></Card>
        <Card className="border-border bg-card"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Stuck Candidates</p><p className="text-2xl font-display font-bold text-foreground">{metrics.stuckCandidates}</p></div><AlertTriangle className="h-4 w-4 text-rp-yellow"/></div></CardContent></Card>
        <Card className="border-border bg-card"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Backout Risk</p><p className="text-2xl font-display font-bold text-foreground">{metrics.backoutRisk}</p></div><ShieldAlert className="h-4 w-4 text-rp-orange"/></div></CardContent></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader><CardTitle className="text-sm font-display">Hiring Funnel</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {funnel.map((f, i) => (
              <div key={f.stage} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground">{f.stage}</span>
                  <span className="text-muted-foreground">{f.count} {i > 0 ? `· Drop ${f.drop}%` : ''}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div className={`h-full ${barColors[i]}`} style={{ width: `${f.width}%` }} />
                </div>
              </div>
            ))}
            <Button onClick={runAnalyze} disabled={aiLoading} className="mt-2 w-full bg-primary text-primary-foreground hover:bg-primary/90">
              <Sparkles className="mr-2 h-4 w-4" /> 🤖 AI Analyze
            </Button>
            {aiLoading && <div className="mx-auto h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin-glow" />}
            {aiError && <p className="text-xs text-destructive">{aiError}</p>}
            {insight && <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-xs text-foreground whitespace-pre-wrap">{insight}</div>}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader><CardTitle className="text-sm font-display">Client Status Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {clientStatusBreakdown.slice(0, 10).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{status}</span>
                <Badge variant="outline" className="border-border text-foreground">{count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader><CardTitle className="text-sm font-display">Recruiter Leaderboard</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-border text-muted-foreground"><th className="py-2 text-left">Recruiter</th><th className="py-2 text-left">Calls</th><th className="py-2 text-left">Lineups</th><th className="py-2 text-left">Selections</th><th className="py-2 text-left">Score</th></tr></thead>
              <tbody>
                {recruiterLeaderboard.map((r) => (
                  <tr key={r.recruiterName} className="border-b border-border/50">
                    <td className="py-2 text-foreground">{r.recruiterName}</td>
                    <td className="py-2 text-muted-foreground">{r.totalCallsMade}</td>
                    <td className="py-2 text-muted-foreground">{r.lineupsDone}</td>
                    <td className="py-2 text-muted-foreground">{r.selections}</td>
                    <td className="py-2 text-primary font-medium">{r.score.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader><CardTitle className="text-sm font-display">Urgent Attention Candidates</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {urgentCandidates.length === 0 ? <p className="text-xs text-muted-foreground">No urgent candidates.</p> : urgentCandidates.map(c => (
              <div key={c.candidateName} className="rounded-md border border-rp-orange/40 bg-rp-orange/10 p-2 text-xs">
                <p className="font-medium text-foreground">{c.candidateName} · {c.role}</p>
                <p className="text-muted-foreground">{c.organisation} · {daysSince(c.date)} days pending</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader><CardTitle className="text-sm font-display">Source Channel Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(sourceBreakdown).sort((a,b)=>b[1]-a[1]).map(([source, count]) => (
              <div key={source} className="space-y-1">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">{source}</span><span className="text-foreground">{count}</span></div>
                <div className="h-1.5 rounded-full bg-secondary"><div className="h-full rounded-full bg-rp-blue" style={{ width: `${(count / Math.max(...Object.values(sourceBreakdown),1))*100}%` }} /></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
