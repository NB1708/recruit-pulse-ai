import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import { AiSpinner } from '@/components/AiSpinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { MasterTrackerRow, EODSheetRow, SelectionSheetRow } from '@/types/recruitment';
import { StatCards } from './StatCards';
import { HiringFunnel } from './HiringFunnel';
import { ClientStatusChart } from './ClientStatusChart';
import { RecruiterLeaderboard } from './RecruiterLeaderboard';
import { UrgentCandidates } from './UrgentCandidates';
import { SourceBreakdown } from './SourceBreakdown';

interface DashboardTabProps {
  masterData: MasterTrackerRow[];
  selectionData: SelectionSheetRow[];
  eodData: EODSheetRow[];
  sourceData: Record<string, number>;
  onAiAnalyze: (prompt: string) => Promise<string | null>;
  aiLoading: boolean;
}

const currentMonth = new Date().toLocaleString('default', { month: 'long' });

export function DashboardTab({ masterData, selectionData, eodData, sourceData, onAiAnalyze, aiLoading }: DashboardTabProps) {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [monthFilter, setMonthFilter] = useState(currentMonth);

  const months = useMemo(() => [...new Set(masterData.map(r => r.month).filter(v => v && v.trim()))], [masterData]);

  const filteredMaster = useMemo(() =>
    monthFilter === 'all' ? masterData : masterData.filter(r => r.month === monthFilter),
    [masterData, monthFilter]
  );
  const filteredSelection = useMemo(() =>
    monthFilter === 'all' ? selectionData : selectionData.filter(r => r.month === monthFilter),
    [selectionData, monthFilter]
  );
  const filteredEod = useMemo(() => {
    if (monthFilter === 'all') return eodData;
    return eodData.filter(r => {
      const parts = r.date.split(/\s+/);
      const monthName = (parts[1] || '').toLowerCase();
      return monthName.startsWith(monthFilter.toLowerCase().slice(0, 3));
    });
  }, [eodData, monthFilter]);

  const handleAnalyze = async () => {
    const stages: Record<string, number> = {};
    filteredMaster.forEach(r => { stages[r.stage] = (stages[r.stage] || 0) + 1; });
    const recruiterStats = filteredEod.map(r => `${r.recruiterName}: ${r.totalCallsMade} calls, ${r.lineupsDone} lineups, ${r.selections} selections`).join('; ');

    const prompt = `You are RecruitPulse AI, an analytics engine for Hunar.AI's recruitment team managed by Nikita Berwal. Analyze this pipeline data and provide 3-4 key insights with actionable recommendations.

Funnel counts: ${JSON.stringify(stages)}
Recruiter performance today: ${recruiterStats}
Total active pipeline: ${filteredMaster.filter(r => r.stage !== 'Joined').length}

Be specific, use numbers, suggest exactly what to do. Use emojis. Keep under 150 words.`;

    const result = await onAiAnalyze(prompt);
    if (result) setAiInsight(result);
  };

  return (
    <div className="space-y-4 animate-fade-in">
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
      <StatCards masterData={filteredMaster} selectionData={filteredSelection} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <HiringFunnel masterData={filteredMaster} selectionData={filteredSelection} />
          <div className="flex items-center gap-3">
            <Button onClick={handleAnalyze} disabled={aiLoading} className="bg-primary text-primary-foreground hover:bg-primary/90 font-display">
              <Bot className="h-4 w-4 mr-2" />
              🤖 AI Analyze
            </Button>
            {aiLoading && <AiSpinner />}
          </div>
          {aiInsight && (
            <div className="bg-card border border-primary/30 rounded-lg p-4 text-sm text-foreground whitespace-pre-wrap">
              {aiInsight}
            </div>
          )}
        </div>
        <ClientStatusChart masterData={filteredMaster} />
      </div>

      <RecruiterLeaderboard eodData={filteredEod} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UrgentCandidates masterData={filteredMaster} />
        <SourceBreakdown sourceData={sourceData} />
      </div>
    </div>
  );
}
