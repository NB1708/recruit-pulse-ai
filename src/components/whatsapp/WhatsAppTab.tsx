import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy, RefreshCw, AlertTriangle } from 'lucide-react';
import { AiSpinner } from '@/components/AiSpinner';
import type { CandidateForWhatsApp } from '@/types/recruitment';
import { getMessageGoal } from '@/utils/messageGoals';
import { toast } from 'sonner';

interface WhatsAppTabProps {
  candidate: CandidateForWhatsApp | null;
  onBack: () => void;
  onGenerate: (prompt: string) => Promise<string | null>;
  aiLoading: boolean;
}

export function WhatsAppTab({ candidate, onBack, onGenerate, aiLoading }: WhatsAppTabProps) {
  const [message, setMessage] = useState<string | null>(null);

  if (!candidate) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-20 text-center">
        <span className="text-4xl mb-4">💬</span>
        <h3 className="font-display text-lg text-foreground mb-2">No candidate selected</h3>
        <p className="text-sm text-muted-foreground">Go to the Candidates tab and click on a candidate to generate a WhatsApp message.</p>
        <Button variant="outline" onClick={onBack} className="mt-4 border-border text-foreground hover:bg-secondary">
          <ArrowLeft className="h-4 w-4 mr-2" /> Go to Candidates
        </Button>
      </div>
    );
  }

  const { goal: messageGoal, shortLabel, isDuplicate } = getMessageGoal(candidate.stage, candidate.clientStatus);

  const generateMessage = async () => {
    const prompt = `You are a recruitment assistant for TrueViq. Generate a warm, short WhatsApp message in Hindi or Hinglish for a candidate named ${candidate.candidateName} who applied for ${candidate.role} at ${candidate.organisation} in ${candidate.location}. They have been at ${candidate.clientStatus} stage for ${candidate.daysStuck} days. Their recruiter is ${candidate.recruiter}.

Current Stage Goal: ${messageGoal}
Your message MUST achieve this goal. Keep it natural, warm and under 4 lines. Do not directly copy the goal into the message — just use it as your intent and write naturally.

Use relevant emojis, sound human not robotic, include a clear next step, sign off as '${candidate.recruiter} from TrueViq'`;
    const result = await onGenerate(prompt);
    if (result) setMessage(result);
  };

  const copyToClipboard = () => {
    if (message) {
      navigator.clipboard.writeText(message);
      toast.success('Message copied to clipboard!');
    }
  };

  return (
    <div className="animate-fade-in max-w-xl mx-auto space-y-4">
      <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Candidates
      </Button>

      <div className="bg-card border border-border rounded-lg p-5">
        <h3 className="font-display font-semibold text-foreground mb-3">Candidate Details</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">Name:</span> <span className="text-foreground font-medium">{candidate.candidateName}</span></div>
          <div><span className="text-muted-foreground">Role:</span> <span className="text-foreground">{candidate.role}</span></div>
          <div><span className="text-muted-foreground">Company:</span> <span className="text-foreground">{candidate.organisation}</span></div>
          <div><span className="text-muted-foreground">Status:</span> <span className="text-rp-orange font-medium">{candidate.clientStatus}</span></div>
          <div><span className="text-muted-foreground">Stage:</span> <span className="text-foreground">{candidate.stage}</span></div>
          <div><span className="text-muted-foreground">Recruiter:</span> <span className="text-foreground">{candidate.recruiter}</span></div>
          <div><span className="text-muted-foreground">Days Stuck:</span> <span className={`font-display font-bold ${candidate.daysStuck >= 7 ? 'text-rp-red' : 'text-rp-yellow'}`}>{candidate.daysStuck}</span></div>
          <div><span className="text-muted-foreground">Contact:</span> <span className="text-foreground">{candidate.contact}</span></div>
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          {isDuplicate ? (
            <div className="flex items-center gap-2 text-rp-orange text-xs">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>⚠️ {shortLabel}</span>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">💬 Goal: {shortLabel}</div>
          )}
        </div>
      </div>

      {isDuplicate ? (
        <div className="bg-rp-orange/10 border border-rp-orange/30 rounded-lg p-4 text-center">
          <AlertTriangle className="h-6 w-6 text-rp-orange mx-auto mb-2" />
          <p className="text-sm text-foreground font-medium">⚠️ Duplicate profile — no message needed</p>
          <p className="text-xs text-muted-foreground mt-1">This candidate appears to be a duplicate entry.</p>
        </div>
      ) : (
        <>
          {!message && !aiLoading && (
            <Button onClick={generateMessage} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display">
              💬 Generate WhatsApp Message
            </Button>
          )}

          {aiLoading && (
            <div className="flex justify-center py-8">
              <AiSpinner />
            </div>
          )}

          {message && (
            <>
              <div className="relative">
                <div className="bg-[#075E54] rounded-2xl rounded-tl-sm p-4 text-sm leading-relaxed" style={{ color: '#E8EDF5' }}>
                  {message}
                </div>
                <div className="absolute -bottom-1 left-4 w-3 h-3 bg-[#075E54] rotate-45" />
              </div>

              <div className="flex gap-3">
                <Button onClick={generateMessage} disabled={aiLoading} variant="outline" className="flex-1 border-border text-foreground hover:bg-secondary">
                  <RefreshCw className="h-4 w-4 mr-2" /> Regenerate
                </Button>
                <Button onClick={copyToClipboard} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Copy className="h-4 w-4 mr-2" /> Copy to Clipboard
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
