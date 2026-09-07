import React, { useEffect, useState } from 'react';
import { ActionAnnouncement } from '../types/game';
import { CardView } from './CardView';

interface ActionBannerProps {
  announcement: ActionAnnouncement | null;
}

export const ActionBanner: React.FC<ActionBannerProps> = ({ announcement }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!announcement) {
      setProgress(100);
      return;
    }

    setProgress(100);
    const duration = announcement.durationMs || 2200;
    const intervalTime = 30;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return Math.max(0, prev - step);
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [announcement]);

  if (!announcement) return null;

  const getTypeStyle = () => {
    switch (announcement.type) {
      case 'PLAY_CARD':
        return 'border-cyan-400/80 bg-slate-900/95 text-cyan-200 shadow-cyan-500/30';
      case 'DRAW_TWO':
        return 'border-rose-500/90 bg-rose-950/95 text-rose-200 shadow-rose-500/40 ring-2 ring-rose-500/40';
      case 'SKIP':
        return 'border-amber-400/80 bg-amber-950/95 text-amber-200 shadow-amber-500/30';
      case 'REVERSE':
        return 'border-cyan-400/80 bg-cyan-950/95 text-cyan-200 shadow-cyan-500/30';
      case 'WILD':
        return 'border-fuchsia-400/80 bg-fuchsia-950/95 text-fuchsia-200 shadow-fuchsia-500/30';
      case 'EQUATION':
        return 'border-indigo-400/90 bg-indigo-950/95 text-indigo-200 shadow-indigo-500/40 ring-2 ring-indigo-400/40';
      case 'HARMONIC':
        return 'border-amber-400/90 bg-amber-950/95 text-amber-100 shadow-amber-500/40 ring-2 ring-amber-400/40';
      case 'CATCH':
        return 'border-rose-500/90 bg-rose-950/95 text-rose-200 shadow-rose-500/40';
      case 'THINKING':
        return 'border-purple-400/70 bg-purple-950/90 text-purple-200 shadow-purple-500/20';
      case 'CORRECT':
        return 'border-emerald-400/90 bg-emerald-950/95 text-emerald-200 shadow-emerald-500/40';
      case 'WRONG':
        return 'border-rose-500/90 bg-rose-950/95 text-rose-200 shadow-rose-500/40';
      default:
        return 'border-white/20 bg-slate-900/95 text-slate-100 shadow-slate-900/50';
    }
  };

  return (
    <div
      id="action-announcement-banner"
      className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-md pointer-events-none transition-all duration-200 animate-in fade-in zoom-in-95"
    >
      <div
        className={`relative overflow-hidden rounded-3xl border-2 p-4 shadow-2xl backdrop-blur-xl flex items-center gap-3.5 ${getTypeStyle()}`}
      >
        {/* Animated Background Pulse */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-transparent pointer-events-none" />

        {/* Card Thumbnail if available */}
        {announcement.card && (
          <div className="flex-shrink-0 animate-in zoom-in duration-300 scale-90 sm:scale-100">
            <CardView card={announcement.card} size="sm" />
          </div>
        )}

        {/* Text Info */}
        <div className="flex-1 min-w-0 z-10 text-left">
          <div className="flex items-center gap-2 mb-0.5">
            {announcement.playerLetter ? (
              <span className="w-5 h-5 rounded-md bg-white/20 text-white font-mono font-black text-[11px] flex items-center justify-center">
                {announcement.playerLetter}
              </span>
            ) : (
              <span className="text-cyan-400 text-xs">∿</span>
            )}
            <span className="font-extrabold text-xs uppercase tracking-wider opacity-90 truncate">
              {announcement.title}
            </span>
          </div>
          <div className="font-bold text-sm sm:text-base text-white leading-tight break-words drop-shadow-sm">
            {announcement.subtitle || announcement.description}
          </div>
        </div>

        {/* Progress Bar at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div
            className="h-full bg-white/70 transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
