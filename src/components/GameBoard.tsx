import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, GameState } from '../types/game';
import { CardView } from './CardView';
import { ActionBanner } from './ActionBanner';
import { canPlayCard, getColorBg } from '../utils/cardUtils';
import {
  BookOpen,
  LogOut,
  Sparkles,
  Bot,
  User,
  RotateCw,
  RotateCcw,
  Zap,
  AlertTriangle,
  Radio,
  Trophy,
  Skull,
} from 'lucide-react';

interface GameBoardProps {
  state: GameState;
  localPlayerId?: string;
  onPlayCard: (card: Card) => void;
  onDrawCard: () => void;
  onCallHarmonic: (playerId: string) => void;
  onCatchHarmonic: (targetPlayerId: string) => void;
  onPlayDrawnCardChoice: (play: boolean) => void;
  onOpenHowToPlay: () => void;
  onSaveGame: () => void;
  onResetGame: () => void;
  isOnlineMode?: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  state,
  localPlayerId,
  onPlayCard,
  onDrawCard,
  onCallHarmonic,
  onCatchHarmonic,
  onPlayDrawnCardChoice,
  onOpenHowToPlay,
  onResetGame,
  isOnlineMode = false,
}) => {
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  const {
    players,
    currentPlayerIndex,
    direction,
    deck,
    discardPile,
    currentColor,
    drawnCardChoice,
    turnsCount,
    actionAnnouncement,
    roomId,
    gameMode = 'FIND_WINNER',
    finishedPlayers = [],
  } = state;

  const currentPlayer = players[currentPlayerIndex];
  const localPlayer =
    players.find((p) => p.id === localPlayerId) ||
    players.find((p) => !p.isBot) ||
    players[0];
  const isMyTurn = currentPlayer?.id === localPlayer?.id;
  const topCard = discardPile[discardPile.length - 1];

  const triggerWarning = (msg: string) => {
    setWarningMsg(msg);
    setTimeout(() => setWarningMsg(null), 2500);
  };

  const handleCardClick = (card: Card) => {
    if (!isMyTurn) {
      triggerWarning('⏳ ยังไม่ถึงตาของคุณ กรุณารอผู้เล่นคนอื่นลงไพ่');
      return;
    }

    if (canPlayCard(card, topCard, currentColor)) {
      onPlayCard(card);
    } else {
      triggerWarning('❌ ลงไพ่ใบนี้ไม่ได้! ต้องเป็นสีเดียวกัน หรือมีค่า/ฟังก์ชันเดียวกับกองทิ้ง');
    }
  };

  const uncalledHarmonicPlayers = players.filter(
    (p) => p.id !== localPlayer?.id && p.hand.length === 1 && !p.calledHarmonic
  );

  // Dynamic table center aura based on currentColor
  const getAuraColor = () => {
    switch (currentColor) {
      case 'RED':
        return 'rgba(244, 63, 94, 0.15)';
      case 'BLUE':
        return 'rgba(6, 182, 212, 0.15)';
      case 'GREEN':
        return 'rgba(16, 185, 129, 0.15)';
      case 'YELLOW':
        return 'rgba(245, 158, 11, 0.15)';
      case 'WILD':
      default:
        return 'rgba(168, 85, 247, 0.15)';
    }
  };

  return (
    <div className="relative h-screen max-h-screen w-full bg-[#05070e] bg-physics-grid text-slate-100 flex flex-col justify-between overflow-hidden select-none">
      {/* Floating Action Announcement Overlay */}
      <ActionBanner announcement={actionAnnouncement || null} />

      {/* Dynamic Ambient Center Radial Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blur-[140px] pointer-events-none transition-all duration-700"
        style={{ backgroundColor: getAuraColor() }}
      />

      {/* ================= TOP NAVIGATION BAR ================= */}
      <header className="relative z-20 px-3 sm:px-6 py-2.5 glass-panel border-b border-white/10 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 via-cyan-500 to-indigo-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-cyan-500/20">
            <span className="text-sm">∿</span>
          </div>

          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-cyan-300 to-amber-300 text-sm sm:text-base leading-none">
                HARMONIC
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded-full border border-white/10">
                รอบที่ #{turnsCount}
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                  gameMode === 'FIND_LOSER'
                    ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                    : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                }`}
              >
                {gameMode === 'FIND_LOSER' ? (
                  <>
                    <Skull className="w-3 h-3 text-rose-400" />
                    <span>ผู้เหลือไพ่คนสุดท้าย</span>
                  </>
                ) : (
                  <>
                    <Trophy className="w-3 h-3 text-amber-400" />
                    <span>ใครหมดก่อนชนะ</span>
                  </>
                )}
              </span>
            </div>
            <span className="text-[9px] font-mono text-cyan-400/80 uppercase tracking-wider hidden sm:block">
              SHM Quantum Physics Battle
            </span>
          </div>

          {roomId && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold shadow-sm">
              <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>ห้อง: {roomId}</span>
            </div>
          )}
        </div>

        {/* Catch Harmonic Alert Banner */}
        {uncalledHarmonicPlayers.length > 0 && (
          <motion.button
            initial={{ scale: 0.9 }}
            animate={{ scale: [0.95, 1.05, 0.95] }}
            transition={{ repeat: Infinity, duration: 0.9 }}
            onClick={() => onCatchHarmonic(uncalledHarmonicPlayers[0].id)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 text-slate-950 font-black text-xs rounded-full shadow-xl shadow-amber-500/40 border border-amber-200 flex items-center gap-1.5 cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-slate-950" />
            <span>จับได้! {uncalledHarmonicPlayers[0].name} ลืมพูด HARMONIC!</span>
          </motion.button>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenHowToPlay}
            title="เปิดอ่านกติกาการเล่น"
            className="px-3 py-1.5 glass-panel-subtle hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">กติกา</span>
          </button>

          <button
            onClick={onResetGame}
            title="ออกจากเกม"
            className="px-3 py-1.5 bg-rose-950/70 hover:bg-rose-900 text-rose-300 text-xs font-bold rounded-xl border border-rose-800/60 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">ออก</span>
          </button>
        </div>
      </header>

      {/* Warning Notification Toast */}
      <AnimatePresence>
        {warningMsg && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-rose-950/95 border border-rose-500 rounded-full shadow-2xl text-rose-100 text-xs font-bold flex items-center gap-2 backdrop-blur-xl pointer-events-none"
          >
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{warningMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= MIDDLE GAME ARENA ================= */}
      <main className="relative z-10 flex-1 flex flex-col justify-between px-2 sm:px-6 py-2 max-w-6xl mx-auto w-full overflow-hidden">
        {/* OPPONENTS AVATAR TRAY */}
        <div className="w-full flex items-center justify-center gap-2 sm:gap-3.5 overflow-x-auto py-1 scrollbar-none flex-shrink-0">
          {players.map((p, idx) => {
            const isTurn = idx === currentPlayerIndex;
            const isMe = p.id === localPlayer?.id;
            const hasOneCard = p.hand.length === 1;
            const isFinished = p.isFinished || p.hand.length === 0;

            return (
              <motion.div
                key={p.id}
                animate={isTurn ? { scale: 1.04 } : { scale: 1 }}
                className={`relative px-3 py-1.5 sm:py-2 rounded-2xl border transition-all flex items-center gap-2.5 backdrop-blur-md ${
                  isFinished
                    ? 'border-emerald-500/40 bg-emerald-950/40 opacity-75'
                    : isTurn
                    ? 'border-cyan-400 bg-cyan-950/70 shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-400/50'
                    : isMe
                    ? 'border-indigo-400/40 bg-indigo-950/40'
                    : 'border-white/10 bg-slate-900/70'
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-xl font-black font-mono flex items-center justify-center text-xs shadow-md flex-shrink-0 relative ${
                    isFinished
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : isTurn
                      ? 'bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 font-black'
                      : isMe
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {isFinished ? '✓' : p.letter}
                  {p.isBot ? (
                    <Bot className="w-3 h-3 absolute -bottom-1 -right-1 text-cyan-300 bg-slate-950 rounded-full p-0.5 border border-cyan-400/50" />
                  ) : (
                    <User className="w-3 h-3 absolute -bottom-1 -right-1 text-indigo-300 bg-slate-950 rounded-full p-0.5 border border-indigo-400/50" />
                  )}
                </div>

                <div className="text-left leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-200 max-w-[85px] sm:max-w-[120px] truncate">
                      {p.name}
                    </span>
                    {isMe && (
                      <span className="text-[9px] px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 rounded-md font-bold">
                        คุณ
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-0.5">
                    {isFinished ? (
                      <span className="text-[10px] font-mono font-black text-emerald-400">
                        {p.finishRank ? `อันดับ #${p.finishRank}` : 'หมดมือแล้ว ✓'}
                      </span>
                    ) : (
                      <>
                        <span className="text-[11px] font-mono font-bold text-indigo-300 flex items-center gap-0.5">
                          <span>🎴</span>
                          <span>{p.hand.length}</span>
                        </span>

                        {hasOneCard && (
                          <span className="text-[10px] font-black text-amber-400 animate-pulse bg-amber-500/20 px-1 rounded">
                            {p.calledHarmonic ? 'HARMONIC!' : '1 ใบ!'}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {isTurn && !isFinished && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* HOLOGRAPHIC CENTER TABLE MAT */}
        <div className="relative flex-1 flex flex-col items-center justify-center py-2 sm:py-3 gap-3">
          {/* TURN & COLOR STATUS PILL */}
          <div className="relative z-10 flex items-center gap-2.5 sm:gap-4 px-5 py-2 rounded-full glass-panel border border-white/15 shadow-2xl text-xs backdrop-blur-xl">
            {isMyTurn ? (
              <div className="font-black text-emerald-400 flex items-center gap-2 animate-pulse">
                <Zap className="w-4 h-4 fill-emerald-400" />
                <span>ถึงตาคุณแล้ว!</span>
                <span className="hidden sm:inline font-normal text-slate-300">
                  (เลือกลงไพ่หรือจั่ว)
                </span>
              </div>
            ) : (
              <div className="font-bold text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>ตาของ {currentPlayer?.name}</span>
                {currentPlayer?.isBot && (
                  <span className="text-cyan-400 text-[11px] font-mono">🤖 คำนวณสูตร...</span>
                )}
              </div>
            )}

            <div className="w-[1px] h-3.5 bg-white/20" />

            {/* Current Active Color */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px]">สีนำ:</span>
              <span
                className={`px-2.5 py-0.5 rounded-lg font-mono font-black text-[11px] uppercase text-white shadow-md ${getColorBg(
                  currentColor
                )}`}
              >
                {currentColor === 'RED'
                  ? 'แดง (A — แอมพลิจูด)'
                  : currentColor === 'BLUE'
                  ? 'น้ำเงิน (ω — ความถี่เชิงมุม)'
                  : currentColor === 'GREEN'
                  ? 'เขียว (k — ค่าคงที่สปริง)'
                  : currentColor === 'YELLOW'
                  ? 'เหลือง (m — มวล)'
                  : currentColor}
              </span>
            </div>

            <div className="w-[1px] h-3.5 bg-white/20" />

            {/* Orbit Direction */}
            <div className="flex items-center gap-1 text-slate-300 font-mono text-[11px]">
              {direction === 1 ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ตามเข็ม</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                  <span>ทวนเข็ม</span>
                </>
              )}
            </div>
          </div>

          {/* TABLE CARDS ARENA WITH DISCARD PILE & DRAW DECK */}
          <div className="relative flex items-center justify-center gap-8 sm:gap-14">
            {/* DRAW PILE WITH 3D LAYERED SHADOW */}
            <div className="flex flex-col items-center gap-2">
              <motion.div
                whileHover={isMyTurn ? { scale: 1.06, y: -4 } : {}}
                whileTap={isMyTurn ? { scale: 0.94 } : {}}
                onClick={() => {
                  if (isMyTurn) onDrawCard();
                  else triggerWarning('⏳ ยังไม่ถึงตาของคุณ ไม่สามารถจั่วได้');
                }}
                className={`relative transition-all cursor-pointer ${
                  !isMyTurn ? 'opacity-75' : 'hover:drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]'
                }`}
              >
                {/* 3D stacked deck visual behind */}
                <div className="absolute top-1 left-1 w-full h-full bg-slate-900/90 rounded-2xl border border-slate-700/60 -z-10" />
                <div className="absolute top-2 left-2 w-full h-full bg-slate-950/90 rounded-2xl border border-slate-800/60 -z-20" />

                <CardView isBack={true} size="md" countBadge={deck.length} />
              </motion.div>

              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                {isMyTurn ? (
                  <span className="text-cyan-300 font-bold">👉 กดเพื่อจั่ว</span>
                ) : (
                  <span>กองจั่ว ({deck.length})</span>
                )}
              </span>
            </div>

            {/* DISCARD PILE WITH REALISTIC ENTRY ANIMATION */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={topCard?.id || 'discard-top'}
                    initial={{ scale: 0.7, opacity: 0, rotate: -12 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  >
                    <CardView card={topCard} size="md" />
                  </motion.div>
                </AnimatePresence>

                {topCard?.type === 'WILD' && (
                  <div
                    className={`absolute -top-3 -right-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase text-white shadow-xl border border-white/60 animate-bounce ${getColorBg(
                      currentColor
                    )}`}
                  >
                    {currentColor}
                  </div>
                )}
              </div>

              <span className="text-[11px] font-mono text-slate-400">
                กองทิ้ง ({discardPile.length})
              </span>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM: LOCAL PLAYER'S HAND STATION ================= */}
        <div className="w-full glass-panel border border-white/10 rounded-3xl p-3 sm:p-4 shadow-2xl flex-shrink-0">
          {/* Hand Header & Harmonic Button */}
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white font-mono font-black flex items-center justify-center text-xs shadow-md">
                {localPlayer?.letter}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs sm:text-sm text-white">
                  ไพ่ในมือของคุณ
                </span>
                <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-400/30">
                  {localPlayer?.hand.length} ใบ
                </span>
              </div>
            </div>

            {/* HARMONIC CALL BUTTON */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (localPlayer) onCallHarmonic(localPlayer.id);
              }}
              className={`px-4 py-1.5 rounded-xl font-black text-xs tracking-wider uppercase transition-all shadow-lg flex items-center gap-1.5 cursor-pointer ${
                localPlayer?.hand.length <= 2
                  ? 'bg-gradient-to-r from-amber-400 via-rose-500 to-amber-400 text-slate-950 animate-pulse shadow-amber-500/40 border border-amber-200 ring-2 ring-amber-300/60'
                  : 'bg-slate-800/80 text-slate-500 border border-white/10 hover:text-slate-400'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>∿ HARMONIC!</span>
            </motion.button>
          </div>

          {/* Quick Color Variable Reference Bar */}
          <div className="flex items-center justify-between overflow-x-auto gap-1.5 py-1 px-1 mb-1 text-[10px] sm:text-[11px] font-mono scrollbar-none">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
              <span className="px-2 py-0.5 rounded-full bg-rose-950/90 border border-rose-500/50 text-rose-200 whitespace-nowrap shadow-sm">
                🔴 แดง = Amplitude (A) — แอมพลิจูด
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-500/50 text-cyan-200 whitespace-nowrap shadow-sm">
                🔵 น้ำเงิน = Angular Frequency (ω) — ความถี่เชิงมุม
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 whitespace-nowrap shadow-sm">
                🟢 เขียว = Spring Constant (k) — ค่าคงที่สปริง
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-950/90 border border-amber-500/50 text-amber-200 whitespace-nowrap shadow-sm">
                🟡 เหลือง = Mass (m) — มวล
              </span>
            </div>
          </div>

          {/* Cards Horizontal Carousel */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 overflow-x-auto pb-1.5 pt-2 px-1 scrollbar-thin scrollbar-thumb-cyan-500/40">
            {localPlayer?.hand.map((card) => {
              const isPlayable = isMyTurn && canPlayCard(card, topCard, currentColor);
              return (
                <motion.div
                  key={card.id}
                  whileHover={isPlayable ? { y: -10, scale: 1.05 } : {}}
                  whileTap={isPlayable ? { scale: 0.95 } : {}}
                  transition={{ duration: 0.15 }}
                  className={`flex-shrink-0 ${
                    !isPlayable && isMyTurn ? 'opacity-65' : ''
                  }`}
                >
                  <CardView
                    card={card}
                    size="md"
                    isPlayable={isPlayable}
                    onClick={() => handleCardClick(card)}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>

      {/* ================= DRAWN CARD CHOICE MODAL ================= */}
      <AnimatePresence>
        {drawnCardChoice && drawnCardChoice.playerId !== localPlayer?.id && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-40 px-5 py-2.5 rounded-2xl glass-panel-elevated border border-cyan-500/40 text-cyan-300 text-xs font-bold shadow-2xl flex items-center gap-2 backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>
              {players.find((p) => p.id === drawnCardChoice.playerId)?.name || 'ผู้เล่น'} กำลังตัดสินใจว่าจะลงไพ่ที่จั่วได้หรือไม่...
            </span>
          </motion.div>
        )}

        {drawnCardChoice && drawnCardChoice.playerId === localPlayer?.id && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="w-full max-w-xs glass-panel-elevated rounded-3xl p-6 text-center space-y-4 border border-white/20 shadow-2xl"
            >
              <div className="text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>คุณจั่วได้ไพ่ใบนี้</span>
              </div>

              <div className="flex justify-center py-1">
                <CardView card={drawnCardChoice.card} size="lg" />
              </div>

              <div className="space-y-2.5 pt-1">
                {canPlayCard(drawnCardChoice.card, topCard, currentColor) ? (
                  <>
                    <p className="text-xs text-emerald-300 font-bold">
                      ไพ่ใบนี้ลงต่อได้ทันที! ต้องการลงเลยหรือไม่?
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onPlayDrawnCardChoice(true)}
                        className="py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg cursor-pointer transition-transform hover:scale-105"
                      >
                        ลงทันที
                      </button>
                      <button
                        onClick={() => onPlayDrawnCardChoice(false)}
                        className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-white/10 cursor-pointer"
                      >
                        เก็บเข้ามือ
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-slate-400">
                      ไพ่ใบนี้ยังลงไม่ได้ในรอบนี้ เก็บเข้ามือและส่งต่อตาเล่น
                    </p>
                    <button
                      onClick={() => onPlayDrawnCardChoice(false)}
                      className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-white/10 cursor-pointer"
                    >
                      รับทราบและจบตา
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
