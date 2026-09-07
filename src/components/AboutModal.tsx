import React from 'react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl glass-panel-elevated border border-white/15 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-slate-200">
        <div className="p-5 border-b border-white/10 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl text-amber-400 font-black drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">∿</span>
            <div>
              <h2 className="text-xl font-black text-white tracking-wide">เกี่ยวกับเกม HARMONIC</h2>
              <p className="text-xs text-slate-400 font-medium">Simple Harmonic Motion (SHM) Concept</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm border border-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-300">
          <p className="leading-relaxed">
            <strong>HARMONIC</strong> เป็นเกมการ์ดที่ถูกออกแบบขึ้นเพื่อเปลี่ยนบทเรียนฟิสิกส์เรื่อง 
            <em> การเคลื่อนที่แบบฮาร์มอนิกอย่างง่าย (Simple Harmonic Motion: SHM)</em> ให้กลายเป็นประสบการณ์ที่สนุก ตื่นเต้น และเล่นได้จริง
          </p>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2 shadow-inner">
            <h3 className="text-sm font-bold text-cyan-300">ฟิสิกส์ SHM คืออะไร?</h3>
            <p className="text-xs leading-relaxed text-slate-400">
              การเคลื่อนที่แบบฮาร์มอนิกอย่างง่าย คือการเคลื่อนที่กลับไปกลับมาซ้ำรอยเดิมรอบตำแหน่งสมดุล (Equilibrium Position) 
              เช่น การแกว่งของลูกตุ้มนาฬิกา หรือการสั่นของมวลติดสปริง โดยมีแรงดึงกลับที่แปรผันตรงกับการกระจัดแต่มีทิศทางตรงกันข้าม
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-amber-300">ความสัมพันธ์ของสูตรหลักในเกม:</h3>
            <ul className="list-disc list-inside text-xs space-y-1.5 font-mono text-slate-300 bg-slate-950/50 p-4 rounded-2xl border border-white/5">
              <li><strong>คาบและความถี่:</strong> f = 1/T หรือ T = 1/f</li>
              <li><strong>ความถี่เชิงมุม:</strong> ω = 2πf = 2π/T = √(k/m)</li>
              <li><strong>อัตราเร็วสูงสุด:</strong> vmax = ωA = A√(k/m)</li>
              <li><strong>ความเร่งสูงสุด:</strong> amax = ω²A = (k/m)A</li>
              <li><strong>พลังงานกลรวมของสปริง:</strong> E = 1/2 kA²</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-400/30 text-xs text-indigo-200 leading-relaxed shadow-sm">
            <strong>ไอเดียเกม:</strong> รวมกฎคลาสสิกของเกมการ์ดเข้ากับการคำนวณสด ทุกครั้งที่มีคนเล่นการ์ด E ผู้เล่นทุกคนจะได้ร่วมลุ้น 
            แย่งกันตอบโจทย์ และฝึกทักษะการคำนวณทางฟิสิกส์อย่างเป็นธรรมชาติ
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-slate-900/60 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
