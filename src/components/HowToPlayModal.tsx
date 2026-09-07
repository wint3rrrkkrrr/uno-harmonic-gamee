import React, { useState } from 'react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'BASICS' | 'SPECIAL' | 'EQUATION' | 'HARMONIC'>('BASICS');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl glass-panel-elevated border border-white/15 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl text-cyan-400 font-bold drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">📖</span>
            <div>
              <h2 className="text-xl font-black text-white tracking-wide">กติกาการเล่นเกม HARMONIC (ฉบับเข้าใจง่าย)</h2>
              <p className="text-xs text-slate-400 font-medium">เล่นสนุกเหมือน UNO ผสมความรู้ฟิสิกส์การเคลื่อนที่แบบฮาร์มอนิกอย่างง่าย (SHM)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm border border-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-slate-950/50 p-2 gap-1.5 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('BASICS')}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'BASICS'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            🎯 1. วิธีเล่นพื้นฐาน
          </button>
          <button
            onClick={() => setActiveTab('SPECIAL')}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'SPECIAL'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            💥 2. ไพ่พิเศษทั้ง 4 ชนิด
          </button>
          <button
            onClick={() => setActiveTab('EQUATION')}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'EQUATION'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            ∿ 3. ระบบโจทย์ฟิสิกส์ (ไพ่ E)
          </button>
          <button
            onClick={() => setActiveTab('HARMONIC')}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'HARMONIC'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            🚨 4. กฎ HARMONIC & การจับคนลืม
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm leading-relaxed">
          {activeTab === 'BASICS' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-400/30 text-cyan-200 font-medium">
                🎯 <strong>เป้าหมายของเกม:</strong> ใครที่ลงไพ่ในมือจนหมดเกลี้ยงก่อน จะเป็นผู้ชนะทันที!
              </div>

              <div>
                <h4 className="font-bold text-white text-base mb-2">รอบการเล่นในแต่ละเทิร์น:</h4>
                <ol className="list-decimal list-inside space-y-2 text-slate-300">
                  <li>
                    ดูไพ่ใบบนสุดของ <strong>กองไพ่ทิ้ง (Discard Pile)</strong>
                  </li>
                  <li>
                    คุณสามารถลงไพ่ได้ถ้าไพ่ในมือของคุณมี:
                    <ul className="list-disc list-inside ml-5 mt-1 space-y-1 text-slate-200">
                      <li><strong>สีตรงกัน</strong> กับกองทิ้ง (เช่น แดงลงทับแดง)</li>
                      <li><strong>ตัวเลขตรงกัน</strong> (เช่น เลข 5 ทับเลข 5 แม้คนละสี)</li>
                      <li><strong>สัญลักษณ์เดียวกัน</strong> (เช่น ข้ามตา ทับ ข้ามตา)</li>
                      <li><strong>ไพ่เปลี่ยนสี (WILD)</strong> ลงได้เสมอไม่ว่ากองทิ้งจะเป็นสีอะไร</li>
                    </ul>
                  </li>
                  <li>
                    ถ้าไม่มีไพ่ที่ลงได้ ให้คลิกที่ <strong>กองไพ่จั่ว (Draw Pile)</strong> เพื่อจั่ว 1 ใบ
                    (ถ้าใบที่จั่วขึ้นมาลงได้ ระบบจะให้เลือกว่าจะลงทันทีเลยหรือไม่)
                  </li>
                </ol>
              </div>

              <div>
                <h4 className="font-bold text-white text-base mb-2">🎨 ความหมายของ 4 สีกับฟิสิกส์ SHM:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs">
                  <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300">
                    <strong className="text-rose-400 text-sm font-black">🔴 สีแดง:</strong> แอมพลิจูด (A) และการกระจัด (x)
                  </div>
                  <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-300">
                    <strong className="text-cyan-400 text-sm font-black">🔵 สีน้ำเงิน:</strong> ความถี่เชิงมุม (ω), ความถี่ (f), ความเร็ว (v)
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300">
                    <strong className="text-emerald-400 text-sm font-black">🟢 สีเขียว:</strong> ค่านิจสปริง (k), พลังงาน (E), เวลา (t)
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-300">
                    <strong className="text-amber-400 text-sm font-black">🟡 สีเหลือง:</strong> มวล (m), คาบการแกว่ง (T)
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'SPECIAL' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-rose-500 text-white font-black text-xs">+2</span>
                  <strong className="text-rose-300 text-sm font-black">จั่ว 2 ใบ (Energy Loss)</strong>
                </div>
                <p className="text-xs text-slate-300">
                  ผู้เล่นคนถัดไปจะโดนลงโทษให้จั่วไพ่ 2 ใบเข้ามือทันที และเสียตาเล่นในรอบนั้น
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-xs">⏭</span>
                  <strong className="text-amber-300 text-sm font-black">ข้ามตา (Equilibrium Stop)</strong>
                </div>
                <p className="text-xs text-slate-300">
                  ข้ามตาของผู้เล่นคนถัดไป ทำให้คนนั้นไม่ได้เล่น และส่งต่อให้คนต่อไปทันที
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-500 text-slate-950 font-black text-xs">🔄</span>
                  <strong className="text-cyan-300 text-sm font-black">สลับทิศทาง (Reverse Inversion)</strong>
                </div>
                <p className="text-xs text-slate-300">
                  สลับทิศทางการเล่นรอบโต๊ะ (จากตามเข็มนาฬิกา ↻ สลับเป็น ทวนเข็มนาฬิกา ↺ หรือในทางกลับกัน)
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-fuchsia-950/40 border border-fuchsia-500/40 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-fuchsia-500 text-white font-black text-xs">★</span>
                  <strong className="text-fuchsia-300 text-sm font-black">เปลี่ยนสี (Wild Color)</strong>
                </div>
                <p className="text-xs text-slate-300">
                  สามารถลงทับไพ่สีใดก็ได้ เมื่อลงแล้วคุณจะมีสิทธิ์เลือกสีที่ต้องการกำหนดเป็นสีต่อไป
                </p>
              </div>
            </div>
          )}

          {activeTab === 'EQUATION' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-400/30 text-indigo-200">
                ∿ <strong>ไพ่โจทย์ Equation (E)</strong> คือหัวใจสำคัญของเกม HARMONIC ที่เปิดโอกาสให้คุณทิ้งไพ่ฟรีได้เร็วขึ้น!
              </div>

              <ol className="list-decimal list-inside space-y-2 text-slate-300 text-xs sm:text-sm">
                <li>
                  เมื่อมีคนลงไพ่ <strong>E</strong> ทุกคนจะเข้าสู่หน้าต่างโจทย์ฟิสิกส์ SHM
                </li>
                <li>
                  ระบบจะสุ่มมอบหมายให้ผู้เล่นนำ <strong>ไพ่ตัวเลขที่มีสีตรงกับช่องว่าง</strong> มาเติมค่าในสูตร
                </li>
                <li>
                  ถ้าผู้เล่นคนนั้นไม่มีสีที่ต้องใช้ จะได้จั่ว 1 ใบ หากยังไม่ได้จะส่งต่อให้ผู้เล่นถัดไปเติม
                </li>
                <li>
                  เมื่อตัวเลขถูกเติมจนครบสูตร ปุ่ม <strong>“THE ANSWER IS!”</strong> จะสว่างขึ้น
                  ผู้เล่นทุกคนสามารถ <strong>แย่งกันกดปุ่มเพื่อชิงสิทธิ์ตอบ</strong>
                </li>
                <li>
                  <strong className="text-emerald-300">ตอบถูก ✅:</strong> ได้สิทธิ์ <strong>ทิ้งไพ่ในมือฟรี 1 ใบ</strong> ทันที! (ลดไพ่ได้ไวมาก)
                </li>
                <li>
                  <strong className="text-rose-300">ตอบผิด ❌:</strong> ถูกปรับจั่วไพ่ 1 ใบ และหมดสิทธิ์ตอบในโจทย์ข้อนั้น
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'HARMONIC' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-400/40 text-amber-200">
                🚨 <strong>กฎสำคัญที่สุดเมื่อเหลือไพ่ 1 ใบ:</strong>
              </div>

              <p className="text-slate-300">
                เมื่อคุณลงไพ่จนเหลือไพ่เพียง <strong>1 ใบสุดท้ายในมือ</strong> คุณต้องกดปุ่ม{' '}
                <span className="text-amber-300 font-black">“∿ ประกาศ HARMONIC!”</span> ทันที
              </p>

              <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-200 space-y-2">
                <strong className="text-rose-300 text-base">🚨 ระวังเพื่อนจับได้!</strong>
                <p className="text-xs leading-relaxed text-slate-300">
                  ถ้าคุณลืมกดประกาศ HARMONIC แล้วผู้เล่นคนอื่นสังเกตเห็น และกดปุ่ม{' '}
                  <strong className="text-amber-300">“🚨 จับได้!”</strong>
                  คุณจะถูกปรับให้ <strong>จั่วไพ่เพิ่ม 2 ใบ</strong> ทันที!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-900/60 flex items-center justify-between">
          <span className="text-xs text-slate-400">คุณสามารถเปิดอ่านกติกานี้ได้ตลอดเวลาขณะเล่นเกม</span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95"
          >
            เข้าใจแล้ว เข้าสู่เกม 🚀
          </button>
        </div>
      </div>
    </div>
  );
};
