import { useMemo, useState } from 'react';
import { DEMO_MASTER_TRACKER } from '@/data/demoData';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquareShare } from 'lucide-react';
import type { CandidateForWhatsApp } from '@/types/recruitment';

interface CandidatesTabProps {
  onSelectCandidate: (candidate: CandidateForWhatsApp) => void;
}

function daysSince(str: string): number {
  const d = new Date(str);
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function stageBadgeClass(stage: string): string {
  switch (stage) {
    case 'Feedback Pending': return 'bg-rp-orange/20 text-rp-orange border-rp-orange/40';
    case 'CV Shortlisted': return 'bg-rp-blue/20 text-rp-blue border-rp-blue/40';
    case 'Process': return 'bg-rp-purple/20 text-rp-purple border-rp-purple/40';
    case 'Offered': return 'bg-rp-green/20 text-rp-green border-rp-green/40';
    case 'Joined': return 'bg-rp-teal/20 text-rp-teal border-rp-teal/40';
    default: return 'bg-secondary text-foreground border-border';
  }
}

function daysColor(days: number): string {
  if (days >= 7) return 'text-rp-red';
  if (days >= 5) return 'text-rp-yellow';
  return 'text-muted-foreground';
}

export default function CandidatesTab({ onSelectCandidate }: CandidatesTabProps) {
  const [search, setSearch] = useState('');
  const [recruiterFilter, setRecruiterFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const recruiters = useMemo(() => ['all', ...Array.from(new Set(DEMO_MASTER_TRACKER.map(r => r.recruiter)))], []);
  const stages = useMemo(() => ['all', ...Array.from(new Set(DEMO_MASTER_TRACKER.map(r => r.stage)))], []);
  const statuses = useMemo(() => ['all', ...Array.from(new Set(DEMO_MASTER_TRACKER.map(r => r.clientStatus)))], []);

  const rows = useMemo(() => {
    return DEMO_MASTER_TRACKER
      .filter(r => r.stage !== 'Joined')
      .filter(r => {
        const q = search.toLowerCase();
        return !q || [r.candidateName, r.role, r.organisation].some(v => v.toLowerCase().includes(q));
      })
      .filter(r => recruiterFilter === 'all' || r.recruiter === recruiterFilter)
      .filter(r => stageFilter === 'all' || r.stage === stageFilter)
      .filter(r => statusFilter === 'all' || r.clientStatus === statusFilter)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [search, recruiterFilter, stageFilter, statusFilter]);

  return (
    <Card className="border-border bg-card animate-fade-in">
      <CardHeader>
        <CardTitle className="text-sm font-display">Stuck Pipeline Candidates</CardTitle>
        <div className="grid gap-2 md:grid-cols-4">
          <Input placeholder="Search candidate/role/org" value={search} onChange={(e) => setSearch(e.target.value)} className="border-border bg-secondary text-foreground" />
          <Select value={recruiterFilter} onValueChange={setRecruiterFilter}><SelectTrigger className="border-border bg-secondary text-foreground"><SelectValue placeholder="Recruiter" /></SelectTrigger><SelectContent className="border-border bg-card">{recruiters.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select>
          <Select value={stageFilter} onValueChange={setStageFilter}><SelectTrigger className="border-border bg-secondary text-foreground"><SelectValue placeholder="Stage" /></SelectTrigger><SelectContent className="border-border bg-card">{stages.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="border-border bg-secondary text-foreground"><SelectValue placeholder="Client Status" /></SelectTrigger><SelectContent className="border-border bg-card">{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2 text-left">Candidate</th><th className="py-2 text-left">Recruiter</th><th className="py-2 text-left">Role</th><th className="py-2 text-left">Organisation</th><th className="py-2 text-left">Status</th><th className="py-2 text-left">Days</th><th className="py-2 text-left">Contact</th><th className="py-2 text-left">AI</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const days = daysSince(r.date);
                return (
                  <tr key={`${r.candidateName}-${r.date}`} className="border-b border-border/40 candidate-row-hover">
                    <td className="py-3 text-foreground">{r.candidateName}</td>
                    <td className="py-3 text-muted-foreground">{r.recruiter}</td>
                    <td className="py-3 text-muted-foreground">{r.role}</td>
                    <td className="py-3 text-muted-foreground">{r.organisation}</td>
                    <td className="py-3"><Badge className={`border ${stageBadgeClass(r.stage)}`}>{r.clientStatus}</Badge></td>
                    <td className={`py-3 font-medium ${daysColor(days)}`}>{days}d</td>
                    <td className="py-3 text-muted-foreground">{r.contact}</td>
                    <td className="py-3">
                      <button
                        onClick={() => onSelectCandidate({
                          candidateName: r.candidateName,
                          role: r.role,
                          organisation: r.organisation,
                          clientStatus: r.clientStatus,
                          recruiter: r.recruiter,
                          daysStuck: days,
                          contact: r.contact,
                          location: r.location,
                        })}
                        className="inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-2 py-1 text-primary hover:bg-primary/20"
                        title="Generate WhatsApp message"
                      >
                        <MessageSquareShare className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
