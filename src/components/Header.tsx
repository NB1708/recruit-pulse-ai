import { Zap, Settings } from 'lucide-react';
import type { TabId } from '@/types/recruitment';

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'candidates', label: 'Candidates', icon: '👥' },
  { id: 'clientAnalysis', label: 'Client Analysis', icon: '🏢' },
  { id: 'whatsapp', label: 'WhatsApp AI', icon: '💬' },
  { id: 'briefing', label: 'Daily Briefing', icon: '📋' },
];

interface HeaderProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  sheetsConnected: boolean;
  onSettingsOpen: () => void;
  onReconnect: () => void;
}

export function Header({ activeTab, onTabChange, sheetsConnected, onSettingsOpen, onReconnect }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-[940px] mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-rp-green" />
            <h1 className="font-display text-xl font-bold text-foreground tracking-tight">
              RecruitPulse AI
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-rp-green animate-pulse-green" />
              <span className="text-xs text-rp-green font-medium">Live Pipeline</span>
            </div>
            {sheetsConnected ? (
              <span className="text-xs font-medium text-rp-green flex items-center gap-1">✅ Sheets Connected</span>
            ) : (
              <span className="text-xs font-medium text-destructive flex items-center gap-1">
                ❌ Sheets Disconnected
                <button onClick={onReconnect} className="underline ml-1 text-primary hover:text-primary/80">Reconnect</button>
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              by <span style={{ color: '#00E5A0' }} className="font-semibold">TrueViq</span>
            </span>
            <button onClick={onSettingsOpen} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Settings">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
        <nav className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary/15 text-primary border border-primary/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <span className="mr-1.5">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
