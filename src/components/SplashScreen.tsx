import { Zap } from 'lucide-react';

interface SplashScreenProps {
  onEnter: () => void;
}

export function SplashScreen({ onEnter }: SplashScreenProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden" style={{ background: '#080B11' }}>
      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.07]" style={{
        backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />

      {/* Green orb top-left */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20 blur-[120px]" style={{ background: '#00E5A0' }} />
      {/* Blue orb bottom-right */}
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full opacity-20 blur-[120px]" style={{ background: '#3B82F6' }} />

      <div className="relative z-10 flex flex-col items-center gap-6 px-4">
        {/* Lightning icon */}
        <div
          className="animate-[fade-in_0.5s_ease-out_both]"
          style={{ animationDelay: '0s' }}
        >
          <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(0,229,160,0.4)]" style={{
            background: 'linear-gradient(135deg, #00E5A0, #06B6D4)',
          }}>
            <Zap className="w-8 h-8 text-[#080B11]" fill="#080B11" />
            {/* Glow pulse */}
            <div className="absolute inset-0 rounded-2xl animate-pulse opacity-50" style={{
              boxShadow: '0 0 30px rgba(0,229,160,0.6)',
            }} />
          </div>
        </div>

        {/* Title */}
        <h1
          className="text-4xl md:text-5xl font-extrabold tracking-tight text-white animate-[fade-in_0.5s_ease-out_both]"
          style={{ fontFamily: "'Space Grotesk', sans-serif", animationDelay: '0.2s' }}
        >
          RecruitPulse <span style={{ color: '#00E5A0' }}>AI</span>
        </h1>

        {/* Tagline */}
        <p
          className="text-sm md:text-base text-gray-400 tracking-wide animate-[fade-in_0.5s_ease-out_both]"
          style={{ animationDelay: '0.4s' }}
        >
          Smart Hiring Intelligence · From Applied to Joined
        </p>

        {/* Divider with label */}
        <div
          className="flex items-center gap-3 w-64 animate-[fade-in_0.5s_ease-out_both]"
          style={{ animationDelay: '0.6s' }}
        >
          <div className="flex-1 h-px bg-gray-700" />
          <span className="text-xs text-gray-500 whitespace-nowrap">A TrueViq Product</span>
          <div className="flex-1 h-px bg-gray-700" />
        </div>

        {/* Branded card */}
        <div
          className="rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur px-8 py-5 flex flex-col items-center gap-1.5 animate-[fade-in_0.5s_ease-out_both]"
          style={{ animationDelay: '0.8s' }}
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Built by</span>
          <span
            className="text-2xl font-bold bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite] bg-[length:200%_100%]"
            style={{
              backgroundImage: 'linear-gradient(90deg, #00E5A0, #06B6D4, #00E5A0)',
            }}
          >
            TrueViq
          </span>
          <span className="text-[11px] text-gray-500">Nikita &amp; Aman · 2025</span>
        </div>

        {/* CTA button */}
        <button
          onClick={onEnter}
          className="mt-2 px-8 py-3 rounded-full text-sm font-semibold tracking-wide text-[#080B11] transition-transform hover:scale-105 active:scale-95 animate-[fade-in_0.5s_ease-out_both]"
          style={{
            background: 'linear-gradient(135deg, #00E5A0, #06B6D4)',
            animationDelay: '1s',
          }}
        >
          Enter Dashboard →
        </button>
      </div>
    </div>
  );
}
