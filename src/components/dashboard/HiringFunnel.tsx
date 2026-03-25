import type { MasterTrackerRow } from '@/types/recruitment';

interface HiringFunnelProps {
  masterData: MasterTrackerRow[];
}

const STAGES = ['Feedback Pending', 'CV Shortlisted', 'Process', 'Offered', 'Joined'] as const;
const STAGE_COLORS: Record<string, string> = {
  'Feedback Pending': 'bg-rp-orange',
  'CV Shortlisted': 'bg-rp-blue',
  'Process': 'bg-rp-purple',
  'Offered': 'bg-rp-green',
  'Joined': 'bg-rp-teal',
};

export function HiringFunnel({ masterData }: HiringFunnelProps) {
  const counts: Record<string, number> = {};
  STAGES.forEach(s => { counts[s] = 0; });
  
  masterData.forEach(r => {
    // Count by clientStatus for Offered, by stage for others
    if (r.clientStatus === 'Offered') counts['Offered']++;
    else if (STAGES.includes(r.stage as any)) counts[r.stage]++;
  });

  const maxCount = Math.max(...Object.values(counts), 1);

  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <h3 className="font-display font-semibold text-foreground mb-4">Hiring Funnel</h3>
      <div className="space-y-3">
        {STAGES.map((stage, i) => {
          const count = counts[stage];
          const pct = Math.round((count / maxCount) * 100);
          const prevCount = i > 0 ? counts[STAGES[i - 1]] : null;
          const dropOff = prevCount && prevCount > 0 ? Math.round(((prevCount - count) / prevCount) * 100) : null;

          return (
            <div key={stage}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-foreground font-medium">{stage}</span>
                <div className="flex items-center gap-2">
                  <span className="text-foreground font-display font-bold">{count}</span>
                  {dropOff !== null && dropOff > 0 && (
                    <span className="text-rp-red text-xs">-{dropOff}%</span>
                  )}
                </div>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${STAGE_COLORS[stage]} transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
