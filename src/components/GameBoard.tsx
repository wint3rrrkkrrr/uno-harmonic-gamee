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
  GraduationCap,
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
  onOpenTutorial?: () => void;
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
  onOpenTutorial,
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
    pendingDraw = 0,
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

    if (canPlayCard(card, topCard, currentColor, pendingDraw)) {
      onPlayCard(card);
    } else {
      if (pendingDraw > 0) {
        triggerWarning(`⚡ มีโทษจั่วสะสม +${pendingDraw} ใบ! ต้องลงไพ่ +2 หรือ +4 ทับต่อเท่านั้น หรือกดกองจั่วเพื่อยอมรับโทษ`);
      } else {
        triggerWarning('❌ ลงไพ่ใบนี้ไม่ได้! ต้องเป็นสีเดียวกัน หรือมีค่า/ฟังก์ชันเดียวกับกองทิ้ง');
      }
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
    <div className="relative h-[100dvh] w-full bg-[#070913] text-slate-100 flex flex-col justify-between overflow-hidden select-none font-sans">
      {/* Floating Action Announcement Overlay */}
      <ActionBanner announcement={actionAnnouncement || null} />

      {/* Dynamic Ambient Center Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] sm:w-[650px] h-[350px] sm:h-[450px] rounded-full blur-[100px] sm:blur-[130px] pointer-events-none transition-all duration-700 opacity-60"
        style={{ backgroundColor: getAuraColor() }}
      />

      {/* ================= COMPACT TOP BAR ================= */}
      <header className="relative z-20 px-3 sm:px-6 py-2 bg-slate-950/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-rose-500 via-cyan-500 to-indigo-500 flex items-center justify-center text-slate-950 font-black shadow-sm">
            <span className="text-xs sm:text-sm font-mono">∿</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-cyan-300 to-amber-300 text-sm sm:text-base leading-none">
              HARMONIC
            </span>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-white/10">
              #{turnsCount}
            </span>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                gameMode === 'FIND_LOSER'
                  ? 'bg-rose-950/70 text-rose-300 border-rose-500/40'
                  : 'bg-amber-950/70 text-amber-300 border-amber-500/40'
              }`}
            >
              {gameMode === 'FIND_LOSER' ? (
                <>
                  <Skull className="w-2.5 h-2.5 text-rose-400" />
                  <span className="hidden xs:inline">หาคนแพ้</span>
                </>
              ) : (
                <>
                  <Trophy className="w-2.5 h-2.5 text-amber-400" />
                  <span className="hidden xs:inline">ใครหมดชนะ</span>
                </>
              )}
            </span>
          </div>

          {roomId && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-[10px] sm:text-xs font-mono font-bold">
              <Radio className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
              <span>{roomId}</span>
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
            className="px-2.5 py-1 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 text-slate-950 font-black text-[10px] sm:text-xs rounded-full shadow-lg border border-amber-200 flex items-center gap-1 cursor-pointer animate-bounce"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>จับ {uncalledHarmonicPlayers[0].name} ลืมพูด!</span>
          </motion.button>
        )}

        {/* Header Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onOpenTutorial && (
            <button
              onClick={onOpenTutorial}
              title="สอนเล่น"
              className="p-1.5 sm:px-2.5 sm:py-1 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-500/30 transition-all flex items-center gap-1 cursor-pointer"
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">สอนเล่น</span>
            </button>
          )}

          <button
            onClick={onOpenHowToPlay}
            title="กติกา"
            className="p-1.5 sm:px-2.5 sm:py-1 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-lg border border-white/10 transition-all flex items-center gap-1 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">กติกา</span>
          </button>

          <button
            onClick={onResetGame}
            title="ออก"
            className="p-1.5 sm:px-2.5 sm:py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-bold rounded-lg border border-rose-800/40 transition-colors flex items-center gap-1 cursor-pointer"
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
            className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-rose-950/95 border border-rose-500/80 rounded-full shadow-2xl text-rose-100 text-xs font-bold flex items-center gap-2 backdrop-blur-xl pointer-events-none max-w-[90vw] text-center"
          >
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{warningMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= MIDDLE GAME ARENA ================= */}
      <main className="relative z-10 flex-1 flex flex-col justify-between px-2 sm:px-4 py-1.5 max-w-4xl mx-auto w-full overflow-hidden">
        {/* PLAYERS HORIZONTAL BAR (Minimalist avatars) */}
        <div className="w-full flex items-center justify-center gap-1.5 sm:gap-2.5 overflow-x-auto py-1 scrollbar-none flex-shrink-0">
          {players.map((p, idx) => {
            const isTurn = idx === currentPlayerIndex;
            const isMe = p.id === localPlayer?.id;
            const hasOneCard = p.hand.length === 1;
            const isFinished = p.isFinished || p.hand.length === 0;

            return (
              <motion.div
                key={p.id}
                animate={isTurn && !isFinished ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                transition={isTurn && !isFinished ? { repeat: Infinity, duration: 1.2 } : {}}
                className={`relative px-2 sm:px-3 py-1 rounded-xl border transition-all flex items-center gap-1.5 sm:gap-2 backdrop-blur-sm ${
                  isFinished
                    ? 'border-emerald-500/40 bg-emerald-950/30 opacity-70'
                    : isTurn
                    ? 'border-2 border-rose-500 bg-rose-950/80 shadow-lg shadow-rose-500/40 ring-2 ring-rose-500/70 animate-pulse'
                    : isMe
                    ? 'border-indigo-400/40 bg-indigo-950/30'
                    : 'border-white/10 bg-slate-900/60'
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg font-black font-mono flex items-center justify-center text-[11px] shadow-sm flex-shrink-0 relative ${
                    isFinished
                      ? 'bg-emerald-500 text-slate-950'
                      : isTurn
                      ? 'bg-gradient-to-br from-rose-500 via-rose-600 to-amber-500 text-white font-black animate-bounce'
                      : isMe
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {isFinished ? '✓' : p.letter}
                  {p.isBot ? (
                    <Bot className="w-2.5 h-2.5 absolute -bottom-0.5 -right-0.5 text-cyan-300 bg-slate-950 rounded-full p-0.5" />
                  ) : (
                    <User className="w-2.5 h-2.5 absolute -bottom-0.5 -right-0.5 text-indigo-300 bg-slate-950 rounded-full p-0.5" />
                  )}
                </div>

                <div className="text-left leading-tight">
                  <div className="flex items-center gap-1">
                    <span className={`font-bold text-[11px] sm:text-xs max-w-[65px] sm:max-w-[90px] truncate ${isTurn && !isFinished ? 'text-rose-200' : 'text-slate-200'}`}>
                      {p.name}
                    </span>
                    {isMe && (
                      <span className="text-[8px] px-1 bg-cyan-500/20 text-cyan-300 rounded font-bold">
                        คุณ
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {isFinished ? (
                      <span className="text-[9px] font-mono font-bold text-emerald-400">
                        #{p.finishRank || '✓'}
                      </span>
                    ) : (
                      <>
                        <span className="text-[10px] font-mono font-bold text-slate-300 flex items-center gap-0.5">
                          <span>🎴</span>
                          <span>{p.hand.length}</span>
                        </span>
                        {hasOneCard && (
                          <span className="text-[9px] font-black text-amber-400 bg-amber-500/20 px-1 rounded animate-pulse">
                            1 ใบ!
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {isTurn && !isFinished && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* CENTER TABLE MAT: DISCARD PILE & DRAW DECK */}
        <div className="relative flex-1 flex flex-col items-center justify-center py-1 sm:py-2 gap-2 sm:gap-3">
          {/* TURN & COLOR MINIMAL PILL */}
          <div className="relative z-10 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 rounded-full bg-slate-900/90 border border-white/10 shadow-lg text-[11px] sm:text-xs backdrop-blur-md">
            {isMyTurn ? (
              <div className="font-black text-emerald-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 fill-emerald-400 animate-pulse" />
                <span>ตาของคุณ</span>
              </div>
            ) : (
              <div className="font-medium text-slate-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="truncate max-w-[100px] sm:max-w-none">ตา {currentPlayer?.name}</span>
              </div>
            )}

            <div className="w-[1px] h-3 bg-white/20" />

            {/* Current Active Color */}
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-[10px]">สี:</span>
              <span
                className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase text-white shadow-sm ${getColorBg(
                  currentColor
                )}`}
              >
                {currentColor}
              </span>
            </div>

            <div className="w-[1px] h-3 bg-white/20" />

            {/* Direction */}
            <div className="flex items-center gap-0.5 text-slate-400 font-mono text-[10px]">
              {direction === 1 ? (
                <RotateCw className="w-3 h-3 text-cyan-400" />
              ) : (
                <RotateCcw className="w-3 h-3 text-rose-400" />
              )}
            </div>
          </div>

          {/* TABLE CARDS ARENA WITH DISCARD PILE & DRAW DECK */}
          <div className="relative flex items-center justify-center gap-6 sm:gap-10">
            {/* DRAW PILE WITH MOBILE TAP TARGET */}
            <div className="flex flex-col items-center gap-1">
              <motion.div
                whileHover={isMyTurn ? { scale: 1.05 } : {}}
                whileTap={isMyTurn ? { scale: 0.92 } : {}}
                onClick={() => {
                  if (isMyTurn) onDrawCard();
                  else triggerWarning('⏳ ยังไม่ถึงตาของคุณ');
                }}
                className={`relative transition-all cursor-pointer touch-manipulation ${
                  !isMyTurn ? 'opacity-80' : 'hover:drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                }`}
              >
                <CardView isBack={true} size="md" countBadge={deck.length} />

                {/* Stacking Penalty Badge on Draw Deck */}
                {pendingDraw > 0 && (
                  <div className="absolute -top-2.5 -right-2.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase text-white bg-rose-600 shadow-lg border-2 border-white animate-bounce ring-2 ring-rose-500/50 flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
                    <span>+{pendingDraw}</span>
                  </div>
                )}
              </motion.div>

              <span className="text-[10px] sm:text-[11px] font-mono text-slate-400">
                {isMyTurn ? (
                  pendingDraw > 0 ? (
                    <span className="text-rose-400 font-bold animate-pulse">
                      💥 รับโทษ (+{pendingDraw})
                    </span>
                  ) : (
                    <span className="text-cyan-300 font-bold">👉 กดเพื่อจั่ว</span>
                  )
                ) : (
                  <span>กองจั่ว ({deck.length})</span>
                )}
              </span>
            </div>

            {/* DISCARD PILE */}
            <div className="flex flex-col items-center gap-1">
              <div className="relative">
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={topCard?.id || 'discard-top'}
                    initial={{ scale: 0.8, opacity: 0, rotate: -6 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  >
                    <CardView card={topCard} size="md" />
                  </motion.div>
                </AnimatePresence>

                {(topCard?.type === 'WILD' || topCard?.type === 'WILD_DRAW_FOUR') && (
                  <div
                    className={`absolute -top-2.5 -right-2.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-white shadow-lg border border-white/60 animate-bounce ${getColorBg(
                      currentColor
                    )}`}
                  >
                    {currentColor}
                  </div>
                )}
              </div>

              <span className="text-[10px] sm:text-[11px] font-mono text-slate-400">
                กองทิ้ง ({discardPile.length})
              </span>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM: MOBILE ERGONOMIC PLAYER HAND DOCK ================= */}
        <div
          className={`w-full ${
            isMyTurn
              ? 'bg-slate-900/95 border-2 border-rose-500/80 shadow-2xl shadow-rose-950/50 ring-1 ring-rose-500/50'
              : 'bg-slate-900/90 border border-white/10'
          } rounded-2xl p-2 sm:p-3 shadow-xl flex-shrink-0 backdrop-blur-md transition-all`}
        >
          {/* Hand Header Bar with Responsive HARMONIC button */}
          <div className="flex items-center justify-between mb-1.5 px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-indigo-600 text-white font-mono font-bold flex items-center justify-center text-[10px]">
                {localPlayer?.letter}
              </span>
              <span className="font-bold text-xs text-white">ไพ่ในมือ</span>
              <span className="text-[11px] font-mono font-bold text-cyan-300 bg-cyan-950 px-1.5 py-0.2 rounded border border-cyan-400/30">
                {localPlayer?.hand.length}
              </span>
            </div>

            {/* HARMONIC CALL BUTTON */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                if (localPlayer) onCallHarmonic(localPlayer.id);
              }}
              className={`px-3 py-1 rounded-lg font-black text-[11px] tracking-wide uppercase transition-all shadow-md flex items-center gap-1 cursor-pointer ${
                localPlayer?.hand.length <= 2
                  ? 'bg-gradient-to-r from-amber-400 via-rose-500 to-amber-400 text-slate-950 animate-pulse shadow-amber-500/40 border border-amber-200 ring-1 ring-amber-300'
                  : 'bg-slate-800 text-slate-400 border border-white/10 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>HARMONIC!</span>
            </motion.button>
          </div>

          {/* Cards Horizontal Carousel with Momentum Touch Scrolling */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 pt-1 px-1 scrollbar-thin scrollbar-thumb-cyan-500/30 touch-pan-x">
            {localPlayer?.hand.map((card) => {
              const isPlayable = isMyTurn && canPlayCard(card, topCard, currentColor, pendingDraw);
              return (
                <motion.div
                  key={card.id}
                  whileTap={isPlayable ? { scale: 0.92 } : {}}
                  transition={{ duration: 0.1 }}
                  className={`flex-shrink-0 touch-manipulation transition-transform ${
                    isPlayable ? '-translate-y-1' : isMyTurn ? 'opacity-60' : ''
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

      {/* ================= DRAWN CARD CHOICE MODAL (Mobile Clean) ================= */}
      <AnimatePresence>
        {drawnCardChoice && drawnCardChoice.playerId !== localPlayer?.id && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-14 left-1/2 -translate-x-1/2 z-40 px-3.5 py-1.5 rounded-full bg-slate-900/95 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold shadow-xl flex items-center gap-1.5 backdrop-blur-md"
          >
            <Sparkles className="w-3 h-3 animate-spin text-cyan-400" />
            <span>
              {players.find((p) => p.id === drawnCardChoice.playerId)?.name || 'ผู้เล่น'} กำลังตัดสินใจ...
            </span>
          </motion.div>
        )}

        {drawnCardChoice && drawnCardChoice.playerId === localPlayer?.id && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="w-full max-w-xs bg-slate-900 rounded-2xl p-5 text-center space-y-3.5 border border-white/20 shadow-2xl"
            >
              <div className="text-[11px] font-mono font-bold text-cyan-400 tracking-wider uppercase flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>ไพ่ที่คุณจั่วได้</span>
              </div>

              <div className="flex justify-center py-1">
                <CardView card={drawnCardChoice.card} size="lg" />
              </div>

              <div className="space-y-2 pt-1">
                {canPlayCard(drawnCardChoice.card, topCard, currentColor, pendingDraw) ? (
                  <>
                    <p className="text-xs text-emerald-300 font-bold">
                      ไพ่ใบนี้ลงต่อได้ทันที!
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onPlayDrawnCardChoice(true)}
                        className="py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer active:scale-95 transition-transform"
                      >
                        ลงทันที
                      </button>
                      <button
                        onClick={() => onPlayDrawnCardChoice(false)}
                        className="py-2.5 px-3 bg-slate-800 text-slate-200 font-bold text-xs rounded-xl border border-white/10 cursor-pointer active:scale-95"
                      >
                        เก็บเข้ามือ
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-slate-400">
                      ไพ่ใบนี้ลงไม่ได้ เก็บเข้ามือและจบตา
                    </p>
                    <button
                      onClick={() => onPlayDrawnCardChoice(false)}
                      className="w-full py-2.5 px-4 bg-slate-800 text-white font-bold text-xs rounded-xl border border-white/10 cursor-pointer active:scale-95"
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
