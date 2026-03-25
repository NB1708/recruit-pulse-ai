import { Loader2 } from 'lucide-react';

export function AiSpinner() {
  return (
    <div className="flex items-center gap-2 text-rp-green">
      <Loader2 className="h-5 w-5 animate-spin-glow" />
      <span className="text-sm font-medium animate-pulse">AI is thinking...</span>
    </div>
  );
}
