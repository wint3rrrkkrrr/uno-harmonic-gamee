import React from 'react';
import { CardColor } from '../types/game';

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

  const colorOptions: { color: CardColor; name: string; bg: string; border: string; varInfo: string }[] = [
    {
      color: 'RED',
      name: 'RED (แดง)',
      bg: 'bg-rose-600 hover:bg-rose-500',
      border: 'border-rose-400',
      varInfo: 'A (Amplitude), x (Displacement)',
    },
    {
      color: 'BLUE',
      name: 'BLUE (น้ำเงิน)',
      bg: 'bg-cyan-600 hover:bg-cyan-500',
      border: 'border-cyan-400',
      varInfo: 'ω (Angular Freq), f (Frequency), v (Velocity)',
    },
    {
      color: 'GREEN',
      name: 'GREEN (เขียว)',
      bg: 'bg-emerald-600 hover:bg-emerald-500',
      border: 'border-emerald-400',
      varInfo: 'k (Spring Const), E (Energy), t (Time)',
    },
    {
      color: 'YELLOW',
      name: 'YELLOW (เหลือง)',
      bg: 'bg-amber-500 hover:bg-amber-400',
      border: 'border-amber-300',
      varInfo: 'm (Mass), T (Period)',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-panel-elevated border border-white/15 rounded-3xl shadow-2xl p-6 sm:p-7 text-center text-white overflow-hidden">
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-400 to-cyan-400" />

        <div className="text-xs font-mono font-bold tracking-widest text-indigo-400 uppercase mb-1">
          WILD CARD ACTIVATED
        </div>
        <h2 className="text-2xl font-black text-slate-100 mb-2 tracking-wide">
          CHOOSE NEXT COLOR
        </h2>
        <p className="text-sm text-slate-300 mb-6">
          <span className="font-bold text-amber-300">{playerName}</span>, เลือกสีถัดไปสำหรับไพ่บนกองทิ้ง:
        </p>

        <div className="grid grid-cols-2 gap-3.5 mb-2">
          {colorOptions.map((opt) => (
            <button
              key={opt.color}
              onClick={() => onSelectColor(opt.color)}
              className={`p-4 rounded-2xl text-left border-2 ${opt.border} ${opt.bg} transition-all duration-150 hover:scale-105 active:scale-95 shadow-xl group flex flex-col justify-between`}
            >
              <div className="font-black text-base text-white group-hover:drop-shadow mb-1">
                {opt.name}
              </div>
              <div className="text-[11px] text-white/90 font-mono leading-tight font-medium">
                {opt.varInfo}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
