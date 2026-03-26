import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMemo, useState } from 'react';
import { TrendingUp, Users, AlertTriangle, ShieldAlert, Sparkles, IndianRupee } from 'lucide-react';
import type { EODSheetRow, MasterTrackerRow, SelectionSheetRow } from '@/types/recruitment';

interface DashboardTabProps {
  masterData: MasterTrackerRow[];
  selectionData: SelectionSheetRow[];
  eodData: EODSheetRow[];
  onAiAnalyze: (prompt: string) => Promise<string | null>;
  aiLoading: boolean;
  aiError: string | null;
  monthFilter: string;
  yearFilter: string;
}

const stageColor: Record<string, string> = {
  'FB Pending': 'bg-rp-orange',
  'CV Shortlisted': 'bg-rp-blue',
  'Process': 'bg-rp-purple',
  'Offered': 'bg-rp-green',
  'Joined': 'bg-rp-teal',
};

const daysSince = (s: string) => {
  if (!s) return 0;
  return Math.floor((Date.now() - new Date(s).getTime()) / 86400000);
};

// Aggressive sanitizer to ignore spaces and capital letters
const sanitize = (val: any) => (val || '').toString().trim().toLowerCase();

export default function DashboardTab({ masterData, selectionData, eodData, onAiAnalyze, aiLoading, aiError, monthFilter, yearFilter }: DashboardTabProps) {
  const [insight, setInsight] = useState('');

  const mFilter = sanitize(monthFilter);
  const yFilter = sanitize(yearFilter);

  // Filter Master Tracker aggressively resolving spaces
  const filteredMaster = useMemo(() =>
    masterData
      .filter(r => mFilter === 'all' || sanitize(r.month) === mFilter)
      .filter(r => yFilter === 'all' || sanitize(r.year) === yFilter),
    [masterData, mFilter, yFilter]
  );

  // Filter Selection Sheet aggressively
  const filteredSelection = useMemo(() =>
    selectionData
      .filter(r => mFilter === 'all' || sanitize(r.month) === mFilter),
    [selectionData, mFilter]
  );

  // Safe EOD filtering (loose match)
  const filteredEod = useMemo(() => {
    if (mFilter === 'all' && yFilter === 'all') return eodData || [];
    return (eodData || []).filter(r => {
      if (!r.date) return false;
      return mFilter === 'all' || sanitize(r.date).includes(mFilter.slice(0, 3));
    });
  }, [eodData, mFilter, yFilter]);

  const metrics = useMemo(() => {
    const totalRevenue = filteredSelection.filter(r => sanitize(r.candidateStatus) === 'joined').reduce((sum, r) => sum + (Number(r.clientPayout) || 0), 0);
    return {
      activePipeline: filteredMaster.filter(r => sanitize(r.stage) === 'process' || sanitize(r.stage) === 'fb pending').length,
      joinedThisMonth: filteredSelection.filter(r => sanitize(r.candidateStatus) === 'joined').length,
      stuckCandidates: filteredMaster.filter(r => r.date && daysSince(r.date) >= 5 && sanitize(r.stage) !== 'joined').length,
      backoutRisk: filteredSelection.filter(r => ['backout', 'offer backout', 'drop'].includes(sanitize(r.candidateStatus))).length,
      totalRevenue,
    };
  }, [filteredMaster, filteredSelection]);

  const funnel = useMemo(() => {
    const stages = ['FB Pending', 'CV Shortlisted', 'Process', 'Offered', 'Joined'];
    const counts = stages.map(s => {
      const sanS = sanitize(s);
      if (s === 'Offered') return filteredSelection.filter(r => ['ol released', 'offer pending'].includes(sanitize(r.candidateStatus))).length;
      if (s === 'Joined') return filteredSelection.filter(r => sanitize(r.candidateStatus) === 'joined').length;
      return filteredMaster.filter(r => sanitize(r.stage) === sanS).length;
    });
    const max = Math.max(...counts, 1);
    return stages.map((s, i) => ({
      stage: s,
      count: counts[i],
      width: (counts[i] / max) * 100,
      drop: i ? Math.round((((counts[i - 1] || 1) - counts[i]) / (counts[i - 1] || 1)) * 100) : 0
    }));
  }, [filteredMaster, filteredSelection]);

  const statusBreakdown = useMemo(() => {
    return Object.entries(filteredMaster.reduce((acc, r) => {
      const stat = r.clientStatus ? r.clientStatus.trim() : 'Unknown';
      return { ...acc, [stat]: (acc[stat] || 0) + 1 };
    }, {} as Record<string, number>)).sort((a, b) => b[1] - a[1]);
  }, [filteredMaster]);

  // Robust Leaderboard computing directly from Selection Sheet + EOD
  const leaderboard = useMemo(() => {
    const recruiterStats: Record<string, { calls: number; lineups: number; selections: number; revenue: number }> = {};

    // First: Base it off actual selections and joinings from the robust Selection Sheet
    filteredSelection.forEach(r => {
      let name = sanitize(r.recruiterName);
      if (name.includes('@')) name = name.split('@')[0];
      if (!name) return;
      const cleanName = name.charAt(0).toUpperCase() + name.slice(1);

      if (!recruiterStats[cleanName]) recruiterStats[cleanName] = { calls: 0, lineups: 0, selections: 0, revenue: 0 };
      recruiterStats[cleanName].selections += 1;

      if (sanitize(r.candidateStatus) === 'joined') {
        recruiterStats[cleanName].revenue += (Number(r.clientPayout) || 0);
      }
    });

    // Second: Lay the EOD metrics on top using fuzzy name matching
    filteredEod.forEach(r => {
      let name = sanitize(r.recruiterName);
      if (!name) return;
      const cleanName = name.charAt(0).toUpperCase() + name.slice(1);
      const eodLower = cleanName.toLowerCase();

      // Fuzzy match: find existing key where one name contains the other
      const matchedKey = Object.keys(recruiterStats).find(k => {
        const kLower = k.toLowerCase();
        return kLower.includes(eodLower) || eodLower.includes(kLower);
      });

      const key = matchedKey || cleanName;
      if (!recruiterStats[key]) recruiterStats[key] = { calls: 0, lineups: 0, selections: 0, revenue: 0 };
      recruiterStats[key].calls += (Number(r.totalCallsMade) || 0);
      recruiterStats[key].lineups += (Number(r.lineupsDone) || 0);
    });

    // Calculate score and array
    return Object.entries(recruiterStats).map(([name, stats]) => {
      const score = (stats.calls * 0.2) + (stats.lineups * 2) + (stats.selections * 4);
      return {
        recruiterName: name,
        totalCallsMade: stats.calls,
        lineupsDone: stats.lineups,
        selections: stats.selections,
        revenue: stats.revenue,
        score
      };
    }).sort((a, b) => b.score - a.score);
  }, [filteredEod, filteredSelection]);

  const urgent = useMemo(() => filteredMaster.filter(r => sanitize(r.stage) === 'fb pending' && r.date && daysSince(r.date) >= 7).sort((a, b) => daysSince(b.date) - daysSince(a.date)), [filteredMaster]);

  const runAnalyze = async () => {
    const prompt = `Analyze recruitment funnel ${JSON.stringify(funnel)} and recruiter stats ${JSON.stringify(leaderboard)}. Give concise actionable insights.`;
    const res = await onAiAnalyze(prompt);
    if (res) setInsight(res);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-sm font-display font-bold text-foreground">Dashboard</h2>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {([
          ['Total Active Pipeline', metrics.activePipeline, <Users className="h-4 w-4 text-primary" />],
          ['Joined This Month', metrics.joinedThisMonth, <TrendingUp className="h-4 w-4 text-rp-green" />],
          ['Stuck Candidates', metrics.stuckCandidates, <AlertTriangle className="h-4 w-4 text-rp-yellow" />],
          ['Backout Risk', metrics.backoutRisk, <ShieldAlert className="h-4 w-4 text-rp-orange" />],
          ['Total Revenue', `₹${metrics.totalRevenue.toLocaleString('en-IN')}`, <IndianRupee className="h-4 w-4 text-rp-teal" />],
        ] as [string, string | number, React.ReactNode][]).map(([label, value, icon]) => (
          <Card key={String(label)} className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-2xl font-display font-bold">{String(value)}</p>
                </div>
                {icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-display">Hiring Funnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {funnel.map(f => (
              <div key={f.stage}>
                <div className="flex justify-between text-xs">
                  <span>{f.stage}</span>
                  <span className="text-muted-foreground">{f.count}{f.drop ? ` · Drop ${f.drop}%` : ''}</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className={`h-full ${stageColor[f.stage]}`} style={{ width: `${f.width}%` }} />
                </div>
              </div>
            ))}
            <Button onClick={runAnalyze} disabled={aiLoading} className="w-full bg-primary text-primary-foreground">
              <Sparkles className="mr-2 h-4 w-4" />🤖 AI Analyze
            </Button>
            {aiLoading && <div className="mx-auto h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin-glow" />}
            {aiError && <p className="text-xs text-destructive">{aiError}</p>}
            {insight && <div className="rounded border border-primary/30 bg-primary/5 p-3 text-xs whitespace-pre-wrap">{insight}</div>}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-display">Client Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {statusBreakdown.slice(0, 10).map(([s, c]) => (
              <div key={s} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{s}</span>
                <Badge variant="outline" className="border-border">{c}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-display">Recruiter Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2 text-left">Recruiter</th>
                <th className="py-2 text-left">Calls</th>
                <th className="py-2 text-left">Lineups</th>
                <th className="py-2 text-left">Selections</th>
                <th className="py-2 text-left">Revenue</th>
                <th className="py-2 text-left">Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length === 0 ? (
                <tr><td colSpan={6} className="py-4 text-center text-muted-foreground">No selections found this month.</td></tr>
              ) : (
                leaderboard.map(r => (
                  <tr key={r.recruiterName} className="border-b border-border/40">
                    <td className="py-2">{r.recruiterName}</td>
                    <td>{r.totalCallsMade}</td>
                    <td>{r.lineupsDone}</td>
                    <td>{r.selections}</td>
                    <td className="text-rp-teal">₹{r.revenue.toLocaleString('en-IN')}</td>
                    <td className="text-primary">{r.score.toFixed(1)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

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
            urgent.slice(0, 8).map(c => (
              <div key={c.candidateName + c.date} className="rounded border border-rp-orange/40 bg-rp-orange/10 p-2 text-xs flex items-center justify-between">
                <div>
                  <span className="text-foreground font-medium">{c.candidateName}</span>
                  <span className="text-muted-foreground ml-2">{c.role} @ {c.organisation || 'Unknown'}</span>
                </div>
                <span className={`font-display font-bold ${daysSince(c.date) > 7 ? 'text-rp-red' : 'text-rp-yellow'}`}>
                  {daysSince(c.date)}d stuck
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
