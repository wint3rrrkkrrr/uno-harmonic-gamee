import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerLetter } from '../types/game';
import { PLAYER_LETTERS } from '../utils/cardUtils';

interface StartScreenProps {
  onStartNewGame: (playersConfig: { name: string; letter: PlayerLetter; isBot: boolean }[]) => void;
  onOpenOnlineLobby: () => void;
  onOpenHowToPlay: () => void;
  onOpenAbout: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartNewGame,
  onOpenOnlineLobby,
  onOpenHowToPlay,
  onOpenAbout,
}) => {
  const [view, setView] = useState<'HOME' | 'SETUP'>('HOME');
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [userName, setUserName] = useState<string>('ผู้เล่น (คุณ)');
  // 'RANDOM' or 0, 1, 2, ...
  const [chosenSeat, setChosenSeat] = useState<'RANDOM' | number>(0);

  const handleLaunchBotGame = () => {
    // Determine which seat index is human
    let humanIndex: number;
    if (chosenSeat === 'RANDOM') {
      humanIndex = Math.floor(Math.random() * playerCount);
    } else {
      humanIndex = Math.min(chosenSeat, playerCount - 1);
    }

    const configs = Array.from({ length: playerCount }).map((_, idx) => {
      const isHuman = idx === humanIndex;
      const letter = PLAYER_LETTERS[idx];
      return {
        name: isHuman
          ? userName.trim() || `Player ${letter}`
          : `บอท ${letter} (AI)`,
        letter,
        isBot: !isHuman,
      };
    });

    onStartNewGame(configs);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#08090d] bg-physics-grid text-slate-100 flex flex-col items-center justify-center p-4 overflow-hidden select-none">
      {/* Background Animated Sine Waves */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <svg
          className="w-[200%] h-full -translate-x-1/4"
          viewBox="0 0 1000 400"
          preserveAspectRatio="none"
          fill="none"
          stroke="currentColor"
        >
          <path
            d="M0 200 Q 125 50, 250 200 T 500 200 T 750 200 T 1000 200"
            stroke="url(#grad1)"
            strokeWidth="2.5"
          />
          <path
            d="M0 220 Q 125 350, 250 220 T 500 220 T 750 220 T 1000 220"
            stroke="url(#grad2)"
            strokeWidth="1.5"
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

      <AnimatePresence mode="wait">
        {view === 'HOME' ? (
          /* ================= HOME VIEW ================= */
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 w-full max-w-md glass-panel-elevated rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 text-center space-y-6"
          >
            {/* Logo Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/25 text-indigo-200 text-xs font-mono tracking-wider uppercase">
              <span className="text-cyan-400">∿</span> SHM Physics Card Game
            </div>

            <div>
              <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-cyan-300 to-amber-300 drop-shadow-md">
                HARMONIC
              </h1>
              <p className="text-sm text-slate-300 mt-2 font-medium">
                เกมการ์ดสไตล์ UNO ผสมการคำนวณ Simple Harmonic Motion
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-1">
              {/* ONLINE MULTIPLAYER BUTTON */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenOnlineLobby}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2.5 border border-cyan-300/40 cursor-pointer"
              >
                <span className="text-lg">🌐</span>
                <span>เล่นออนไลน์ (สร้างห้อง / ใส่รหัสห้อง)</span>
              </motion.button>

              {/* SINGLEPLAYER WITH BOTS BUTTON */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setView('SETUP')}
                className="w-full py-3.5 px-6 bg-slate-800/90 hover:bg-slate-700/90 text-white font-black text-base rounded-2xl shadow-lg border border-white/15 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="text-lg">🤖</span>
                <span>เล่นกับบอท (Singleplayer)</span>
              </motion.button>

              {/* HOW TO PLAY & FORMULAS */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  onClick={onOpenHowToPlay}
                  className="py-2.5 px-3 glass-panel-subtle hover:bg-slate-800 text-slate-300 hover:text-white font-bold rounded-xl text-xs border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>📖 กติกาการเล่น</span>
                </button>
                <button
                  onClick={onOpenAbout}
                  className="py-2.5 px-3 glass-panel-subtle hover:bg-slate-800 text-slate-300 hover:text-white font-bold rounded-xl text-xs border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>ℹ️ สูตรฟิสิกส์ SHM</span>
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ================= SETUP VIEW ================= */
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 w-full max-w-md glass-panel-elevated rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/10 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <button
                onClick={() => setView('HOME')}
                className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                ← ย้อนกลับ
              </button>
              <h2 className="text-base font-black text-white tracking-wide">
                ตั้งค่าเล่นกับบอท AI
              </h2>
              <div className="w-12" />
            </div>

            {/* Player Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider block">
                ชื่อของคุณ:
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="ระบุชื่อของคุณ"
                className="w-full px-3.5 py-2 bg-slate-900 border border-white/15 rounded-xl text-white text-sm font-bold focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            {/* Number of Players */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider block">
                จำนวนผู้เล่นทั้งหมด (2–6 คน):
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setPlayerCount(num);
                      if (typeof chosenSeat === 'number' && chosenSeat >= num) {
                        setChosenSeat(0);
                      }
                    }}
                    className={`py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      playerCount === num
                        ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-white/10'
                    }`}
                  >
                    {num} คน
                  </button>
                ))}
              </div>
            </div>

            {/* SEAT SELECTION: Choose position or Random */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                  ตำแหน่งผู้เล่นของคุณ (คนที่เท่าไหร่):
                </label>
                <span className="text-[11px] text-cyan-400 font-bold font-mono">
                  {chosenSeat === 'RANDOM'
                    ? '🎲 สุ่มตำแหน่ง'
                    : `คนที่ ${chosenSeat + 1} (${PLAYER_LETTERS[chosenSeat]})`}
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 pt-1">
                {/* Random Button */}
                <button
                  type="button"
                  onClick={() => setChosenSeat('RANDOM')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    chosenSeat === 'RANDOM'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black ring-2 ring-amber-300'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-white/10'
                  }`}
                >
                  <span>🎲</span>
                  <span>สุ่มตำแหน่ง</span>
                </button>

                {/* Specific Seats A, B, C... */}
                {Array.from({ length: playerCount }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setChosenSeat(idx)}
                    className={`py-2 px-2 rounded-xl text-xs transition-all cursor-pointer ${
                      chosenSeat === idx
                        ? 'bg-cyan-500 text-slate-950 font-black shadow-md ring-2 ring-cyan-300'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-white/10 font-bold'
                    }`}
                  >
                    คนที่ {idx + 1} ({PLAYER_LETTERS[idx]})
                    {idx === 0 && <span className="block text-[9px] opacity-80">เริ่มก่อน</span>}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 pt-0.5">
                {chosenSeat === 0
                  ? 'คุณจะได้เริ่มเล่นเป็นคนแรก (Player A)'
                  : chosenSeat === 'RANDOM'
                  ? 'ระบบจะสุ่มเลือกว่าคุณจะได้เล่นเป็นคนที่เท่าไหร่'
                  : `คุณจะได้เล่นเป็นลำดับที่ ${Number(chosenSeat) + 1} (บอทอื่นจะเล่นก่อนหน้า)`}
              </p>
            </div>

            {/* Launch Game Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLaunchBotGame}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-600 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-base rounded-2xl shadow-xl transition-all border border-white/20 cursor-pointer"
            >
              🚀 เริ่มเล่นเกมทันที
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
