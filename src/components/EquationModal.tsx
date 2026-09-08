import React, { useState, useEffect } from 'react';
import { Card, CardColor, EquationActiveState, Player } from '../types/game';
import { CardView } from './CardView';
import { getColorBg, getColorBorder, getColorText } from '../utils/cardUtils';
import {
  Atom,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  Calculator,
  CornerDownLeft,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

interface EquationModalProps {
  isOpen: boolean;
  state: EquationActiveState;
  players: Player[];
  mainDeckCount: number;
  localPlayerId?: string;
  isHost?: boolean;
  isOnline?: boolean;
  onFillBlank: (blankIndex: number, card: Card, playerId: string) => void;
  onPlayerDrawForColor: (playerId: string, blankIndex: number) => void;
  onSkipPlayerCascading: (blankIndex: number) => void;
  onClaimAnswer: (playerId: string) => void;
  onSubmitAnswer: (playerId: string, answerText: string) => void;
  onFreeDiscardCard: (playerId: string, cardId: string) => void;
  onCloseEquation: () => void;
  onResetEquationForRetry?: () => void;
}

export const EquationModal: React.FC<EquationModalProps> = ({
  isOpen,
  state,
  players,
  mainDeckCount,
  localPlayerId,
  isHost = false,
  isOnline = false,
  onFillBlank,
  onPlayerDrawForColor,
  onSkipPlayerCascading,
  onClaimAnswer,
  onSubmitAnswer,
  onFreeDiscardCard,
  onCloseEquation,
  onResetEquationForRetry,
}) => {
  const [answerInput, setAnswerInput] = useState('');
  const [selectedDiscardCardId, setSelectedDiscardCardId] = useState<string | null>(null);
  const [isTimedOut, setIsTimedOut] = useState(false);

  const { equation, currentBlankIndex, allFilled, claimedByPlayerId, disqualifiedPlayerIds, resultState } = state;

  const maxTime = equation.difficulty === 'EASY' ? 10 : equation.difficulty === 'MEDIUM' ? 20 : 30;
  const [timeLeft, setTimeLeft] = useState<number>(maxTime);

  useEffect(() => {
    setAnswerInput('');
    setSelectedDiscardCardId(null);
  }, [state.equation.id, state.claimedByPlayerId]);

  useEffect(() => {
    if (allFilled && !claimedByPlayerId && !resultState) {
      setTimeLeft(maxTime);
      setIsTimedOut(false);
    }
  }, [allFilled, state.equation.id, claimedByPlayerId, resultState, maxTime]);

  useEffect(() => {
    if (!allFilled || claimedByPlayerId || resultState || isTimedOut) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimedOut(true);
          // In online rooms, only Host triggers closing to avoid multi-client duplicate state transitions
          if (!isOnline || isHost) {
            setTimeout(() => {
              onCloseEquation();
            }, 1800);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [allFilled, claimedByPlayerId, resultState, isTimedOut, onCloseEquation, isOnline, isHost]);

  if (!isOpen) return null;
  const currentBlank = equation.blanks[currentBlankIndex];
  const assignedPlayer = players.find((p) => p.id === state.assignedPlayerId);

  const matchingNumberCards = assignedPlayer
    ? assignedPlayer.hand.filter(
        (c) => c.type === 'NUMBER' && c.color === currentBlank?.color
      )
    : [];

  const claimingPlayer = players.find((p) => p.id === claimedByPlayerId);

  const appendSymbol = (sym: string) => {
    setAnswerInput((prev) => prev + sym);
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'EASY':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'HARD':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xl p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl glass-panel-elevated border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Holographic Glowing Top Edge */}
        <div className="h-1.5 bg-gradient-to-r from-rose-500 via-cyan-400 to-emerald-400" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-slate-900/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/30">
              <Atom className="w-5 h-5 text-white animate-spin [animation-duration:14s]" />
            </div>

            <div className="text-left">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                  EQUATION CHALLENGE
                </h2>
                <span
                  className={`text-[10px] font-black font-mono uppercase px-2.5 py-0.5 rounded-full border ${getDifficultyBadge(
                    equation.difficulty
                  )}`}
                >
                  {equation.difficulty} • {equation.code}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">{equation.title}</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-cyan-300 font-mono font-bold bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-400/30">
            <Calculator className="w-3.5 h-3.5" />
            <span>SHM LAB</span>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Main Equation Formula Card */}
          <div className="p-5 bg-gradient-to-br from-slate-950/90 via-slate-900/90 to-indigo-950/50 border border-white/15 rounded-3xl text-center shadow-inner relative backdrop-blur-xl space-y-2">
            <div className="text-[11px] font-mono tracking-widest text-cyan-300 uppercase font-bold flex items-center justify-center gap-1.5">
              <span>∿</span>
              <span>สูตรฟิสิกส์หลัก (PHYSICS FORMULA)</span>
              <span>∿</span>
            </div>

            <div className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-amber-200 font-mono tracking-wider drop-shadow-md py-1">
              {equation.formula}
            </div>

            <p className="text-xs sm:text-sm text-slate-200 font-medium max-w-lg mx-auto">
              {equation.promptText}
            </p>

            {/* Target Variable Display */}
            <div className="pt-2 flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-950/80 border border-indigo-400/40 rounded-full text-xs text-indigo-200 shadow-sm font-mono">
                <span className="font-semibold text-slate-400">เป้าหมายคำนวณ:</span>
                <span className="font-black text-white text-sm">
                  {equation.targetVariable} = ? ({equation.targetUnit})
                </span>
              </div>
            </div>
          </div>

          {/* Variables & Blanks List */}
          <div className="space-y-3 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">
                ตัวแปรและช่องว่างที่ต้องใส่ค่า (EQUATION BLANKS):
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                <span className="px-2 py-0.5 rounded-full bg-rose-950/90 border border-rose-500/50 text-rose-200">
                  🔴 แดง = Amplitude (A) — แอมพลิจูด
                </span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-500/50 text-cyan-200">
                  🔵 น้ำเงิน = Angular Frequency (ω) — ความถี่เชิงมุม
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-200">
                  🟢 เขียว = Spring Constant (k) — ค่าคงที่สปริง
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-950/90 border border-amber-500/50 text-amber-200">
                  🟡 เหลือง = Mass (m) — มวล
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {equation.blanks.map((b, idx) => {
                const isCurrentActive = !allFilled && idx === currentBlankIndex;
                const assignedP = players.find((p) => p.id === b.assignedPlayerId);

                return (
                  <div
                    key={b.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isCurrentActive
                        ? 'border-cyan-400 bg-cyan-950/60 shadow-xl shadow-cyan-500/20 ring-2 ring-cyan-400/40'
                        : b.filledValue !== null
                        ? 'border-emerald-500/60 bg-emerald-950/30'
                        : 'border-white/10 bg-slate-950/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-slate-200">
                        ช่องที่ {idx + 1}: {b.nameTh}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${getColorBg(
                          b.color
                        )} text-white shadow-sm`}
                      >
                        {b.color}
                      </span>
                    </div>

                    {/* Formula Variable Row */}
                    <div className="flex items-center justify-center gap-2 text-base sm:text-lg font-mono py-2 bg-slate-900/90 rounded-xl border border-white/10 shadow-inner">
                      <span className="font-bold text-white">{b.variable} =</span>
                      <div
                        className={`min-w-[52px] px-3.5 py-1 rounded-lg text-center font-black border-2 ${
                          b.filledValue !== null
                            ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 text-xl shadow-sm'
                            : `${getColorBorder(b.color)} bg-slate-950 text-slate-400 animate-pulse`
                        }`}
                      >
                        {b.filledValue !== null ? b.filledValue : '___'}
                      </div>
                      <span className="text-slate-400 text-xs font-semibold">{b.unit}</span>
                    </div>

                    {/* Player Assignment Status */}
                    <div className="mt-2 text-xs flex items-center justify-between text-slate-400 font-medium">
                      <span>ผู้รับผิดชอบ:</span>
                      <span className="font-bold text-white">
                        {assignedP ? `Player ${assignedP.letter} (${assignedP.name})` : 'กำลังสุ่ม...'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Display fixed constants if any */}
            {equation.fixedConstants && (
              <div className="text-xs text-slate-300 flex flex-wrap items-center gap-3 bg-slate-950/70 p-3 rounded-2xl border border-white/10 font-mono">
                <span className="text-cyan-300 font-bold">ค่าคงที่กำหนดให้:</span>
                {Object.entries(equation.fixedConstants).map(([k, v]) => (
                  <span key={k} className="font-bold text-white bg-slate-900 px-2.5 py-0.5 rounded-lg border border-white/10">
                    {k} = {v}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* PHASE 1: FILLING BLANKS */}
          {!allFilled && currentBlank && assignedPlayer && (
            <div className="p-4 sm:p-5 rounded-3xl bg-indigo-950/50 border border-indigo-400/40 space-y-4 shadow-xl text-left">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-cyan-300 tracking-wider uppercase font-bold">
                    ตาของผู้เล่นที่ต้องเติมค่า (PLAYER TURN):
                  </span>
                  <div className="text-base sm:text-lg font-black text-white flex items-center gap-2 mt-0.5">
                    <span className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white flex items-center justify-center text-xs font-mono font-black shadow-md">
                      {assignedPlayer.letter}
                    </span>
                    <span>{assignedPlayer.name}</span>
                    <span className="text-xs text-slate-300 font-normal">
                      (ต้องใช้ Number Card สี {currentBlank.color})
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Message from cascade */}
              {state.statusMessage && (
                <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-xs text-amber-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>{state.statusMessage}</span>
                </div>
              )}

              {/* Case 1 & 2: Check if this is the active player's turn to fill the blank */}
              {(() => {
                const isMyBlankTurn =
                  !isOnline ||
                  (assignedPlayer && assignedPlayer.id === localPlayerId) ||
                  (assignedPlayer?.isBot && isHost);

                if (!isMyBlankTurn) {
                  return (
                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/20 text-center space-y-2">
                      <div className="text-sm font-bold text-cyan-300 animate-pulse flex items-center justify-center gap-2">
                        <Atom className="w-4 h-4 animate-spin text-cyan-400" />
                        <span>กำลังรอ Player {assignedPlayer?.letter} ({assignedPlayer?.name}) เติมค่า...</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        ผู้เล่นต้องนำ Number Card สี{' '}
                        <span className={`font-bold ${getColorText(currentBlank.color)}`}>
                          {currentBlank.color}
                        </span>{' '}
                        มาเติมค่าในช่องนี้
                      </p>
                    </div>
                  );
                }

                if (matchingNumberCards.length > 0) {
                  return (
                    <div>
                      <p className="text-xs text-slate-300 mb-2.5">
                        เลือก Number Card สี{' '}
                        <span className={`font-bold ${getColorText(currentBlank.color)}`}>
                          {currentBlank.color}
                        </span>{' '}
                        จากมือของ {assignedPlayer.name} เพื่อเติมค่าลงในช่อง:
                      </p>
                      <div className="flex flex-wrap gap-3 items-center">
                        {matchingNumberCards.map((card) => (
                          <button
                            key={card.id}
                            onClick={() => onFillBlank(currentBlankIndex, card, assignedPlayer.id)}
                            className="group transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                          >
                            <CardView card={card} size="sm" isPlayable={true} />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs sm:text-sm">
                      ❌ <strong>{assignedPlayer.name} ไม่มีไพ่ตัวเลขสี {currentBlank.color} ในมือ!</strong>
                      <br />
                      กรุณาเลือกจั่วไพ่ 1 ใบเพื่อลุ้นหาการ์ดสีที่ต้องการ หรือส่งต่อให้ผู้เล่นคนถัดไป
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      <button
                        onClick={() => onPlayerDrawForColor(assignedPlayer.id, currentBlankIndex)}
                        className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-cyan-950/40 transition-transform hover:scale-105 flex items-center gap-2 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>จั่วไพ่ 1 ใบ ({assignedPlayer.name})</span>
                        <span className="text-xs opacity-80">(เหลือในกอง {mainDeckCount})</span>
                      </button>

                      <button
                        onClick={() => onSkipPlayerCascading(currentBlankIndex)}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm rounded-xl border border-white/10 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span>ส่งต่อให้ผู้เล่นถัดไป</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* PHASE 2: ALL BLANKS FILLED -> BUZZER / ANSWERING */}
          {allFilled && !resultState && (
            <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-950 border-2 border-indigo-400/80 text-center space-y-4 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 tracking-widest uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>เติมตัวแปรครบถ้วนแล้ว!</span>
                </span>

                {/* Countdown Timer */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-300">
                    ความยาก {equation.difficulty} ({maxTime}s)
                  </span>
                  <span
                    className={`font-mono font-black text-sm px-3 py-0.5 rounded-full border ${
                      timeLeft <= 5
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-ping'
                        : timeLeft <= 10
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    }`}
                  >
                    ⏱️ {timeLeft}s
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    timeLeft <= 5 ? 'bg-rose-500' : timeLeft <= 10 ? 'bg-amber-400' : 'bg-cyan-400'
                  }`}
                  style={{ width: `${(timeLeft / maxTime) * 100}%` }}
                />
              </div>

              {isTimedOut ? (
                <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/70 text-rose-200 space-y-1 animate-pulse">
                  <div className="text-lg font-black flex items-center justify-center gap-2">
                    <Clock className="w-5 h-5 text-rose-400" />
                    <span>หมดเวลาตอบโจทย์ SHM!</span>
                  </div>
                  <div className="text-xs text-rose-300">
                    ไม่มีผู้เล่นตอบได้ทันเวลา กำลังข้ามโจทย์และเล่นต่อตามปกติ...
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-lg sm:text-2xl font-black text-white">
                    ใครรู้คำตอบ แย่งกันกดปุ่มเพื่อตอบโจทย์!
                  </h3>

                  {!claimedByPlayerId ? (
                    <div className="space-y-3">
                      {localPlayerId ? (
                        <button
                          disabled={disqualifiedPlayerIds.includes(localPlayerId)}
                          onClick={() => {
                            if (!disqualifiedPlayerIds.includes(localPlayerId)) {
                              onClaimAnswer(localPlayerId);
                            }
                          }}
                          className={`w-full py-4 px-6 font-black text-lg sm:text-2xl rounded-2xl shadow-2xl tracking-wider transition-all border border-white/30 cursor-pointer flex items-center justify-center gap-2 ${
                            disqualifiedPlayerIds.includes(localPlayerId)
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed line-through'
                              : 'bg-gradient-to-r from-amber-400 via-rose-500 to-cyan-400 hover:from-amber-300 hover:to-cyan-300 text-slate-950 shadow-rose-500/30 transform hover:scale-[1.02] active:scale-95 animate-pulse'
                          }`}
                        >
                          <Zap className="w-6 h-6 fill-slate-950" />
                          <span>THE ANSWER IS! (แย่งตอบ)</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              const eligible = players.find((p) => !disqualifiedPlayerIds.includes(p.id));
                              if (eligible) onClaimAnswer(eligible.id);
                            }}
                            className="w-full py-4 px-6 bg-gradient-to-r from-amber-400 via-rose-500 to-cyan-400 hover:from-amber-300 hover:to-cyan-300 text-slate-950 font-black text-lg sm:text-2xl rounded-2xl shadow-2xl shadow-rose-500/30 transform hover:scale-[1.02] active:scale-95 transition-all tracking-wider animate-pulse border border-white/30 cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Zap className="w-6 h-6 fill-slate-950" />
                            <span>THE ANSWER IS! (แย่งตอบ)</span>
                          </button>

                          <div className="text-xs text-slate-400 font-medium">
                            หรือเลือกผู้เล่นที่ต้องการแย่งตอบ:
                          </div>
                          <div className="flex flex-wrap justify-center gap-2">
                            {players.map((p) => {
                              const isDisq = disqualifiedPlayerIds.includes(p.id);
                              return (
                                <button
                                  key={p.id}
                                  disabled={isDisq}
                                  onClick={() => onClaimAnswer(p.id)}
                                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    isDisq
                                      ? 'bg-slate-800 text-slate-500 line-through cursor-not-allowed border border-white/5'
                                      : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-105 shadow-md shadow-indigo-600/30'
                                  }`}
                                >
                                  Player {p.letter} ({p.name}) {isDisq ? '❌' : '⚡'}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    /* Answering Input Terminal */
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-indigo-400/50 space-y-3.5 text-left shadow-inner">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span>
                            PLAYER {claimingPlayer?.letter} ({claimingPlayer?.name}) ได้สิทธิ์ตอบ!
                          </span>
                        </span>
                        <span className="text-xs text-slate-400 font-mono font-semibold">
                          หน่วยคำตอบ: {equation.targetUnit}
                        </span>
                      </div>

                      {localPlayerId && claimingPlayer?.id !== localPlayerId ? (
                        <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 text-center space-y-2">
                          <div className="text-sm font-bold text-cyan-300 animate-pulse flex items-center justify-center gap-2">
                            <Atom className="w-4 h-4 animate-spin" />
                            <span>กำลังรอ {claimingPlayer?.name} คิดคำนวณและตอบ...</span>
                          </div>
                          <p className="text-xs text-slate-400">
                            หากผู้เล่นตอบผิด ระบบจะเปิดโอกาสให้ผู้เล่นคนอื่นแย่งตอบต่อทันที!
                          </p>
                        </div>
                      ) : (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const targetId = claimingPlayer?.id || claimedByPlayerId || localPlayerId;
                            if (targetId && answerInput.trim()) {
                              onSubmitAnswer(targetId, answerInput.trim());
                            }
                          }}
                          className="flex flex-col sm:flex-row gap-2.5"
                        >
                          <input
                            type="text"
                            value={answerInput}
                            onChange={(e) => setAnswerInput(e.target.value)}
                            placeholder={`เช่น 40 หรือ 0.5 หรือ 1/2`}
                            autoFocus
                            className="flex-1 px-4 py-3 bg-slate-900 border border-cyan-400/80 rounded-2xl text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-inner"
                          />
                          <button
                            type="submit"
                            disabled={!answerInput.trim()}
                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-black rounded-2xl text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-950/40 cursor-pointer flex items-center justify-center gap-2"
                          >
                            <span>ส่งคำตอบ</span>
                            <CornerDownLeft className="w-4 h-4" />
                          </button>
                        </form>
                      )}

                      {/* Scientific Math Keypad */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] text-slate-400 mr-1 font-semibold">สัญลักษณ์ช่วยพิมพ์:</span>
                        {['π', '/', '.', '0.5', '1/2', '2', '4', '8', '-'].map((sym) => (
                          <button
                            key={sym}
                            type="button"
                            onClick={() => appendSymbol(sym)}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl font-mono text-xs border border-white/10 hover:border-white/20 transition-all active:scale-95 cursor-pointer"
                          >
                            {sym}
                          </button>
                        ))}
                      </div>

                      <p className="text-[11px] text-slate-400">
                        💡 รองรับจำนวนเต็ม, ทศนิยม, เศษส่วน (เช่น 1/2), และค่า π (เช่น 4π หรือ 4*pi)
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* PHASE 3: RESULT DISPLAY */}
          {resultState && (() => {
            const answeringPlayer = players.find(
              (p) => p.id === (resultState.answeringPlayerId || resultState.answeredPlayerId)
            );
            const steps = resultState.steps || resultState.solution?.explanationSteps || [];
            const displayAnswer =
              resultState.correctAnswerDisplay ||
              resultState.solution?.displayAnswer ||
              (resultState.solution?.numericValue !== undefined ? String(resultState.solution.numericValue) : '');

            return (
              <div
                className={`p-5 sm:p-6 rounded-3xl border-2 space-y-4 text-left ${
                  resultState.correct
                    ? 'bg-emerald-950/50 border-emerald-400 shadow-2xl shadow-emerald-500/20'
                    : 'bg-rose-950/50 border-rose-500 shadow-2xl shadow-rose-500/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  {resultState.correct ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-8 h-8 text-rose-400 flex-shrink-0" />
                  )}

                  <div>
                    <h3
                      className={`text-lg sm:text-xl font-black ${
                        resultState.correct ? 'text-emerald-300' : 'text-rose-300'
                      }`}
                    >
                      {resultState.correct ? 'CORRECT! คำตอบถูกต้อง!' : 'WRONG! คำตอบยังไม่ถูกต้อง!'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-200 font-medium">
                      {resultState.correct
                        ? `🎉 ผู้เล่น ${answeringPlayer?.name || 'นิรนาม'} ตอบถูกต้อง! ได้รับรางวัลทิ้งไพ่ 1 ใบฟรี`
                        : `⚠️ ผู้เล่น ${answeringPlayer?.name || 'นิรนาม'} ถูกลงโทษจั่ว 1 ใบ และหมดสิทธิ์ตอบโจทย์นี้`}
                    </p>
                  </div>
                </div>

                {/* Detailed Steps */}
                <div className="p-4 bg-slate-950/90 rounded-2xl border border-white/10 space-y-2 font-mono text-xs sm:text-sm text-slate-200 shadow-inner">
                  <div className="font-bold text-cyan-300 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5" />
                    <span>วิธีทำและสูตรคำนวณอย่างละเอียด (STEP-BY-STEP SOLUTION):</span>
                  </div>
                  {steps.length > 0 ? (
                    steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-cyan-400 font-semibold">[{idx + 1}]</span>
                        <span>{step}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 text-xs italic">คำนวณตามสูตร Simple Harmonic Motion</div>
                  )}
                  {displayAnswer && (
                    <div className="pt-2 font-bold text-amber-300 border-t border-white/10 mt-2 flex items-center gap-2">
                      <span>คำตอบที่ถูกต้อง:</span>
                      <span className="text-base text-white">{displayAnswer}</span>
                    </div>
                  )}
                </div>

                {/* Free Discard Selection */}
                {resultState.correct && resultState.pendingFreeDiscardPlayerId && (
                  <div className="space-y-3 pt-2">
                    <div className="text-sm font-bold text-amber-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>เลือกไพ่ 1 ใบในมือเพื่อทิ้งฟรี (ไม่ต้องสนใจสีหรือตัวเลข):</span>
                    </div>
                    {(() => {
                      const rewardingPlayer = players.find(
                        (p) => p.id === resultState.pendingFreeDiscardPlayerId
                      );
                      if (!rewardingPlayer || rewardingPlayer.hand.length === 0) return null;

                      const isMyReward =
                        !isOnline ||
                        rewardingPlayer.id === localPlayerId ||
                        (rewardingPlayer.isBot && isHost);

                      if (!isMyReward) {
                        return (
                          <div className="p-4 bg-slate-900/80 rounded-2xl border border-emerald-500/30 text-center space-y-1">
                            <div className="text-sm font-bold text-emerald-300 animate-pulse">
                              กำลังรอ {rewardingPlayer.name} เลือกไพ่ในมือ 1 ใบเพื่อทิ้งฟรี...
                            </div>
                            <p className="text-xs text-slate-400">
                              ผู้เล่นได้รับรางวัลทิ้งไพ่ฟรีจากการตอบโจทย์ SHM ถูกต้อง
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2.5 max-h-44 overflow-y-auto p-3 bg-slate-950/70 rounded-2xl border border-white/10">
                            {rewardingPlayer.hand.map((card) => (
                              <button
                                key={card.id}
                                onClick={() => setSelectedDiscardCardId(card.id)}
                                className="transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                              >
                                <CardView
                                  card={card}
                                  size="sm"
                                  isSelected={selectedDiscardCardId === card.id}
                                />
                              </button>
                            ))}
                          </div>

                          <button
                            disabled={!selectedDiscardCardId}
                            onClick={() => {
                              if (selectedDiscardCardId) {
                                onFreeDiscardCard(
                                  rewardingPlayer.id,
                                  selectedDiscardCardId
                                );
                              }
                            }}
                            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-black text-sm rounded-2xl transition-all shadow-xl hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>ทิ้งไพ่ใบนี้ฟรี & กลับสู่โต๊ะเกมหลัก</span>
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Return button if discard already completed */}
                {resultState.correct && !resultState.pendingFreeDiscardPlayerId && (
                  <div className="p-3.5 bg-emerald-950/80 rounded-2xl border border-emerald-500/40 text-center space-y-2">
                    <div className="text-emerald-300 font-bold text-xs sm:text-sm">
                      🎉 ทิ้งไพ่ฟรีเรียบร้อยแล้ว! กำลังกลับสู่เกมหลัก...
                    </div>
                    <button
                      onClick={onCloseEquation}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow transition-all hover:scale-105 cursor-pointer"
                    >
                      กลับสู่เกมหลักทันที ⏩
                    </button>
                  </div>
                )}

                {/* Wrong answer retry choices */}
                {!resultState.correct && (
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2">
                    <span className="text-xs text-slate-400">
                      {disqualifiedPlayerIds.length >= players.length
                        ? 'ผู้เล่นทุกคนตอบผิดครบแล้ว กำลังข้ามโจทย์...'
                        : 'ผู้เล่นคนอื่นที่ยังไม่ตอบ สามารถแย่งกดตอบใหม่ได้'}
                    </span>
                    <div className="flex gap-2">
                      {disqualifiedPlayerIds.length < players.length && (
                        <button
                          onClick={() => {
                            if (onResetEquationForRetry) {
                              onResetEquationForRetry();
                            } else {
                              onClaimAnswer('');
                            }
                          }}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 cursor-pointer"
                        >
                          แย่งตอบอีกครั้ง ⚡
                        </button>
                      )}
                      {(!isOnline || isHost) && (
                        <button
                          onClick={onCloseEquation}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-white/10 transition-colors cursor-pointer"
                        >
                          ข้ามโจทย์และเล่นต่อ ⏩
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
