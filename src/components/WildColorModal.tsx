import React from 'react';
import { CardColor } from '../types/game';
import { Sparkles } from 'lucide-react';

interface WildColorModalProps {
  isOpen: boolean;
  playerName: string;
  onSelectColor: (color: CardColor) => void;
}

export const WildColorModal: React.FC<WildColorModalProps> = ({
  isOpen,
  playerName,
  onSelectColor,
}) => {
  if (!isOpen) return null;

  const colorOptions: {
    color: CardColor;
    nameTh: string;
    english: string;
    bg: string;
    border: string;
    varInfo: string;
  }[] = [
    {
      color: 'RED',
      nameTh: 'สีแดง (RED)',
      english: 'Amplitude & Displacement',
      bg: 'bg-gradient-to-br from-rose-500 to-rose-700 hover:from-rose-400 hover:to-rose-600',
      border: 'border-rose-300/80 shadow-rose-950/60',
      varInfo: 'A (แอมพลิจูด), x (การกระจัด)',
    },
    {
      color: 'BLUE',
      nameTh: 'สีน้ำเงิน (BLUE)',
      english: 'Frequency & Velocity',
      bg: 'bg-gradient-to-br from-cyan-500 to-blue-700 hover:from-cyan-400 hover:to-blue-600',
      border: 'border-cyan-300/80 shadow-cyan-950/60',
      varInfo: 'ω (ความถี่เชิงมุม), f (ความถี่)',
    },
    {
      color: 'GREEN',
      nameTh: 'สีเขียว (GREEN)',
      english: 'Spring & Energy',
      bg: 'bg-gradient-to-br from-emerald-500 to-teal-700 hover:from-emerald-400 hover:to-teal-600',
      border: 'border-emerald-300/80 shadow-emerald-950/60',
      varInfo: 'k (ค่านิจสปริง), E (พลังงาน)',
    },
    {
      color: 'YELLOW',
      nameTh: 'สีเหลือง (YELLOW)',
      english: 'Mass & Period',
      bg: 'bg-gradient-to-br from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500',
      border: 'border-amber-200/90 shadow-amber-950/60',
      varInfo: 'm (มวล), T (คาบการสั่น)',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xl p-4 animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md glass-panel-elevated border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-8 text-center text-white overflow-hidden">
        {/* Holographic Top Glow Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-400 to-cyan-400" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/30 text-fuchsia-300 text-xs font-mono font-bold tracking-widest uppercase mb-2">
          <Sparkles className="w-3.5 h-3.5 text-fuchsia-300" />
          <span>QUANTUM WILD CARD</span>
        </div>

        <h2 className="text-2xl font-black text-white mb-1.5 tracking-wide">
          เลือกสีถัดไปสำหรับโต๊ะ
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mb-6">
          <span className="font-bold text-amber-300">{playerName}</span> ได้ลงการ์ด WILD
          กรุณาเลือกทิศทางสีถัดไปสำหรับผู้เล่นคนต่อไป:
        </p>

        <div className="grid grid-cols-2 gap-3.5 mb-2">
          {colorOptions.map((opt) => (
            <button
              key={opt.color}
              onClick={() => onSelectColor(opt.color)}
              className={`p-4 rounded-2xl text-left border-2 ${opt.border} ${opt.bg} transition-all duration-200 hover:scale-105 active:scale-95 shadow-xl group flex flex-col justify-between cursor-pointer`}
            >
              <div>
                <div className="font-black text-sm sm:text-base text-white group-hover:drop-shadow mb-0.5">
                  {opt.nameTh}
                </div>
                <div className="text-[10px] text-white/80 font-mono">
                  {opt.english}
                </div>
              </div>

              <div className="mt-3 text-[10px] text-white/95 font-medium leading-tight bg-black/20 p-1.5 rounded-lg">
                {opt.varInfo}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
