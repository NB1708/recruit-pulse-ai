import type { EODSheetRow } from '@/types/recruitment';

interface RecruiterLeaderboardProps {
  eodData: EODSheetRow[];
}

export function RecruiterLeaderboard({ eodData }: RecruiterLeaderboardProps) {
  const sorted = [...eodData].sort((a, b) => (b.totalCallsMade + b.lineupsDone * 5 + b.selections * 20) - (a.totalCallsMade + a.lineupsDone * 5 + a.selections * 20));

  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <h3 className="font-display font-semibold text-foreground mb-4">📈 Recruiter Leaderboard</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground text-xs border-b border-border">
              <th className="text-left pb-2 font-medium">#</th>
              <th className="text-left pb-2 font-medium">Recruiter</th>
              <th className="text-right pb-2 font-medium">Calls</th>
              <th className="text-right pb-2 font-medium">Lineups</th>
              <th className="text-right pb-2 font-medium">Selections</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => (
              <tr key={r.recruiterName} className="border-b border-border/50 last:border-0">
                <td className="py-2 text-muted-foreground">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</td>
                <td className="py-2 text-foreground font-medium">{r.recruiterName}</td>
                <td className="py-2 text-right text-rp-blue font-display font-bold">{r.totalCallsMade}</td>
                <td className="py-2 text-right text-rp-orange font-display font-bold">{r.lineupsDone}</td>
                <td className="py-2 text-right text-rp-green font-display font-bold">{r.selections}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
