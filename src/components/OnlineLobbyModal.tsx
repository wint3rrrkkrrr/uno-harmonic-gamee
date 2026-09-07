import React, { useState } from 'react';
import { OnlineRoomInfo, RoomPlayer } from '../types/game';

interface OnlineLobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomInfo: OnlineRoomInfo | null;
  localPlayer: { id: string; name: string; letter: string; isHost: boolean; isReady?: boolean } | null;
  onCreateRoom: (playerName: string) => void;
  onJoinRoom: (roomId: string, playerName: string) => void;
  onAddBot: () => void;
  onRemoveBot: (botId: string) => void;
  onToggleReady: () => void;
  onStartGame: () => void;
  onLeaveRoom?: () => void;
  onOpenSupabaseConfig?: () => void;
  isSupabaseReady?: boolean;
  isConnected: boolean;
  errorMsg: string | null;
  onClearError: () => void;
}

export const OnlineLobbyModal: React.FC<OnlineLobbyModalProps> = ({
  isOpen,
  onClose,
  roomInfo,
  localPlayer,
  onCreateRoom,
  onJoinRoom,
  onAddBot,
  onRemoveBot,
  onToggleReady,
  onStartGame,
  onLeaveRoom,
  onOpenSupabaseConfig,
  isSupabaseReady = false,
  isConnected,
  errorMsg,
  onClearError,
}) => {
  const [tab, setTab] = useState<'CREATE' | 'JOIN'>('CREATE');
  const [nameInput, setNameInput] = useState('นักฟิสิกส์ 1');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyRoomCode = () => {
    if (!roomInfo) return;
    navigator.clipboard.writeText(roomInfo.roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHost = localPlayer?.isHost || false;
  const canStart = (roomInfo?.players.length ?? 0) >= 2 && isHost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg glass-panel-elevated border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl text-cyan-400 font-bold drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">🌐</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                {roomInfo ? `ห้องเล่นออนไลน์: ${roomInfo.roomId}` : 'เล่นออนไลน์กับเพื่อน (Multiplayer)'}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {roomInfo ? 'รอผู้เล่นพร้อม แล้วกดเริ่มเกม' : 'สร้างห้องใหม่หรือใส่รหัสห้องเพื่อเข้าเล่น'}
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

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-bold flex items-center justify-between animate-in fade-in">
            <span>⚠️ {errorMsg}</span>
            <button onClick={onClearError} className="text-rose-400 hover:text-white ml-2 text-sm font-bold">
              ✕
            </button>
          </div>
        )}

        {/* ================= VIEW 1: NOT IN ROOM YET (CREATE / JOIN) ================= */}
        {!roomInfo ? (
          <div className="p-6 space-y-5">
            {/* Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-950/60 border border-white/10">
              <button
                onClick={() => setTab('CREATE')}
                className={`py-2.5 rounded-xl font-black text-xs transition-all ${
                  tab === 'CREATE'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ➕ สร้างห้องใหม่
              </button>
              <button
                onClick={() => setTab('JOIN')}
                className={`py-2.5 rounded-xl font-black text-xs transition-all ${
                  tab === 'JOIN'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🔑 ใส่รหัสเข้าห้อง
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  ชื่อของคุณในเกม:
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="พิมพ์ชื่อของคุณ..."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950/70 border border-white/10 focus:border-cyan-400 focus:outline-none text-white font-bold text-sm shadow-inner"
                />
              </div>

              {tab === 'JOIN' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    รหัสห้อง (Room Code 6 หลัก):
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                    placeholder="เช่น ABC123"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-950/70 border border-white/10 focus:border-cyan-400 focus:outline-none text-cyan-300 font-mono font-black text-lg tracking-widest text-center uppercase shadow-inner"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-3">
              {tab === 'CREATE' ? (
                <button
                  onClick={() => onCreateRoom(nameInput)}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  🚀 สร้างห้องและรับรหัสชวนเพื่อน
                </button>
              ) : (
                <button
                  onClick={() => onJoinRoom(roomCodeInput, nameInput)}
                  disabled={roomCodeInput.trim().length < 4}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  🔑 เข้าร่วมห้องทันที
                </button>
              )}

              {onOpenSupabaseConfig && (
                <button
                  type="button"
                  onClick={onOpenSupabaseConfig}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-400 hover:text-white text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <span className="text-amber-400">⚡</span>
                  <span>
                    {isSupabaseReady
                      ? 'Backend: Supabase เชื่อมต่ออยู่ (ดูการตั้งค่า)'
                      : 'คลิกเพื่อตั้งค่า Supabase URL & Key'}
                  </span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ================= VIEW 2: INSIDE LOBBY ================= */
          <div className="p-6 space-y-5">
            {/* Room Code Showcase Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950/90 to-cyan-950/40 border-2 border-cyan-400/40 text-center space-y-2 shadow-xl">
              <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-300 font-bold">
                รหัสห้องสำหรับส่งให้เพื่อน (ROOM CODE)
              </span>
              <div className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-white drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]">
                {roomInfo.roomId}
              </div>
              <div className="pt-1">
                <button
                  onClick={handleCopyRoomCode}
                  className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-transform hover:scale-105 active:scale-95"
                >
                  {copied ? '✅ คัดลอกรหัสแล้ว!' : '📋 คัดลอกรหัสห้อง'}
                </button>
              </div>
            </div>

            {/* Players List in Room */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
                <span>ผู้เล่นในห้อง ({roomInfo.players.length}/6 คน):</span>
                {isHost && roomInfo.players.length < 6 && (
                  <button
                    onClick={onAddBot}
                    className="text-[11px] text-cyan-300 hover:text-cyan-200 underline font-bold"
                  >
                    + เพิ่มบอทช่วยเล่น
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {roomInfo.players.map((p) => {
                  const isMe = p.id === localPlayer?.id;
                  return (
                    <div
                      key={p.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                        isMe
                          ? 'border-cyan-400/80 bg-cyan-950/40 shadow-md'
                          : 'border-white/10 bg-slate-950/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-mono font-black flex items-center justify-center text-xs shadow-md">
                          {p.letter}
                        </span>
                        <div>
                          <div className="font-bold text-sm text-white flex items-center gap-1.5">
                            <span>{p.name}</span>
                            {isMe && (
                              <span className="text-[10px] text-cyan-300 font-mono">(คุณ)</span>
                            )}
                            {p.isHost && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full font-bold">
                                👑 หัวหน้าห้อง
                              </span>
                            )}
                            {p.isBot && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full font-bold">
                                BOT
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {p.isBot ? 'บอทอัตโนมัติ' : p.isReady ? '🟢 พร้อมแล้ว' : '🟡 กำลังรอ...'}
                          </div>
                        </div>
                      </div>

                      {/* Remove Bot action for host */}
                      {isHost && p.isBot && (
                        <button
                          onClick={() => onRemoveBot(p.id)}
                          className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded-lg hover:bg-rose-950/40"
                        >
                          ลบ
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 space-y-2">
              {isHost ? (
                <>
                  <button
                    onClick={onStartGame}
                    disabled={!canStart}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    🚀 เริ่มเล่นเกมทันที ({roomInfo.players.length} คน)
                  </button>
                  {!canStart && (
                    <p className="text-[11px] text-amber-300/90 text-center font-medium">
                      * ต้องมีผู้เล่นอย่างน้อย 2 คนขึ้นไป (สามารถกดปุ่ม "เพิ่มบอทช่วยเล่น" ได้)
                    </p>
                  )}
                </>
              ) : (
                <div className="text-center py-2 space-y-2">
                  <div className="text-xs text-cyan-300 font-bold animate-pulse">
                    ⏳ กำลังรอหัวหน้าห้องกดเริ่มเกม...
                  </div>
                  <button
                    onClick={onToggleReady}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-transform hover:scale-105"
                  >
                    {localPlayer?.isReady ? 'ยกเลิกความพร้อม' : 'กดพร้อมเล่น ✅'}
                  </button>
                </div>
              )}

              {onLeaveRoom && (
                <button
                  onClick={onLeaveRoom}
                  className="w-full py-2 bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 font-bold text-xs rounded-xl border border-white/10 hover:border-rose-500/30 transition-colors"
                >
                  🚪 ออกจากห้อง
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
