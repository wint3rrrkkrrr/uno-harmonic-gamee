import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameMode, PlayerLetter } from '../types/game';
import { PLAYER_LETTERS } from '../utils/cardUtils';
import {
  Globe,
  Bot,
  BookOpen,
  Atom,
  Sparkles,
  ArrowRight,
  Shuffle,
  Users,
  ChevronLeft,
  Zap,
  Trophy,
  Skull,
  GraduationCap,
} from 'lucide-react';

interface StartScreenProps {
  onStartNewGame: (
    playersConfig: { name: string; letter: PlayerLetter; isBot: boolean }[],
    gameMode: GameMode
  ) => void;
  onOpenOnlineLobby: () => void;
  onOpenHowToPlay: () => void;
  onOpenAbout: () => void;
  onOpenTutorial: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartNewGame,
  onOpenOnlineLobby,
  onOpenHowToPlay,
  onOpenAbout,
  onOpenTutorial,
}) => {
  const [view, setView] = useState<'HOME' | 'SETUP'>('HOME');
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [userName, setUserName] = useState<string>('ผู้เล่น (คุณ)');
  const [chosenSeat, setChosenSeat] = useState<'RANDOM' | number>(0);
  const [gameMode, setGameMode] = useState<GameMode>('FIND_WINNER');

  const handleLaunchBotGame = () => {
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
        name: isHuman ? userName.trim() || `Player ${letter}` : `บอท ${letter} (AI)`,
        letter,
        isBot: !isHuman,
      };
    });

    onStartNewGame(configs, gameMode);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#05070e] bg-physics-grid text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      {/* Dynamic Quantum Glow Accents */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Background Animated Sine Wave SVG */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25">
        <svg
          className="w-[200%] h-full -translate-x-1/4"
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
          fill="none"
          stroke="currentColor"
        >
          <path
            d="M0 200 Q 150 40, 300 200 T 600 200 T 900 200 T 1200 200"
            stroke="url(#grad1)"
            strokeWidth="3"
          />
          <path
            d="M0 220 Q 150 360, 300 220 T 600 220 T 900 220 T 1200 220"
            stroke="url(#grad2)"
            strokeWidth="1.8"
            opacity="0.6"
          />
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="30%" stopColor="#06b6d4" />
              <stop offset="70%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <AnimatePresence mode="wait">
        {view === 'HOME' ? (
          /* ================= HOME VIEW ================= */
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-xl flex flex-col items-center text-center space-y-6 sm:space-y-8"
          >
            {/* Header / Title Area */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-400/30 text-cyan-300 text-[11px] font-mono font-bold tracking-wider uppercase">
                <Atom className="w-3.5 h-3.5 text-cyan-400 animate-spin [animation-duration:12s]" />
                <span>Simple Harmonic Motion Physics Card Game</span>
              </div>

              <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-cyan-300 to-amber-300 drop-shadow-[0_2px_12px_rgba(6,182,212,0.25)]">
                HARMONIC
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 max-w-sm sm:max-w-md mx-auto leading-relaxed">
                เกมการ์ดประลองไหวพริบสไตล์ UNO ผสมสูตรฟิสิกส์ SHM
                ชิงสิทธิ์ตอบโจทย์ และประกาศ <span className="text-amber-300 font-bold">“HARMONIC!”</span> เพื่อคว้าชัย
              </p>
            </div>

            {/* Game Mode Cards Grid */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* ONLINE MULTIPLAYER CARD */}
              <motion.div
                whileTap={{ scale: 0.98 }}
                onClick={onOpenOnlineLobby}
                className="group relative bg-slate-900/90 rounded-2xl p-4 sm:p-5 text-left border border-cyan-500/30 hover:border-cyan-400/80 shadow-xl transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      LIVE
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-white group-hover:text-cyan-200 transition-colors">
                    เล่นออนไลน์
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 leading-relaxed">
                    สร้างห้องเล่นกับเพื่อน แชร์รหัสห้อง 4 หลัก หรือจับคู่ประลองความเร็วแบบเรียลไทม์
                  </p>
                </div>

                <div className="mt-3 sm:mt-4 flex items-center gap-1 text-cyan-300 font-bold text-xs">
                  <span>เข้าสู่ล็อบบี้</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>

              {/* SINGLEPLAYER VS AI BOTS CARD */}
              <motion.div
                whileTap={{ scale: 0.98 }}
                onClick={() => setView('SETUP')}
                className="group relative bg-slate-900/90 rounded-2xl p-4 sm:p-5 text-left border border-indigo-500/30 hover:border-indigo-400/80 shadow-xl transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] font-bold font-mono">
                      OFFLINE
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-white group-hover:text-indigo-200 transition-colors">
                    เล่นกับบอท AI
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 leading-relaxed">
                    ฝึกทักษะการคำนวณและตัดแต้มกับบอท ปรับจำนวนผู้เล่นและลำดับที่นั่งได้อิสระ
                  </p>
                </div>

                <div className="mt-3 sm:mt-4 flex items-center gap-1 text-indigo-300 font-bold text-xs">
                  <span>ตั้งค่าและเริ่มเล่น</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            </div>

            {/* Quick Navigation: Tutorial, Rules & Formulas */}
            <div className="w-full flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                onClick={onOpenTutorial}
                className="py-2 px-3 bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 font-bold rounded-xl text-xs border border-emerald-500/40 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                <span>สอนเล่น</span>
              </button>

              <button
                onClick={onOpenHowToPlay}
                className="py-2 px-3 bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-medium rounded-xl text-xs border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>กติกา</span>
              </button>

              <button
                onClick={onOpenAbout}
                className="py-2 px-3 bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-medium rounded-xl text-xs border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>สูตร SHM</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* ================= SETUP VIEW ================= */
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-md glass-panel-elevated rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/15 space-y-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <button
                onClick={() => setView('HOME')}
                className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>ย้อนกลับ</span>
              </button>

              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm sm:text-base font-black text-white tracking-wide">
                  ตั้งค่าผู้เล่นกับบอท AI
                </h2>
              </div>
              <div className="w-10" />
            </div>

            {/* Player Name Input */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider block">
                ชื่อของคุณ:
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="ระบุชื่อของคุณ"
                maxLength={20}
                className="w-full px-4 py-2.5 bg-slate-900/90 border border-white/15 rounded-2xl text-white text-sm font-bold focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all shadow-inner"
              />
            </div>

            {/* Number of Players */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
                  จำนวนผู้เล่นทั้งหมด:
                </label>
                <span className="text-xs font-mono font-black text-cyan-300">
                  {playerCount} คน (คุณ + บอท {playerCount - 1} ตัว)
                </span>
              </div>

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
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/30 font-black scale-105'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-white/10'
                    }`}
                  >
                    {num} คน
                  </button>
                ))}
              </div>
            </div>

            {/* Seat Selection */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
                  ลำดับตำแหน่งที่นั่ง:
                </label>
                <span className="text-[11px] text-cyan-400 font-bold font-mono">
                  {chosenSeat === 'RANDOM'
                    ? '🎲 สุ่มตำแหน่ง'
                    : `คนที่ ${chosenSeat + 1} (Player ${PLAYER_LETTERS[chosenSeat]})`}
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setChosenSeat('RANDOM')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    chosenSeat === 'RANDOM'
                      ? 'bg-amber-400 text-slate-950 shadow-md font-black ring-2 ring-amber-300 scale-105'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-white/10'
                  }`}
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>สุ่มตำแหน่ง</span>
                </button>

                {Array.from({ length: playerCount }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setChosenSeat(idx)}
                    className={`py-2 px-2 rounded-xl text-xs transition-all cursor-pointer ${
                      chosenSeat === idx
                        ? 'bg-cyan-400 text-slate-950 font-black shadow-md ring-2 ring-cyan-300 scale-105'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-white/10 font-bold'
                    }`}
                  >
                    {idx + 1} ({PLAYER_LETTERS[idx]})
                    {idx === 0 && <span className="block text-[9px] opacity-70">เริ่มก่อน</span>}
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-slate-400 pt-1">
                {chosenSeat === 0
                  ? '🎯 คุณจะได้เริ่มเล่นเป็นคนแรก (Player A)'
                  : chosenSeat === 'RANDOM'
                  ? '🎲 ระบบจะสุ่มลำดับรอบการเล่นให้คุณอัตโนมัติ'
                  : `⏳ คุณจะได้เล่นเป็นลำดับที่ ${Number(chosenSeat) + 1} (บอทอื่นจะเริ่มเล่นก่อน)`}
              </p>
            </div>

            {/* Game Mode Selection */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
                  กติกาการจบเกม (GAME MODE):
                </label>
                <span className="text-[11px] font-mono font-bold text-amber-300">
                  {gameMode === 'FIND_WINNER' ? '🏆 หาผู้ชนะคนแรก' : '💀 ผู้เหลือไพ่คนสุดท้าย'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGameMode('FIND_WINNER')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    gameMode === 'FIND_WINNER'
                      ? 'border-amber-400/80 bg-gradient-to-br from-amber-500/20 to-amber-950/40 shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/40'
                      : 'border-white/10 bg-slate-900/80 hover:bg-slate-850 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`p-1.5 rounded-xl ${gameMode === 'FIND_WINNER' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                      <Trophy className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-black text-white">ใครหมดก่อนชนะ</span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-tight">
                    คนแรกที่ทิ้งไพ่หมดมือ ชนะเกมและจบการแข่งขันทัันที
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setGameMode('FIND_LOSER')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    gameMode === 'FIND_LOSER'
                      ? 'border-rose-400/80 bg-gradient-to-br from-rose-500/20 to-rose-950/40 shadow-lg shadow-rose-500/10 ring-2 ring-rose-400/40'
                      : 'border-white/10 bg-slate-900/80 hover:bg-slate-850 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`p-1.5 rounded-xl ${gameMode === 'FIND_LOSER' ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300'}`}>
                      <Skull className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-black text-white">ผู้เหลือไพ่คนสุดท้าย</span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-tight">
                    คนหมดมือจะออกและได้อันดับ เล่นต่อจนเหลือคนสุดท้าย (Loser)
                  </p>
                </button>
              </div>
            </div>

            {/* Launch Game Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLaunchBotGame}
              className="w-full py-4 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-cyan-500/25 transition-all border border-cyan-200/50 cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
              <span>เริ่มเล่นเกมทันที</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
