import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DEMO_EOD_SHEET, DEMO_MASTER_TRACKER, DEMO_SELECTION_SHEET } from '@/data/demoData';
import { Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface DailyBriefingTabProps {
  onGenerate: (prompt: string) => Promise<string | null>;
  loading: boolean;
  error: string | null;
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
}

function daysSince(str: string): number {
  const d = new Date(str);
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export default function DailyBriefingTab({ onGenerate, loading, error }: DailyBriefingTabProps) {
  const [briefing, setBriefing] = useState('');

  const todayStats = useMemo(() => {
    const todayEod = DEMO_EOD_SHEET.filter(r => isToday(r.date));
    const calls = todayEod.reduce((sum, r) => sum + r.totalCallsMade, 0);
    const lineups = todayEod.reduce((sum, r) => sum + r.lineupsDone, 0);
    const selections = todayEod.reduce((sum, r) => sum + r.selections, 0);
    const joinings = todayEod.reduce((sum, r) => sum + r.joinings, 0);
    const stuck = DEMO_MASTER_TRACKER.filter(r => r.stage !== 'Joined' && daysSince(r.date) >= 5).length;
    const backouts = DEMO_SELECTION_SHEET.filter(r => r.candidateStatus === 'Backout' || r.candidateStatus === 'Dropout').length;
    return { calls, lineups, selections, joinings, stuck, backouts };
  }, []);

  const generateBriefing = async () => {
    const prompt = `You are RecruitPulse AI, Nikita Berwal's recruitment copilot at Hunar.AI. She manages 6 recruiters. Today's data: calls=${todayStats.calls}, lineups=${todayStats.lineups}, stuck candidates=${todayStats.stuck}, joinings=${todayStats.joinings}, backouts=${todayStats.backouts}, selections=${todayStats.selections}. Generate a crisp morning briefing with: Today's priorities, at-risk candidates needing call, AI tip to improve conversion, quick wins. Under 200 words. Use emojis. Be specific and actionable.`;
    const result = await onGenerate(prompt);
    if (result) setBriefing(result);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-display">Daily AI Briefing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={generateBriefing} disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Sparkles className="mr-2 h-4 w-4" /> Generate Briefing
          </Button>
          {loading && <div className="mx-auto h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin-glow" />}
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="rounded-lg border border-border bg-secondary/40 p-4 text-sm text-foreground min-h-40 prose prose-invert prose-sm max-w-none">
            {briefing ? <ReactMarkdown>{briefing}</ReactMarkdown> : <p className="text-muted-foreground">Click Generate Briefing to get today's actionable summary.</p>}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        <Card className="border-border bg-card"><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">Calls</p><p className="text-lg font-display font-bold text-foreground">{todayStats.calls}</p></CardContent></Card>
        <Card className="border-border bg-card"><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">Lineups</p><p className="text-lg font-display font-bold text-foreground">{todayStats.lineups}</p></CardContent></Card>
        <Card className="border-border bg-card"><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">Selections</p><p className="text-lg font-display font-bold text-foreground">{todayStats.selections}</p></CardContent></Card>
        <Card className="border-border bg-card"><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">Joinings</p><p className="text-lg font-display font-bold text-rp-green">{todayStats.joinings}</p></CardContent></Card>
        <Card className="border-border bg-card"><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">Stuck</p><p className="text-lg font-display font-bold text-rp-yellow">{todayStats.stuck}</p></CardContent></Card>
        <Card className="border-border bg-card"><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">Backouts</p><p className="text-lg font-display font-bold text-rp-red">{todayStats.backouts}</p></CardContent></Card>
      </div>
    </div>
  );
}
