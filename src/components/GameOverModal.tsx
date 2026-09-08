import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Player } from '../types/game';
import { Trophy, RotateCcw, Home, Sparkles, Award } from 'lucide-react';

interface GameOverModalProps {
  winner: Player | null;
  turnsCount: number;
  players: Player[];
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  turnsCount,
  players,
  onPlayAgain,
  onBackToMenu,
}) => {
  useEffect(() => {
    if (winner) {
      try {
        confetti({
          particleCount: 140,
          spread: 80,
          origin: { y: 0.55 },
        });
        const timer = setTimeout(() => {
          confetti({
            particleCount: 90,
            angle: 60,
            spread: 60,
            origin: { x: 0.1, y: 0.6 },
          });
          confetti({
            particleCount: 90,
            angle: 120,
            spread: 60,
            origin: { x: 0.9, y: 0.6 },
          });
        }, 350);
        return () => clearTimeout(timer);
      } catch {
        // fallback
      }
    }
  }, [winner]);

  if (!winner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xl p-4 animate-in fade-in zoom-in-95 duration-300 select-none">
      <div className="relative w-full max-w-lg glass-panel-elevated border-2 border-amber-400/60 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-center text-white">
        {/* Glow Top Edge */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-rose-500 to-cyan-400" />

        <div className="relative z-10 space-y-5">
          {/* Trophy Header Badge */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 text-xs font-mono font-black tracking-widest uppercase animate-pulse shadow-sm">
            <Trophy className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>HARMONIC VICTORY</span>
          </div>

          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-300 to-cyan-300 tracking-tight drop-shadow-md">
              VICTORY!
            </h1>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 flex items-center justify-center gap-2">
              <span>{winner.name}</span>
              <Award className="w-6 h-6 text-amber-400" />
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
              ผู้เล่น {winner.letter} ({winner.name}) สามารถทิ้งไพ่ในมือได้หมดก่อนทุกคน!
            </p>
          </div>

          {/* Stats Breakdown Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-white/15 space-y-3.5 shadow-inner">
            <div className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>สรุปสถิติรอบการแข่งขัน (MATCH REPORT)</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left font-mono">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10">
                <span className="text-[11px] text-slate-400 font-semibold">จำนวนเทิร์นทั้งหมด:</span>
                <div className="text-lg font-black text-cyan-300 mt-0.5">{turnsCount} รอบ</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10">
                <span className="text-[11px] text-slate-400 font-semibold">ผู้ชนะอันดับ 1:</span>
                <div className="text-lg font-black text-amber-300 mt-0.5 truncate">{winner.name}</div>
              </div>
            </div>

            {/* Other players cards count */}
            <div className="pt-1 text-left">
              <div className="text-xs text-slate-400 mb-2 font-semibold">ไพ่ที่เหลือของผู้เล่นอื่น:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {players
                  .filter((p) => p.id !== winner.id)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between text-slate-300"
                    >
                      <span className="font-medium">
                        Player {p.letter} ({p.name})
                      </span>
                      <span className="font-mono font-black text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded-lg border border-rose-500/30">
                        {p.hand.length} ใบ
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={onPlayAgain}
              className="py-3.5 px-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-sm transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-950/50 cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>เล่นอีกครั้ง</span>
            </button>

            <button
              onClick={onBackToMenu}
              className="py-3.5 px-5 glass-panel-subtle hover:bg-slate-800 text-slate-200 font-bold rounded-2xl text-sm border border-white/15 transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4 text-cyan-400" />
              <span>กลับสู่หน้าแรก</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
