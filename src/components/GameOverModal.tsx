import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Player } from '../types/game';

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
      // Fire confetti bursts
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
        const timer = setTimeout(() => {
          confetti({
            particleCount: 80,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 80,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
          });
        }, 300);
        return () => clearTimeout(timer);
      } catch {
        // fallback if canvas-confetti fails
      }
    }
  }, [winner]);

  if (!winner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="relative w-full max-w-lg glass-panel-elevated border-2 border-amber-400/70 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-center text-white">
        {/* Animated wave background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" stroke="currentColor">
            <path d="M 0 50 Q 25 10, 50 50 T 100 50" strokeWidth="2" />
          </svg>
        </div>

        <div className="relative z-10 space-y-5">
          <div className="inline-block px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 text-xs font-mono font-black tracking-widest uppercase animate-pulse shadow-sm">
            ★ HARMONIC VICTORY! ★
          </div>

          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-300 to-cyan-300 tracking-tight drop-shadow-md">
              HARMONIC!
            </h1>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              {winner.name} WINS!
            </h2>
            <p className="text-sm text-slate-300 mt-1 font-medium">
              (Player {winner.letter}) สามารถทิ้งไพ่ในมือได้หมดก่อนทุกคน!
            </p>
          </div>

          {/* Stats Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-3 shadow-inner">
            <div className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
              สถิติของเกม (MATCH STATISTICS)
            </div>
            <div className="grid grid-cols-2 gap-3 text-left font-mono">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10">
                <span className="text-xs text-slate-400 font-semibold">จำนวนเทิร์นทั้งหมด:</span>
                <div className="text-lg font-black text-cyan-300">{turnsCount} เทิร์น</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10">
                <span className="text-xs text-slate-400 font-semibold">ผู้ชนะ:</span>
                <div className="text-lg font-black text-amber-300">{winner.name}</div>
              </div>
            </div>

            {/* Other players cards count */}
            <div className="pt-2 text-left">
              <div className="text-xs text-slate-400 mb-1.5 font-semibold">ไพ่ที่เหลือของผู้เล่นอื่น:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {players
                  .filter((p) => p.id !== winner.id)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="p-2 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between text-slate-300"
                    >
                      <span className="font-medium">Player {p.letter} ({p.name})</span>
                      <span className="font-mono font-black text-rose-400">{p.hand.length} ใบ</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={onPlayAgain}
              className="py-3.5 px-5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black rounded-xl text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-900/40 border border-emerald-400/30"
            >
              🔄 เล่นอีกครั้ง (PLAY AGAIN)
            </button>
            <button
              onClick={onBackToMenu}
              className="py-3.5 px-5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-sm border border-white/10 transition-colors"
            >
              🏠 กลับหน้าหลัก (MAIN MENU)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
