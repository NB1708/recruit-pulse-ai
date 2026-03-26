import type { MasterTrackerRow, SelectionSheetRow } from '@/types/recruitment';

interface StatCardsProps {
  masterData: MasterTrackerRow[];
  selectionData: SelectionSheetRow[];
}

function daysBetween(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export function StatCards({ masterData, selectionData }: StatCardsProps) {
  const activePipeline = masterData.filter(r => r.stage === 'Process' || r.stage === 'FB Pending').length;
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const joinedThisMonth = selectionData.filter(r => r.candidateStatus === 'Joined' && r.month === currentMonth).length;
  const stuck = masterData.filter(r => daysBetween(r.date) >= 5 && r.stage !== 'Joined').length;
  const backoutRisk = selectionData.filter(r => ['Backout', 'Offer Backout', 'Drop'].includes(r.candidateStatus)).length;

  const cards = [
    { label: 'Active Pipeline', value: activePipeline, color: 'text-rp-green', icon: '🔥' },
    { label: 'Joined This Month', value: joinedThisMonth, color: 'text-rp-teal', icon: '🎉' },
    { label: 'Stuck Candidates', value: stuck, color: 'text-rp-yellow', icon: '⚠️' },
    { label: 'Backout Risk', value: backoutRisk, color: 'text-rp-red', icon: '🚨' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map(card => (
        <div key={card.label} className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg">{card.icon}</span>
          </div>
          <p className={`text-2xl font-display font-bold ${card.color}`}>{card.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
