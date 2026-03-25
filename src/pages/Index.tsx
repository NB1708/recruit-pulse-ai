import { useEffect, useState } from 'react';
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
import type { CandidateForWhatsApp, TabId } from '@/types/recruitment';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateForWhatsApp | null>(null);
  const [apiModalOpen, setApiModalOpen] = useState(false);

  const { loading: aiLoading, error: aiError, generate, setupKey } = useGemini();
  const { master, selection, eod, loading: sheetLoading, error: sheetError, connected, connectGoogleSheets } = useRecruitmentData();

  useEffect(() => {
    const storedKey = sessionStorage.getItem('gemini_api_key');
    const storedSheet = sessionStorage.getItem('gp_sheet_id');
    if (storedKey && storedSheet) {
      setupKey(storedKey);
      setApiModalOpen(false);
    } else {
      setApiModalOpen(true);
    }
  }, [setupKey]);

  const handleSetup = (apiKey: string, spreadsheetId: string) => {
    sessionStorage.setItem('gemini_api_key', apiKey);
    sessionStorage.setItem('gp_sheet_id', spreadsheetId);
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
        <GoogleSheetsPanel connected={connected} loading={sheetLoading} error={sheetError} onConnect={connectGoogleSheets} />

        {activeTab === 'dashboard' && (
          <DashboardTab
            masterData={master}
            selectionData={selection}
            eodData={eod}
            onAiAnalyze={generate}
            aiLoading={aiLoading}
            aiError={aiError}
          />
        )}

        {activeTab === 'candidates' && <CandidatesTab masterData={master} onSelectCandidate={onSelectCandidate} />}

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
