import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

const COLORS = ['#00E5A0', '#4D9FFF', '#FF6B35', '#9B6FFF', '#00C9A7', '#F8B500'];

interface SourceBreakdownProps {
  sourceData: Record<string, number>;
}

export function SourceBreakdown({ sourceData }: SourceBreakdownProps) {
  const data = Object.entries(sourceData).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <h3 className="font-display font-semibold text-foreground mb-3">📡 Source Channels</h3>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">No calling data yet</p>
      ) : (
        <div className="h-48">
          <ResponsiveContainer>
            <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={70} tick={{ fill: '#6B7A99', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#111520', border: '1px solid #1E2535', borderRadius: '8px', color: '#E8EDF5', fontSize: '12px' }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
