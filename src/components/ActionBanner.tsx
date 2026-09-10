import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ActionAnnouncement } from '../types/game';
import { Sparkles, Zap, AlertCircle, CheckCircle2, XCircle, RotateCcw, Ban, Atom } from 'lucide-react';

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
        return 'border-cyan-400/50 bg-slate-900/95 text-cyan-200 shadow-cyan-500/20';
      case 'DRAW_TWO':
      case 'PENALTY':
        return 'border-rose-500/70 bg-rose-950/95 text-rose-200 shadow-rose-500/30';
      case 'SKIP':
        return 'border-amber-400/60 bg-amber-950/95 text-amber-200 shadow-amber-500/25';
      case 'REVERSE':
        return 'border-cyan-400/60 bg-cyan-950/95 text-cyan-200 shadow-cyan-500/25';
      case 'WILD':
      case 'SPECIAL':
        return 'border-fuchsia-400/60 bg-fuchsia-950/95 text-fuchsia-200 shadow-fuchsia-500/25';
      case 'EQUATION':
        return 'border-indigo-400/70 bg-indigo-950/95 text-indigo-200 shadow-indigo-500/30';
      case 'HARMONIC':
        return 'border-amber-400/70 bg-amber-950/95 text-amber-100 shadow-amber-500/35';
      case 'CORRECT':
        return 'border-emerald-400/70 bg-emerald-950/95 text-emerald-200 shadow-emerald-500/30';
      case 'WRONG':
        return 'border-rose-500/70 bg-rose-950/95 text-rose-200 shadow-rose-500/30';
      default:
        return 'border-white/20 bg-slate-900/95 text-slate-100 shadow-slate-900/40';
    }
  };

  const getIcon = () => {
    if (!announcement) return null;
    switch (announcement.type) {
      case 'DRAW_TWO':
      case 'PENALTY':
        return <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />;
      case 'SKIP':
        return <Ban className="w-4 h-4 text-amber-400 flex-shrink-0" />;
      case 'REVERSE':
        return <RotateCcw className="w-4 h-4 text-cyan-400 flex-shrink-0" />;
      case 'WILD':
      case 'SPECIAL':
        return <Sparkles className="w-4 h-4 text-fuchsia-400 flex-shrink-0" />;
      case 'EQUATION':
        return <Atom className="w-4 h-4 text-indigo-400 flex-shrink-0" />;
      case 'HARMONIC':
        return <Zap className="w-4 h-4 text-amber-300 flex-shrink-0 fill-amber-300" />;
      case 'CORRECT':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />;
      case 'WRONG':
        return <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />;
      default:
        return <span className="text-cyan-400 text-xs flex-shrink-0">∿</span>;
    }
  };

  return (
    <div
      id="action-announcement-banner"
      className="fixed top-24 sm:top-28 left-1/2 -translate-x-1/2 z-40 pointer-events-none w-auto max-w-[92vw] sm:max-w-md select-none"
    >
      <AnimatePresence>
        {announcement && (
          <motion.div
            key={announcement.id || announcement.title}
            initial={{ opacity: 0, y: -20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.92 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`relative overflow-hidden rounded-2xl border px-3.5 py-2.5 shadow-2xl backdrop-blur-xl flex items-center gap-2.5 ${getTypeStyle()}`}
          >
            {/* Action Icon or Player Badge */}
            {announcement.playerLetter ? (
              <span className="w-6 h-6 rounded-xl bg-white/15 text-white font-mono font-black text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                {announcement.playerLetter}
              </span>
            ) : (
              getIcon()
            )}

            {/* Mini Card Chip if card present */}
            {announcement.card && (
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-white/15 text-white flex-shrink-0 border border-white/20">
                {announcement.card.color !== 'WILD' ? announcement.card.color[0] : '★'}{' '}
                {announcement.card.value ?? announcement.card.type}
              </span>
            )}

            {/* Compact Text Details */}
            <div className="flex-1 min-w-0 text-left flex flex-col justify-center">
              <span className="font-black text-xs text-white truncate leading-snug">
                {announcement.title}
              </span>
              {(announcement.subtitle || announcement.description) && (
                <span className="text-[10px] text-slate-300/90 truncate font-normal leading-tight">
                  {announcement.subtitle || announcement.description}
                </span>
              )}
            </div>

            {/* Animated Bottom Progress Line */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10">
              <div
                className="h-full bg-cyan-400/90 transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
