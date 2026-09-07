import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, GameState } from '../types/game';
import { CardView } from './CardView';
import { ActionBanner } from './ActionBanner';
import { canPlayCard, getColorBg } from '../utils/cardUtils';

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
  } = state;

  const currentPlayer = players[currentPlayerIndex];
  const localPlayer = players.find((p) => p.id === localPlayerId) || players[0];
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
      triggerWarning('❌ ลงไพ่ใบนี้ไม่ได้! ต้องสีเดียวกัน หรือเลข/สัญลักษณ์เดียวกันกับกองทิ้ง');
    }
  };

  const uncalledHarmonicPlayers = players.filter(
    (p) => p.hand.length === 1 && !p.calledHarmonic
  );

  return (
    <div className="relative h-screen max-h-screen w-full bg-[#08090e] bg-physics-grid text-slate-100 flex flex-col justify-between overflow-hidden select-none">
      {/* Action Announcement Overlay Banner - Compact & Floating */}
      <ActionBanner announcement={actionAnnouncement || null} />

      {/* Subtle Background Sine Waves */}
      <div className="absolute inset-0 pointer-events-none opacity-15 overflow-hidden">
        <svg
          className="w-full h-full"
          viewBox="0 0 1200 600"
          preserveAspectRatio="none"
          fill="none"
          stroke="currentColor"
        >
          <path
            d="M 0 300 Q 150 120, 300 300 T 600 300 T 900 300 T 1200 300"
            stroke="#06b6d4"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* ================= TOP NAVIGATION BAR ================= */}
      <header className="relative z-20 px-3 sm:px-5 py-2 glass-panel border-b border-white/10 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-lg text-rose-500 font-black">∿</span>
          <span className="font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-cyan-300 to-amber-300 text-sm sm:text-base">
            HARMONIC
          </span>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded-full border border-white/10">
            #{turnsCount}
          </span>
          {roomId && (
            <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-400/40 px-2 py-0.5 rounded-full">
              ห้อง: {roomId}
            </span>
          )}
        </div>

        {/* Catch Harmonic Alert */}
        {uncalledHarmonicPlayers.length > 0 && (
          <motion.button
            initial={{ scale: 0.9 }}
            animate={{ scale: [0.95, 1.05, 0.95] }}
            transition={{ repeat: Infinity, duration: 1 }}
            onClick={() => onCatchHarmonic(uncalledHarmonicPlayers[0].id)}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-full shadow-lg border border-amber-200 flex items-center gap-1 cursor-pointer"
          >
            <span>🚨 จับได้! {uncalledHarmonicPlayers[0].name} ลืมพูด HARMONIC</span>
          </motion.button>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onOpenHowToPlay}
            title="เปิดอ่านกติกาการเล่น"
            className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-white/10 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>📖</span>
            <span className="hidden sm:inline">กติกา</span>
          </button>
          <button
            onClick={onResetGame}
            title="ออกจากเกม"
            className="px-2.5 py-1 bg-rose-950/70 hover:bg-rose-900 text-rose-300 text-xs font-semibold rounded-lg border border-rose-800/60 transition-colors cursor-pointer"
          >
            ออกจากเกม
          </button>
        </div>
      </header>

      {/* Warning Toast */}
      <AnimatePresence>
        {warningMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-28 sm:bottom-32 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 bg-rose-950/95 border border-rose-500/80 rounded-full shadow-2xl text-rose-200 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md pointer-events-none"
          >
            <span>{warningMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= MIDDLE GAME ARENA ================= */}
      <main className="relative z-10 flex-1 flex flex-col justify-between px-2 sm:px-6 py-2 max-w-6xl mx-auto w-full overflow-hidden">
        {/* OPPONENTS TRAY (COMPACT & SLEEK) */}
        <div className="w-full flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto py-1 scrollbar-none flex-shrink-0">
          {players.map((p, idx) => {
            const isTurn = idx === currentPlayerIndex;
            const isMe = p.id === localPlayer?.id;
            const hasOneCard = p.hand.length === 1;

            return (
              <motion.div
                key={p.id}
                animate={isTurn ? { scale: 1.05 } : { scale: 1 }}
                className={`relative px-2.5 sm:px-3 py-1.5 rounded-2xl border transition-all flex items-center gap-2 ${
                  isTurn
                    ? 'border-cyan-400 bg-cyan-950/70 shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-400'
                    : isMe
                    ? 'border-indigo-400/40 bg-indigo-950/30'
                    : 'border-white/10 bg-slate-900/60'
                }`}
              >
                {/* Player Letter Avatar */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl font-black font-mono flex items-center justify-center text-xs shadow-sm flex-shrink-0 ${
                    isTurn
                      ? 'bg-cyan-500 text-slate-950 font-black'
                      : isMe
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {p.letter}
                </div>

                <div className="text-left leading-tight">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs text-slate-200 max-w-[80px] sm:max-w-[110px] truncate">
                      {p.name}
                    </span>
                    {isMe && (
                      <span className="text-[9px] px-1 bg-cyan-500/20 text-cyan-300 rounded font-bold">
                        คุณ
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] font-mono font-bold text-indigo-300">
                      🎴 {p.hand.length}
                    </span>
                    {hasOneCard && (
                      <span className="text-[10px] font-black text-amber-400 animate-pulse">
                        {p.calledHarmonic ? 'HARMONIC!' : '1 ใบ!'}
                      </span>
                    )}
                  </div>
                </div>

                {isTurn && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* CENTER TABLE: DRAW PILE, DISCARD PILE & SLIM STATUS */}
        <div className="flex-1 flex flex-col items-center justify-center py-2 sm:py-4 gap-3 sm:gap-4">
          {/* SLIM TURN & COLOR STATUS PILL */}
          <div className="flex items-center gap-2 sm:gap-3 px-4 py-1.5 rounded-full bg-slate-900/90 border border-white/10 shadow-lg text-xs backdrop-blur-md">
            {isMyTurn ? (
              <span className="font-black text-emerald-400 flex items-center gap-1.5 animate-pulse">
                <span>🎯 ถึงตาคุณแล้ว!</span>
                <span className="hidden sm:inline font-normal text-slate-300">
                  (เลือกลงไพ่หรือจั่ว)
                </span>
              </span>
            ) : (
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <span>ตาของ {currentPlayer?.name}</span>
                {currentPlayer?.isBot && (
                  <span className="text-cyan-400 text-[11px]">🤖 คิดคำนวณ...</span>
                )}
              </span>
            )}

            <div className="w-[1px] h-3 bg-white/20" />

            {/* Current Color Indicator */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px]">สีนำ:</span>
              <span
                className={`px-2 py-0.5 rounded-md font-mono font-black text-[10px] uppercase text-white shadow-sm ${getColorBg(
                  currentColor
                )}`}
              >
                {currentColor}
              </span>
            </div>

            <div className="w-[1px] h-3 bg-white/20" />

            {/* Direction */}
            <span className="text-slate-400 font-mono text-[11px]">
              {direction === 1 ? '↻ ตามเข็ม' : '↺ ทวนเข็ม'}
            </span>
          </div>

          {/* TABLE CARDS ARENA */}
          <div className="flex items-center justify-center gap-6 sm:gap-12">
            {/* DRAW PILE */}
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                whileHover={isMyTurn ? { scale: 1.05, y: -4 } : {}}
                whileTap={isMyTurn ? { scale: 0.95 } : {}}
                onClick={() => {
                  if (isMyTurn) onDrawCard();
                  else triggerWarning('⏳ ยังไม่ถึงตาของคุณ ไม่สามารถจั่วได้');
                }}
                className={`relative transition-all cursor-pointer ${
                  !isMyTurn ? 'opacity-70' : 'hover:drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                }`}
              >
                <CardView isBack={true} size="md" countBadge={deck.length} />
              </motion.div>
              <span className="text-[11px] font-mono text-slate-400">
                {isMyTurn ? '👉 กดเพื่อจั่ว' : 'กองจั่ว'}
              </span>
            </div>

            {/* DISCARD PILE WITH REALISTIC ENTRY ANIMATION */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="relative">
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={topCard?.id || 'discard-top'}
                    initial={{ scale: 0.75, opacity: 0, rotate: -8 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  >
                    <CardView card={topCard} size="md" />
                  </motion.div>
                </AnimatePresence>

                {topCard?.type === 'WILD' && (
                  <div
                    className={`absolute -top-2.5 -right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white shadow-lg border border-white/50 ${getColorBg(
                      currentColor
                    )}`}
                  >
                    {currentColor}
                  </div>
                )}
              </div>
              <span className="text-[11px] font-mono text-slate-400">กองทิ้ง</span>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM: LOCAL PLAYER'S HAND ================= */}
        <div className="w-full glass-panel border border-white/10 rounded-3xl p-2.5 sm:p-4 shadow-xl flex-shrink-0">
          {/* Hand Header & Harmonic Button */}
          <div className="flex items-center justify-between mb-1.5 px-1">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-mono font-black flex items-center justify-center text-xs shadow-sm">
                {localPlayer?.letter}
              </span>
              <span className="font-extrabold text-xs sm:text-sm text-white">
                ไพ่ในมือของคุณ ({localPlayer?.hand.length} ใบ)
              </span>
            </div>

            {/* HARMONIC CALL BUTTON */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (localPlayer) onCallHarmonic(localPlayer.id);
              }}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer ${
                localPlayer?.hand.length <= 2
                  ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 text-white animate-pulse shadow-amber-500/30 border border-amber-300'
                  : 'bg-slate-800/80 text-slate-500 border border-white/10 hover:text-slate-400'
              }`}
            >
              ∿ HARMONIC!
            </motion.button>
          </div>

          {/* Cards Scrollable Row */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1.5 pt-2 px-1 scrollbar-thin scrollbar-thumb-slate-700">
            {localPlayer?.hand.map((card) => {
              const isPlayable = isMyTurn && canPlayCard(card, topCard, currentColor);
              return (
                <motion.div
                  key={card.id}
                  whileHover={isPlayable ? { y: -8, scale: 1.04 } : {}}
                  whileTap={isPlayable ? { scale: 0.96 } : {}}
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
        {drawnCardChoice && drawnCardChoice.playerId === localPlayer?.id && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="w-full max-w-xs glass-panel-elevated rounded-3xl p-5 text-center space-y-3.5 border border-white/15 shadow-2xl"
            >
              <div className="text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase">
                🎴 คุณจั่วได้ไพ่ใบนี้
              </div>
              <div className="flex justify-center py-1">
                <CardView card={drawnCardChoice.card} size="lg" />
              </div>

              <div className="space-y-2 pt-1">
                {canPlayCard(drawnCardChoice.card, topCard, currentColor) ? (
                  <>
                    <p className="text-xs text-emerald-300 font-bold">
                      ไพ่ใบนี้ลงต่อได้ทันที! ต้องการลงเลยหรือไม่?
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onPlayDrawnCardChoice(true)}
                        className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-transform hover:scale-105"
                      >
                        ลงทันที
                      </button>
                      <button
                        onClick={() => onPlayDrawnCardChoice(false)}
                        className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-white/10 cursor-pointer"
                      >
                        เก็บเข้ามือ
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-slate-400">
                      ไพ่ใบนี้ยังลงไม่ได้ในตานี้ เก็บเข้ามือและจบตา
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
