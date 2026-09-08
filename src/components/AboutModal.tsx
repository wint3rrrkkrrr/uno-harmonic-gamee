import React from 'react';
import { Atom, X, BookOpen, Sparkles } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xl p-4 overflow-y-auto animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl glass-panel-elevated border border-white/15 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-slate-200">
        {/* Holographic Top Glow */}
        <div className="h-1.5 bg-gradient-to-r from-cyan-400 via-indigo-500 to-amber-400" />

        <div className="p-5 border-b border-white/10 bg-slate-900/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-md">
              <Atom className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                เกี่ยวกับเกม HARMONIC
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Simple Harmonic Motion (SHM) Physics Card Game
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

        <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-300 text-left">
          <p className="leading-relaxed">
            <strong>HARMONIC</strong> เป็นบอร์ดเกมการ์ดเพื่อการศึกษาที่ถูกออกแบบขึ้นเพื่อเปลี่ยนบทเรียนวิชาฟิสิกส์เรื่อง{' '}
            <span className="text-cyan-300 font-semibold">การเคลื่อนที่แบบฮาร์มอนิกอย่างง่าย (Simple Harmonic Motion: SHM)</span>{' '}
            ให้กลายเป็นการแข่งขันที่สนุก ตื่นเต้น ได้ฝึกไหวพริบ และคำนวณสูตรฟิสิกส์ร่วมกับเพื่อน
          </p>

          <div className="p-5 rounded-3xl bg-slate-950/80 border border-white/10 space-y-2.5 shadow-inner">
            <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>หลักการฟิสิกส์ SHM ในชีวิตจริง:</span>
            </h3>
            <p className="text-xs leading-relaxed text-slate-300">
              การเคลื่อนที่แบบฮาร์มอนิกอย่างง่าย คือการเคลื่อนที่กลับไปกลับมาซ้ำรอยเดิมรอบตำแหน่งสมดุล (Equilibrium Position)
              เช่น การแกว่งของลูกตุ้มนาฬิกา หรือการสั่นของมวลติดปลายสปริง โดยมีแรงดึงกลับที่แปรผันตรงกับการกระจัดและมีทิศตรงกันข้าม
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>สูตรคำนวณหลักที่ใช้ในการเล่น:</span>
            </h3>
            <ul className="list-disc list-inside text-xs space-y-2 font-mono text-slate-300 bg-slate-950/60 p-4 rounded-2xl border border-white/10">
              <li>
                <strong className="text-white">คาบและความถี่:</strong> f = 1/T หรือ T = 1/f
              </li>
              <li>
                <strong className="text-white">ความถี่เชิงมุม:</strong> ω = 2πf = 2π/T = √(k/m)
              </li>
              <li>
                <strong className="text-white">อัตราเร็วสูงสุด:</strong> vmax = ωA = A√(k/m)
              </li>
              <li>
                <strong className="text-white">ความเร่งสูงสุด:</strong> amax = ω²A = (k/m)A
              </li>
              <li>
                <strong className="text-white">พลังงานกลรวมของระบบสปริง:</strong> E = 1/2 kA²
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-400/30 text-xs text-indigo-200 leading-relaxed shadow-sm">
            💡 <strong>การผสมผสาน:</strong> นำกติกาที่เข้าใจง่ายของเกมไพ่คลาสสิกมาผสานกับการคำนวณสด เมื่อไพ่โจทย์ E ปรากฏขึ้น ทุกคนจะได้แย่งกันคิดคำนวณ ทำให้การเรียนฟิสิกส์ไม่น่าเบื่ออีกต่อไป!
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-slate-900/70 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
