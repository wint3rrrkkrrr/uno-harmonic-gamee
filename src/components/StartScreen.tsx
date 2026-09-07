import React, { useState } from 'react';
import { Player, PlayerLetter } from '../types/game';
import { PLAYER_LETTERS } from '../utils/cardUtils';

interface StartScreenProps {
  hasSavedGame: boolean;
  onContinueGame: () => void;
  onStartNewGame: (playersConfig: { name: string; letter: PlayerLetter; isBot: boolean }[]) => void;
  onOpenOnlineLobby: () => void;
  onOpenHowToPlay: () => void;
  onOpenAbout: () => void;
  onOpenSupabaseConfig?: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  hasSavedGame,
  onContinueGame,
  onStartNewGame,
  onOpenOnlineLobby,
  onOpenHowToPlay,
  onOpenAbout,
  onOpenSupabaseConfig,
}) => {
  const [view, setView] = useState<'HOME' | 'SETUP'>('HOME');
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [playerConfigs, setPlayerConfigs] = useState<{ name: string; isBot: boolean }[]>([
    { name: 'Player A', isBot: false },
    { name: 'บอท B (SHM)', isBot: true },
    { name: 'บอท C (SHM)', isBot: true },
    { name: 'บอท D (SHM)', isBot: true },
    { name: 'บอท E (SHM)', isBot: true },
    { name: 'บอท F (SHM)', isBot: true },
  ]);

  const handleNameChange = (idx: number, newName: string) => {
    const next = [...playerConfigs];
    next[idx].name = newName;
    setPlayerConfigs(next);
  };

  const handleBotToggle = (idx: number) => {
    const next = [...playerConfigs];
    next[idx].isBot = !next[idx].isBot;
    setPlayerConfigs(next);
  };

  const handleLaunchGame = () => {
    const configsToUse = playerConfigs.slice(0, playerCount).map((cfg, idx) => ({
      name: cfg.name.trim() || `Player ${PLAYER_LETTERS[idx]}`,
      letter: PLAYER_LETTERS[idx],
      isBot: cfg.isBot,
    }));
    onStartNewGame(configsToUse);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#08090d] bg-physics-grid text-slate-100 flex flex-col items-center justify-center p-4 overflow-hidden select-none">
      {/* Dynamic Animated Sine Wave Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25">
        <svg
          className="w-[200%] h-full -translate-x-1/4 animate-pulse"
          viewBox="0 0 1000 400"
          preserveAspectRatio="none"
          fill="none"
          stroke="currentColor"
        >
          <path
            d="M0 200 Q 125 50, 250 200 T 500 200 T 750 200 T 1000 200"
            stroke="url(#grad1)"
            strokeWidth="3"
          />
          <path
            d="M0 220 Q 125 350, 250 220 T 500 220 T 750 220 T 1000 220"
            stroke="url(#grad2)"
            strokeWidth="2"
            opacity="0.6"
          />
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="35%" stopColor="#06b6d4" />
              <stop offset="70%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {view === 'HOME' ? (
        /* ================= HOME VIEW ================= */
        <div className="relative z-10 w-full max-w-lg glass-panel-elevated rounded-3xl p-6 sm:p-9 shadow-2xl border border-white/10 text-center space-y-6">
          {/* Logo Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-200 text-xs font-mono tracking-widest uppercase shadow-sm">
            <span className="text-cyan-400">∿</span> Simple Harmonic Motion Card Game
          </div>

          <div>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-cyan-300 to-amber-300 drop-shadow-md">
              HARMONIC
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2.5 font-medium leading-relaxed">
              เกมการ์ดออนไลน์สไตล์ UNO ผสมโจทย์ฟิสิกส์ SHM
              <br />
              <span className="text-xs text-slate-400">
                เล่นออนไลน์สร้างห้องกับเพื่อน หรือเล่นฝึกสมองกับบอท AI
              </span>
            </p>
          </div>

          {/* Card Preview Graphic */}
          <div className="flex justify-center items-center gap-3 py-2">
            <div className="w-12 h-16 rounded-xl bg-gradient-to-b from-rose-500 to-rose-800 border border-rose-400/80 shadow-lg card-glow-red -rotate-12 flex flex-col items-center justify-center font-black text-white text-base">
              A
              <span className="text-[7px] font-mono font-bold text-rose-100">RED</span>
            </div>
            <div className="w-12 h-16 rounded-xl bg-gradient-to-b from-cyan-500 to-cyan-800 border border-cyan-400/80 shadow-lg card-glow-blue -rotate-3 flex flex-col items-center justify-center font-black text-white text-base">
              ω
              <span className="text-[7px] font-mono font-bold text-cyan-100">BLUE</span>
            </div>
            <div className="w-14 h-20 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border-2 border-indigo-400 shadow-2xl flex flex-col items-center justify-center font-black text-white text-base scale-110 z-10 card-glow-wild">
              ∿ E
              <span className="text-[7px] font-mono font-bold text-indigo-200">โจทย์ SHM</span>
            </div>
            <div className="w-12 h-16 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-800 border border-emerald-400/80 shadow-lg card-glow-green rotate-3 flex flex-col items-center justify-center font-black text-white text-base">
              k
              <span className="text-[7px] font-mono font-bold text-emerald-100">GREEN</span>
            </div>
            <div className="w-12 h-16 rounded-xl bg-gradient-to-b from-amber-400 to-amber-700 border border-amber-300/80 shadow-lg card-glow-yellow rotate-12 flex flex-col items-center justify-center font-black text-slate-950 text-base">
              m
              <span className="text-[7px] font-mono font-bold text-amber-950">YELLOW</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {/* ONLINE MULTIPLAYER BUTTON */}
            <button
              onClick={onOpenOnlineLobby}
              className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-2.5 border border-cyan-300/40"
            >
              <span className="text-xl">🌐</span>
              <span>เล่นออนไลน์กับเพื่อน (สร้างห้อง / รหัสห้อง)</span>
            </button>

            {/* SINGLEPLAYER / PASS AND PLAY BUTTON */}
            <button
              onClick={() => setView('SETUP')}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-base rounded-2xl shadow-xl shadow-indigo-950/40 transition-all hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-2 border border-purple-400/30"
            >
              <span className="text-lg">🤖</span>
              <span>เล่นคนเดียวกับบอท (Singleplayer)</span>
            </button>

            {hasSavedGame && (
              <button
                onClick={onContinueGame}
                className="w-full py-3 px-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-950/40 transition-all hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-2 border border-emerald-400/30"
              >
                <span>💾 เล่นเกมที่บันทึกไว้ (CONTINUE GAME)</span>
              </button>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={onOpenHowToPlay}
                className="py-3 px-4 glass-panel-subtle hover:bg-slate-800 text-slate-200 font-bold rounded-xl text-xs sm:text-sm border border-white/10 hover:border-white/25 transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>📖 กติกาเข้าใจง่าย</span>
              </button>
              <button
                onClick={onOpenAbout}
                className="py-3 px-4 glass-panel-subtle hover:bg-slate-800 text-slate-200 font-bold rounded-xl text-xs sm:text-sm border border-white/10 hover:border-white/25 transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>ℹ️ สูตรฟิสิกส์ SHM</span>
              </button>
            </div>

            {onOpenSupabaseConfig && (
              <button
                onClick={onOpenSupabaseConfig}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 text-cyan-300 hover:text-cyan-200 font-bold text-xs border border-cyan-500/20 hover:border-cyan-400/40 flex items-center justify-center gap-2 transition-all shadow-inner"
              >
                <span>⚡</span>
                <span>ตั้งค่า Supabase Backend & คู่มือ Netlify</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ================= SETUP VIEW ================= */
        <div className="relative z-10 w-full max-w-lg glass-panel-elevated rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
            <button
              onClick={() => setView('HOME')}
              className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              ← ย้อนกลับ
            </button>
            <h2 className="text-lg font-black text-white tracking-wide">
              ตั้งค่าเล่นกับบอท (Singleplayer)
            </h2>
            <div className="w-12" />
          </div>

          {/* Number of Players */}
          <div className="space-y-2.5">
            <label className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider block">
              จำนวนผู้เล่นทั้งหมด (2–6 คน)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPlayerCount(num)}
                  className={`py-2.5 rounded-xl font-black text-sm transition-all ${
                    playerCount === num
                      ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/35 ring-2 ring-cyan-300 scale-105'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-white/10'
                  }`}
                >
                  {num} คน
                </button>
              ))}
            </div>
          </div>

          {/* Player Configuration List */}
          <div className="space-y-3">
            <label className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider block">
              รายชื่อผู้เล่นและ Player Card (A–F)
            </label>
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {Array.from({ length: playerCount }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-950/70 border border-white/10 shadow-inner"
                >
                  {/* Player Letter Badge */}
                  <span className="w-8 h-8 rounded-xl bg-indigo-600 font-mono font-black text-white flex items-center justify-center text-sm shadow-md shadow-indigo-600/40">
                    {PLAYER_LETTERS[idx]}
                  </span>

                  {/* Name Input */}
                  <input
                    type="text"
                    value={playerConfigs[idx].name}
                    onChange={(e) => handleNameChange(idx, e.target.value)}
                    placeholder={`Player ${PLAYER_LETTERS[idx]}`}
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-white text-xs sm:text-sm font-medium focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  />

                  {/* Bot or Human Toggle */}
                  <button
                    type="button"
                    onClick={() => handleBotToggle(idx)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                      playerConfigs[idx].isBot
                        ? 'bg-purple-950/80 border-purple-500/60 text-purple-300 shadow-sm'
                        : 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 shadow-sm'
                    }`}
                  >
                    {playerConfigs[idx].isBot ? '🤖 BOT' : '👤 คุณเล่น'}
                  </button>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              💡 คุณสามารถเลือกเล่นคนเดียวร่วมกับบอท หรือสลับตาเล่นกับเพื่อนในเครื่องเดียวกัน
            </p>
          </div>

          {/* Start Game Launch */}
          <button
            onClick={handleLaunchGame}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-600 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-cyan-950/50 transition-all hover:scale-[1.02] active:scale-98 border border-white/20"
          >
            🚀 เริ่มเกมทันที (START GAME)
          </button>
        </div>
      )}
    </div>
  );
};
