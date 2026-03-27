import { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SplashScreen } from '@/components/SplashScreen';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { SettingsModal } from '@/components/SettingsModal';
import DashboardTab from '@/components/tabs/DashboardTab';
import CandidatesTab from '@/components/tabs/CandidatesTab';
import WhatsAppTab from '@/components/tabs/WhatsAppTab';
import DailyBriefingTab from '@/components/tabs/DailyBriefingTab';
import ClientAnalysisTab from '@/components/tabs/ClientAnalysisTab';
import { useAI } from '@/hooks/useAI';
import { useRecruitmentData } from '@/hooks/useRecruitmentData';

import type { CandidateForWhatsApp, TabId } from '@/types/recruitment';

type AppScreen = 'splash' | 'config' | 'dashboard';

const now = new Date();
const currentMonthName = now.toLocaleString('default', { month: 'long' });
const currentYear = String(now.getFullYear());

const Index = () => {
  const [appScreen, setAppScreen] = useState<AppScreen>('splash');
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateForWhatsApp | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [monthFilter, setMonthFilter] = useState(currentMonthName);
  const [yearFilter, setYearFilter] = useState(currentYear);
  const [cycleStartDay, setCycleStartDay] = useState(5);

  const { loading: aiLoading, error: aiError, generate, setupKey } = useAI();
  const { master, selection, eod, loading: sheetLoading, error: sheetError, connected, connectGoogleSheets } = useRecruitmentData();

  const years = useMemo(() => {
    const set = new Set(master.map(r => (r.year || '').trim()).filter(Boolean));
    return [...set].sort();
  }, [master]);

  const handleSetup = (apiKey: string, masterSheetId: string, selectionEodSheetId: string) => {
    sessionStorage.setItem('groq_api_key', apiKey);
    sessionStorage.setItem('gp_master_sheet_id', masterSheetId);
    sessionStorage.setItem('gp_selection_eod_sheet_id', selectionEodSheetId);
    setupKey(apiKey);
    setAppScreen('dashboard');
  };

  const handleSettingsSave = (apiKey: string, masterSheetId: string, selectionEodSheetId: string) => {
    sessionStorage.setItem('groq_api_key', apiKey);
    sessionStorage.setItem('gp_master_sheet_id', masterSheetId);
    sessionStorage.setItem('gp_selection_eod_sheet_id', selectionEodSheetId);
    setupKey(apiKey);
  };

  const handleReconnect = () => {
    setSettingsOpen(true);
  };

  const onSelectCandidate = (candidate: CandidateForWhatsApp) => {
    setSelectedCandidate(candidate);
    setActiveTab('whatsapp');
  };

  // ── SPLASH ──
  if (appScreen === 'splash') {
    return <SplashScreen onEnter={() => setAppScreen('config')} />;
  }

  // ── CONFIG ──
  if (appScreen === 'config') {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#080B11' }}>
        <ApiKeyModal open={true} onSubmit={handleSetup} />
      </div>
    );
  }

  // ── DASHBOARD ──
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} onSave={handleSettingsSave} />
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sheetsConnected={connected}
        onSettingsOpen={() => setSettingsOpen(true)}
        onReconnect={handleReconnect}
      />

      <main className="mx-auto max-w-[940px] space-y-4 px-4 py-6">
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
            onMonthChange={setMonthFilter}
            onYearChange={setYearFilter}
            onCycleStartDayChange={setCycleStartDay}
            years={years}
          />
        )}

        {activeTab === 'candidates' && <CandidatesTab masterData={master} onSelectCandidate={onSelectCandidate} monthFilter={monthFilter} yearFilter={yearFilter} />}

        {activeTab === 'clientAnalysis' && (
          <ClientAnalysisTab
            masterData={master}
            selectionData={selection}
          />
        )}

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
