import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { EODSheetRow, MasterTrackerRow, SelectionSheetRow } from '@/types/recruitment';

interface DailyBriefingTabProps {
  eodData: EODSheetRow[];
  masterData: MasterTrackerRow[];
  selectionData: SelectionSheetRow[];
  onGenerate: (prompt: string) => Promise<string | null>;
  loading: boolean;
  error: string | null;
}

const isToday = (s: string) => { const d = new Date(s); const t = new Date(); return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate(); };
const daysSince = (s: string) => Math.floor((Date.now() - new Date(s).getTime()) / 86400000);

export default function DailyBriefingTab({ eodData, masterData, selectionData, onGenerate, loading, error }: DailyBriefingTabProps) {
  const [briefing, setBriefing] = useState('');
  const stats = useMemo(() => {
    const today = eodData.filter(r => isToday(r.date));
    return {
      calls: today.reduce((n, r) => n + r.totalCallsMade, 0),
      lineups: today.reduce((n, r) => n + r.lineupsDone, 0),
      selections: today.reduce((n, r) => n + r.selections, 0),
      joinings: today.reduce((n, r) => n + r.joinings, 0),
      stuck: masterData.filter(r => r.stage !== 'Joined' && daysSince(r.date) >= 5).length,
      backouts: selectionData.filter(r => ['Backout', 'Dropout'].includes(r.candidateStatus)).length,
    };
  }, [eodData, masterData, selectionData]);

  const generate = async () => {
    const prompt = `You are RecruitPulse AI, Nikita Berwal's recruitment copilot at Hunar.AI. She manages 6 recruiters. Today's data: calls=${stats.calls}, lineups=${stats.lineups}, stuck candidates=${stats.stuck}, joinings=${stats.joinings}, backouts=${stats.backouts}, selections=${stats.selections}. Generate a crisp morning briefing with priorities, at-risk candidates, AI tip, quick wins. Under 200 words with emojis.`;
    const out = await onGenerate(prompt);
    if (out) setBriefing(out);
  };

  return <div className="space-y-4 animate-fade-in">
    <Card className="border-border bg-card"><CardHeader><CardTitle className="text-sm font-display">Daily AI Briefing</CardTitle></CardHeader><CardContent className="space-y-3"><Button onClick={generate} disabled={loading} className="bg-primary text-primary-foreground"><Sparkles className="mr-2 h-4 w-4"/>Generate Briefing</Button>{loading && <div className="mx-auto h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin-glow" />}{error && <p className="text-xs text-destructive">{error}</p>}<div className="rounded border border-border bg-secondary/40 p-4 min-h-40 text-sm prose prose-invert prose-sm max-w-none">{briefing ? <ReactMarkdown>{briefing}</ReactMarkdown> : <p className="text-muted-foreground">Click Generate Briefing.</p>}</div></CardContent></Card>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-6">{[['Calls',stats.calls,'text-foreground'],['Lineups',stats.lineups,'text-foreground'],['Selections',stats.selections,'text-foreground'],['Joinings',stats.joinings,'text-rp-green'],['Stuck',stats.stuck,'text-rp-yellow'],['Backouts',stats.backouts,'text-rp-red']].map(([l,v,c]) => <Card key={String(l)} className="border-border bg-card"><CardContent className="p-3"><p className="text-[10px] text-muted-foreground">{String(l)}</p><p className={`text-lg font-display font-bold ${String(c)}`}>{String(v)}</p></CardContent></Card>)}</div>
  </div>;
}
