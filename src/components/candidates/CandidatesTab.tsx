import { useState, useMemo } from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { MasterTrackerRow, CandidateForWhatsApp } from '@/types/recruitment';
import { getMessageGoal } from '@/utils/messageGoals';

const STAGE_BADGE_COLORS: Record<string, string> = {
  'FB Pending': 'bg-rp-orange/20 text-rp-orange border-rp-orange/30',
  'CV Shortlisted': 'bg-rp-blue/20 text-rp-blue border-rp-blue/30',
  'Process': 'bg-rp-purple/20 text-rp-purple border-rp-purple/30',
  'Offered': 'bg-rp-green/20 text-rp-green border-rp-green/30',
  'Joined': 'bg-rp-teal/20 text-rp-teal border-rp-teal/30',
  'Uselater': 'bg-muted text-muted-foreground border-border',
};

interface CandidatesTabProps {
  masterData: MasterTrackerRow[];
  onSelectCandidate: (c: CandidateForWhatsApp) => void;
}

function daysBetween(dateStr: string): number {
  return Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

const currentMonth = new Date().toLocaleString('default', { month: 'long' });

export function CandidatesTab({ masterData, onSelectCandidate }: CandidatesTabProps) {
  const [recruiterFilter, setRecruiterFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState(currentMonth);
  const [search, setSearch] = useState('');

  const months = useMemo(() => [...new Set(masterData.map(r => (r.month || '').trim()).filter(v => v.length > 0))], [masterData]);
  const recruiters = useMemo(() => [...new Set(masterData.map(r => (r.recruiter || '').trim()).filter(v => v.length > 0))], [masterData]);
  const stages = useMemo(() => [...new Set(masterData.map(r => (r.stage || '').trim()).filter(v => v.length > 0))], [masterData]);
  const statuses = useMemo(() => [...new Set(masterData.map(r => (r.clientStatus || '').trim()).filter(v => v.length > 0))], [masterData]);

  const filtered = useMemo(() => {
    return masterData
      .filter(r => r.stage !== 'Joined')
      .filter(r => monthFilter === 'all' || r.month === monthFilter)
      .filter(r => recruiterFilter === 'all' || r.recruiter === recruiterFilter)
      .filter(r => stageFilter === 'all' || r.stage === stageFilter)
      .filter(r => statusFilter === 'all' || r.clientStatus === statusFilter)
      .filter(r => search === '' || r.candidateName.toLowerCase().includes(search.toLowerCase()) || r.role.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [masterData, monthFilter, recruiterFilter, stageFilter, statusFilter, search]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search candidate or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-48 bg-card border-border text-foreground placeholder:text-muted-foreground"
        />
        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger className="w-36 bg-card border-border text-foreground">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Months</SelectItem>
            {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={recruiterFilter} onValueChange={setRecruiterFilter}>
          <SelectTrigger className="w-40 bg-card border-border text-foreground">
            <SelectValue placeholder="Recruiter" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Recruiters</SelectItem>
            {recruiters.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-40 bg-card border-border text-foreground">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Stages</SelectItem>
            {stages.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 bg-card border-border text-foreground">
            <SelectValue placeholder="Client Status" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="text-xs text-muted-foreground">{filtered.length} candidates in pipeline (oldest first)</div>

      <div className="space-y-2">
        {filtered.map(r => {
          const days = daysBetween(r.date);
          const badgeClass = STAGE_BADGE_COLORS[r.clientStatus] || STAGE_BADGE_COLORS[r.stage] || 'bg-muted text-muted-foreground border-border';
          const { shortLabel, isDuplicate } = getMessageGoal(r.stage, r.clientStatus);

          return (
            <div
              key={r.candidateName + r.date + r.role}
              className="bg-card border border-border rounded-lg p-4 candidate-row-hover cursor-pointer"
              onClick={() => onSelectCandidate({
                candidateName: r.candidateName,
                role: r.role,
                organisation: r.organisation,
                clientStatus: r.clientStatus,
                stage: r.stage,
                recruiter: r.recruiter,
                daysStuck: days,
                contact: r.contact,
                location: r.location,
              })}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-foreground font-medium">{r.candidateName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${badgeClass}`}>{r.clientStatus}</span>
                    <span className={`text-xs font-display font-bold ${days >= 7 ? 'text-rp-red' : days >= 5 ? 'text-rp-yellow' : 'text-muted-foreground'}`}>
                      {days}d
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {r.role} @ {r.organisation} · {r.recruiter}
                  </div>
                  <div className="text-xs mt-1">
                    {isDuplicate ? (
                      <span className="text-rp-orange">⚠️ {shortLabel}</span>
                    ) : (
                      <span className="text-muted-foreground">💬 Goal: {shortLabel}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-muted-foreground">{r.contact}</span>
                  <MessageCircle className="h-4 w-4 text-rp-green" />
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
