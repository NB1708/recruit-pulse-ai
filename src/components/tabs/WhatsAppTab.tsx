import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, RefreshCcw, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import type { CandidateForWhatsApp } from '@/types/recruitment';

interface WhatsAppTabProps {
  selectedCandidate: CandidateForWhatsApp | null;
  onBack: () => void;
  onGenerate: (prompt: string) => Promise<string | null>;
  loading: boolean;
  error: string | null;
}

export default function WhatsAppTab({ selectedCandidate, onBack, onGenerate, loading, error }: WhatsAppTabProps) {
  const [message, setMessage] = useState('');

  if (!selectedCandidate) {
    return (
      <Card className="border-border bg-card animate-fade-in">
        <CardContent className="p-8 text-center">
          <p className="text-sm text-muted-foreground">Select a candidate from the Candidates tab to generate a WhatsApp AI message.</p>
        </CardContent>
      </Card>
    );
  }

  const prompt = `You are a recruitment assistant for Hunar.AI. Generate a warm, short WhatsApp message in Hindi or Hinglish for a candidate named ${selectedCandidate.candidateName} who applied for ${selectedCandidate.role} at ${selectedCandidate.organisation} in ${selectedCandidate.location}. They have been at ${selectedCandidate.clientStatus} stage for ${selectedCandidate.daysStuck} days. Their recruiter is ${selectedCandidate.recruiter}. Write 3-4 lines, use relevant emojis, sound human not robotic, include a clear next step, sign off as '${selectedCandidate.recruiter} from Hunar.AI'`;

  const generate = async () => {
    const res = await onGenerate(prompt);
    if (res) setMessage(res);
  };

  const copyToClipboard = async () => {
    if (message) {
      await navigator.clipboard.writeText(message);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-display">Candidate Context</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-xs md:grid-cols-2">
          <p><span className="text-muted-foreground">Name:</span> <span className="text-foreground">{selectedCandidate.candidateName}</span></p>
          <p><span className="text-muted-foreground">Role:</span> <span className="text-foreground">{selectedCandidate.role}</span></p>
          <p><span className="text-muted-foreground">Organisation:</span> <span className="text-foreground">{selectedCandidate.organisation}</span></p>
          <p><span className="text-muted-foreground">Client Status:</span> <span className="text-foreground">{selectedCandidate.clientStatus}</span></p>
          <p><span className="text-muted-foreground">Recruiter:</span> <span className="text-foreground">{selectedCandidate.recruiter}</span></p>
          <p><span className="text-muted-foreground">Days stuck:</span> <span className="text-foreground">{selectedCandidate.daysStuck}</span></p>
          <p><span className="text-muted-foreground">Contact:</span> <span className="text-foreground">{selectedCandidate.contact}</span></p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-display">WhatsApp AI Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm text-foreground whitespace-pre-wrap min-h-28">
            {message || 'Click Regenerate to generate message...'}
          </div>
          {loading && <div className="mx-auto h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin-glow" />}
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <Button onClick={generate} disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90"><RefreshCcw className="mr-2 h-4 w-4" />Regenerate</Button>
            <Button onClick={copyToClipboard} variant="outline" className="border-border bg-secondary text-foreground hover:bg-secondary/80"><Copy className="mr-2 h-4 w-4" />Copy to Clipboard</Button>
            <Button onClick={onBack} variant="ghost" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
