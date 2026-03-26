import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { MasterTrackerRow } from '@/types/recruitment';

const STATUS_COLORS: Record<string, string> = {
  'FB Pending': '#FF6B35',
  'CV Shortlisted': '#4D9FFF',
  'Process': '#9B6FFF',
  'Joined': '#00C9A7',
  'Offered': '#00E5A0',
  'Backout': '#FF4757',
  'Offer Backout': '#FF4757',
  'Drop': '#FF6B81',
  'TL Reject': '#FF9F43',
  'Interview Reject': '#EE5A24',
  'Tel': '#54A0FF',
  'VC': '#5F27CD',
  'F2F': '#01A3A4',
  'Finals': '#00D2D3',
  'Uselater': '#6B7A99',
  'Reject': '#C44569',
  'Duplicate': '#786FA6',
  'On Hold': '#F8B500',
  'Position on Hold': '#F6B93B',
  'Position Closed': '#718093',
};

interface ClientStatusChartProps {
  masterData: MasterTrackerRow[];
}

export function ClientStatusChart({ masterData }: ClientStatusChartProps) {
  const counts: Record<string, number> = {};
  masterData.forEach(r => {
    counts[r.clientStatus] = (counts[r.clientStatus] || 0) + 1;
  });

  const data = Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <h3 className="font-display font-semibold text-foreground mb-4">Client Status Breakdown</h3>
      <div className="flex items-center gap-4">
        <div className="w-48 h-48">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={70} strokeWidth={2} stroke="hsl(222,30%,10%)">
                {data.map(entry => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#6B7A99'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#111520', border: '1px solid #1E2535', borderRadius: '8px', color: '#E8EDF5', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1 text-xs max-h-48 overflow-y-auto">
          {data.map(entry => (
            <div key={entry.name} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_COLORS[entry.name] || '#6B7A99' }} />
              <span className="text-muted-foreground truncate">{entry.name}</span>
              <span className="text-foreground font-medium ml-auto">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
