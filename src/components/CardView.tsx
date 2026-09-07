import React from 'react';
import { Card, CardColor } from '../types/game';

interface CardViewProps {
  card?: Card;
  isBack?: boolean;
  isPlayable?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'mini';
  className?: string;
  countBadge?: number;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  isBack = false,
  isPlayable = false,
  isSelected = false,
  onClick,
  size = 'md',
  className = '',
  countBadge,
}) => {
  // Dimensions matching standard 6.3 : 8.8 cm ratio
  const sizeClasses = {
    mini: 'w-10 h-14 text-xs rounded-md',
    sm: 'w-14 h-20 text-xs rounded-lg',
    md: 'w-20 h-28 sm:w-24 sm:h-34 text-sm rounded-xl',
    lg: 'w-28 h-40 sm:w-32 sm:h-44 text-base rounded-2xl',
  }[size];

  if (isBack || !card) {
    return (
      <div
        onClick={onClick}
        className={`relative ${sizeClasses} aspect-[63/88] bg-gradient-to-br from-slate-900 via-[#0d121f] to-indigo-950 border border-slate-700/70 shadow-xl select-none flex flex-col items-center justify-center overflow-hidden transition-all duration-200 ${
          onClick ? 'cursor-pointer hover:-translate-y-1.5 hover:border-indigo-400/90 hover:shadow-indigo-500/25 hover:shadow-2xl' : ''
        } ${className}`}
      >
        {/* Subtle background sine wave */}
        <svg
          className="absolute inset-0 w-full h-full opacity-25 pointer-events-none text-cyan-400/60"
          viewBox="0 0 100 140"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M-10 70 Q 15 30, 40 70 T 90 70 T 140 70" />
          <path d="M-10 60 Q 20 100, 50 60 T 100 60 T 150 60" opacity="0.4" stroke="#f43f5e" />
        </svg>

        {/* Outer border inset ring */}
        <div className="absolute inset-1.5 rounded-lg border border-indigo-400/15 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <span className="text-[10px] sm:text-xs font-mono tracking-widest text-cyan-300/80 uppercase font-semibold">
            ∿ SHM ∿
          </span>
          <div className="text-xs sm:text-sm font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-cyan-200 to-slate-100 uppercase mt-0.5 drop-shadow">
            HARMONIC
          </div>
        </div>

        {countBadge !== undefined && (
          <span className="absolute top-1.5 right-1.5 bg-indigo-600/90 border border-indigo-400 text-white font-mono font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md">
            {countBadge}
          </span>
        )}
      </div>
    );
  }

  // Card Colors
  const getColorScheme = (color: CardColor) => {
    switch (color) {
      case 'RED':
        return {
          bg: 'bg-gradient-to-b from-rose-500 via-rose-600 to-rose-900',
          border: 'border-rose-400/80 shadow-rose-950/60',
          glow: 'card-glow-red shadow-rose-500/50',
          accent: 'text-rose-100',
          badge: 'bg-rose-500 text-white',
          name: 'A (RED)',
        };
      case 'BLUE':
        return {
          bg: 'bg-gradient-to-b from-cyan-500 via-sky-600 to-blue-950',
          border: 'border-cyan-300/80 shadow-cyan-950/60',
          glow: 'card-glow-blue shadow-cyan-400/50',
          accent: 'text-cyan-100',
          badge: 'bg-cyan-500 text-white',
          name: 'ω/f (BLUE)',
        };
      case 'GREEN':
        return {
          bg: 'bg-gradient-to-b from-emerald-500 via-emerald-600 to-teal-950',
          border: 'border-emerald-300/80 shadow-emerald-950/60',
          glow: 'card-glow-green shadow-emerald-400/50',
          accent: 'text-emerald-100',
          badge: 'bg-emerald-500 text-white',
          name: 'k/E (GREEN)',
        };
      case 'YELLOW':
        return {
          bg: 'bg-gradient-to-b from-amber-400 via-amber-500 to-amber-800',
          border: 'border-amber-200/90 shadow-amber-950/60',
          glow: 'card-glow-yellow shadow-amber-300/60',
          accent: 'text-amber-50',
          badge: 'bg-amber-400 text-slate-950',
          name: 'm/T (YELLOW)',
        };
      case 'WILD':
      default:
        return {
          bg: 'bg-gradient-to-br from-slate-900 via-purple-950 to-slate-950',
          border: 'border-fuchsia-400/80 shadow-purple-950/70',
          glow: 'card-glow-wild shadow-fuchsia-400/50',
          accent: 'text-fuchsia-100',
          badge: 'bg-fuchsia-500 text-white',
          name: 'WILD',
        };
    }
  };

  const scheme = getColorScheme(card.color);

  // Card Content renderer
  const renderCardContent = () => {
    switch (card.type) {
      case 'NUMBER':
        return (
          <div className="flex flex-col items-center justify-center my-auto">
            <span className="font-extrabold text-2xl sm:text-4xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-none">
              {card.value}
            </span>
            <span className="text-[10px] sm:text-xs text-white/70 font-mono mt-0.5">
              ∿
            </span>
          </div>
        );
      case 'DRAW_TWO':
        return (
          <div className="flex flex-col items-center justify-center my-auto text-center px-1">
            <span className="font-extrabold text-xl sm:text-3xl text-white drop-shadow leading-none">
              +2
            </span>
            <span className="text-[8px] sm:text-[10px] font-bold tracking-tight text-white/95 uppercase mt-1 leading-tight">
              จั่ว 2 ใบ
            </span>
            <span className="text-[6px] sm:text-[8px] text-white/70 font-mono">ENERGY LOSS</span>
          </div>
        );
      case 'SKIP':
        return (
          <div className="flex flex-col items-center justify-center my-auto text-center px-1">
            <span className="font-extrabold text-xl sm:text-3xl text-white drop-shadow leading-none">
              ⏭
            </span>
            <span className="text-[8px] sm:text-[10px] font-bold tracking-tight text-white/95 uppercase mt-1 leading-tight">
              ข้ามตาเล่น
            </span>
            <span className="text-[6px] sm:text-[8px] text-white/70 font-mono">STOP</span>
          </div>
        );
      case 'REVERSE':
        return (
          <div className="flex flex-col items-center justify-center my-auto text-center px-1">
            <span className="font-extrabold text-xl sm:text-3xl text-white drop-shadow leading-none">
              🔄
            </span>
            <span className="text-[8px] sm:text-[10px] font-bold tracking-tight text-white/95 uppercase mt-1 leading-tight">
              สลับทิศทาง
            </span>
            <span className="text-[6px] sm:text-[8px] text-white/70 font-mono">REVERSE</span>
          </div>
        );
      case 'EQUATION':
        return (
          <div className="flex flex-col items-center justify-center my-auto text-center px-1">
            <span className="font-extrabold text-xl sm:text-3xl text-white drop-shadow leading-none">
              ∿ E
            </span>
            <span className="text-[7px] sm:text-[9px] font-bold tracking-tight text-amber-200 uppercase mt-1 leading-tight">
              โจทย์ฟิสิกส์
            </span>
            <span className="text-[6px] sm:text-[8px] text-white/70 font-mono">SHM CHALLENGE</span>
          </div>
        );
      case 'WILD':
        return (
          <div className="flex flex-col items-center justify-center my-auto text-center px-1">
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full grid grid-cols-2 p-0.5 gap-0.5 bg-slate-900/60 border border-white/40 shadow-inner mb-1">
              <div className="bg-rose-500 rounded-tl-full" />
              <div className="bg-cyan-500 rounded-tr-full" />
              <div className="bg-amber-400 rounded-bl-full" />
              <div className="bg-emerald-500 rounded-br-full" />
            </div>
            <span className="font-black text-xs sm:text-sm tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-amber-200 to-cyan-300">
              เปลี่ยนสี
            </span>
            <span className="text-[7px] sm:text-[9px] text-purple-200/80 uppercase font-medium">
              WILD COLOR
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  const cornerSymbol = () => {
    if (card.type === 'NUMBER') return card.value;
    if (card.type === 'DRAW_TWO') return '+2';
    if (card.type === 'SKIP') return '⏭';
    if (card.type === 'REVERSE') return '🔄';
    if (card.type === 'EQUATION') return 'E';
    if (card.type === 'WILD') return '★';
    return '';
  };

  return (
    <div
      onClick={onClick}
      className={`relative ${sizeClasses} aspect-[63/88] ${scheme.bg} border-2 ${
        isSelected ? 'border-amber-300 ring-4 ring-amber-400/40 -translate-y-3' : scheme.border
      } shadow-lg select-none flex flex-col justify-between p-1.5 overflow-hidden transition-all duration-200 ${
        isPlayable
          ? `cursor-pointer hover:-translate-y-2.5 hover:shadow-2xl hover:scale-105 hover:ring-2 hover:ring-white/80 ${scheme.glow}`
          : onClick
          ? 'cursor-pointer hover:-translate-y-1'
          : 'opacity-90'
      } ${className}`}
    >
      {/* Wave texture watermark */}
      <svg
        className="absolute inset-0 w-full h-full opacity-15 pointer-events-none text-white"
        viewBox="0 0 100 140"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M-10 70 Q 15 20, 40 70 T 90 70 T 140 70" />
      </svg>

      {/* Top Left Corner */}
      <div className="flex items-center justify-between z-10 leading-none">
        <span className="font-black text-[11px] sm:text-xs text-white drop-shadow">
          {cornerSymbol()}
        </span>
        {card.type === 'EQUATION' && (
          <span className="text-[8px] font-mono text-white/80">∿</span>
        )}
      </div>

      {/* Main Center Area */}
      <div className="relative z-10 flex items-center justify-center flex-1">
        {renderCardContent()}
      </div>

      {/* Bottom Right Corner (inverted) */}
      <div className="flex items-center justify-end z-10 leading-none rotate-180">
        <span className="font-black text-[11px] sm:text-xs text-white drop-shadow">
          {cornerSymbol()}
        </span>
      </div>

      {/* Playable indicator dot */}
      {isPlayable && (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
      )}
    </div>
  );
};
