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
  const [activeTab, setActiveTab] = useState<'BASICS' | 'SPECIAL' | 'EQUATION' | 'HARMONIC'>('BASICS');

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
                เล่นสนุกสไตล์การ์ดเกม ผสมผสานองค์ความรู้ฟิสิกส์ฮาร์มอนิกอย่างง่าย (SHM)
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
            className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
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
            className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'SPECIAL'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>2. ไพ่พิเศษ 4 แบบ</span>
          </button>
          <button
            onClick={() => setActiveTab('EQUATION')}
            className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'EQUATION'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Atom className="w-3.5 h-3.5" />
            <span>3. สูตรฟิสิกส์ (ไพ่ E)</span>
          </button>
          <button
            onClick={() => setActiveTab('HARMONIC')}
            className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'HARMONIC'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>4. พูด HARMONIC!</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm leading-relaxed text-left">
          {activeTab === 'BASICS' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-400/30 text-cyan-200 font-medium flex items-center gap-3">
                <Target className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                <div>
                  <strong>เป้าหมายของเกม:</strong> ใครที่ลงไพ่ในมือจนหมดเกลี้ยงก่อน จะเป็นผู้ชนะในรอบนั้นทันที!
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white text-base mb-2">ความหมายของสีไพ่ทั้ง 4 สี:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs">
                  <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 flex-shrink-0" />
                    <span>🔴 แดง = Amplitude (A) — แอมพลิจูด</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-cyan-400 flex-shrink-0" />
                    <span>🔵 น้ำเงิน = Angular Frequency (ω) — ความถี่เชิงมุม</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 flex-shrink-0" />
                    <span>🟢 เขียว = Spring Constant (k) — ค่าคงที่สปริง</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-400 flex-shrink-0" />
                    <span>🟡 เหลือง = Mass (m) — มวล</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white text-base mb-2">รอบการเล่นในแต่ละเทิร์น:</h4>
                <ol className="list-decimal list-inside space-y-2 text-slate-300">
                  <li>ดูไพ่ใบบนสุดของ <strong>กองไพ่ทิ้ง (Discard Pile)</strong> ที่อยู่กลางโต๊ะ</li>
                  <li>
                    คุณสามารถลงไพ่ได้ ถ้าไพ่ในมือของคุณมี:
                    <ul className="list-disc list-inside ml-5 mt-1 space-y-1 text-slate-200">
                      <li><strong>สีตรงกัน</strong> กับกองทิ้ง (แดงลงทับแดง, เขียวทับเขียว ฯลฯ)</li>
                      <li><strong>ตัวเลขตรงกัน</strong> (เช่น เลข 4 ทับเลข 4 แม้จะคนละสี)</li>
                      <li><strong>สัญลักษณ์เดียวกัน</strong> (เช่น ข้ามตาทับข้ามตา)</li>
                      <li><strong>ไพ่เปลี่ยนสี (WILD)</strong> ลงได้เสมอไม่ว่ากองทิ้งจะเป็นสีอะไร</li>
                    </ul>
                  </li>
                  <li>
                    หากไม่มีไพ่ที่ลงได้ ให้กดปุ่ม <strong>จั่วไพ่ 1 ใบ</strong> จากกองจั่ว หากใบที่จั่วขึ้นมาลงได้ คุณสามารถเลือกตัดสินใจลงต่อได้ทันที
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
                    ผู้เล่นคนถัดไปต้องจั่วไพ่ 2 ใบจากกองจั่ว และถูกบังคับข้ามตาเล่นทันที!
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/40 flex items-start gap-3">
                <Ban className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-white">SKIP (ข้ามตา)</h5>
                  <p className="text-xs text-slate-300">
                    ข้ามตาของผู้เล่นคนถัดไปทันที ตาเล่นจะข้ามไปยังผู้เล่นลำดับต่อไป
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 flex items-start gap-3">
                <RotateCcw className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-white">REVERSE (กลับทิศทาง)</h5>
                  <p className="text-xs text-slate-300">
                    สลับทิศทางการวนรอบ จากตามเข็มนาฬิกาเป็นทวนเข็มนาฬิกา (หรือในทางกลับกัน)
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-fuchsia-500/40 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-fuchsia-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-white">WILD (เปลี่ยนสี)</h5>
                  <p className="text-xs text-slate-300">
                    สามารถลงทับไพ่สีใดก็ได้ เมื่อลงแล้วผู้เล่นจะได้สิทธิ์เลือกสีนำรอบถัดไป (แดง, น้ำเงิน, เขียว, เหลือง)
                  </p>
                </div>
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
                  เมื่อมีผู้เล่นลงการ์ดโจทย์ E เกมจะเข้าสู่โหมด <strong>Challenge Terminal</strong>:
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="p-3 bg-slate-900/80 rounded-xl border border-white/10">
                  <strong className="text-cyan-300">ขั้นตอนที่ 1 (ใส่ตัวแปร):</strong> ระบบจะสุ่มผู้เล่นมาเป็นผู้ใส่การ์ดตัวเลขตามสีของตัวแปรในสูตร (เช่น ค่านิจสปริง k สีเขียว, มวล m สีเหลือง)
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-white/10">
                  <strong className="text-amber-300">ขั้นตอนที่ 2 (แย่งกันกดตอบ):</strong> เมื่อตัวแปรครบ ทุกคนจะเห็นโจทย์และสูตรคำนวณ ใครคิดคำตอบได้ก่อนให้กดปุ่ม <strong>THE ANSWER IS!</strong>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-white/10">
                  <strong className="text-emerald-300">ผลลัพธ์:</strong> คนที่ตอบถูกจะได้สิทธิ์ <strong>ทิ้งไพ่ 1 ใบฟรี</strong> ส่วนคนที่ตอบผิดจะถูกลงโทษจั่ว 1 ใบ!
                </div>
              </div>
            </div>
          )}

          {activeTab === 'HARMONIC' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-2">
                <h4 className="font-bold text-amber-200 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <span>กฎการพูด HARMONIC เมื่อเหลือไพ่ 1 ใบ!</span>
                </h4>
                <p className="text-xs text-slate-300">
                  เมื่อคุณลงไพ่จนเหลือไพ่ในมือเพียง <strong>1 ใบสุดท้าย</strong> คุณต้องกดปุ่ม <strong>"HARMONIC!"</strong> ทันที
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 space-y-1.5">
                <h5 className="font-bold">🚨 การจับคนลืมพูด HARMONIC:</h5>
                <p>
                  หากผู้เล่นคนใดเหลือไพ่ 1 ใบแล้วลืมกดปุ่ม HARMONIC ผู้เล่นคนอื่นสามารถกดปุ่ม <strong>"จับคนลืม HARMONIC"</strong> เพื่อลงโทษให้ผู้เล่นคนนั้นต้องจั่วไพ่เพิ่ม 2 ใบได้ทันที!
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
