import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquareShare } from 'lucide-react';
import type { CandidateForWhatsApp, MasterTrackerRow } from '@/types/recruitment';

interface CandidatesTabProps {
  masterData: MasterTrackerRow[];
  onSelectCandidate: (candidate: CandidateForWhatsApp) => void;
}

const daysSince = (s: string) => Math.floor((Date.now() - new Date(s).getTime()) / 86400000);
const daysColor = (d: number) => d >= 7 ? 'text-rp-red' : d >= 5 ? 'text-rp-yellow' : 'text-muted-foreground';

const currentMonth = new Date().toLocaleString('default', { month: 'long' });

export default function CandidatesTab({ masterData, onSelectCandidate }: CandidatesTabProps) {
  const [search, setSearch] = useState('');
  const [recruiter, setRecruiter] = useState('all');
  const [stage, setStage] = useState('all');
  const [status, setStatus] = useState('all');
  const [monthFilter, setMonthFilter] = useState(currentMonth);

  const months = useMemo(() => ['all', ...Array.from(new Set(masterData.map(r => r.month).filter(Boolean)))], [masterData]);
  const recruiters = useMemo(() => ['all', ...Array.from(new Set(masterData.map(r => r.recruiter)))], [masterData]);
  const stages = useMemo(() => ['all', ...Array.from(new Set(masterData.map(r => r.stage)))], [masterData]);
  const statuses = useMemo(() => ['all', ...Array.from(new Set(masterData.map(r => r.clientStatus)))], [masterData]);

  const rows = useMemo(() => masterData.filter(r => r.stage !== 'Joined')
    .filter(r => monthFilter === 'all' || r.month === monthFilter)
    .filter(r => !search || [r.candidateName, r.role, r.organisation].join(' ').toLowerCase().includes(search.toLowerCase()))
    .filter(r => recruiter === 'all' || r.recruiter === recruiter)
    .filter(r => stage === 'all' || r.stage === stage)
    .filter(r => status === 'all' || r.clientStatus === status)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [masterData, search, recruiter, stage, status, monthFilter]);

  return <Card className="border-border bg-card animate-fade-in"><CardHeader><CardTitle className="text-sm font-display">Stuck Pipeline</CardTitle>
    <div className="grid gap-2 md:grid-cols-4">
      <Input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search" className="border-border bg-secondary"/>
      <Select value={monthFilter} onValueChange={setMonthFilter}><SelectTrigger className="border-border bg-secondary"><SelectValue/></SelectTrigger><SelectContent className="border-border bg-card">{months.map(v => <SelectItem key={v} value={v}>{v === 'all' ? 'All Months' : v}</SelectItem>)}</SelectContent></Select>
      <Select value={recruiter} onValueChange={setRecruiter}><SelectTrigger className="border-border bg-secondary"><SelectValue/></SelectTrigger><SelectContent className="border-border bg-card">{recruiters.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select>
      <Select value={stage} onValueChange={setStage}><SelectTrigger className="border-border bg-secondary"><SelectValue/></SelectTrigger><SelectContent className="border-border bg-card">{stages.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select>
      <Select value={status} onValueChange={setStatus}><SelectTrigger className="border-border bg-secondary"><SelectValue/></SelectTrigger><SelectContent className="border-border bg-card">{statuses.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select>
    </div>
  </CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full text-xs"><thead><tr className="border-b border-border text-muted-foreground"><th className="py-2 text-left">Candidate</th><th className="py-2 text-left">Recruiter</th><th className="py-2 text-left">Role</th><th className="py-2 text-left">Organisation</th><th className="py-2 text-left">Status</th><th className="py-2 text-left">Days</th><th className="py-2 text-left">Contact</th><th className="py-2 text-left">AI</th></tr></thead><tbody>{rows.map((r: MasterTrackerRow)=>{const d=daysSince(r.date);return <tr key={`${r.candidateName}-${r.date}`} className="border-b border-border/40 candidate-row-hover"><td className="py-3">{r.candidateName}</td><td>{r.recruiter}</td><td>{r.role}</td><td>{r.organisation}</td><td><Badge variant="outline" className="border-border">{r.clientStatus}</Badge></td><td className={daysColor(d)}>{d}d</td><td>{r.contact}</td><td><button onClick={()=>onSelectCandidate({candidateName:r.candidateName,role:r.role,organisation:r.organisation,clientStatus:r.clientStatus,recruiter:r.recruiter,daysStuck:d,contact:r.contact,location:r.location})} className="inline-flex rounded border border-primary/40 bg-primary/10 p-1 text-primary hover:bg-primary/20"><MessageSquareShare className="h-3.5 w-3.5"/></button></td></tr>;})}</tbody></table></div></CardContent></Card>;
}
