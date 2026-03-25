import { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { DashboardTab } from '@/components/dashboard/DashboardTab';
import { CandidatesTab } from '@/components/candidates/CandidatesTab';
import { WhatsAppTab } from '@/components/whatsapp/WhatsAppTab';
import { DailyBriefingTab } from '@/components/briefing/DailyBriefingTab';
import { useGemini } from '@/hooks/useGemini';
import { DEMO_MASTER_TRACKER, DEMO_SELECTION_SHEET, DEMO_EOD_SHEET, DEMO_DAILY_CALLING, getSourceBreakdown } from '@/data/demoData';
import type { TabId, CandidateForWhatsApp } from '@/types/recruitment';
import { toast } from 'sonner';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [apiKeySet, setApiKeySet] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateForWhatsApp | null>(null);
  const { loading: aiLoading, error: aiError, generate, setupKey } = useGemini();

  const sourceData = getSourceBreakdown(DEMO_DAILY_CALLING);

  const handleApiKey = useCallback((key: string) => {
    setupKey(key);
    setApiKeySet(true);
    toast.success('Gemini AI connected successfully!');
  }, [setupKey]);

  const handleSelectCandidate = useCallback((c: CandidateForWhatsApp) => {
    setSelectedCandidate(c);
    setActiveTab('whatsapp');
  }, []);

  if (aiError) {
    toast.error(aiError);
  }

  return (
    <div className="min-h-screen bg-background">
      <ApiKeyModal open={!apiKeySet} onSubmit={handleApiKey} />
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-[940px] mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <DashboardTab
            masterData={DEMO_MASTER_TRACKER}
            selectionData={DEMO_SELECTION_SHEET}
            eodData={DEMO_EOD_SHEET}
            sourceData={sourceData}
            onAiAnalyze={generate}
            aiLoading={aiLoading}
          />
        )}
        {activeTab === 'candidates' && (
          <CandidatesTab
            masterData={DEMO_MASTER_TRACKER}
            onSelectCandidate={handleSelectCandidate}
          />
        )}
        {activeTab === 'whatsapp' && (
          <WhatsAppTab
            candidate={selectedCandidate}
            onBack={() => setActiveTab('candidates')}
            onGenerate={generate}
            aiLoading={aiLoading}
          />
        )}
        {activeTab === 'briefing' && (
          <DailyBriefingTab
            masterData={DEMO_MASTER_TRACKER}
            selectionData={DEMO_SELECTION_SHEET}
            eodData={DEMO_EOD_SHEET}
            onGenerate={generate}
            aiLoading={aiLoading}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
