import { Zap } from 'lucide-react';
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
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
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
            <span className="text-xs text-muted-foreground">Powered by Hunar.AI</span>
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
