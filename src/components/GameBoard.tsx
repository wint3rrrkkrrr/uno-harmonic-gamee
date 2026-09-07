import React, { useState } from 'react';
import { Card, CardColor, GameState, Player } from '../types/game';
import { CardView } from './CardView';
import { ActionBanner } from './ActionBanner';
import { canPlayCard, getColorBg, getColorBorder, getColorText } from '../utils/cardUtils';

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
  onSaveGame,
  onResetGame,
  isOnlineMode = false,
}) => {
  const [showLogDrawer, setShowLogDrawer] = useState(false);
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
    logs,
    actionAnnouncement,
    roomId,
  } = state;

  const currentPlayer = players[currentPlayerIndex];
  // Local player is the person playing on this device/client
  const localPlayer = players.find((p) => p.id === localPlayerId) || players[0];
  const isMyTurn = currentPlayer?.id === localPlayer?.id;
  const topCard = discardPile[discardPile.length - 1];

  // Helper to flash warning
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
      triggerWarning('❌ ลงไพ่ใบนี้ไม่ได้! ต้องเป็นสีเดียวกัน หรือตัวเลข/สัญลักษณ์เดียวกันกับกองทิ้ง');
    }
  };

  // Check if anyone has 1 card and forgot to call Harmonic
  const uncalledHarmonicPlayers = players.filter(
    (p) => p.hand.length === 1 && !p.calledHarmonic
  );

  return (
    <div className="relative min-h-screen w-full bg-[#08090d] bg-physics-grid text-slate-100 flex flex-col justify-between overflow-hidden select-none">
      {/* Action Announcement Overlay Banner */}
      <ActionBanner announcement={actionAnnouncement || null} />

      {/* Background SHM Wave Canvas Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <svg
          className="w-full h-full"
          viewBox="0 0 1200 600"
          preserveAspectRatio="none"
          fill="none"
          stroke="currentColor"
        >
          <path
            d="M 0 300 Q 150 100, 300 300 T 600 300 T 900 300 T 1200 300"
            stroke="#06b6d4"
            strokeWidth="2"
          />
          <path
            d="M 0 300 Q 150 500, 300 300 T 600 300 T 900 300 T 1200 300"
            stroke="#f43f5e"
            strokeWidth="1.5"
            opacity="0.5"
          />
        </svg>
      </div>

      {/* ================= TOP NAVIGATION BAR ================= */}
      <header className="relative z-20 px-3 sm:px-6 py-2.5 glass-panel border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xl text-rose-500 font-black drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]">∿</span>
          <span className="font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-cyan-300 to-amber-300 text-sm sm:text-base drop-shadow-sm">
            HARMONIC
          </span>
          <span className="hidden sm:inline-block text-[11px] font-mono font-semibold text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-white/10 shadow-inner">
            รอบที่ #{turnsCount}
          </span>
          {roomId && (
            <span className="text-[11px] font-mono font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-400/40 px-2.5 py-0.5 rounded-full">
              ห้อง: {roomId}
            </span>
          )}
        </div>

        {/* Catch button alert if uncalled harmonic exists */}
        {uncalledHarmonicPlayers.length > 0 && (
          <div className="flex items-center gap-2 animate-bounce">
            <button
              onClick={() => onCatchHarmonic(uncalledHarmonicPlayers[0].id)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs rounded-full shadow-lg shadow-amber-500/40 border border-amber-200 flex items-center gap-1.5 transition-transform hover:scale-105"
            >
              <span>🚨 จับได้! ({uncalledHarmonicPlayers[0].name} ลืมพูด HARMONIC)</span>
            </button>
          </div>
        )}

        {/* Utility Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onOpenHowToPlay}
            title="เปิดอ่านกติกาการเล่นอย่างละเอียด"
            className="px-3 py-1.5 bg-cyan-600/90 hover:bg-cyan-500 text-slate-950 text-xs font-black rounded-xl border border-cyan-300 shadow-md shadow-cyan-950/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
          >
            <span>📖</span>
            <span>กติกาการเล่น</span>
          </button>
          {!isOnlineMode && (
            <button
              onClick={onSaveGame}
              title="บันทึกเกมปัจจุบัน"
              className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-white/10 hover:border-white/20 transition-all shadow-sm active:scale-95 flex items-center gap-1"
            >
              <span>💾</span>
              <span className="hidden sm:inline">บันทึก</span>
            </button>
          )}
          <button
            onClick={() => setShowLogDrawer(!showLogDrawer)}
            title="ดูประวัติการเล่น"
            className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-white/10 hover:border-white/20 transition-all shadow-sm active:scale-95 flex items-center gap-1"
          >
            <span>📜</span>
            <span className="hidden sm:inline">ประวัติ</span>
          </button>
          <button
            onClick={onResetGame}
            title="ออกจากเกม"
            className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-700/60 text-rose-300 hover:text-rose-200 text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
          >
            ออก / เกมใหม่
          </button>
        </div>
      </header>

      {/* Warning Toast */}
      {warningMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-rose-950/95 border border-rose-500/80 rounded-2xl shadow-2xl text-rose-200 text-xs sm:text-sm font-bold animate-in fade-in slide-in-from-top-4 duration-150 flex items-center gap-2 backdrop-blur-md">
          <span>{warningMsg}</span>
        </div>
      )}

      {/* ================= MIDDLE GAME TABLE ================= */}
      <main className="relative z-10 flex-1 flex flex-col justify-between p-2 sm:p-4 max-w-7xl mx-auto w-full">
        {/* ================= OPPONENTS ORBIT (CARDS ARE HIDDEN / BACK FACING) ================= */}
        <div className="w-full flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 py-1">
          {players.map((p, idx) => {
            const isTurn = idx === currentPlayerIndex;
            const isMe = p.id === localPlayer?.id;
            const hasOneCard = p.hand.length === 1;

            return (
              <div
                key={p.id}
                className={`relative px-3.5 py-2 rounded-2xl border transition-all duration-300 ${
                  isTurn
                    ? 'border-cyan-400/90 bg-cyan-950/60 shadow-xl shadow-cyan-500/30 ring-2 ring-cyan-400/50 scale-105 backdrop-blur-md'
                    : isMe
                    ? 'border-indigo-400/40 bg-indigo-950/30'
                    : 'glass-panel-subtle border-white/10'
                } flex items-center gap-3 min-w-[140px] sm:min-w-[170px]`}
              >
                {/* Letter Avatar */}
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl font-black font-mono flex items-center justify-center text-xs sm:text-sm shadow-md flex-shrink-0 ${
                    isTurn
                      ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-300 shadow-cyan-500/50'
                      : isMe
                      ? 'bg-indigo-500 text-white shadow-indigo-600/50'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {p.letter}
                </div>

                {/* Player Details & Hidden Card Indicator */}
                <div className="flex-1 overflow-hidden text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs sm:text-sm text-slate-200 truncate">
                      {p.name}
                    </span>
                    {isMe && (
                      <span className="text-[9px] px-1.5 py-0.2 bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 rounded font-mono font-bold">
                        คุณ
                      </span>
                    )}
                    {p.isBot && (
                      <span className="text-[9px] px-1.5 py-0.2 bg-purple-950/80 border border-purple-500/40 text-purple-300 rounded font-mono font-semibold">
                        BOT
                      </span>
                    )}
                  </div>

                  {/* Opponent Card Back Visual */}
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      {/* Miniature Card Back Icon */}
                      <div className="w-4 h-5.5 rounded bg-gradient-to-br from-slate-800 to-indigo-950 border border-slate-600 flex items-center justify-center shadow-xs">
                        <span className="text-[8px] text-cyan-400">∿</span>
                      </div>
                      <span className="font-mono font-bold text-xs text-indigo-300">
                        {p.hand.length} ใบ
                      </span>
                    </div>

                    {hasOneCard && (
                      <span className="text-[10px] font-black text-amber-400 animate-pulse drop-shadow">
                        {p.calledHarmonic ? 'HARMONIC!' : 'เหลือ 1 ใบ!'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Active Indicator Pulse */}
                {isTurn && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-ping shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                )}
              </div>
            );
          })}
        </div>

        {/* ================= CENTER TABLE DECK & DISCARD PILE ================= */}
        <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-14 my-2 sm:my-4">
          {/* Turn & Direction Status Badge */}
          <div className="flex flex-col items-center text-center order-1 sm:order-none glass-panel-subtle px-5 py-4 rounded-3xl border border-white/10 shadow-xl min-w-[240px]">
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
              สถานะเทิร์นปัจจุบัน
            </span>
            <div className="text-base sm:text-lg font-black text-cyan-300 flex items-center gap-2 mt-1 drop-shadow-sm">
              <span>Player {currentPlayer?.letter}</span>
              <span className="text-slate-300 font-bold">({currentPlayer?.name})</span>
            </div>

            {/* Turn Announcement banner */}
            <div className="mt-1 text-xs">
              {isMyTurn ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold animate-pulse">
                  🎯 ถึงตาของคุณแล้ว! เลือกลงไพ่หรือกดจั่ว
                </span>
              ) : (
                <span className="text-slate-400 text-[11px] font-medium">
                  {currentPlayer?.isBot ? '🤖 บอทกำลังคิดคำนวณสูตร...' : '⏳ กำลังรอผู้เล่นลงไพ่...'}
                </span>
              )}
            </div>

            {/* Direction Indicator */}
            <div className="mt-2.5 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-white/10 text-xs font-mono text-slate-300 shadow-inner">
              <span
                className={`text-cyan-400 font-black inline-block transition-transform duration-500 text-sm ${
                  direction === 1 ? 'rotate-0' : 'scale-x-[-1]'
                }`}
              >
                ↻
              </span>
              <span className="font-semibold">{direction === 1 ? 'ตามเข็มนาฬิกา ↻' : 'ทวนเข็มนาฬิกา ↺'}</span>
            </div>

            {/* Harmonic Action Buttons */}
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => {
                  if (localPlayer) onCallHarmonic(localPlayer.id);
                }}
                className={`px-5 py-2.5 rounded-2xl font-black text-xs tracking-wider uppercase transition-all shadow-xl ${
                  localPlayer?.hand.length <= 2
                    ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 hover:from-amber-400 hover:to-rose-400 text-white animate-pulse hover:scale-105 shadow-amber-500/40 ring-2 ring-amber-400/40'
                    : 'bg-slate-800/80 text-slate-500 border border-white/10 hover:text-slate-400'
                }`}
              >
                ∿ ประกาศ HARMONIC!
              </button>
            </div>
          </div>

          {/* Cards Table Arena */}
          <div className="flex items-center gap-8 sm:gap-12">
            {/* DRAW PILE */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                กองไพ่จั่ว (DRAW)
              </span>
              <div
                onClick={() => {
                  if (isMyTurn) onDrawCard();
                  else triggerWarning('⏳ ยังไม่ถึงตาของคุณ ไม่สามารถจั่วได้');
                }}
                className={`group relative transition-transform ${
                  isMyTurn ? 'cursor-pointer hover:scale-105 active:scale-95' : 'opacity-75'
                }`}
              >
                <CardView isBack={true} size="md" countBadge={deck.length} />
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-900/95 border border-indigo-400/60 rounded-full text-[10px] font-mono font-bold text-indigo-200 shadow-xl whitespace-nowrap backdrop-blur-md">
                  {isMyTurn ? '👉 กดเพื่อจั่วไพ่' : 'กองไพ่จั่ว'}
                </div>
              </div>
            </div>

            {/* DISCARD PILE */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                กองไพ่ทิ้ง (DISCARD)
              </span>
              <div className="relative">
                <CardView card={topCard} size="md" />

                {/* Active Color Indicator when Wild is played */}
                {topCard?.type === 'WILD' && (
                  <div
                    className={`absolute -top-3 -right-3 px-3 py-1 rounded-full text-[10px] font-black uppercase text-white shadow-xl border-2 border-white/90 animate-bounce ${getColorBg(
                      currentColor
                    )}`}
                  >
                    สีปัจจุบัน: {currentColor}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM: LOCAL PLAYER'S HAND (FACE-UP) ================= */}
        <div className="w-full glass-panel border border-white/10 rounded-3xl p-3.5 sm:p-5 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-mono font-black flex items-center justify-center text-xs shadow-md shadow-indigo-600/30">
                {localPlayer?.letter}
              </span>
              <span className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                ไพ่ในมือของคุณ ({localPlayer?.name})
              </span>
              <span className="text-xs text-indigo-300 font-mono font-bold">
                ({localPlayer?.hand.length} ใบ)
              </span>
            </div>

            {/* Current Color Indicator */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-mono font-semibold">สีที่ต้องลง:</span>
              <span
                className={`px-3 py-1 rounded-full font-black text-[11px] text-white uppercase shadow-md border border-white/30 ${getColorBg(
                  currentColor
                )}`}
              >
                {currentColor}
              </span>
            </div>
          </div>

          {/* Hand Cards List - Only Local Player's Cards are visible! */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 overflow-x-auto pb-2.5 pt-3.5 px-1 scrollbar-thin scrollbar-thumb-slate-700">
            {localPlayer?.hand.map((card) => {
              const isPlayable = isMyTurn && canPlayCard(card, topCard, currentColor);
              return (
                <div key={card.id} className="flex-shrink-0">
                  <CardView
                    card={card}
                    size="md"
                    isPlayable={isPlayable}
                    onClick={() => handleCardClick(card)}
                  />
                </div>
              );
            })}
          </div>

          {/* Helper hint for user */}
          {!isMyTurn && (
            <div className="mt-2 text-center text-xs text-slate-400 font-medium">
              ขณะนี้เป็นตาของผู้เล่นอื่น ไพ่ของคุณจะเปิดให้คลิกลงได้เมื่อถึงตาของคุณ
            </div>
          )}
        </div>
      </main>

      {/* Floating Quick-Help Rules Button */}
      <div className="fixed bottom-24 right-4 sm:right-6 z-30">
        <button
          onClick={onOpenHowToPlay}
          className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs rounded-full shadow-2xl border border-cyan-300/60 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
        >
          <span>💡</span>
          <span>เปิดดูวิธีเล่น & สูตรฟิสิกส์</span>
        </button>
      </div>

      {/* ================= DRAWN CARD CHOICE MODAL ================= */}
      {drawnCardChoice && drawnCardChoice.playerId === localPlayer?.id && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm glass-panel-elevated rounded-3xl p-6 text-center space-y-4 border border-white/15">
            <div className="text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase">
              🎴 คุณเพิ่งจั่วได้ไพ่ใบนี้
            </div>
            <div className="flex justify-center py-2">
              <CardView card={drawnCardChoice.card} size="lg" />
            </div>

            <div className="space-y-2 pt-2">
              {canPlayCard(drawnCardChoice.card, topCard, currentColor) ? (
                <>
                  <p className="text-xs text-emerald-300 font-bold">
                    ไพ่ใบนี้สามารถลงได้ทันที! ต้องการลงเลยหรือไม่?
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => onPlayDrawnCardChoice(true)}
                      className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-950/40 transition-transform hover:scale-105"
                    >
                      ลงไพ่ใบนี้เลย 🚀
                    </button>
                    <button
                      onClick={() => onPlayDrawnCardChoice(false)}
                      className="py-2.5 px-4 bg-slate-800/90 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-white/10"
                    >
                      เก็บไว้ & จบตา ✋
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs text-slate-400">
                    ไพ่ใบนี้ไม่สามารถลงในเทิร์นนี้ได้ จะถูกเก็บเข้าสู่มือของคุณ
                  </p>
                  <button
                    onClick={() => onPlayDrawnCardChoice(false)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950/40"
                  >
                    เก็บเข้ามือ & จบตา
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= GAME LOG DRAWER ================= */}
      {showLogDrawer && (
        <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-80 glass-panel-elevated border-l border-white/10 p-5 flex flex-col animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span>📜</span>
              <h3 className="font-bold text-sm text-white tracking-wide">ประวัติการเล่น (GAME LOG)</h3>
            </div>
            <button
              onClick={() => setShowLogDrawer(false)}
              className="text-slate-400 hover:text-white font-bold text-sm w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs font-mono">
            {logs.length === 0 ? (
              <div className="text-slate-500 text-center py-8">ยังไม่มีประวัติการเล่น</div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 space-y-1 shadow-inner"
                >
                  <div className="text-[10px] text-slate-500 font-semibold">{log.time}</div>
                  <div className="text-slate-200 leading-snug">{log.text}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
