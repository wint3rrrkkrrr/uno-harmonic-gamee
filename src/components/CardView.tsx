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
  // Proportional standard card aspect ratio 63:88 with optimized mobile touch dimensions
  const sizeClasses = {
    mini: 'w-9 h-13 text-[10px] rounded-lg',
    sm: 'w-12 h-17 sm:w-14 sm:h-20 text-xs rounded-xl',
    md: 'w-[4.75rem] h-[6.85rem] sm:w-24 sm:h-34 text-xs sm:text-sm rounded-2xl',
    lg: 'w-24 h-34 sm:w-32 sm:h-46 text-sm sm:text-base rounded-2xl',
  }[size];

  // ----------------------------------------------------
  // CARD BACK: Sleek Minimal Physics Emblem
  // ----------------------------------------------------
  if (isBack || !card) {
    return (
      <div
        onClick={onClick}
        className={`relative ${sizeClasses} aspect-[63/88] bg-slate-900 border border-indigo-500/30 shadow-xl select-none flex flex-col items-center justify-center overflow-hidden transition-all duration-200 active:scale-95 ${
          onClick
            ? 'cursor-pointer hover:border-cyan-400 hover:shadow-cyan-500/25 hover:shadow-xl'
            : ''
        } ${className}`}
      >
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:8px_8px]" />

        {/* Minimal inner border */}
        <div className="absolute inset-1.5 rounded-xl border border-white/10 pointer-events-none" />

        {/* Center Minimal SHM Logo */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center p-1">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-950 border border-cyan-400/40 flex items-center justify-center shadow-md mb-1">
            <span className="text-cyan-300 text-sm sm:text-base font-bold">∿</span>
          </div>
          <div className="text-[9px] sm:text-[10px] font-black tracking-widest text-slate-200 uppercase font-mono">
            HARMONIC
          </div>
          <span className="text-[7px] font-mono text-cyan-400/70 tracking-wider">
            SHM
          </span>
        </div>

        {countBadge !== undefined && (
          <span className="absolute top-1.5 right-1.5 bg-cyan-500 text-slate-950 font-mono font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md">
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
          badgeText: 'สีแดง (RED)',
          colorName: 'แดง',
          cornerBadge: 'bg-rose-950/80 text-rose-200',
          accent: 'text-rose-100',
        };
      case 'BLUE':
        return {
          bg: 'bg-gradient-to-b from-cyan-400 via-sky-600 to-blue-950',
          border: 'border-cyan-200/90 shadow-cyan-950/80',
          glow: 'card-glow-blue',
          badgeText: 'สีน้ำเงิน (BLUE)',
          colorName: 'น้ำเงิน',
          cornerBadge: 'bg-sky-950/80 text-cyan-200',
          accent: 'text-cyan-100',
        };
      case 'GREEN':
        return {
          bg: 'bg-gradient-to-b from-emerald-400 via-emerald-600 to-teal-950',
          border: 'border-emerald-200/90 shadow-emerald-950/80',
          glow: 'card-glow-green',
          badgeText: 'สีเขียว (GREEN)',
          colorName: 'เขียว',
          cornerBadge: 'bg-emerald-950/80 text-emerald-200',
          accent: 'text-emerald-100',
        };
      case 'YELLOW':
        return {
          bg: 'bg-gradient-to-b from-amber-300 via-amber-500 to-amber-900',
          border: 'border-amber-100/95 shadow-amber-950/80',
          glow: 'card-glow-yellow',
          badgeText: 'สีเหลือง (YELLOW)',
          colorName: 'เหลือง',
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
          colorName: 'เปลี่ยนสี',
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
            <span className="font-black text-4xl sm:text-6xl text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.85)] tracking-tight leading-none">
              {card.value}
            </span>
            <div className="h-0.5 w-7 sm:w-10 bg-white/60 rounded-full mt-2 mb-1" />
            <span className="text-[9px] sm:text-[10px] font-black text-white/90 drop-shadow tracking-wider uppercase">
              {scheme.colorName} {card.value}
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
            <span className="text-[7px] sm:text-[8px] text-white/90 font-bold tracking-wider">(DRAW TWO)</span>
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
      case 'WILD_DRAW_FOUR':
        return (
          <div className="flex flex-col items-center justify-center my-auto text-center px-1">
            <div className="relative flex items-center justify-center mb-1">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full grid grid-cols-2 p-1 gap-0.5 bg-slate-950/80 border border-white/60 shadow-xl">
                <div className="bg-rose-500 rounded-tl-full" />
                <div className="bg-cyan-400 rounded-tr-full" />
                <div className="bg-amber-400 rounded-bl-full" />
                <div className="bg-emerald-400 rounded-br-full" />
              </div>
              <span className="absolute font-black text-base sm:text-xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                +4
              </span>
            </div>
            <span className="font-black text-[11px] sm:text-xs tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-amber-200 to-cyan-300 drop-shadow">
              เปลี่ยนสี +4
            </span>
            <span className="text-[7px] sm:text-[8px] text-purple-200 font-bold uppercase tracking-wider">
              (WILD +4)
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  const cornerSymbol = () => {
    if (card.type === 'NUMBER') return `${card.value}`;
    if (card.type === 'DRAW_TWO') return '+2';
    if (card.type === 'SKIP') return '⏭';
    if (card.type === 'REVERSE') return '↺';
    if (card.type === 'EQUATION') return '∿';
    if (card.type === 'WILD') return '★';
    if (card.type === 'WILD_DRAW_FOUR') return '+4★';
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
