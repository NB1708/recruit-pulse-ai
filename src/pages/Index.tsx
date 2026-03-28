import { useEffect, useMemo, useState } from 'react';
import { extractAccessTokenFromHash } from '@/services/googleSheets';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SplashScreen } from '@/components/SplashScreen';
import { SetupGuide } from '@/components/SetupGuide';
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

type AppScreen = 'splash' | 'guide' | 'config' | 'dashboard';

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
  const [sheetError, setSheetError] = useState<string | null>(null);

  const { loading: aiLoading, error: aiError, generate, setupKey } = useAI();
  const { master, selection, eod, loading: sheetLoading, error: hookSheetError, connected, connectGoogleSheets, connectWithToken } = useRecruitmentData();

  const displayError = sheetError || hookSheetError;

  // Handle OAuth redirect return
  useEffect(() => {
    const token = extractAccessTokenFromHash();
    const isPending = sessionStorage.getItem('gp_oauth_pending') === 'true';

    if (token && isPending) {
      sessionStorage.removeItem('gp_oauth_pending');
      // Restore API key
      const savedApiKey = sessionStorage.getItem('groq_api_key') || '';
      if (savedApiKey) setupKey(savedApiKey);
      // Jump straight to dashboard and fetch data
      setAppScreen('dashboard');
      connectWithToken(token).catch((e: any) => {
        setSheetError(e?.message || 'Failed to fetch sheet data after login.');
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const years = useMemo(() => {
    const set = new Set(master.map(r => (r.year || '').trim()).filter(Boolean));
    return [...set].sort();
  }, [master]);

  const handleSetup = async (apiKey: string, clientId: string, masterSheetId: string, selectionEodSheetId: string) => {
    sessionStorage.setItem('groq_api_key', apiKey);
    sessionStorage.setItem('gp_client_id', clientId);
    sessionStorage.setItem('gp_master_sheet_id', masterSheetId);
    sessionStorage.setItem('gp_selection_eod_sheet_id', selectionEodSheetId);
    setupKey(apiKey);
    // This will redirect to Google OAuth — page will unload
    await connectGoogleSheets(clientId, masterSheetId, selectionEodSheetId);
  };

  const handleSettingsSave = (apiKey: string, masterSheetId: string, selectionEodSheetId: string) => {
    sessionStorage.setItem('groq_api_key', apiKey);
    sessionStorage.setItem('gp_master_sheet_id', masterSheetId);
    sessionStorage.setItem('gp_selection_eod_sheet_id', selectionEodSheetId);
    setupKey(apiKey);
  };

  const handleReconnect = async () => {
    const clientId = sessionStorage.getItem('gp_client_id') || '';
    const masterSheetId = sessionStorage.getItem('gp_master_sheet_id') || '';
    const selectionEodSheetId = sessionStorage.getItem('gp_selection_eod_sheet_id') || '';
    if (!clientId || !masterSheetId || !selectionEodSheetId) {
      setSettingsOpen(true);
      return;
    }
    // Try using existing token first, else redirect
    const existingToken = sessionStorage.getItem('gp_access_token');
    if (existingToken) {
      try {
        setSheetError(null);
        await connectWithToken(existingToken);
      } catch {
        // Token expired, redirect for new one
        await connectGoogleSheets(clientId, masterSheetId, selectionEodSheetId);
      }
    } else {
      await connectGoogleSheets(clientId, masterSheetId, selectionEodSheetId);
    }
  };

  const handleRefresh = async () => {
    const existingToken = sessionStorage.getItem('gp_access_token');
    if (!existingToken) {
      setSheetError('No active session. Please reconnect Google Sheets.');
      return;
    }
    try {
      setSheetError(null);
      await connectWithToken(existingToken);
    } catch (e: any) {
      setSheetError(e?.message || 'Sync failed. Try reconnecting.');
    }
  };

  const onSelectCandidate = (candidate: CandidateForWhatsApp) => {
    setSelectedCandidate(candidate);
    setActiveTab('whatsapp');
  };

  // ── SPLASH ──
  if (appScreen === 'splash') {
    return <SplashScreen onEnter={() => setAppScreen('guide')} />;
  }

  if (appScreen === 'guide') {
    return <SetupGuide onContinue={() => setAppScreen('config')} />;
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

      {/* Error banner */}
      {displayError && (
        <div className="bg-destructive/10 border-b border-destructive/30 px-4 py-2 flex items-center justify-between">
          <span className="text-xs text-destructive">❌ {displayError}</span>
          <button onClick={() => setSheetError(null)} className="text-xs text-muted-foreground hover:text-foreground ml-4">Dismiss</button>
        </div>
      )}

      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sheetsConnected={connected}
        onSettingsOpen={() => setSettingsOpen(true)}
        onReconnect={handleReconnect}
        onRefresh={handleRefresh}
        refreshing={sheetLoading}
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
