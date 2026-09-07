import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ActionAnnouncement } from '../types/game';

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

  const getTypeStyle = () => {
    if (!announcement) return '';
    switch (announcement.type) {
      case 'PLAY_CARD':
      case 'PLAY':
        return 'border-cyan-400/40 bg-slate-900/95 text-cyan-200 shadow-cyan-500/15';
      case 'DRAW_TWO':
      case 'PENALTY':
        return 'border-rose-500/60 bg-rose-950/95 text-rose-200 shadow-rose-500/25';
      case 'SKIP':
        return 'border-amber-400/50 bg-amber-950/95 text-amber-200 shadow-amber-500/20';
      case 'REVERSE':
        return 'border-cyan-400/50 bg-cyan-950/95 text-cyan-200 shadow-cyan-500/20';
      case 'WILD':
      case 'SPECIAL':
        return 'border-fuchsia-400/50 bg-fuchsia-950/95 text-fuchsia-200 shadow-fuchsia-500/20';
      case 'EQUATION':
        return 'border-indigo-400/60 bg-indigo-950/95 text-indigo-200 shadow-indigo-500/25';
      case 'HARMONIC':
        return 'border-amber-400/60 bg-amber-950/95 text-amber-100 shadow-amber-500/25';
      case 'CORRECT':
        return 'border-emerald-400/60 bg-emerald-950/95 text-emerald-200 shadow-emerald-500/25';
      case 'WRONG':
        return 'border-rose-500/60 bg-rose-950/95 text-rose-200 shadow-rose-500/25';
      default:
        return 'border-white/15 bg-slate-900/95 text-slate-100 shadow-slate-900/40';
    }
  };

  return (
    <div
      id="action-announcement-banner"
      className="fixed bottom-28 sm:bottom-32 right-3 sm:right-6 z-40 pointer-events-none w-auto max-w-[290px] sm:max-w-sm"
    >
      <AnimatePresence>
        {announcement && (
          <motion.div
            key={announcement.id || announcement.title}
            initial={{ opacity: 0, y: 14, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.92 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`relative overflow-hidden rounded-2xl border px-3 py-2 shadow-2xl backdrop-blur-md flex items-center gap-2.5 ${getTypeStyle()}`}
          >
            {/* Player Letter Badge */}
            {announcement.playerLetter ? (
              <span className="w-5 h-5 rounded-full bg-white/20 text-white font-mono font-black text-[10px] flex items-center justify-center flex-shrink-0">
                {announcement.playerLetter}
              </span>
            ) : (
              <span className="text-cyan-400 text-xs flex-shrink-0">∿</span>
            )}

            {/* Mini Card Chip if card present */}
            {announcement.card && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white/15 text-white flex-shrink-0">
                {announcement.card.color !== 'WILD' ? announcement.card.color[0] : '★'}{' '}
                {announcement.card.value ?? announcement.card.type}
              </span>
            )}

            {/* Compact Text Info */}
            <div className="flex-1 min-w-0 text-left flex items-center gap-1.5 overflow-hidden">
              <span className="font-extrabold text-xs text-white truncate">
                {announcement.title}
              </span>
              {(announcement.subtitle || announcement.description) && (
                <span className="hidden sm:inline text-[11px] opacity-75 truncate font-normal">
                  — {announcement.subtitle || announcement.description}
                </span>
              )}
            </div>

            {/* Slim Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10">
              <div
                className="h-full bg-white/70 transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

