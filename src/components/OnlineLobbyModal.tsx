import React, { useState } from 'react';
import { OnlineRoomInfo, GameMode } from '../types/game';
import {
  Globe,
  Copy,
  Check,
  Crown,
  Bot,
  User,
  Plus,
  Play,
  LogOut,
  X,
  AlertTriangle,
  KeyRound,
  Users,
  Sparkles,
  Trophy,
  Skull,
} from 'lucide-react';

interface OnlineLobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomInfo: OnlineRoomInfo | null;
  localPlayer: { id: string; name: string; letter: string; isHost: boolean; isReady?: boolean } | null;
  selectedGameMode?: GameMode;
  onChangeGameMode?: (mode: GameMode) => void;
  onCreateRoom: (playerName: string, gameMode: GameMode) => void;
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
  selectedGameMode = 'FIND_WINNER',
  onChangeGameMode,
  onCreateRoom,
  onJoinRoom,
  onAddBot,
  onRemoveBot,
  onToggleReady,
  onStartGame,
  onLeaveRoom,
  errorMsg,
  onClearError,
}) => {
  const [tab, setTab] = useState<'CREATE' | 'JOIN'>('CREATE');
  const [nameInput, setNameInput] = useState('นักฟิสิกส์ 1');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [createMode, setCreateMode] = useState<GameMode>(selectedGameMode || 'FIND_WINNER');

  if (!isOpen) return null;

  const handleCopyRoomCode = () => {
    if (!roomInfo) return;
    navigator.clipboard.writeText(roomInfo.roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHost = localPlayer?.isHost || false;
  const activeRoomMode = roomInfo?.gameMode || selectedGameMode || 'FIND_WINNER';
  const humanGuests = roomInfo?.players.filter((p) => !p.isHost && !p.isBot) || [];
  const unreadyGuests = humanGuests.filter((p) => !p.isReady);
  const unreadyCount = unreadyGuests.length;
  const allGuestsReady = unreadyCount === 0;
  const hasEnoughPlayers = (roomInfo?.players.length ?? 0) >= 2;
  const canStart = isHost && hasEnoughPlayers && allGuestsReady;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xl p-4 overflow-y-auto animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg glass-panel-elevated border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-200">
        {/* Holographic Top Glow */}
        <div className="h-1.5 bg-gradient-to-r from-cyan-400 via-indigo-500 to-emerald-400" />

        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 bg-slate-900/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-md">
              <Globe className="w-5 h-5 text-cyan-300 animate-pulse" />
            </div>
            <div className="text-left">
              <h2 className="text-base sm:text-lg font-black text-white tracking-wide flex items-center gap-2">
                <span>{roomInfo ? `ห้องเล่นออนไลน์: ${roomInfo.roomId}` : 'เล่นออนไลน์ (Multiplayer)'}</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {roomInfo ? 'รอผู้เล่นพร้อม แล้วกดเริ่มเกม' : 'สร้างห้องใหม่หรือกรอกรหัสห้องเพื่อเข้าร่วม'}
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

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-bold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={onClearError} className="text-rose-400 hover:text-white ml-2 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ================= VIEW 1: NOT IN ROOM YET (CREATE / JOIN) ================= */}
        {!roomInfo ? (
          <div className="p-6 space-y-5">
            {/* Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-950/70 border border-white/10">
              <button
                onClick={() => setTab('CREATE')}
                className={`py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tab === 'CREATE'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>สร้างห้องใหม่</span>
              </button>
              <button
                onClick={() => setTab('JOIN')}
                className={`py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tab === 'JOIN'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>ใส่รหัสเข้าห้อง</span>
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 text-left">
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
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950/70 border border-white/15 focus:border-cyan-400 focus:outline-none text-white font-bold text-sm shadow-inner"
                />
              </div>

              {tab === 'CREATE' && (
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-bold text-slate-300">
                    กติกาการจบเกม (GAME MODE):
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCreateMode('FIND_WINNER')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        createMode === 'FIND_WINNER'
                          ? 'border-cyan-400 bg-cyan-950/70 shadow-lg ring-1 ring-cyan-400/40 text-white'
                          : 'border-white/10 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 font-black text-xs">
                          <Trophy className={`w-3.5 h-3.5 ${createMode === 'FIND_WINNER' ? 'text-amber-300' : 'text-slate-400'}`} />
                          <span>ใครหมดก่อนชนะ</span>
                        </div>
                        {createMode === 'FIND_WINNER' && (
                          <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        )}
                      </div>
                      <p className="text-[10px] leading-tight text-slate-400">
                        First to Finish: คนแรกที่ทิ้งไพ่หมดมือคือผู้ชนะ
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCreateMode('FIND_LOSER')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        createMode === 'FIND_LOSER'
                          ? 'border-rose-400 bg-rose-950/70 shadow-lg ring-1 ring-rose-400/40 text-white'
                          : 'border-white/10 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 font-black text-xs">
                          <Skull className={`w-3.5 h-3.5 ${createMode === 'FIND_LOSER' ? 'text-rose-400' : 'text-slate-400'}`} />
                          <span>คนสุดท้ายแพ้</span>
                        </div>
                        {createMode === 'FIND_LOSER' && (
                          <span className="w-2 h-2 rounded-full bg-rose-400" />
                        )}
                      </div>
                      <p className="text-[10px] leading-tight text-slate-400">
                        Last Man Standing: เล่นจนเหลือคนสุดท้ายเป็นผู้แพ้
                      </p>
                    </button>
                  </div>
                </div>
              )}

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
                    className="w-full px-4 py-3 rounded-2xl bg-slate-950/70 border border-white/15 focus:border-cyan-400 focus:outline-none text-cyan-300 font-mono font-black text-lg tracking-widest text-center uppercase shadow-inner"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              {tab === 'CREATE' ? (
                <button
                  onClick={() => onCreateRoom(nameInput, createMode)}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>สร้างห้องและรับรหัสชวนเพื่อน</span>
                </button>
              ) : (
                <button
                  onClick={() => onJoinRoom(roomCodeInput, nameInput)}
                  disabled={roomCodeInput.trim().length < 4}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>เข้าร่วมห้องทันที</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ================= VIEW 2: INSIDE LOBBY ================= */
          <div className="p-6 space-y-5">
            {/* Room Code Showcase Box */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-950/90 to-cyan-950/40 border-2 border-cyan-400/40 text-center space-y-2.5 shadow-xl">
              <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-300 font-bold">
                รหัสห้องสำหรับส่งให้เพื่อน (ROOM CODE)
              </span>
              <div className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-white drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]">
                {roomInfo.roomId}
              </div>
              <div className="pt-1">
                <button
                  onClick={handleCopyRoomCode}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'คัดลอกรหัสแล้ว!' : 'คัดลอกรหัสห้อง'}</span>
                </button>
              </div>
            </div>

            {/* Room Game Mode Selector / Indicator */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 text-left space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>กติกาการจบเกม (GAME MODE):</span>
                </span>
                {isHost ? (
                  <span className="text-[10px] text-cyan-300 font-mono font-normal">หัวหน้าห้องปรับได้</span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-mono font-normal">กำหนดโดยหัวหน้าห้อง</span>
                )}
              </div>

              {isHost ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onChangeGameMode && onChangeGameMode('FIND_WINNER')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      activeRoomMode === 'FIND_WINNER'
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md font-black'
                        : 'bg-slate-900/80 text-slate-400 border-white/10 hover:text-white'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>ใครหมดก่อนชนะ (Winner)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeGameMode && onChangeGameMode('FIND_LOSER')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      activeRoomMode === 'FIND_LOSER'
                        ? 'bg-rose-500 text-white border-rose-400 shadow-md font-black'
                        : 'bg-slate-900/80 text-slate-400 border-white/10 hover:text-white'
                    }`}
                  >
                    <Skull className="w-3.5 h-3.5" />
                    <span>คนสุดท้ายแพ้ (Loser)</span>
                  </button>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {activeRoomMode === 'FIND_LOSER' ? (
                      <Skull className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Trophy className="w-4 h-4 text-amber-400" />
                    )}
                    <span className="text-xs font-bold text-white">
                      {activeRoomMode === 'FIND_LOSER'
                        ? 'โหมดผู้เหลือไพ่คนสุดท้าย (Last Man Standing)'
                        : 'โหมดใครหมดก่อนชนะ (First to Finish)'}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold ${
                    activeRoomMode === 'FIND_LOSER'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  }`}>
                    {activeRoomMode === 'FIND_LOSER' ? 'LOSER' : 'WINNER'}
                  </span>
                </div>
              )}
            </div>

            {/* Players List in Room */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ผู้เล่นในห้อง ({roomInfo.players.length}/6 คน):</span>
                </span>
                {isHost && roomInfo.players.length < 6 && (
                  <button
                    onClick={onAddBot}
                    className="text-xs text-cyan-300 hover:text-cyan-200 font-bold flex items-center gap-1 cursor-pointer bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-400/30"
                  >
                    <Plus className="w-3 h-3" />
                    <span>เพิ่มบอทช่วยเล่น</span>
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
                          ? 'border-cyan-400/80 bg-cyan-950/50 shadow-md'
                          : 'border-white/10 bg-slate-950/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white font-mono font-black flex items-center justify-center text-xs shadow-md">
                          {p.letter}
                        </span>
                        <div className="text-left">
                          <div className="font-bold text-sm text-white flex items-center gap-1.5">
                            <span>{p.name}</span>
                            {isMe && (
                              <span className="text-[10px] text-cyan-300 font-mono">(คุณ)</span>
                            )}
                            {p.isHost && (
                              <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full font-bold flex items-center gap-1">
                                <Crown className="w-3 h-3 text-amber-400" />
                                <span>หัวหน้าห้อง</span>
                              </span>
                            )}
                            {p.isBot && (
                              <span className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full font-bold flex items-center gap-1">
                                <Bot className="w-3 h-3 text-purple-300" />
                                <span>BOT</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] flex items-center gap-1.5 mt-0.5">
                            {p.isBot ? (
                              <span className="text-purple-300 font-bold">🤖 บอทพร้อมเล่น</span>
                            ) : p.isHost ? (
                              <span className="text-amber-300 font-bold">👑 พร้อมเริ่มเมื่อเพื่อนครบ</span>
                            ) : p.isReady ? (
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>พร้อมแล้ว (READY)</span>
                              </span>
                            ) : (
                              <span className="text-amber-400/90 font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                                <span>กำลังรอเพื่อนกดพร้อม...</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Remove Bot button */}
                      {isHost && p.isBot && (
                        <button
                          onClick={() => onRemoveBot(p.id)}
                          className="text-xs text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded-lg hover:bg-rose-950/40 cursor-pointer border border-rose-500/20"
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
            <div className="pt-2 space-y-3">
              {isHost ? (
                <>
                  <button
                    onClick={onStartGame}
                    disabled={!canStart}
                    className={`w-full py-3.5 font-black text-sm rounded-2xl shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      canStart
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-slate-800 text-slate-500 border border-white/10 opacity-70 cursor-not-allowed'
                    }`}
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>
                      {canStart
                        ? `เริ่มเล่นเกมทันที (${roomInfo.players.length} คน) ✅`
                        : !hasEnoughPlayers
                        ? 'ต้องการผู้เล่นอย่างน้อย 2 คน'
                        : `รอเพื่อนกดพร้อมเล่น (ยังไม่พร้อมอีก ${unreadyCount} คน)`}
                    </span>
                  </button>

                  {!canStart && (
                    <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-200 text-center font-medium leading-relaxed">
                      {!hasEnoughPlayers ? (
                        <span>
                          * ต้องการผู้เล่นอย่างน้อย 2 คนขึ้นไป สามารถกดปุ่ม{' '}
                          <b className="text-cyan-300 font-bold">+ เพิ่มบอทช่วยเล่น</b> ด้านบนได้
                        </span>
                      ) : (
                        <span>
                          * รอให้เพื่อนทุกคนกดปุ่ม <b className="text-emerald-300 font-bold">"กดพร้อมเล่น"</b> ให้ครบก่อน จึงจะเริ่มเกมได้
                          {unreadyGuests.length > 0 && (
                            <span className="block mt-1 font-bold text-amber-300">
                              (ผู้เล่นที่ยังไม่กดพร้อม: {unreadyGuests.map((u) => u.name).join(', ')})
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center space-y-2.5">
                  <div
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all ${
                      localPlayer?.isReady
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200 shadow-md'
                        : 'bg-amber-950/60 border-amber-500/50 text-amber-200 animate-pulse'
                    }`}
                  >
                    {localPlayer?.isReady ? (
                      <div className="flex items-center justify-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>คุณกดพร้อมแล้ว! กำลังรอหัวหน้าห้องกดเริ่มเกม...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <span>กรุณากดปุ่ม "กดพร้อมเล่น" เพื่อให้หัวหน้าห้องสามารถเริ่มเกมได้</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={onToggleReady}
                    className={`w-full py-3.5 font-black text-sm rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 ${
                      localPlayer?.isReady
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/20'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/40 animate-pulse'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>{localPlayer?.isReady ? 'ยกเลิกความพร้อม' : 'กดพร้อมเล่น (READY)'}</span>
                  </button>
                </div>
              )}

              {onLeaveRoom && (
                <button
                  onClick={onLeaveRoom}
                  className="w-full py-2.5 bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 font-bold text-xs rounded-xl border border-white/10 hover:border-rose-500/30 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>ออกจากห้อง</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
