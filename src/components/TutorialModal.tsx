import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardColor, Player } from '../types/game';
import { CardView } from './CardView';
import { getColorBg, getColorBorder, getColorText } from '../utils/cardUtils';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Zap,
  Atom,
  Bell,
  Skull,
  Trophy,
  AlertTriangle,
  Lightbulb,
  X,
  Play,
  Check,
  ChevronRight,
} from 'lucide-react';

interface TutorialStep {
  id: string;
  category: 'BASICS' | 'ACTION_CARDS' | 'HARMONIC_RULE' | 'EQUATION_CHALLENGE' | 'GAME_MODES';
  title: string;
  badge: string;
  situation: string; // อธิบายสถานการณ์จำลองที่ผู้เล่นกำลังพบ
  explanation: string; // คำอธิบายกติกาแบบเข้าใจง่าย
  colorRuleNote?: string; // ข้อสังเกตสำคัญเรื่องสี/ตัวเลขฟิสิกส์
  actionPrompt: string; // แนะนำสิ่งที่ต้องทำในสถานการณ์นี้
  interactiveType:
    | 'PLAY_NUMBER'
    | 'PLAY_ACTION'
    | 'CALL_HARMONIC'
    | 'CATCH_OPPONENT'
    | 'SOLVE_EQUATION'
    | 'CHOOSE_MODE';
  topCard: Card;
  currentColor: CardColor;
  playerHand: Card[];
  highlightCardIds?: string[];
  equationDemo?: {
    code: string;
    title: string;
    formula: string;
    target: string;
    blankVar: string;
    blankColor: 'RED' | 'BLUE' | 'GREEN' | 'YELLOW';
    blankValue: number;
    answer: string;
    calculationSteps: string[];
  };
}

const TUTORIAL_STEPS: TutorialStep[] = [
  // 1. BASICS: Matching Color and Number
  {
    id: 'step-1-basics',
    category: 'BASICS',
    title: '1. การลงไพ่ตัวเลขพื้นฐาน (Basic Matching)',
    badge: 'กติกาเริ่มต้น',
    situation: 'บนกองทิ้งคือไพ่ 🔴 RED 5 (สีแดง เลข 5) และถึงตาเล่นของคุณ',
    explanation:
      'คุณสามารถลงไพ่ที่มี "สีเดียวกัน" (สีแดง) หรือ "ตัวเลขเดียวกัน" (เลข 5 ไม่จำกัดสี) หรือใช้ไพ่เปลี่ยนสี (WILD) ได้',
    colorRuleNote:
      '💡 ข้อจำกัดความเข้าใจผิด: สีของไพ่ตัวเลขไม่มีผลต่อฟิสิกส์ใด ๆ ในการเล่นปกติ เป็นเพียงสีตามกฎเกมเหมือน UNO เท่านั้น!',
    actionPrompt: 'ลองกดเลือกไพ่ 🔴 RED 7 หรือ 🔵 BLUE 5 เพื่อลงบนกองทิ้ง',
    interactiveType: 'PLAY_NUMBER',
    topCard: { id: 'top-1', type: 'NUMBER', color: 'RED', value: 5 },
    currentColor: 'RED',
    playerHand: [
      { id: 'h-1', type: 'NUMBER', color: 'RED', value: 7 },
      { id: 'h-2', type: 'NUMBER', color: 'BLUE', value: 5 },
      { id: 'h-3', type: 'NUMBER', color: 'GREEN', value: 2 },
      { id: 'h-4', type: 'NUMBER', color: 'YELLOW', value: 9 },
    ],
    highlightCardIds: ['h-1', 'h-2'],
  },

  // 2. ACTION CARDS: +2 Draw Two, Skip, Reverse & Wild
  {
    id: 'step-2-actions',
    category: 'ACTION_CARDS',
    title: '2. ไพ่แอคชั่นพิเศษ (+2, SKIP, REVERSE, WILD)',
    badge: 'ตัดแต้ม & สลับทิศ',
    situation: 'คุณมีไพ่พิเศษในมือ และบนกองทิ้งคือไพ่ 🟢 GREEN 3',
    explanation:
      '• ⚡ +2 (Energy Loss): บังคับให้ผู้เล่นคนถัดไปจั่ว 2 ใบ และข้ามตาเล่นทันที\n• ⏭ SKIP (Equilibrium Stop): ข้ามตาผู้เล่นคนถัดไป\n• 🔄 REVERSE (Inversion): สลับทิศทางการวนรอบโต๊ะ\n• ★ WILD: ลงได้ทุกเมื่อเพื่อเลือกเปลี่ยนสีนำ',
    colorRuleNote: '⚡ กลยุทธ์: ใช้ +2 หรือ SKIP เพื่อขัดจังหวะผู้เล่นที่กำลังจะทิ้งไพ่หมดมือ!',
    actionPrompt: 'ลองคลิกลงไพ่ 🟢 GREEN +2 หรือ ★ WILD',
    interactiveType: 'PLAY_ACTION',
    topCard: { id: 'top-2', type: 'NUMBER', color: 'GREEN', value: 3 },
    currentColor: 'GREEN',
    playerHand: [
      { id: 'h-act-1', type: 'DRAW_TWO', color: 'GREEN' },
      { id: 'h-act-2', type: 'SKIP', color: 'YELLOW' },
      { id: 'h-act-3', type: 'WILD', color: 'WILD' },
      { id: 'h-act-4', type: 'NUMBER', color: 'BLUE', value: 1 },
    ],
    highlightCardIds: ['h-act-1', 'h-act-3'],
  },

  // 3. HARMONIC RULE: Remaining 1 card & Catching Opponents
  {
    id: 'step-3-harmonic',
    category: 'HARMONIC_RULE',
    title: '3. กฎการกด “HARMONIC!” เมื่อเหลือไพ่ 1 ใบ',
    badge: 'หัวใจสำคัญของเกม',
    situation: 'คุณกำลังจะลงไพ่ใบที่สองในมือ ทำให้ในมือจะเหลือเพียง 1 ใบสุดท้าย!',
    explanation:
      'เมื่อผู้เล่นเหลือไพ่ 1 ใบ "ต้องกดปุ่ม HARMONIC!" ทันที หากลืมกดแล้วมีผู้เล่นคนอื่นกดจับได้ (CATCH HARMONIC) คุณจะถูกปรับจั่วไพ่เพิ่ม 2 ใบเป็นบทลงโทษ',
    colorRuleNote:
      '🎯 การจับคนลืมกด: เมื่อเห็นคู่แข่งเหลือไพ่ 1 ใบแต่ไม่มีป้าย HARMONIC สว่าง คุณสามารถกดจับเพื่อลงโทษคู่แข่งได้ทันที!',
    actionPrompt: 'กดจำลองปุ่ม "HARMONIC!" เพื่อประกาศเตือนผู้เล่นคนอื่น',
    interactiveType: 'CALL_HARMONIC',
    topCard: { id: 'top-3', type: 'NUMBER', color: 'BLUE', value: 4 },
    currentColor: 'BLUE',
    playerHand: [
      { id: 'h-har-1', type: 'NUMBER', color: 'BLUE', value: 8 },
      { id: 'h-har-2', type: 'NUMBER', color: 'RED', value: 3 },
    ],
    highlightCardIds: ['h-har-1'],
  },

  // 4. EQUATION CARD: SHM Challenge, Blanks & Free Discard
  {
    id: 'step-4-equation',
    category: 'EQUATION_CHALLENGE',
    title: '4. ไพ่สมการฟิสิกส์ SHM (Equation Challenge Card)',
    badge: 'ชิงสิทธิ์ทิ้งไพ่ฟรี',
    situation: 'มีคนลงไพ่ ⚛️ EQUATION บนโต๊ะ! ระบบจะเปิดโจทย์สมการ SHM สุ่มขึ้นมา',
    explanation:
      '1. สุ่มผู้เล่นวางไพ่ตัวเลขเพื่อเติมค่าตัวแปรในช่องว่าง (สีไพ่ต้องตรงกับสีกรอบช่องว่าง แต่ตัวเลขใช้เป็นค่าฟิสิกส์)\n2. เมื่อช่องว่างถูกเติมครบ ทุกคนจะแย่งกันกดปุ่ม Buzzer เพื่อชิงสิทธิ์ตอบ\n3. คนที่ตอบถูกจะได้ "สิทธิ์ทิ้งไพ่ฟรี 1 ใบ" ทันที! (หากตอบผิดจะโดนปรับจั่ว 1 ใบ)',
    colorRuleNote:
      '🔬 ตัวอย่าง: f = [ 5 ] Hz ⟹ คาบ T = 1/f = 1/5 = 0.2 s (สีของไพ่ไม่ได้แทนสูตรฟิสิกส์ ตัวเลขบนไพ่เท่านั้นคือค่าที่นำมาคิด)',
    actionPrompt: 'ทดลองกด "กดแย่งตอบ (BUZZER)" แล้วเลือกคำตอบที่ถูกต้อง',
    interactiveType: 'SOLVE_EQUATION',
    topCard: { id: 'top-4', type: 'EQUATION', color: 'WILD' },
    currentColor: 'BLUE',
    playerHand: [
      { id: 'h-eq-1', type: 'NUMBER', color: 'BLUE', value: 5 },
      { id: 'h-eq-2', type: 'NUMBER', color: 'RED', value: 8 },
      { id: 'h-eq-3', type: 'NUMBER', color: 'YELLOW', value: 2 },
    ],
    equationDemo: {
      code: 'E01',
      title: 'Period from Frequency (T = 1/f)',
      formula: 'f = 1/T',
      target: 'T (คาบการแกว่ง)',
      blankVar: 'f',
      blankColor: 'BLUE',
      blankValue: 5,
      answer: '0.2 s (หรือ 1/5 s)',
      calculationSteps: [
        'สูตรความสัมพันธ์: f = 1/T ⟹ T = 1/f',
        'แทนค่าความถี่ f = 5 Hz จากไพ่ที่ถูกเติม',
        'คำนวณ: T = 1 / 5 = 0.2 วินาที (s)',
      ],
    },
  },

  // 5. GAME MODES: Winner vs Last Man Standing
  {
    id: 'step-5-modes',
    category: 'GAME_MODES',
    title: '5. โหมดการเล่น 2 สไตล์ (Game Modes)',
    badge: 'เงื่อนไขจบเกม',
    situation: 'เลือกลักษณะการตัดสินเกมที่คุณและเพื่อนต้องการเล่น',
    explanation:
      '• 🏆 โหมดใครหมดก่อนชนะ (First to Finish): คนแรกที่ลงไพ่จนหมดมือจะเป็นผู้ชนะทันทีและจบเกม\n• 💀 โหมดหาผู้เหลือไพ่คนสุดท้าย (Last Man Standing): คนที่ไพ่หมดมือจะผ่านเข้ารอบ (Rank #1, #2, ...) และเกมจะแข่งต่อจนเหลือผู้ถือไพ่คนสุดท้าย ซึ่งจะเป็นผู้แพ้!',
    colorRuleNote:
      '✨ แนะนำ: สำหรับกลุ่มเพื่อนที่ต้องการหาคนโดนทำโทษ ให้เลือกเล่นโหมด "ผู้เหลือไพ่คนสุดท้าย (Last Man Standing)"',
    actionPrompt: 'เลือกโหมดที่สนใจเพื่อดูสรุปและจบการสอนเล่น',
    interactiveType: 'CHOOSE_MODE',
    topCard: { id: 'top-5', type: 'NUMBER', color: 'YELLOW', value: 1 },
    currentColor: 'YELLOW',
    playerHand: [{ id: 'h-last-1', type: 'NUMBER', color: 'YELLOW', value: 1 }],
  },
];

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartRealGame: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  onClose,
  onStartRealGame,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [interactionSuccess, setInteractionSuccess] = useState<boolean>(false);
  const [buzzedIn, setBuzzedIn] = useState<boolean>(false);
  const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean | null>(null);
  const [harmonicCalled, setHarmonicCalled] = useState<boolean>(false);
  const [chosenModePreview, setChosenModePreview] = useState<'WINNER' | 'LOSER'>('WINNER');

  if (!isOpen) return null;

  const currentStep = TUTORIAL_STEPS[currentStepIdx];
  const isLastStep = currentStepIdx === TUTORIAL_STEPS.length - 1;

  const handleNextStep = () => {
    if (currentStepIdx < TUTORIAL_STEPS.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
      resetStepState();
    } else {
      onClose();
      onStartRealGame();
    }
  };

  const handlePrevStep = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx((prev) => prev - 1);
      resetStepState();
    }
  };

  const resetStepState = () => {
    setSelectedCardId(null);
    setInteractionSuccess(false);
    setBuzzedIn(false);
    setAnsweredCorrectly(null);
    setHarmonicCalled(false);
  };

  const handleCardClick = (card: Card) => {
    if (currentStep.interactiveType === 'PLAY_NUMBER') {
      const isValid =
        card.color === currentStep.currentColor || card.value === currentStep.topCard.value;
      if (isValid) {
        setSelectedCardId(card.id);
        setInteractionSuccess(true);
      }
    } else if (currentStep.interactiveType === 'PLAY_ACTION') {
      const isValid = card.color === currentStep.currentColor || card.type === 'WILD';
      if (isValid) {
        setSelectedCardId(card.id);
        setInteractionSuccess(true);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-4xl glass-panel-elevated border border-cyan-400/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[95vh]">
        {/* Top Gradient Banner */}
        <div className="h-1.5 bg-gradient-to-r from-rose-500 via-cyan-400 to-amber-300" />

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-white/10 bg-slate-900/80 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-slate-950 shadow-md">
              <GraduationCap className="w-5 h-5 text-slate-950" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                  โหมดสอนเล่นแบบอินเตอร์แอคทีฟ (Interactive Tutorial)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[10px] font-mono font-bold">
                  {currentStepIdx + 1} / {TUTORIAL_STEPS.length}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                จำลองสถานการณ์จริงบนโต๊ะ พร้อมคำอธิบายกติกาและวิธีเล่นเข้าใจง่าย
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm border border-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="flex bg-slate-950/70 border-b border-white/10 px-4 py-2 gap-1.5 overflow-x-auto scrollbar-none">
          {TUTORIAL_STEPS.map((step, idx) => {
            const isActive = idx === currentStepIdx;
            const isPassed = idx < currentStepIdx;
            return (
              <button
                key={step.id}
                onClick={() => {
                  setCurrentStepIdx(idx);
                  resetStepState();
                }}
                className={`flex-1 min-w-[120px] py-1.5 px-2.5 rounded-xl text-left text-xs font-bold transition-all border flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200 shadow-md ring-1 ring-cyan-400/40'
                    : isPassed
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 opacity-90'
                    : 'bg-slate-900/50 border-white/5 text-slate-400 opacity-60'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-black ${
                    isActive
                      ? 'bg-cyan-400 text-slate-950'
                      : isPassed
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isPassed ? '✓' : idx + 1}
                </span>
                <span className="truncate">{step.badge}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Main Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Situation & Rule Explanation Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-white/10 shadow-lg space-y-3 text-left">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>{currentStep.title}</span>
              </h3>
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-mono font-bold text-xs">
                {currentStep.badge}
              </span>
            </div>

            {/* Situation Box */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/50 border border-indigo-500/30 text-xs sm:text-sm text-indigo-200 flex items-start gap-2.5">
              <Lightbulb className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300">สถานการณ์: </span>
                <span>{currentStep.situation}</span>
              </div>
            </div>

            {/* Rule Explanation */}
            <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
              {currentStep.explanation}
            </p>

            {/* Color / Physics note */}
            {currentStep.colorRuleNote && (
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-cyan-500/20 text-xs text-cyan-200/90 font-medium">
                {currentStep.colorRuleNote}
              </div>
            )}
          </div>

          {/* Interactive Simulation Arena */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-slate-950 to-slate-900 border border-cyan-500/30 shadow-2xl text-center space-y-4">
            <div className="text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase flex items-center justify-center gap-2">
              <Play className="w-3.5 h-3.5" />
              <span>{currentStep.actionPrompt}</span>
            </div>

            {/* Scenario 1 & 2: Matching & Action Play Arena */}
            {(currentStep.interactiveType === 'PLAY_NUMBER' ||
              currentStep.interactiveType === 'PLAY_ACTION') && (
              <div className="space-y-4">
                {/* Board Center (Top Card) */}
                <div className="flex flex-col items-center justify-center gap-2 py-2">
                  <span className="text-[11px] font-mono text-slate-400 uppercase">
                    ไพ่บนกองทิ้งปัจจุบัน (Active Color:{' '}
                    <span className="font-bold text-white">{currentStep.currentColor}</span>)
                  </span>
                  <div className="relative">
                    <CardView card={currentStep.topCard} size="md" />
                  </div>
                </div>

                {/* Player Hand Cards to interact */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <span className="text-xs font-bold text-slate-300 block">
                    ไพ่ในมือของคุณ (คลิกใบที่ลงได้เพื่อทดลอง):
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {currentStep.playerHand.map((card) => {
                      const isHighlighted = currentStep.highlightCardIds?.includes(card.id);
                      const isSelected = selectedCardId === card.id;

                      return (
                        <div
                          key={card.id}
                          onClick={() => handleCardClick(card)}
                          className={`relative cursor-pointer transition-all transform hover:-translate-y-2 ${
                            isSelected
                              ? 'scale-110 ring-4 ring-emerald-400 rounded-2xl shadow-2xl'
                              : isHighlighted
                              ? 'ring-2 ring-cyan-400/80 rounded-2xl animate-bounce [animation-duration:3s]'
                              : 'opacity-50 hover:opacity-100'
                          }`}
                        >
                          <CardView card={card} size="sm" />
                          {isHighlighted && !isSelected && (
                            <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-emerald-500 text-slate-950 font-black text-[9px] rounded-full shadow">
                              แนะนำ
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Success Feedback */}
                {interactionSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-400/50 text-emerald-200 text-xs font-bold flex items-center justify-center gap-2 shadow-lg"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>ถูกต้อง! ไพ่ใบนี้สามารถลงได้ตามกฎกติกา</span>
                  </motion.div>
                )}
              </div>
            )}

            {/* Scenario 3: Harmonic Button */}
            {currentStep.interactiveType === 'CALL_HARMONIC' && (
              <div className="space-y-4 py-2">
                <div className="flex justify-center items-center gap-6">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 block mb-1">
                      ไพ่ที่เหลือกำลังจะลง
                    </span>
                    <CardView card={currentStep.playerHand[0]} size="sm" />
                  </div>
                  <div className="text-2xl font-bold text-cyan-400">➔</div>
                  <div>
                    <span className="text-[11px] font-mono text-amber-300 font-bold block mb-1">
                      จะเหลือเพียง 1 ใบสุดท้าย!
                    </span>
                    <CardView card={currentStep.playerHand[1]} size="sm" />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    onClick={() => {
                      setHarmonicCalled(true);
                      setInteractionSuccess(true);
                    }}
                    className={`py-3.5 px-8 rounded-2xl font-black text-sm tracking-wider shadow-2xl transition-all cursor-pointer inline-flex items-center gap-2 ${
                      harmonicCalled
                        ? 'bg-emerald-500 text-slate-950 scale-105'
                        : 'bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white animate-pulse shadow-amber-500/40 hover:scale-105'
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                    <span>{harmonicCalled ? 'ประกาศ HARMONIC! สำเร็จแล้ว' : 'กดปุ่ม HARMONIC!'}</span>
                  </button>
                </div>

                {harmonicCalled && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-400/50 text-emerald-200 text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>
                      เยี่ยมมาก! คุณประกาศ HARMONIC ทันเวลา จะไม่โดนปรับจั่ว 2 ใบจากคู่แข่ง
                    </span>
                  </motion.div>
                )}
              </div>
            )}

            {/* Scenario 4: Equation Card Challenge Interactive Demo */}
            {currentStep.interactiveType === 'SOLVE_EQUATION' && currentStep.equationDemo && (
              <div className="space-y-4 py-1 text-left">
                <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-400/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold">
                      {currentStep.equationDemo.code}: {currentStep.equationDemo.title}
                    </span>
                    <span className="text-xs text-amber-300 font-bold">
                      สูตร: {currentStep.equationDemo.formula}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-white/10 text-center font-mono font-bold text-sm text-white">
                    f = [ <span className="text-cyan-300 font-black">5</span> ] Hz ⟹ จงหา{' '}
                    <span className="text-amber-300 font-black">
                      {currentStep.equationDemo.target}
                    </span>
                  </div>

                  {/* Buzzer & Answer Simulation */}
                  {!buzzedIn ? (
                    <div className="text-center pt-2">
                      <button
                        onClick={() => setBuzzedIn(true)}
                        className="py-3 px-6 bg-gradient-to-r from-rose-500 via-amber-500 to-cyan-500 hover:from-rose-400 hover:to-cyan-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-cyan-500/30 transition-transform hover:scale-105 active:scale-95 cursor-pointer inline-flex items-center gap-2 animate-pulse"
                      >
                        <Zap className="w-4 h-4 fill-current" />
                        <span>กดแย่งตอบ (BUZZER)!</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-2">
                      <span className="text-xs font-bold text-cyan-300 block">
                        คุณได้สิทธิ์ตอบ! เลือกคำตอบที่ถูกต้อง:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {['0.2 s (หรือ 1/5 s)', '5.0 s', '25 s'].map((opt, i) => {
                          const isCorrectChoice = i === 0;
                          return (
                            <button
                              key={opt}
                              onClick={() => {
                                setAnsweredCorrectly(isCorrectChoice);
                                if (isCorrectChoice) setInteractionSuccess(true);
                              }}
                              className={`p-3 rounded-xl font-bold text-xs border transition-all cursor-pointer text-center ${
                                answeredCorrectly !== null && isCorrectChoice
                                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                                  : answeredCorrectly === false && !isCorrectChoice
                                  ? 'bg-rose-950/40 text-rose-300 border-rose-500/30'
                                  : 'bg-slate-800 hover:bg-slate-700 text-white border-white/10 hover:border-cyan-400/50'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {answeredCorrectly === true && (
                        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-400/50 text-emerald-200 text-xs space-y-1">
                          <div className="font-bold flex items-center gap-1.5 text-emerald-300">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>ถูกต้อง! คุณได้รับสิทธิ์ทิ้งไพ่ฟรี 1 ใบออกจากมือทันที</span>
                          </div>
                          <p className="text-[11px] text-slate-300 font-mono">
                            {currentStep.equationDemo.calculationSteps.join(' ➔ ')}
                          </p>
                        </div>
                      )}

                      {answeredCorrectly === false && (
                        <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-bold flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-rose-400" />
                          <span>ตอบผิด! ในเกมจริงจะถูกปรับจั่วไพ่ 1 ใบ ลองกดเลือกคำตอบใหม่อีกครั้ง</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Scenario 5: Game Mode Choice Demo */}
            {currentStep.interactiveType === 'CHOOSE_MODE' && (
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  <div
                    onClick={() => {
                      setChosenModePreview('WINNER');
                      setInteractionSuccess(true);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      chosenModePreview === 'WINNER'
                        ? 'bg-amber-950/60 border-amber-400 text-amber-200 ring-2 ring-amber-400/50 shadow-lg'
                        : 'bg-slate-900 border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-black text-sm mb-1 text-white">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span>โหมดใครหมดก่อนชนะ (First to Finish)</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      เหมาะสำหรับการแข่งขันเร็ว ผู้เล่นคนแรกที่ทิ้งไพ่หมดมือคือผู้ชนะเดี่ยวและจบเกมทันที
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      setChosenModePreview('LOSER');
                      setInteractionSuccess(true);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      chosenModePreview === 'LOSER'
                        ? 'bg-rose-950/60 border-rose-400 text-rose-200 ring-2 ring-rose-400/50 shadow-lg'
                        : 'bg-slate-900 border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-black text-sm mb-1 text-white">
                      <Skull className="w-4 h-4 text-rose-400" />
                      <span>โหมดหาผู้เหลือไพ่คนสุดท้าย (Last Man Standing)</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      แข่งต่อเนื่อง คนที่ไพ่หมดมือจะผ่านเข้ารอบ จนเหลือผู้เล่นคนสุดท้ายที่ต้องรับบทเป็นผู้แพ้
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-4 border-t border-white/10 bg-slate-900/90 flex items-center justify-between flex-shrink-0">
          <button
            onClick={handlePrevStep}
            disabled={currentStepIdx === 0}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-200 font-bold text-xs border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ย้อนกลับ</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-white/10 transition-colors cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>

            <button
              onClick={handleNextStep}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>{isLastStep ? 'เริ่มเล่นเกมจริงทันที 🚀' : 'ขั้นตอนถัดไป'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
