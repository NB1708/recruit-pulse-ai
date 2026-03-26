import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMemo, useState } from 'react';
import { TrendingUp, Users, AlertTriangle, ShieldAlert, Sparkles, IndianRupee, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { EODSheetRow, MasterTrackerRow, SelectionSheetRow } from '@/types/recruitment';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

interface DashboardTabProps {
  masterData: MasterTrackerRow[];
  selectionData: SelectionSheetRow[];
  eodData: EODSheetRow[];
  onAiAnalyze: (prompt: string) => Promise<string | null>;
  aiLoading: boolean;
  aiError: string | null;
  monthFilter: string;
  yearFilter: string;
  cycleStartDay: number;
  onMonthChange: (v: string) => void;
  onYearChange: (v: string) => void;
  onCycleStartDayChange: (v: number) => void;
  years: string[];
}

const stageColor: Record<string, string> = {
  'FB Pending': 'bg-rp-orange',
  'CV Shortlisted': 'bg-rp-blue',
  'Process': 'bg-rp-purple',
  'Offered': 'bg-rp-green',
  'Joined': 'bg-rp-teal',
};

/** Parse DD/MM/YYYY or fallback */
function parseDate(s: string): Date {
  if (!s) return new Date(NaN);
  const parts = s.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts.map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(s);
}

const daysSince = (s: string) => {
  const t = parseDate(s).getTime();
  return isNaN(t) ? 0 : Math.floor((Date.now() - t) / 86400000);
};

const sanitize = (val: any) => (val || '').toString().trim().toLowerCase();

/** Get cycle date range: [cycleStartDate, cycleEndDate] inclusive for given month/year/cycleDay.
 * E.g. month=March, year=2026, cycleDay=5 → March 5, 2026 to April 4, 2026 (inclusive). */
function getCycleDateRange(monthName: string, yearStr: string, cycleDay: number): [Date, Date] | null {
  const mIdx = MONTH_NAMES.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
  if (mIdx === -1) return null;
  const year = Number(yearStr);
  if (isNaN(year)) return null;
  // Cycle starts on cycleDay of selected month
  const start = new Date(year, mIdx, cycleDay, 0, 0, 0, 0);
  // Cycle ends the day before cycleDay of next month (inclusive)
  const endExclusive = new Date(year, mIdx + 1, cycleDay);
  const end = new Date(endExclusive.getTime() - 86400000); // subtract 1 day
  end.setHours(23, 59, 59, 999);
  return [start, end];
}

/** Check if a joining date string (DD/MM/YYYY) falls within the cycle range [start, end] inclusive */
function isDateInCycle(dateStr: string, range: [Date, Date] | null): boolean {
  if (!range) return true;
  const d = parseDate(dateStr);
  if (isNaN(d.getTime())) return false;
  return d.getTime() >= range[0].getTime() && d.getTime() <= range[1].getTime();
}

export default function DashboardTab({ masterData, selectionData, eodData, onAiAnalyze, aiLoading, aiError, monthFilter, yearFilter, cycleStartDay, onMonthChange, onYearChange, onCycleStartDayChange, years }: DashboardTabProps) {
  const [insight, setInsight] = useState('');

  const mFilter = sanitize(monthFilter);
  const yFilter = sanitize(yearFilter);

  const cycleRange = useMemo(() => {
    if (mFilter === 'all' || yFilter === 'all') return null;
    return getCycleDateRange(monthFilter, yearFilter, cycleStartDay);
  }, [monthFilter, yearFilter, cycleStartDay, mFilter, yFilter]);

  const filteredMaster = useMemo(() =>
    masterData
      .filter(r => mFilter === 'all' || sanitize(r.month) === mFilter)
      .filter(r => yFilter === 'all' || sanitize(r.year) === yFilter),
    [masterData, mFilter, yFilter]
  );

  const filteredSelection = useMemo(() =>
    selectionData
      .filter(r => mFilter === 'all' || sanitize(r.month) === mFilter),
    [selectionData, mFilter]
  );

  const filteredEod = useMemo(() => {
    if (mFilter === 'all' && yFilter === 'all') return eodData || [];
    return (eodData || []).filter(r => {
      if (!r.date) return false;
      return mFilter === 'all' || sanitize(r.date).includes(mFilter.slice(0, 3));
    });
  }, [eodData, mFilter, yFilter]);

  // Get yesterday's EOD data
  const yesterdayEod = useMemo(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yDay = yesterday.getDate();
    const yMonth = yesterday.toLocaleString('default', { month: 'short' }).toLowerCase();
    return (eodData || []).filter(r => {
      if (!r.date) return false;
      const d = sanitize(r.date);
      return d.includes(String(yDay)) && d.includes(yMonth);
    });
  }, [eodData]);

  const metrics = useMemo(() => {
    const totalRevenue = filteredSelection.filter(r => sanitize(r.candidateStatus) === 'joined').reduce((sum, r) => sum + (Number(r.clientPayout) || 0), 0);

    // Joined this month: scan ALL selection data (not pre-filtered by month string)
    // and count only rows whose actual joiningDate falls within the cycle range
    const joinedThisMonth = selectionData.filter(r => {
      if (sanitize(r.candidateStatus) !== 'joined') return false;
      if (!cycleRange) return true; // "all" filter
      return isDateInCycle(r.joiningDate, cycleRange);
    }).length;

    return {
      activePipeline: filteredMaster.filter(r => sanitize(r.stage) === 'process' || sanitize(r.stage) === 'fb pending').length,
      joinedThisMonth,
      stuckCandidates: filteredMaster.filter(r => r.date && daysSince(r.date) >= 5 && sanitize(r.stage) !== 'joined').length,
      backoutRisk: filteredSelection.filter(r => ['backout', 'offer backout', 'drop'].includes(sanitize(r.candidateStatus))).length,
      totalRevenue,
    };
  }, [filteredMaster, filteredSelection, cycleRange]);

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

  // Leaderboard with joinings, prev day lineup & interview
  const leaderboard = useMemo(() => {
    const recruiterStats: Record<string, { calls: number; lineups: number; selections: number; revenue: number; joinings: number; prevDayLineups: number; prevDayInterviews: number }> = {};

    filteredSelection.forEach(r => {
      let name = sanitize(r.recruiterName);
      if (name.includes('@')) name = name.split('@')[0];
      if (!name) return;
      const cleanName = name.charAt(0).toUpperCase() + name.slice(1);

      if (!recruiterStats[cleanName]) recruiterStats[cleanName] = { calls: 0, lineups: 0, selections: 0, revenue: 0, joinings: 0, prevDayLineups: 0, prevDayInterviews: 0 };
      recruiterStats[cleanName].selections += 1;
    });

    // Joinings & Revenue: use raw selectionData + cycle date range (same logic as joinedThisMonth)
    selectionData.forEach(r => {
      if (sanitize(r.candidateStatus) !== 'joined') return;
      if (cycleRange && !isDateInCycle(r.joiningDate, cycleRange)) return;
      let name = sanitize(r.recruiterName);
      if (name.includes('@')) name = name.split('@')[0];
      if (!name) return;
      const cleanName = name.charAt(0).toUpperCase() + name.slice(1);
      const eodLower = cleanName.toLowerCase();
      const matchedKey = Object.keys(recruiterStats).find(k => k.toLowerCase().includes(eodLower) || eodLower.includes(k.toLowerCase()));
      const key = matchedKey || cleanName;
      if (!recruiterStats[key]) recruiterStats[key] = { calls: 0, lineups: 0, selections: 0, revenue: 0, joinings: 0, prevDayLineups: 0, prevDayInterviews: 0 };
      recruiterStats[key].revenue += (Number(r.clientPayout) || 0);
      recruiterStats[key].joinings += 1;
    });

    filteredEod.forEach(r => {
      let name = sanitize(r.recruiterName);
      if (!name) return;
      const cleanName = name.charAt(0).toUpperCase() + name.slice(1);
      const eodLower = cleanName.toLowerCase();

      const matchedKey = Object.keys(recruiterStats).find(k => {
        const kLower = k.toLowerCase();
        return kLower.includes(eodLower) || eodLower.includes(kLower);
      });

      const key = matchedKey || cleanName;
      if (!recruiterStats[key]) recruiterStats[key] = { calls: 0, lineups: 0, selections: 0, revenue: 0, joinings: 0, prevDayLineups: 0, prevDayInterviews: 0 };
      recruiterStats[key].calls += (Number(r.totalCallsMade) || 0);
      recruiterStats[key].lineups += (Number(r.lineupsDone) || 0);
    });

    // Previous day stats
    yesterdayEod.forEach(r => {
      let name = sanitize(r.recruiterName);
      if (!name) return;
      const cleanName = name.charAt(0).toUpperCase() + name.slice(1);
      const eodLower = cleanName.toLowerCase();
      const matchedKey = Object.keys(recruiterStats).find(k => k.toLowerCase().includes(eodLower) || eodLower.includes(k.toLowerCase()));
      const key = matchedKey || cleanName;
      if (!recruiterStats[key]) recruiterStats[key] = { calls: 0, lineups: 0, selections: 0, revenue: 0, joinings: 0, prevDayLineups: 0, prevDayInterviews: 0 };
      recruiterStats[key].prevDayLineups += (Number(r.lineupsDone) || 0);
      recruiterStats[key].prevDayInterviews += (Number(r.selections) || 0);
    });

    return Object.entries(recruiterStats).map(([name, stats]) => {
      const score = (stats.calls * 0.2) + (stats.lineups * 2) + (stats.selections * 4);
      return { recruiterName: name, ...stats, score };
    }).sort((a, b) => b.score - a.score);
  }, [filteredEod, filteredSelection, selectionData, cycleRange, yesterdayEod]);

  // Lineup discrepancy: EOD lineups vs Master Tracker lineup-stage rows
  const lineupDiscrepancy = useMemo(() => {
    const eodLineups = filteredEod.reduce((sum, r) => sum + (Number(r.lineupsDone) || 0), 0);
    const masterLineups = filteredMaster.filter(r => {
      const s = sanitize(r.stage);
      return s === 'cv shortlisted' || s === 'process';
    }).length;
    if (eodLineups === 0 && masterLineups === 0) return null;
    if (eodLineups !== masterLineups) return { eod: eodLineups, master: masterLineups };
    return null;
  }, [filteredEod, filteredMaster]);

  const urgent = useMemo(() => filteredMaster.filter(r => sanitize(r.stage) === 'fb pending' && r.date && daysSince(r.date) >= 7).sort((a, b) => daysSince(b.date) - daysSince(a.date)), [filteredMaster]);

  const runAnalyze = async () => {
    const prompt = `Analyze recruitment funnel ${JSON.stringify(funnel)} and recruiter stats ${JSON.stringify(leaderboard)}. Give concise actionable insights.`;
    const res = await onAiAnalyze(prompt);
    if (res) setInsight(res);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-display font-bold text-foreground">Dashboard</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Label className="text-[10px] text-muted-foreground whitespace-nowrap">Cycle Day</Label>
            <Input
              type="number"
              min={1}
              max={28}
              value={cycleStartDay}
              onChange={e => onCycleStartDayChange(Math.max(1, Math.min(28, Number(e.target.value) || 1)))}
              className="w-14 bg-card border-border text-foreground text-xs h-8 text-center"
            />
          </div>
          <Select value={yearFilter} onValueChange={onYearChange}>
            <SelectTrigger className="w-24 bg-card border-border text-foreground text-xs h-8">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Years</SelectItem>
              {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={monthFilter} onValueChange={onMonthChange}>
            <SelectTrigger className="w-28 bg-card border-border text-foreground text-xs h-8">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Months</SelectItem>
              {MONTH_NAMES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {lineupDiscrepancy && (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-sm font-semibold">⚠️ Lineup Data Mismatch Detected!</AlertTitle>
          <AlertDescription className="text-xs">
            EOD Sheet lineups: <strong>{lineupDiscrepancy.eod}</strong> vs Master Tracker pipeline (CV Shortlisted + Process): <strong>{lineupDiscrepancy.master}</strong>. These numbers should match. Please verify recruiter entries.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {([
          ['Active Pipeline', metrics.activePipeline, <Users className="h-4 w-4 text-primary" />],
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
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2 text-left">Recruiter</th>
                  <th className="py-2 text-left">Calls</th>
                  <th className="py-2 text-left">Lineups</th>
                  <th className="py-2 text-left">Selections</th>
                  <th className="py-2 text-left">Joinings</th>
                  <th className="py-2 text-left">Revenue</th>
                  <th className="py-2 text-left">Prev Lineups</th>
                  <th className="py-2 text-left">Prev Interviews</th>
                  <th className="py-2 text-left">Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length === 0 ? (
                  <tr><td colSpan={9} className="py-4 text-center text-muted-foreground">No data found this month.</td></tr>
                ) : (
                  leaderboard.map(r => (
                    <tr key={r.recruiterName} className="border-b border-border/40">
                      <td className="py-2">{r.recruiterName}</td>
                      <td>{r.calls}</td>
                      <td>{r.lineups}</td>
                      <td>{r.selections}</td>
                      <td className="text-rp-green">{r.joinings}</td>
                      <td className="text-rp-teal">₹{r.revenue.toLocaleString('en-IN')}</td>
                      <td>{r.prevDayLineups}</td>
                      <td>{r.prevDayInterviews}</td>
                      <td className="text-primary">{r.score.toFixed(1)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
