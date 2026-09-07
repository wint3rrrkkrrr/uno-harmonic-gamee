import React, { useState, useEffect } from 'react';
import { Card, CardColor, EquationActiveState, Player } from '../types/game';
import { CardView } from './CardView';
import { checkAnswerMath, getColorBg, getColorBorder, getColorText } from '../utils/cardUtils';

interface EquationModalProps {
  isOpen: boolean;
  state: EquationActiveState;
  players: Player[];
  mainDeckCount: number;
  localPlayerId?: string;
  onFillBlank: (blankIndex: number, card: Card, playerId: string) => void;
  onPlayerDrawForColor: (playerId: string, blankIndex: number) => void;
  onSkipPlayerCascading: (blankIndex: number) => void;
  onClaimAnswer: (playerId: string) => void;
  onSubmitAnswer: (playerId: string, answerText: string) => void;
  onFreeDiscardCard: (playerId: string, cardId: string) => void;
  onCloseEquation: () => void;
}

export const EquationModal: React.FC<EquationModalProps> = ({
  isOpen,
  state,
  players,
  mainDeckCount,
  localPlayerId,
  onFillBlank,
  onPlayerDrawForColor,
  onSkipPlayerCascading,
  onClaimAnswer,
  onSubmitAnswer,
  onFreeDiscardCard,
  onCloseEquation,
}) => {
  const [answerInput, setAnswerInput] = useState('');
  const [selectedDiscardCardId, setSelectedDiscardCardId] = useState<string | null>(null);
  const [isTimedOut, setIsTimedOut] = useState(false);

  const { equation, currentBlankIndex, allFilled, claimedByPlayerId, disqualifiedPlayerIds, resultState } = state;

  // Countdown timer based on difficulty: 10s (EASY), 20s (MEDIUM), 30s (HARD)
  const maxTime = equation.difficulty === 'EASY' ? 10 : equation.difficulty === 'MEDIUM' ? 20 : 30;
  const [timeLeft, setTimeLeft] = useState<number>(maxTime);

  useEffect(() => {
    setAnswerInput('');
    setSelectedDiscardCardId(null);
  }, [state.equation.id, state.claimedByPlayerId]);

  // Reset timer when equation changes or when allFilled triggers
  useEffect(() => {
    if (allFilled && !claimedByPlayerId && !resultState) {
      setTimeLeft(maxTime);
      setIsTimedOut(false);
    }
  }, [allFilled, state.equation.id]);

  // Countdown interval when waiting for someone to buzz in
  useEffect(() => {
    if (!allFilled || claimedByPlayerId || resultState || isTimedOut) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimedOut(true);
          // Auto close/discard equation after timeout
          setTimeout(() => {
            onCloseEquation();
          }, 1800);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [allFilled, claimedByPlayerId, resultState, isTimedOut, onCloseEquation]);

  if (!isOpen) return null;
  const currentBlank = equation.blanks[currentBlankIndex];

  // Assigned player for the active blank
  const assignedPlayer = players.find((p) => p.id === state.assignedPlayerId);

  // Available number cards in assigned player's hand that match required color
  const matchingNumberCards = assignedPlayer
    ? assignedPlayer.hand.filter(
        (c) => c.type === 'NUMBER' && c.color === currentBlank?.color
      )
    : [];

  const claimingPlayer = players.find((p) => p.id === claimedByPlayerId);

  // Helper to append symbol to input
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl glass-panel-elevated border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Glowing Top Bar */}
        <div className="h-1.5 bg-gradient-to-r from-rose-500 via-cyan-400 to-emerald-400" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xl sm:text-2xl text-indigo-400 font-black drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">∿</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                  EQUATION CHALLENGE
                </h2>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getDifficultyBadge(
                    equation.difficulty
                  )}`}
                >
                  {equation.difficulty} • {equation.code}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">{equation.title}</p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Main Equation Formula Card */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-950/90 to-slate-900/80 border border-white/10 rounded-2xl text-center shadow-inner relative backdrop-blur-md">
            <div className="text-xs font-mono tracking-widest text-slate-400 uppercase mb-1 font-semibold">
              สูตรหลัก (PHYSICS FORMULA)
            </div>
            <div className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-amber-200 font-mono my-1.5 tracking-wider drop-shadow-sm">
              {equation.formula}
            </div>
            <div className="text-sm font-medium text-indigo-300 mt-1">
              {equation.promptText}
            </div>

            {/* Target Display */}
            <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1 bg-indigo-950/80 border border-indigo-400/40 rounded-full text-xs text-indigo-200 shadow-sm">
              <span className="font-medium">เป้าหมายคำนวณ:</span>
              <span className="font-extrabold text-white">
                {equation.targetVariable} = ? ({equation.targetUnit})
              </span>
            </div>
          </div>

          {/* Variables & Blanks List */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase">
              ตัวแปรและช่องว่าง (EQUATION BLANKS):
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
                        ? 'border-indigo-400 bg-indigo-950/50 shadow-xl shadow-indigo-500/25 ring-1 ring-indigo-400/40'
                        : b.filledValue !== null
                        ? 'border-emerald-500/60 bg-emerald-950/30'
                        : 'border-white/10 bg-slate-950/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-slate-300">
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
                        className={`min-w-[48px] px-3 py-1 rounded-lg text-center font-black border-2 ${
                          b.filledValue !== null
                            ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 text-xl'
                            : `${getColorBorder(b.color)} bg-slate-950 text-slate-400 animate-pulse`
                        }`}
                      >
                        {b.filledValue !== null ? b.filledValue : '___'}
                      </div>
                      <span className="text-slate-400 text-sm font-semibold">{b.unit}</span>
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
              <div className="text-xs text-slate-400 flex gap-4 bg-slate-950/70 p-2.5 rounded-xl border border-white/10">
                <span className="font-mono text-indigo-300 font-semibold">ค่าคงที่กำหนดให้:</span>
                {Object.entries(equation.fixedConstants).map(([k, v]) => (
                  <span key={k} className="font-bold text-white">
                    {k} = {v}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* PHASE 1: FILLING BLANKS */}
          {!allFilled && currentBlank && assignedPlayer && (
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-400/40 space-y-3.5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-indigo-300 tracking-wider uppercase font-semibold">
                    ตาของผู้เล่นที่ต้องเติมค่า (PLAYER ASSIGNMENT):
                  </span>
                  <div className="text-base sm:text-lg font-black text-white flex items-center gap-2 mt-0.5">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-mono shadow-sm">
                      {assignedPlayer.letter}
                    </span>
                    <span>{assignedPlayer.name}</span>
                    <span className="text-xs text-slate-400 font-normal">
                      (ต้องใช้ Number Card สี {currentBlank.color})
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Message from cascade */}
              {state.statusMessage && (
                <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-xs text-amber-200 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{state.statusMessage}</span>
                </div>
              )}

              {/* Case 1: Player has matching cards */}
              {matchingNumberCards.length > 0 ? (
                <div>
                  <p className="text-xs text-slate-300 mb-2">
                    เลือก Number Card สี{' '}
                    <span className={`font-bold ${getColorText(currentBlank.color)}`}>
                      {currentBlank.color}
                    </span>{' '}
                    จากมือของ {assignedPlayer.name} เพื่อเติมค่าลงในช่อง:
                  </p>
                  <div className="flex flex-wrap gap-2.5 items-center">
                    {matchingNumberCards.map((card) => (
                      <button
                        key={card.id}
                        onClick={() => onFillBlank(currentBlankIndex, card, assignedPlayer.id)}
                        className="group transition-transform hover:scale-105 active:scale-95"
                      >
                        <CardView card={card} size="sm" isPlayable={true} />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Case 2: Player has NO matching cards */
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs sm:text-sm">
                    ❌ <strong>PLAYER {assignedPlayer.letter} DOES NOT HAVE THE REQUIRED COLOR!</strong>
                    <br />
                    ผู้เล่นไม่มีไพ่ Number Card สี {currentBlank.color} ในมือ
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    <button
                      onClick={() => onPlayerDrawForColor(assignedPlayer.id, currentBlankIndex)}
                      className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-cyan-950/40 transition-transform hover:scale-105 flex items-center gap-2"
                    >
                      <span>🎴 จั่วไพ่ 1 ใบ ({assignedPlayer.name})</span>
                      <span className="text-xs opacity-75">
                        (เหลือในกอง {mainDeckCount})
                      </span>
                    </button>

                    <button
                      onClick={() => onSkipPlayerCascading(currentBlankIndex)}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm rounded-xl border border-white/10 transition-colors"
                    >
                      ส่งต่อให้ผู้เล่นถัดไป ⏭
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PHASE 2: ALL BLANKS FILLED -> BUZZER / ANSWERING */}
          {allFilled && !resultState && (
            <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-950/80 to-slate-900 border-2 border-indigo-400/80 text-center space-y-4 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 tracking-widest uppercase">
                  ✓ ช่องว่างทั้งหมดถูกเติมแล้ว!
                </span>
                {/* Countdown Timer Display */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-300">
                    ความยาก {equation.difficulty} ({maxTime}s)
                  </span>
                  <span
                    className={`font-mono font-black text-sm px-2.5 py-0.5 rounded-full border ${
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

              {/* Countdown Progress Bar */}
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
                  <div className="text-lg font-black">⏱️ หมดเวลาตอบโจทย์ SHM!</div>
                  <div className="text-xs text-rose-300">
                    ไม่มีผู้เล่นตอบได้ทันเวลา กำลังทิ้งการ์ดโจทย์ใบนี้และเล่นต่อตามปกติ...
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    ใครรู้คำตอบ แย่งกันกดปุ่มเพื่อตอบโจทย์!
                  </h3>

                  {!claimedByPlayerId ? (
                    /* Buzzer Buttons */
                    <div className="space-y-3">
                  {localPlayerId ? (
                    /* Online Multiplayer: Buzz directly for local player */
                    <button
                      disabled={disqualifiedPlayerIds.includes(localPlayerId)}
                      onClick={() => {
                        if (!disqualifiedPlayerIds.includes(localPlayerId)) {
                          onClaimAnswer(localPlayerId);
                        }
                      }}
                      className={`w-full py-4 px-6 font-black text-lg sm:text-2xl rounded-2xl shadow-xl tracking-wider transition-all border border-white/30 ${
                        disqualifiedPlayerIds.includes(localPlayerId)
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed line-through'
                          : 'bg-gradient-to-r from-amber-500 via-rose-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-white shadow-rose-500/30 transform hover:scale-[1.02] active:scale-95 animate-pulse'
                      }`}
                    >
                      {disqualifiedPlayerIds.includes(localPlayerId)
                        ? '❌ คุณตอบผิดไปแล้วในโจทย์นี้ (หมดสิทธิ์แย่งตอบ)'
                        : '⚡ THE ANSWER IS! (แย่งตอบ) ⚡'}
                    </button>
                  ) : (
                    /* Singleplayer / Pass & Play */
                    <>
                      <button
                        onClick={() => {
                          const eligible = players.find((p) => !disqualifiedPlayerIds.includes(p.id));
                          if (eligible) onClaimAnswer(eligible.id);
                        }}
                        className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 via-rose-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-white font-black text-lg sm:text-2xl rounded-2xl shadow-xl shadow-rose-500/30 transform hover:scale-[1.02] active:scale-95 transition-all tracking-wider animate-pulse border border-white/30"
                      >
                        ⚡ THE ANSWER IS! ⚡
                      </button>

                      <div className="text-xs text-slate-400 font-medium">
                        หรือเลือกผู้เล่นที่ต้องการแย่งตอบ (Pass & Play):
                      </div>
                      <div className="flex flex-wrap justify-center gap-2">
                        {players.map((p) => {
                          const isDisq = disqualifiedPlayerIds.includes(p.id);
                          return (
                            <button
                              key={p.id}
                              disabled={isDisq}
                              onClick={() => onClaimAnswer(p.id)}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-transform ${
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
                /* Answering Input Box */
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-indigo-400/50 space-y-3.5 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400">
                      ⚡ PLAYER {claimingPlayer?.letter} ({claimingPlayer?.name}) ได้สิทธิ์ตอบก่อน!
                      {localPlayerId && claimingPlayer?.id === localPlayerId && ' (ตาคุณพิมพ์คำตอบ!)'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono font-semibold">
                      หน่วย: {equation.targetUnit}
                    </span>
                  </div>

                  {localPlayerId && claimingPlayer?.id !== localPlayerId ? (
                    <div className="p-4 rounded-xl bg-slate-900 border border-white/10 text-center space-y-1.5">
                      <div className="text-sm font-bold text-cyan-300 animate-pulse">
                        ⏳ กำลังรอ {claimingPlayer?.name} คำนวณและพิมพ์คำตอบ...
                      </div>
                      <p className="text-xs text-slate-400">
                        หาก {claimingPlayer?.name} ตอบผิด จะเปิดโอกาสให้ผู้เล่นอื่นแย่งตอบรอบถัดไป!
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <input
                        type="text"
                        value={answerInput}
                        onChange={(e) => setAnswerInput(e.target.value)}
                        placeholder={`เช่น 0.5 หรือ 1/2 หรือ 4π`}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && answerInput.trim() && claimingPlayer) {
                            onSubmitAnswer(claimingPlayer.id, answerInput.trim());
                          }
                        }}
                        className="flex-1 px-4 py-2.5 bg-slate-900 border border-indigo-400/80 rounded-xl text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      />
                      <button
                        disabled={!answerInput.trim()}
                        onClick={() => {
                          if (claimingPlayer && answerInput.trim()) {
                            onSubmitAnswer(claimingPlayer.id, answerInput.trim());
                          }
                        }}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black rounded-xl text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-950/40"
                      >
                        SUBMIT ANSWER
                      </button>
                    </div>
                  )}

                  {/* Math Helper Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-slate-400 mr-1 font-semibold">สัญลักษณ์ช่วยพิมพ์:</span>
                    {['π', '/', '.', '0.5', '1/2', '2', '4', '8', '-'].map((sym) => (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => appendSymbol(sym)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg font-mono text-xs border border-white/10 hover:border-white/20 transition-all active:scale-95"
                      >
                        {sym}
                      </button>
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-400">
                    💡 ระบบรองรับจำนวนเต็ม, ทศนิยม, เศษส่วน (เช่น 1/2), ค่า π (เช่น 4π หรือ 4*pi)
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}

          {/* PHASE 3: RESULT DISPLAY */}
          {resultState && (
            <div
              className={`p-5 rounded-2xl border-2 space-y-4 ${
                resultState.correct
                  ? 'bg-emerald-950/40 border-emerald-500/80 shadow-emerald-500/20'
                  : 'bg-rose-950/40 border-rose-500/80 shadow-rose-500/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{resultState.correct ? '✅' : '❌'}</span>
                <div>
                  <h3
                    className={`text-xl font-black ${
                      resultState.correct ? 'text-emerald-300' : 'text-rose-300'
                    }`}
                  >
                    {resultState.correct ? 'CORRECT! ถูกต้อง!' : 'WRONG! คำตอบไม่ถูกต้อง!'}
                  </h3>
                  <p className="text-xs text-slate-300 font-medium">
                    {resultState.correct
                      ? `ผู้เล่น ${
                          players.find((p) => p.id === resultState.answeringPlayerId)?.name
                        } ตอบถูกต้อง! ได้สิทธิ์ทิ้งไพ่ 1 ใบฟรี`
                      : `ผู้เล่น ${
                          players.find((p) => p.id === resultState.answeringPlayerId)?.name
                        } ถูกลงโทษจั่ว 1 ใบ และหมดสิทธิ์ตอบโจทย์นี้`}
                  </p>
                </div>
              </div>

              {/* Step-by-Step Solution */}
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/10 space-y-2 font-mono text-xs sm:text-sm text-slate-200 shadow-inner">
                <div className="font-bold text-cyan-300 text-xs uppercase tracking-wider mb-1">
                  วิธีทำอย่างละเอียด (STEP-BY-STEP SOLUTION):
                </div>
                {resultState.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-slate-500 font-semibold">[{idx + 1}]</span>
                    <span>{step}</span>
                  </div>
                ))}
                <div className="pt-2 font-bold text-amber-300 border-t border-white/5 mt-2">
                  คำตอบที่ถูกต้อง: {resultState.correctAnswerDisplay}
                </div>
              </div>

              {/* If Correct -> Select Card to freely discard */}
              {resultState.correct && resultState.pendingFreeDiscardPlayerId && (
                <div className="space-y-3 pt-2">
                  <div className="text-sm font-bold text-amber-300">
                    🎁 เลือกไพ่ 1 ใบในมือเพื่อทิ้งฟรี (ไม่ต้องสนใจสีหรือตัวเลข):
                  </div>
                  {(() => {
                    const rewardingPlayer = players.find(
                      (p) => p.id === resultState.pendingFreeDiscardPlayerId
                    );
                    if (!rewardingPlayer || rewardingPlayer.hand.length === 0) return null;

                    return (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2.5 bg-slate-950/60 rounded-2xl border border-white/10">
                          {rewardingPlayer.hand.map((card) => (
                            <button
                              key={card.id}
                              onClick={() => setSelectedDiscardCardId(card.id)}
                              className="transition-transform hover:scale-105 active:scale-95"
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
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-sm rounded-xl transition-all shadow-lg hover:scale-[1.01]"
                        >
                          ทิ้งไพ่ใบนี้ฟรี & กลับสู่เกมหลัก ✨
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* If Wrong -> Option for other players to answer or give up */}
              {!resultState.correct && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <span className="text-xs text-slate-400">
                    {disqualifiedPlayerIds.length >= players.length
                      ? 'ผู้เล่นทุกคนตอบผิดครบแล้ว'
                      : 'ผู้เล่นคนอื่นที่ยังไม่ตอบ สามารถแย่งกดตอบใหม่ได้'}
                  </span>
                  <div className="flex gap-2">
                    {disqualifiedPlayerIds.length < players.length && (
                      <button
                        onClick={() => {
                          onClaimAnswer('');
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
                      >
                        แย่งตอบอีกครั้ง ⚡
                      </button>
                    )}
                    <button
                      onClick={onCloseEquation}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-white/10 transition-colors"
                    >
                      ข้ามโจทย์และเล่นต่อ ⏩
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
