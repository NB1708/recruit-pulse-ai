import { AlertTriangle } from 'lucide-react';
import type { MasterTrackerRow } from '@/types/recruitment';

interface UrgentCandidatesProps {
  masterData: MasterTrackerRow[];
}

function daysBetween(dateStr: string): number {
  return Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

export function UrgentCandidates({ masterData }: UrgentCandidatesProps) {
  const urgent = masterData
    .filter(r => r.stage === 'FB Pending' && daysBetween(r.date) >= 7)
    .sort((a, b) => daysBetween(b.date) - daysBetween(a.date));

  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-rp-orange" />
        Urgent Attention
      </h3>
      {urgent.length === 0 ? (
        <p className="text-sm text-muted-foreground">No urgent candidates 🎉</p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {urgent.map(r => {
            const days = daysBetween(r.date);
            return (
              <div key={r.candidateName + r.date} className="flex items-center justify-between text-sm p-2 rounded-md bg-secondary/50">
                <div>
                  <span className="text-foreground font-medium">{r.candidateName}</span>
                  <span className="text-muted-foreground ml-2 text-xs">{r.role} @ {r.organisation}</span>
                </div>
                <span className={`text-xs font-display font-bold ${days > 7 ? 'text-rp-red' : 'text-rp-yellow'}`}>
                  {days}d stuck
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
