import { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import GoogleSheetsPanel from '@/components/GoogleSheetsPanel';
import DashboardTab from '@/components/tabs/DashboardTab';
import CandidatesTab from '@/components/tabs/CandidatesTab';
import WhatsAppTab from '@/components/tabs/WhatsAppTab';
import DailyBriefingTab from '@/components/tabs/DailyBriefingTab';
import { useGemini } from '@/hooks/useGemini';
import { useRecruitmentData } from '@/hooks/useRecruitmentData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CandidateForWhatsApp, TabId } from '@/types/recruitment';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const now = new Date();
const currentMonthName = now.toLocaleString('default', { month: 'long' });
const currentYear = String(now.getFullYear());

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateForWhatsApp | null>(null);
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [monthFilter, setMonthFilter] = useState(currentMonthName);
  const [yearFilter, setYearFilter] = useState(currentYear);
  const [cycleStartDay, setCycleStartDay] = useState(5);

  const { loading: aiLoading, error: aiError, generate, setupKey } = useGemini();
  const { master, selection, eod, loading: sheetLoading, error: sheetError, connected, connectGoogleSheets } = useRecruitmentData();

  const years = useMemo(() => {
    const set = new Set(master.map(r => (r.year || '').trim()).filter(Boolean));
    return [...set].sort();
  }, [master]);

  useEffect(() => {
    const storedKey = sessionStorage.getItem('gemini_api_key');
    const storedMaster = sessionStorage.getItem('gp_master_sheet_id');
    const storedSelectionEod = sessionStorage.getItem('gp_selection_eod_sheet_id');
    if (storedKey && storedMaster && storedSelectionEod) {
      setupKey(storedKey);
      setApiModalOpen(false);
    } else {
      setApiModalOpen(true);
    }
  }, [setupKey]);

  const handleSetup = (apiKey: string, masterSheetId: string, selectionEodSheetId: string) => {
    sessionStorage.setItem('gemini_api_key', apiKey);
    sessionStorage.setItem('gp_master_sheet_id', masterSheetId);
    sessionStorage.setItem('gp_selection_eod_sheet_id', selectionEodSheetId);
    setupKey(apiKey);
    setApiModalOpen(false);
  };

  const onSelectCandidate = (candidate: CandidateForWhatsApp) => {
    setSelectedCandidate(candidate);
    setActiveTab('whatsapp');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ApiKeyModal open={apiModalOpen} onSubmit={handleSetup} />
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="mx-auto max-w-[940px] space-y-4 px-4 py-6">
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex-1 min-w-0">
            <GoogleSheetsPanel connected={connected} loading={sheetLoading} error={sheetError} onConnect={connectGoogleSheets} />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1">
              <Label className="text-[10px] text-muted-foreground">Cycle Start</Label>
              <Input
                type="number"
                min={1}
                max={28}
                value={cycleStartDay}
                onChange={e => setCycleStartDay(Math.max(1, Math.min(28, Number(e.target.value) || 1)))}
                className="w-16 bg-card border-border text-foreground text-xs h-9 text-center"
              />
            </div>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-28 bg-card border-border text-foreground text-xs h-9">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Years</SelectItem>
                {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-32 bg-card border-border text-foreground text-xs h-9">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Months</SelectItem>
                {MONTH_NAMES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <DashboardTab
            masterData={master}
            selectionData={selection}
            eodData={eod}
            onAiAnalyze={generate}
            aiLoading={aiLoading}
            aiError={aiError}
            monthFilter={monthFilter}
            yearFilter={yearFilter}
            cycleStartDay={cycleStartDay}
          />
        )}

        {activeTab === 'candidates' && <CandidatesTab masterData={master} onSelectCandidate={onSelectCandidate} monthFilter={monthFilter} yearFilter={yearFilter} />}

        {activeTab === 'whatsapp' && (
          <WhatsAppTab
            selectedCandidate={selectedCandidate}
            onBack={() => setActiveTab('candidates')}
            onGenerate={generate}
            loading={aiLoading}
            error={aiError}
          />
        )}

        {activeTab === 'briefing' && (
          <DailyBriefingTab
            eodData={eod}
            masterData={master}
            selectionData={selection}
            onGenerate={generate}
            loading={aiLoading}
            error={aiError}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;
