import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AiSpinner } from '@/components/AiSpinner';
import type { MasterTrackerRow, EODSheetRow, SelectionSheetRow } from '@/types/recruitment';

interface DailyBriefingTabProps {
  masterData: MasterTrackerRow[];
  selectionData: SelectionSheetRow[];
  eodData: EODSheetRow[];
  onGenerate: (prompt: string) => Promise<string | null>;
  aiLoading: boolean;
}

function daysBetween(dateStr: string): number {
  return Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

export function DailyBriefingTab({ masterData, selectionData, eodData, onGenerate, aiLoading }: DailyBriefingTabProps) {
  const [briefing, setBriefing] = useState<string | null>(null);

  const totalCalls = eodData.reduce((s, r) => s + r.totalCallsMade, 0);
  const totalLineups = eodData.reduce((s, r) => s + r.lineupsDone, 0);
  const totalSelections = eodData.reduce((s, r) => s + r.selections, 0);
  const totalJoinings = eodData.reduce((s, r) => s + r.joinings, 0);
  const stuck = masterData.filter(r => daysBetween(r.date) >= 5 && r.stage !== 'Joined').length;
  const backouts = selectionData.filter(r => ['Backout', 'Offer Backout', 'Drop'].includes(r.candidateStatus)).length;

  const handleGenerate = async () => {
    const prompt = `You are RecruitPulse AI, Nikita Berwal's recruitment copilot at Hunar.AI. She manages 6 recruiters. Today's data: ${totalCalls} total calls made, ${totalLineups} lineups done, ${totalSelections} selections, ${totalJoinings} joinings, ${stuck} stuck candidates (5+ days), ${backouts} backouts/dropouts. Recruiter breakdown: ${eodData.map(r => `${r.recruiterName}: ${r.totalCallsMade} calls, ${r.lineupsDone} lineups`).join('; ')}. Generate a crisp morning briefing with: Today's priorities, at-risk candidates needing call, AI tip to improve conversion, quick wins. Under 200 words. Use emojis. Be specific and actionable.`;
    const result = await onGenerate(prompt);
    if (result) setBriefing(result);
  };

  const metrics = [
    { label: 'Total Calls', value: totalCalls, icon: '📞', color: 'text-rp-blue' },
    { label: 'Lineups', value: totalLineups, icon: '📋', color: 'text-rp-orange' },
    { label: 'Selections', value: totalSelections, icon: '✅', color: 'text-rp-green' },
    { label: 'Joinings', value: totalJoinings, icon: '🎉', color: 'text-rp-teal' },
    { label: 'Stuck', value: stuck, icon: '⚠️', color: 'text-rp-yellow' },
    { label: 'Backouts', value: backouts, icon: '🚨', color: 'text-rp-red' },
  ];

  return (
    <div className="space-y-4 animate-fade-in max-w-xl mx-auto">
      <div className="grid grid-cols-3 gap-3">
        {metrics.map(m => (
          <div key={m.label} className="bg-card border border-border rounded-lg p-3 text-center">
            <span className="text-lg">{m.icon}</span>
            <p className={`text-xl font-display font-bold ${m.color} mt-1`}>{m.value}</p>
            <p className="text-xs text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      {!briefing && !aiLoading && (
        <Button onClick={handleGenerate} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display text-base py-6">
          📋 Generate Morning Briefing
        </Button>
      )}

      {aiLoading && (
        <div className="flex justify-center py-10">
          <AiSpinner />
        </div>
      )}

      {briefing && (
        <div className="bg-card border border-primary/30 rounded-lg p-5">
          <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
            🤖 AI Morning Briefing
          </h3>
          <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{briefing}</div>
          <Button onClick={handleGenerate} disabled={aiLoading} variant="outline" className="mt-4 border-border text-foreground hover:bg-secondary">
            🔄 Regenerate
          </Button>
        </div>
      )}
    </div>
  );
}
