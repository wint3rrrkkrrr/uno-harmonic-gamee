import React from 'react';
import { Card, CardColor } from '../types/game';
import {
  RotateCcw,
  SkipForward,
  CopyPlus,
  Sparkles,
  Atom,
  Zap,
} from 'lucide-react';

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
  // Proportional standard card aspect ratio 63:88
  const sizeClasses = {
    mini: 'w-10 h-14 text-xs rounded-md',
    sm: 'w-14 h-20 text-xs rounded-xl',
    md: 'w-20 h-28 sm:w-24 sm:h-34 text-sm rounded-2xl',
    lg: 'w-28 h-40 sm:w-32 sm:h-46 text-base rounded-2xl',
  }[size];

  // ----------------------------------------------------
  // CARD BACK: Luxury Quantum Physics Emblem
  // ----------------------------------------------------
  if (isBack || !card) {
    return (
      <div
        onClick={onClick}
        className={`relative ${sizeClasses} aspect-[63/88] bg-gradient-to-br from-slate-950 via-[#0a0e20] to-indigo-950/90 border border-indigo-400/30 shadow-2xl select-none flex flex-col items-center justify-center overflow-hidden transition-all duration-300 ${
          onClick
            ? 'cursor-pointer hover:-translate-y-2 hover:border-cyan-400/80 hover:shadow-cyan-500/30 hover:shadow-2xl'
            : ''
        } ${className}`}
      >
        {/* Subtle holographic foil grid */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:10px_10px]" />

        {/* Double Inset Gold/Cyan Border */}
        <div className="absolute inset-1.5 rounded-xl border border-indigo-400/25 pointer-events-none" />
        <div className="absolute inset-2.5 rounded-lg border border-cyan-400/15 pointer-events-none" />

        {/* Diagonal Gloss Sweep */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-cyan-300/10 pointer-events-none" />

        {/* Orbit Rings */}
        <div className="relative z-10 flex flex-col items-center justify-center p-2 text-center">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-indigo-900/80 via-cyan-950/80 to-slate-900 border border-cyan-400/40 flex items-center justify-center shadow-lg shadow-cyan-950/60 mb-1 relative">
            <span className="text-cyan-300 text-base sm:text-lg animate-pulse">∿</span>
            <div className="absolute inset-0 rounded-full border border-dashed border-cyan-300/30 animate-spin [animation-duration:12s]" />
          </div>

          <div className="text-[9px] sm:text-[11px] font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-slate-200 via-cyan-200 to-indigo-200 uppercase font-mono">
            HARMONIC
          </div>
          <span className="text-[7px] font-mono tracking-wider text-cyan-400/80 uppercase">
            SHM PHYSICS
          </span>
        </div>

        {countBadge !== undefined && (
          <span className="absolute top-1.5 right-1.5 bg-gradient-to-r from-indigo-600 to-cyan-600 border border-cyan-300/60 text-white font-mono font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-indigo-950/80">
            {countBadge}
          </span>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // CARD FRONT: Color Scheme & Textures
  // ----------------------------------------------------
  const getColorScheme = (color: CardColor) => {
    switch (color) {
      case 'RED':
        return {
          bg: 'bg-gradient-to-b from-rose-500 via-rose-600 to-rose-950',
          border: 'border-rose-300/90 shadow-rose-950/80',
          glow: 'card-glow-red',
          badgeText: 'Amplitude (A) — แอมพลิจูด',
          variableSymbol: 'A',
          variableName: 'แอมพลิจูด',
          variableFull: 'Amplitude (A)',
          cornerBadge: 'bg-rose-950/80 text-rose-200',
          accent: 'text-rose-100',
        };
      case 'BLUE':
        return {
          bg: 'bg-gradient-to-b from-cyan-400 via-sky-600 to-blue-950',
          border: 'border-cyan-200/90 shadow-cyan-950/80',
          glow: 'card-glow-blue',
          badgeText: 'Angular Frequency (ω) — ความถี่เชิงมุม',
          variableSymbol: 'ω',
          variableName: 'ความถี่เชิงมุม',
          variableFull: 'Angular Frequency (ω)',
          cornerBadge: 'bg-sky-950/80 text-cyan-200',
          accent: 'text-cyan-100',
        };
      case 'GREEN':
        return {
          bg: 'bg-gradient-to-b from-emerald-400 via-emerald-600 to-teal-950',
          border: 'border-emerald-200/90 shadow-emerald-950/80',
          glow: 'card-glow-green',
          badgeText: 'Spring Constant (k) — ค่าคงที่สปริง',
          variableSymbol: 'k',
          variableName: 'ค่าคงที่สปริง',
          variableFull: 'Spring Constant (k)',
          cornerBadge: 'bg-emerald-950/80 text-emerald-200',
          accent: 'text-emerald-100',
        };
      case 'YELLOW':
        return {
          bg: 'bg-gradient-to-b from-amber-300 via-amber-500 to-amber-900',
          border: 'border-amber-100/95 shadow-amber-950/80',
          glow: 'card-glow-yellow',
          badgeText: 'Mass (m) — มวล',
          variableSymbol: 'm',
          variableName: 'มวล',
          variableFull: 'Mass (m)',
          cornerBadge: 'bg-amber-950/80 text-amber-200',
          accent: 'text-amber-50',
        };
      case 'WILD':
      default:
        return {
          bg: 'bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950',
          border: 'border-fuchsia-400/90 shadow-purple-950/90',
          glow: 'card-glow-wild',
          badgeText: 'เปลี่ยนสี (WILD)',
          variableSymbol: '★',
          variableName: 'เปลี่ยนสี',
          variableFull: 'Wild Color',
          cornerBadge: 'bg-purple-950/80 text-fuchsia-200',
          accent: 'text-fuchsia-100',
        };
    }
  };

  const scheme = getColorScheme(card.color);

  // Center Content
  const renderCenterContent = () => {
    switch (card.type) {
      case 'NUMBER':
        return (
          <div className="flex flex-col items-center justify-center my-auto text-center px-1">
            <span className="font-black text-3xl sm:text-5xl text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] tracking-tight leading-none">
              {card.value}
            </span>
            <div className="h-0.5 w-6 sm:w-8 bg-white/50 rounded-full mt-1.5 mb-1" />
            <span className="text-[8px] sm:text-[9.5px] font-black text-white drop-shadow tracking-tight leading-tight">
              {scheme.variableFull}
            </span>
            <span className="text-[7.5px] sm:text-[8.5px] text-white/90 font-bold leading-tight">
              {scheme.variableName}
            </span>
          </div>
        );
      case 'DRAW_TWO':
        return (
          <div className="flex flex-col items-center justify-center my-auto text-center px-1">
            <div className="flex items-center justify-center gap-0.5">
              <CopyPlus className="w-5 h-5 sm:w-7 sm:h-7 text-white drop-shadow" />
              <span className="font-black text-2xl sm:text-4xl text-white drop-shadow leading-none">
                +2
              </span>
            </div>
            <span className="text-[9px] sm:text-[11px] font-black tracking-tight text-white uppercase mt-1 leading-tight drop-shadow">
              จั่ว 2 ใบ
            </span>
            <span className="text-[7px] sm:text-[8px] text-white/90 font-bold tracking-wider">(+2 ไพ่)</span>
          </div>
        );
      case 'SKIP':
        return (
          <div className="flex flex-col items-center justify-center my-auto text-center px-1">
            <SkipForward className="w-7 h-7 sm:w-9 sm:h-9 text-white drop-shadow" />
            <span className="text-[9px] sm:text-[11px] font-black tracking-tight text-white uppercase mt-1 leading-tight drop-shadow">
              ข้ามตาเล่น
            </span>
            <span className="text-[7px] sm:text-[8px] text-white/90 font-bold tracking-wider">(SKIP)</span>
          </div>
        );
      case 'REVERSE':
        return (
          <div className="flex flex-col items-center justify-center my-auto text-center px-1">
            <RotateCcw className="w-7 h-7 sm:w-9 sm:h-9 text-white drop-shadow" />
            <span className="text-[9px] sm:text-[11px] font-black tracking-tight text-white uppercase mt-1 leading-tight drop-shadow">
              กลับทิศทาง
            </span>
            <span className="text-[7px] sm:text-[8px] text-white/90 font-bold tracking-wider">(REVERSE)</span>
          </div>
        );
      case 'EQUATION':
        return (
          <div className="flex flex-col items-center justify-center my-auto text-center px-1">
            <div className="relative flex items-center justify-center mb-0.5">
              <Atom className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300 drop-shadow animate-spin [animation-duration:16s]" />
              <Zap className="w-3.5 h-3.5 text-white absolute inset-0 m-auto" />
            </div>
            <span className="font-black text-xs sm:text-sm tracking-tight text-amber-200 uppercase mt-0.5 leading-tight drop-shadow">
              โจทย์ฟิสิกส์
            </span>
            <span className="text-[7px] sm:text-[8px] text-white/90 font-bold tracking-wider">(สมการ SHM)</span>
          </div>
        );
      case 'WILD':
        return (
          <div className="flex flex-col items-center justify-center my-auto text-center px-1">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full grid grid-cols-2 p-1 gap-0.5 bg-slate-950/80 border border-white/60 shadow-xl mb-1">
              <div className="bg-rose-500 rounded-tl-full" />
              <div className="bg-cyan-400 rounded-tr-full" />
              <div className="bg-amber-400 rounded-bl-full" />
              <div className="bg-emerald-400 rounded-br-full" />
            </div>
            <span className="font-black text-xs sm:text-sm tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-amber-200 to-cyan-300 drop-shadow">
              เปลี่ยนสี
            </span>
            <span className="text-[7px] sm:text-[8px] text-purple-200 font-bold uppercase tracking-wider">
              (WILD)
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  const cornerSymbol = () => {
    if (card.type === 'NUMBER') return `${card.value} ${scheme.variableSymbol}`;
    if (card.type === 'DRAW_TWO') return '+2';
    if (card.type === 'SKIP') return '⏭';
    if (card.type === 'REVERSE') return '↺';
    if (card.type === 'EQUATION') return '∿';
    if (card.type === 'WILD') return '★';
    return '';
  };

  return (
    <div
      onClick={onClick}
      className={`relative ${sizeClasses} aspect-[63/88] ${scheme.bg} border-2 ${
        isSelected
          ? 'border-amber-300 ring-4 ring-amber-400/50 -translate-y-3 shadow-amber-400/40'
          : scheme.border
      } shadow-xl select-none flex flex-col justify-between p-2 overflow-hidden transition-all duration-200 ${
        isPlayable
          ? `cursor-pointer hover:-translate-y-3 hover:shadow-2xl hover:scale-105 hover:ring-2 hover:ring-white/90 ${scheme.glow}`
          : onClick
          ? 'cursor-pointer hover:-translate-y-1'
          : 'opacity-90'
      } ${className}`}
    >
      {/* Glossy Card Surface Highlight */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 via-white/10 to-transparent pointer-events-none rounded-t-xl" />

      {/* Inset Metallic Card Frame */}
      <div className="absolute inset-1 rounded-xl border border-white/20 pointer-events-none" />

      {/* Top Left Corner Index */}
      <div className="flex items-center justify-between z-10 leading-none">
        <div className="flex items-center gap-1">
          <span className="font-black text-xs sm:text-sm text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            {cornerSymbol()}
          </span>
          {card.type === 'EQUATION' && (
            <span className="text-[8px] font-mono text-amber-200">SHM</span>
          )}
        </div>
        {card.type === 'WILD' && (
          <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-200" />
        )}
      </div>

      {/* Center Artwork / Variable Display */}
      <div className="relative z-10 flex items-center justify-center flex-1">
        {renderCenterContent()}
      </div>

      {/* Bottom Right Corner Index (Inverted 180 deg) */}
      <div className="flex items-center justify-end z-10 leading-none rotate-180">
        <span className="font-black text-xs sm:text-sm text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          {cornerSymbol()}
        </span>
      </div>

      {/* Playable Pulse Glow */}
      {isPlayable && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
      )}
    </div>
  );
};
