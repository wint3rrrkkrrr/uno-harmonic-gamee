import React, { useState } from 'react';
import {
  BookOpen,
  X,
  Target,
  Zap,
  RotateCcw,
  Ban,
  Atom,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'BASICS' | 'SPECIAL' | 'STACKING' | 'EQUATION' | 'MODES'>('BASICS');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xl p-4 overflow-y-auto animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-3xl glass-panel-elevated border border-white/15 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-slate-200">
        {/* Holographic Top Glow */}
        <div className="h-1.5 bg-gradient-to-r from-rose-500 via-cyan-400 to-amber-300" />

        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 bg-slate-900/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-md">
              <BookOpen className="w-5 h-5 text-slate-950" />
            </div>
            <div className="text-left">
              <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                คู่มือและกติกาการเล่นเกม HARMONIC
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                เกมการ์ดประลองไหวพริบ ผสมผสานฟิสิกส์ฮาร์มอนิกอย่างง่าย (SHM)
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

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-slate-950/60 p-2 gap-1.5 overflow-x-auto text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveTab('BASICS')}
            className={`px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'BASICS'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>1. กติกาพื้นฐาน</span>
          </button>
          <button
            onClick={() => setActiveTab('SPECIAL')}
            className={`px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'SPECIAL'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>2. การ์ดพิเศษ (+2, +4, E, ฯลฯ)</span>
          </button>
          <button
            onClick={() => setActiveTab('STACKING')}
            className={`px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'STACKING'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>3. กฎการทับการ์ดจั่ว (Stacking)</span>
          </button>
          <button
            onClick={() => setActiveTab('EQUATION')}
            className={`px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'EQUATION'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Atom className="w-3.5 h-3.5" />
            <span>4. โจทย์สมการ SHM (ไพ่ E)</span>
          </button>
          <button
            onClick={() => setActiveTab('MODES')}
            className={`px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'MODES'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>5. โหมดเกม & HARMONIC!</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm leading-relaxed text-left">
          {activeTab === 'BASICS' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-400/30 text-cyan-200 font-medium flex items-center gap-3">
                <Target className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                <div>
                  <strong>เป้าหมายของเกม:</strong> ลงไพ่ในมือให้หมดเพื่อคว้าชัยชนะ และฝึกฝนการคิดคำนวณสูตรฟิสิกส์ SHM
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-2">
                <h4 className="font-bold text-white text-base">📌 สีของไพ่ไม่มีผลต่อค่าตัวแปร:</h4>
                <p className="text-slate-300 text-xs sm:text-sm">
                  สีของไพ่ตัวเลข <strong>ไม่ได้มีความหมายแทนตัวแปรฟิสิกส์ใด ๆ</strong> และไม่ต้องจับคู่สีกับตัวแปร
                  ไพ่ตัวเลขทั้ง 4 สี (🔴 🔵 🟢 🟡) สามารถใช้แทนค่าตัวแปรใน Equation Card ได้ทั้งหมด โดยดูเฉพาะตัวเลขบนไพ่เท่านั้น!
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-base mb-2">รอบการเล่นในแต่ละเทิร์น:</h4>
                <ol className="list-decimal list-inside space-y-2 text-slate-300">
                  <li>ดูไพ่ใบบนสุดของ <strong>กองไพ่ทิ้ง (Discard Pile)</strong></li>
                  <li>
                    คุณสามารถลงไพ่ได้ ถ้าไพ่ในมือของคุณมี:
                    <ul className="list-disc list-inside ml-5 mt-1 space-y-1 text-slate-200">
                      <li><strong>สีตรงกัน</strong> (แดงลงทับแดง, น้ำเงินทับน้ำเงิน ฯลฯ)</li>
                      <li><strong>ตัวเลขตรงกัน</strong> (เช่น เลข 5 ทับเลข 5 แม้จะคนละสี)</li>
                      <li><strong>สัญลักษณ์เดียวกัน</strong> (เช่น SKIP ทับ SKIP, +2 ทับ +2)</li>
                      <li><strong>ไพ่เปลี่ยนสี (WILD / WILD +4)</strong> ลงได้เสมอ</li>
                    </ul>
                  </li>
                  <li>
                    หากไม่มีไพ่ที่ลงได้ ให้กดปุ่ม <strong>จั่วไพ่</strong> หากใบที่จั่วขึ้นมาลงได้ สามารถเลือกลงต่อได้ทันที
                  </li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'SPECIAL' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-rose-500/40 flex items-start gap-3">
                <div className="px-2.5 py-1 bg-rose-600 text-white rounded-lg font-mono font-black text-xs">
                  +2
                </div>
                <div>
                  <h5 className="font-bold text-white">DRAW TWO (+2)</h5>
                  <p className="text-xs text-slate-300">
                    ผู้เล่นคนถัดไปต้องจั่ว 2 ใบและข้ามตา (หรือสามารถลง +2 หรือ +4 ทับเพื่อส่งต่อโทษสะสมได้)
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-purple-500/40 flex items-start gap-3">
                <div className="px-2.5 py-1 bg-purple-600 text-white rounded-lg font-mono font-black text-xs">
                  +4★
                </div>
                <div>
                  <h5 className="font-bold text-white">WILD DRAW FOUR (+4)</h5>
                  <p className="text-xs text-slate-300">
                    เปลี่ยนสีนำของเกม และผู้เล่นคนถัดไปต้องจั่ว 4 ใบ (หรือสามารถลง +2 หรือ +4 ทับต่อเพื่อสะสมเป็น +6, +8, +12 ได้)
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/40 flex items-start gap-3">
                <Ban className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-white">SKIP (ข้ามตา)</h5>
                  <p className="text-xs text-slate-300">
                    ข้ามตาของผู้เล่นคนถัดไปทันที
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 flex items-start gap-3">
                <RotateCcw className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-white">REVERSE (กลับทิศทาง)</h5>
                  <p className="text-xs text-slate-300">
                    สลับทิศทางการวนรอบ (ตามเข็ม ↻ ↔ ทวนเข็ม ↺)
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-fuchsia-500/40 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-fuchsia-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-white">WILD (เปลี่ยนสี)</h5>
                  <p className="text-xs text-slate-300">
                    ลงทับไพ่สีใดก็ได้ และเลือกเปลี่ยนสีนำของเกม
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'STACKING' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-2">
                <h4 className="font-bold text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>กฎการทับการ์ดจั่ว (Stacking Rules)</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-200">
                  เมื่อมีผู้เล่นลงการ์ด +2 หรือ +4 ผู้เล่นคนถัดไปสามารถเลือกที่จะลงการ์ดจั่วทับเพื่อส่งต่อและเพิ่มยอดสะสมได้:
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300 font-mono">
                <div className="p-3 bg-slate-900/90 rounded-xl border border-emerald-500/30 flex items-center gap-3">
                  <span className="text-emerald-400 font-black text-sm">✅ +2 ทับ +2:</span>
                  <span>ยอดจั่วสะสมเพิ่มขึ้นเป็น +4, +6, +8 ...</span>
                </div>
                <div className="p-3 bg-slate-900/90 rounded-xl border border-emerald-500/30 flex items-center gap-3">
                  <span className="text-emerald-400 font-black text-sm">✅ +4 ทับ +2:</span>
                  <span>ยอดจั่วสะสมจาก +2 จะเพิ่มขึ้นเป็น +6</span>
                </div>
                <div className="p-3 bg-slate-900/90 rounded-xl border border-emerald-500/30 flex items-center gap-3">
                  <span className="text-emerald-400 font-black text-sm">✅ +2 ทับ +4:</span>
                  <span>ยอดจั่วสะสมจาก +4 จะเพิ่มขึ้นเป็น +6, +8 ... (ลงทับกันได้อิสระ)</span>
                </div>
                <div className="p-3 bg-slate-900/90 rounded-xl border border-emerald-500/30 flex items-center gap-3">
                  <span className="text-emerald-400 font-black text-sm">✅ +4 ทับ +4:</span>
                  <span>ยอดจั่วสะสมเพิ่มขึ้นเป็น +8, +12, +16 ...</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-300">
                ⚠️ หากผู้เล่นคนใดไม่มีการ์ดที่สามารถทับต่อได้ จะต้องกดยอมรับบทลงโทษ <strong>จั่วไพ่ตามยอดสะสมทั้งหมด</strong> และเสียตาเล่นรอบนั้นทันที
              </div>
            </div>
          )}

          {activeTab === 'EQUATION' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-950/50 border border-indigo-400/40 space-y-2">
                <h4 className="font-bold text-indigo-200 flex items-center gap-2">
                  <Atom className="w-5 h-5 text-indigo-400" />
                  <span>ไพ่โจทย์สมการฟิสิกส์ (EQUATION CARD "E")</span>
                </h4>
                <p className="text-xs text-slate-300">
                  เมื่อมีผู้เล่นลงการ์ดโจทย์ E เกมจะเข้าสู่โหมดประลองคำนวณ SHM Challenge:
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="p-3 bg-slate-900/80 rounded-xl border border-white/10">
                  <strong className="text-cyan-300">ขั้นตอนที่ 1 (เติมตัวแปร):</strong> ผู้เล่นตามที่สุ่มได้นำไพ่ตัวเลข (0–9 สีใดก็ได้) จากมือมาเติมในช่องว่าง
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-white/10">
                  <strong className="text-amber-300">ขั้นตอนที่ 2 (ชิงกดตอบ):</strong> เมื่อเติมค่าครบ ใครคำนวณคำตอบได้ก่อน ให้กดปุ่ม <strong>THE ANSWER IS!</strong> และพิมพ์คำตอบ
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-white/10 space-y-1">
                  <strong className="text-emerald-300">รางวัลตอบถูก (ฟรี Discard):</strong>
                  <ul className="list-disc list-inside ml-2 space-y-0.5 text-slate-200">
                    <li>ความยาก Easy: <strong>ทิ้งไพ่ฟรี 1 ใบ</strong></li>
                    <li>ความยาก Medium: <strong>ทิ้งไพ่ฟรี 1 ใบ</strong></li>
                    <li>ความยาก Hard: <strong>ทิ้งไพ่ฟรี 2 ใบ</strong></li>
                  </ul>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-rose-500/30 text-rose-200">
                  <strong>บทลงโทษตอบผิด:</strong> ถูกปรับจั่วไพ่ 1 ใบ และหมดสิทธิ์ตอบในข้อนั้น
                </div>
              </div>
            </div>
          )}

          {activeTab === 'MODES' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 space-y-2">
                <h4 className="font-bold text-purple-200">🏆 โหมดการจบเกม 2 รูปแบบ:</h4>
                <div className="space-y-2 text-xs text-slate-200">
                  <div className="p-2.5 bg-slate-900/90 rounded-xl border border-white/10">
                    <span className="font-bold text-amber-300">1. โหมดหาผู้ชนะ (First-to-Empty):</span> ใครไพ่หมดมือก่อน ชนะเกมทันที เกมจบเลย!
                  </div>
                  <div className="p-2.5 bg-slate-900/90 rounded-xl border border-white/10">
                    <span className="font-bold text-rose-300">2. โหมดหาผู้อ่อนแอ (Last-Player-Standing):</span> คนที่ไพ่หมดมือจะได้รับอันดับ 1st, 2nd, ... และออกจากเกม ผู้เล่นที่เหลือจะเล่นต่อไปเรื่อยๆ จนเหลือคนสุดท้ายที่ไพ่ไม่หมด จะเป็น "ผู้อ่อนแอ" (Loser)
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-2">
                <h4 className="font-bold text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <span>กฎการพูด HARMONIC เมื่อเหลือไพ่ 1 ใบ!</span>
                </h4>
                <p className="text-xs text-slate-300">
                  เมื่อคุณลงไพ่จนเหลือไพ่ในมือเพียง <strong>1 ใบสุดท้าย</strong> คุณต้องกดปุ่ม <strong>"HARMONIC!"</strong> ทันที
                  หากลืมกดและถูกผู้เล่นคนอื่นกดจับได้ จะถูกลงโทษ <strong>จั่วไพ่เพิ่ม 2 ใบ</strong>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-900/70 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-cyan-950/40 cursor-pointer"
          >
            เข้าใจแล้ว & เข้าเล่นเกม
          </button>
        </div>
      </div>
    </div>
  );
};
