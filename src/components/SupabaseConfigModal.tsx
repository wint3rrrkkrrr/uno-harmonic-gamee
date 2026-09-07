import React, { useState } from 'react';
import {
  getSupabaseCredentials,
  saveCustomSupabaseCredentials,
  clearCustomSupabaseCredentials,
  isSupabaseConfigured,
  getSupabase,
} from '../utils/supabaseClient';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: () => void;
  onSaveSuccess?: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
  onSaveSuccess,
}) => {
  const currentCreds = getSupabaseCredentials();
  const [urlInput, setUrlInput] = useState(currentCreds.url);
  const [keyInput, setKeyInput] = useState(currentCreds.anonKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'CONFIG' | 'SQL' | 'NETLIFY_GUIDE'>('CONFIG');

  if (!isOpen) return null;

  const notifySaved = () => {
    if (typeof onConfigSaved === 'function') onConfigSaved();
    if (typeof onSaveSuccess === 'function') onSaveSuccess();
  };

  const handleTestAndSave = async () => {
    if (!urlInput.trim() || !keyInput.trim()) {
      setTestResult({
        success: false,
        msg: 'กรุณากรอก Supabase URL และ Anon Key ให้ครบถ้วน',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      saveCustomSupabaseCredentials(urlInput.trim(), keyInput.trim());
      const client = getSupabase();
      if (!client) {
        throw new Error('ไม่สามารถสร้าง Supabase Client ได้ กรุณาตรวจสอบ URL');
      }

      // Test query to rooms table or schema
      const { data, error } = await client.from('rooms').select('count').limit(1);

      if (error && error.code === '42P01') {
        // Table does not exist yet
        setTestResult({
          success: true,
          msg: 'เชื่อมต่อ Supabase สำเร็จแล้ว! แต่ยังไม่พบตาราง "rooms" กรุณาคัดลอก SQL ในแท็บ "📜 SQL Setup" ไปรันใน Supabase SQL Editor',
        });
        notifySaved();
      } else if (error) {
        setTestResult({
          success: false,
          msg: `เชื่อมต่อไม่สำเร็จ: ${error.message} (ตรวจสอบว่าใช้ Anon Key ไม่ใช่ Service Role Key)`,
        });
      } else {
        setTestResult({
          success: true,
          msg: '🎉 เชื่อมต่อ Supabase สำเร็จและพบตาราง rooms เรียบร้อยแล้ว!',
        });
        notifySaved();
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        msg: `เกิดข้อผิดพลาด: ${e.message || 'ตรวจสอบค่าที่กรอกอีกครั้ง'}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleClear = () => {
    clearCustomSupabaseCredentials();
    setUrlInput('');
    setKeyInput('');
    setTestResult({
      success: true,
      msg: 'ล้างค่าการเชื่อมต่อเรียบร้อยแล้ว',
    });
    notifySaved();
  };

  const sqlScript = `-- รันคำสั่งนี้ใน Supabase Dashboard -> SQL Editor -> New query
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT UNIQUE NOT NULL,
  host_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'LOBBY',
  version INTEGER NOT NULL DEFAULT 1,
  players JSONB NOT NULL DEFAULT '[]'::jsonb,
  state JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rooms_room_code ON public.rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all rooms" ON public.rooms;
CREATE POLICY "Allow anon all rooms" ON public.rooms
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.rooms REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'rooms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
  END IF;
END $$;`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl glass-panel-elevated border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-200 my-auto max-h-[95vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-slate-900/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide flex items-center gap-2">
                Supabase & Netlify Multiplayer Setup
                {isSupabaseConfigured() && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ✓ เชื่อมต่อแล้ว
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                ตั้งค่า Backend Database & Realtime สำหรับเกมออนไลน์ 2–6 คน
              </p>
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
        <div className="grid grid-cols-3 gap-1 p-2 bg-slate-950/60 border-b border-white/10 text-xs font-bold">
          <button
            onClick={() => setActiveTab('CONFIG')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'CONFIG'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚙️ ตั้งค่า API Key
          </button>
          <button
            onClick={() => setActiveTab('SQL')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'SQL'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📜 SQL Script
          </button>
          <button
            onClick={() => setActiveTab('NETLIFY_GUIDE')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'NETLIFY_GUIDE'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🚀 คู่มือ Deploy Netlify
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[65vh]">
          {/* ================= TAB 1: API CONFIG ================= */}
          {activeTab === 'CONFIG' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-cyan-300">
                  <span>💡 วิธีหาค่า Supabase URL และ Anon Key:</span>
                </p>
                <ol className="list-decimal pl-5 space-y-0.5 text-slate-300 text-[11px]">
                  <li>ไปที่เว็บไซต์ <strong>supabase.com</strong> แล้วสร้าง New Project</li>
                  <li>เข้าไปที่เมนู <strong>Project Settings</strong> (รูปฟันเฟือง) &gt; <strong>API</strong></li>
                  <li>คัดลอก <strong>Project URL</strong> และ <strong>anon / public key</strong> มาใส่ด้านล่าง</li>
                  <li className="text-amber-300 font-semibold">
                    * ห้ามใช้ service_role key ในหน้าเว็บเด็ดขาด ใช้เฉพาะ anon key เท่านั้น
                  </li>
                </ol>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  VITE_SUPABASE_URL:
                </label>
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://your-project-id.supabase.co"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  VITE_SUPABASE_ANON_KEY (Public Key):
                </label>
                <textarea
                  rows={3}
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold flex items-start gap-2 ${
                    testResult.success
                      ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-300'
                      : 'bg-rose-950/60 border border-rose-500/50 text-rose-300'
                  }`}
                >
                  <span>{testResult.success ? '✓' : '⚠️'}</span>
                  <span>{testResult.msg}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={handleTestAndSave}
                  disabled={testing}
                  className="flex-1 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-cyan-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {testing ? '⏳ กำลังทดสอบ...' : '💾 บันทึกและทดสอบการเชื่อมต่อ'}
                </button>
                <button
                  onClick={handleClear}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-white/10"
                >
                  ล้างค่า
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 2: SQL SCRIPT ================= */}
          {activeTab === 'SQL' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-300 font-bold">
                  SQL สำหรับสร้างตาราง rooms, RLS Policies, และเปิด Realtime:
                </p>
                <button
                  onClick={copySql}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
                >
                  <span>{copiedSql ? '✓ คัดลอกแล้ว!' : '📋 คัดลอก SQL'}</span>
                </button>
              </div>

              <pre className="p-3.5 rounded-2xl bg-slate-950 border border-white/10 text-cyan-300 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-72">
                {sqlScript}
              </pre>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 text-[11px] text-slate-400 space-y-1">
                <p className="font-bold text-white">📍 วิธีรันใน Supabase:</p>
                <ol className="list-decimal pl-5 space-y-0.5">
                  <li>เปิด Supabase Dashboard &gt; เลือกโปรเจกต์ของคุณ</li>
                  <li>คลิกแท็บ <strong>SQL Editor</strong> ที่เมนูด้านซ้าย</li>
                  <li>กด <strong>New query</strong> แล้ววางโค้ด SQL ด้านบน</li>
                  <li>กดปุ่มเขียว <strong>Run</strong> เพื่อรันคำสั่ง</li>
                </ol>
              </div>
            </div>
          )}

          {/* ================= TAB 3: NETLIFY DEPLOY GUIDE ================= */}
          {activeTab === 'NETLIFY_GUIDE' && (
            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 space-y-2">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <span className="text-cyan-400">🚀</span> ขั้นตอน Deploy ขึ้น Netlify
                </h3>
                <p className="text-slate-300 text-[11px]">
                  โปรเจกต์นี้ได้รับการตั้งค่าไฟล์ <code>netlify.toml</code> และ <code>public/_redirects</code> เรียบร้อยแล้ว พร้อมสำหรับ Deploy แบบ SPA
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-1">
                  <p className="font-bold text-cyan-300">1. การตั้งค่า Build บน Netlify:</p>
                  <ul className="list-disc pl-5 text-[11px] text-slate-300 space-y-0.5 font-mono">
                    <li>Build command: <span className="text-amber-300">npm run build</span></li>
                    <li>Publish directory: <span className="text-amber-300">dist</span></li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-1">
                  <p className="font-bold text-cyan-300">2. ตั้งค่า Environment Variables บน Netlify:</p>
                  <p className="text-[11px] text-slate-400">
                    ไปที่ <strong>Site configuration &gt; Environment variables</strong> แล้วเพิ่ม 2 ตัวแปร:
                  </p>
                  <div className="p-2.5 rounded-lg bg-slate-950 font-mono text-[11px] text-emerald-300 space-y-1">
                    <p>VITE_SUPABASE_URL = https://xxx.supabase.co</p>
                    <p>VITE_SUPABASE_ANON_KEY = eyJhbGciOi...</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-1">
                  <p className="font-bold text-cyan-300">3. กด Deploy Site</p>
                  <p className="text-[11px] text-slate-300">
                    เมื่อ Deploy เสร็จ เว็บไซต์ของคุณจะสามารถเล่น Multiplayer ได้แบบ Real-time พร้อมกัน 2–6 คน ทุกคนจะเห็นสถานะโต๊ะเดียวกันทันที!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-white/10 transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
