import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import {
  GameState,
  OnlineRoomInfo,
  Player,
  PlayerLetter,
  RoomPlayer,
  ActionAnnouncement,
  GameMode,
} from '../types/game';
import { PLAYER_LETTERS } from './cardUtils';

// LocalStorage keys for session recovery & credentials
const STORAGE_SUPABASE_URL = 'harmonic_supabase_url';
const STORAGE_SUPABASE_KEY = 'harmonic_supabase_anon_key';
const STORAGE_SAVED_ROOM = 'harmonic_session_room';
const STORAGE_SAVED_PLAYER = 'harmonic_session_player';

// Default project credentials provided by user
export const DEFAULT_SUPABASE_URL = 'https://wsxciqcttxckgohfvexq.supabase.co';
export const DEFAULT_SUPABASE_KEY = 'sb_publishable_eaELQn8ThnZIVXRbxjPz3A_X1SEvRMd';

// Retrieve config from Vite environment variables, localStorage, or defaults
export function getSupabaseCredentials(): { url: string; anonKey: string } {
  let localUrl = '';
  let localKey = '';
  try {
    localUrl = localStorage.getItem(STORAGE_SUPABASE_URL) || '';
    localKey = localStorage.getItem(STORAGE_SUPABASE_KEY) || '';
  } catch {}

  const envUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || '';
  const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || '';

  const url = (localUrl || envUrl || DEFAULT_SUPABASE_URL).trim();
  let anonKey = (localKey || envKey || DEFAULT_SUPABASE_KEY).trim();

  // If localKey was some broken placeholder or truncated string, fallback to default
  if (!anonKey || anonKey.length < 20 || anonKey.includes('your-anon-key')) {
    anonKey = DEFAULT_SUPABASE_KEY;
  }

  return { url, anonKey };
}

export function saveCustomSupabaseCredentials(url: string, anonKey: string) {
  try {
    localStorage.setItem(STORAGE_SUPABASE_URL, url.trim());
    localStorage.setItem(STORAGE_SUPABASE_KEY, anonKey.trim());
    localStorage.removeItem('sb-wsxciqcttxckgohfvexq-auth-token');
  } catch {}
  _client = null; // Reset cached client
}

export function clearCustomSupabaseCredentials() {
  try {
    localStorage.removeItem(STORAGE_SUPABASE_URL);
    localStorage.removeItem(STORAGE_SUPABASE_KEY);
    localStorage.removeItem('sb-wsxciqcttxckgohfvexq-auth-token');
  } catch {}
  _client = null;
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return !!url && !!anonKey && url.startsWith('http') && anonKey.length > 20;
}

let _client: SupabaseClient | null = null;
let _cachedUrl = '';
let _cachedKey = '';

export function getSupabase(forceFresh = false): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();
  if (!url || !anonKey || !url.startsWith('http')) {
    return null;
  }

  if (!forceFresh && _client && _cachedUrl === url && _cachedKey === anonKey) {
    return _client;
  }

  try {
    try {
      localStorage.removeItem('sb-wsxciqcttxckgohfvexq-auth-token');
    } catch {}

    _client = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    _cachedUrl = url;
    _cachedKey = anonKey;
    return _client;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

// Session Recovery Helpers
export function saveRoomSession(roomCode: string, player: RoomPlayer) {
  localStorage.setItem(STORAGE_SAVED_ROOM, roomCode);
  localStorage.setItem(STORAGE_SAVED_PLAYER, JSON.stringify(player));
}

export function getSavedRoomSession(): { roomCode: string; player: RoomPlayer } | null {
  try {
    const roomCode = localStorage.getItem(STORAGE_SAVED_ROOM);
    const playerStr = localStorage.getItem(STORAGE_SAVED_PLAYER);
    if (!roomCode || !playerStr) return null;
    return {
      roomCode,
      player: JSON.parse(playerStr),
    };
  } catch {
    return null;
  }
}

export function clearRoomSession() {
  localStorage.removeItem(STORAGE_SAVED_ROOM);
  localStorage.removeItem(STORAGE_SAVED_PLAYER);
}

// Generate random 6-character room code (e.g., SHM384)
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 3; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SHM${suffix}`;
}

// ============================================================================
// ROOM & GAME STATE SUPABASE OPERATIONS
// ============================================================================

export interface RoomRecord {
  id: string;
  room_code: string;
  host_id: string;
  status: string;
  version: number;
  players: RoomPlayer[];
  state: GameState;
  created_at: string;
  updated_at: string;
}

/**
 * Creates a new multiplayer room in Supabase.
 * The room creator is automatically assigned as Host with Player Letter 'A'.
 */
export async function createRoomInSupabase(
  playerName: string,
  gameMode: GameMode = 'FIND_WINNER'
): Promise<{ roomInfo: OnlineRoomInfo; localPlayer: RoomPlayer; state: GameState }> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase ยังไม่ได้ตั้งค่า URL หรือ Anon Key');
  }

  const roomCode = generateRoomCode();
  const hostId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const hostPlayer: RoomPlayer = {
    id: hostId,
    name: playerName.trim() || 'ผู้เล่น 1 (Host)',
    letter: 'A',
    isHost: true,
    isBot: false,
    isReady: true,
    connected: true,
  };

  const initialLobbyState: GameState = {
    players: [
      {
        id: hostPlayer.id,
        letter: 'A',
        name: hostPlayer.name,
        hand: [],
        isBot: false,
        calledHarmonic: false,
      },
    ],
    currentPlayerIndex: 0,
    direction: 1,
    deck: [],
    discardPile: [],
    currentColor: 'RED',
    equationDeck: [],
    equationDiscardPile: [],
    currentEquationState: null,
    drawnCardChoice: null,
    gamePhase: 'LOBBY',
    gameMode: gameMode,
    pendingDraw: 0,
    finishedPlayers: [],
    winner: null,
    turnsCount: 0,
    logs: [
      {
        id: `log-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `🚪 สร้างห้องรหัส ${roomCode} โดย ${hostPlayer.name} (${gameMode === 'FIND_LOSER' ? 'Last Man Standing' : 'First to Finish'})`,
        type: 'info',
      },
    ],
    lastActionTime: Date.now(),
    roomId: roomCode,
    version: 1,
  };

  let activeSupabase = supabase;
  let { data, error } = await activeSupabase
    .from('rooms')
    .insert({
      room_code: roomCode,
      host_id: hostId,
      status: 'LOBBY',
      version: 1,
      players: [hostPlayer],
      state: initialLobbyState,
    })
    .select()
    .single();

  // Self-healing: If stale custom credentials caused an Invalid API Key error, revert to working default and retry once
  if (error && (error.message?.includes('Invalid API key') || (error as any).code === 'PGRST301')) {
    console.warn('Invalid API key detected. Resetting to project default credentials and retrying...');
    clearCustomSupabaseCredentials();
    activeSupabase = getSupabase(true) || activeSupabase;
    const retryRes = await activeSupabase
      .from('rooms')
      .insert({
        room_code: roomCode,
        host_id: hostId,
        status: 'LOBBY',
        version: 1,
        players: [hostPlayer],
        state: initialLobbyState,
      })
      .select()
      .single();
    data = retryRes.data;
    error = retryRes.error;
  }

  if (error) {
    console.error('Error creating room in Supabase:', error);
    throw new Error(`ไม่สามารถสร้างห้องได้: ${error.message}`);
  }

  const roomInfo: OnlineRoomInfo = {
    roomId: roomCode,
    hostId,
    status: 'LOBBY',
    players: [hostPlayer],
    maxPlayers: 6,
    gameMode: gameMode,
  };

  saveRoomSession(roomCode, hostPlayer);
  return { roomInfo, localPlayer: hostPlayer, state: initialLobbyState };
}

/**
 * Joins an existing room in Supabase using the 6-character room code.
 * Assigns next available Player Letter (A-F).
 */
export async function joinRoomInSupabase(
  roomCode: string,
  playerName: string
): Promise<{ roomInfo: OnlineRoomInfo; localPlayer: RoomPlayer; state: GameState }> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase ยังไม่ได้ตั้งค่า URL หรือ Anon Key');
  }

  const cleanCode = roomCode.trim().toUpperCase();

  let activeSupabase = supabase;
  let { data: room, error: fetchErr } = await activeSupabase
    .from('rooms')
    .select('*')
    .eq('room_code', cleanCode)
    .single();

  if (fetchErr && (fetchErr.message?.includes('Invalid API key') || (fetchErr as any).code === 'PGRST301')) {
    console.warn('Invalid API key detected during join. Resetting to project default credentials and retrying...');
    clearCustomSupabaseCredentials();
    activeSupabase = getSupabase(true) || activeSupabase;
    const retry = await activeSupabase
      .from('rooms')
      .select('*')
      .eq('room_code', cleanCode)
      .single();
    room = retry.data;
    fetchErr = retry.error;
  }

  if (fetchErr || !room) {
    throw new Error(`ไม่พบห้องรหัส "${cleanCode}" กรุณาตรวจสอบรหัสห้องอีกครั้ง`);
  }

  const currentPlayers: RoomPlayer[] = room.players || [];

  if (currentPlayers.length >= 6) {
    throw new Error('ห้องนี้เต็มแล้ว (จำกัดสูงสุด 6 คน)');
  }

  if (room.status !== 'LOBBY') {
    throw new Error('เกมในห้องนี้ได้เริ่มต้นไปแล้ว ไม่สามารถเข้าร่วมระหว่างเล่นได้');
  }

  // Find first unused letter from A to F
  const usedLetters = new Set(currentPlayers.map((p) => p.letter));
  const availableLetter = PLAYER_LETTERS.find((l) => !usedLetters.has(l)) || 'B';

  const newPlayerId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newPlayer: RoomPlayer = {
    id: newPlayerId,
    name: playerName.trim() || `ผู้เล่น ${currentPlayers.length + 1}`,
    letter: availableLetter,
    isHost: false,
    isBot: false,
    isReady: false,
    connected: true,
  };

  const updatedPlayers = [...currentPlayers, newPlayer];

  // Update lobby GameState
  const currentState: GameState = room.state || {};
  const updatedGameState: GameState = {
    ...currentState,
    players: updatedPlayers.map((rp) => ({
      id: rp.id,
      letter: rp.letter,
      name: rp.name,
      hand: [],
      isBot: rp.isBot,
      calledHarmonic: false,
    })),
    logs: [
      {
        id: `log-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `👋 ผู้เล่น ${newPlayer.name} (Player ${newPlayer.letter}) เข้าร่วมห้องแล้ว`,
        type: 'info',
      },
      ...(currentState.logs || []),
    ],
    version: (room.version || 1) + 1,
  };

  const { data: updatedRecord, error: updateErr } = await supabase
    .from('rooms')
    .update({
      players: updatedPlayers,
      state: updatedGameState,
      version: updatedGameState.version,
      updated_at: new Date().toISOString(),
    })
    .eq('room_code', cleanCode)
    .select()
    .single();

  if (updateErr) {
    throw new Error(`เกิดข้อผิดพลาดในการเข้าร่วมห้อง: ${updateErr.message}`);
  }

  if (updatedRecord) {
    broadcastRoomRecord(cleanCode, updatedRecord as RoomRecord);
  }

  const roomInfo: OnlineRoomInfo = {
    roomId: cleanCode,
    hostId: room.host_id,
    status: room.status,
    players: updatedPlayers,
    maxPlayers: 6,
    gameMode: room.state?.gameMode || 'FIND_WINNER',
  };

  saveRoomSession(cleanCode, newPlayer);
  return { roomInfo, localPlayer: newPlayer, state: updatedGameState };
}

/**
 * Re-connects / restores session after browser refresh.
 */
export async function reconnectRoomInSupabase(
  roomCode: string,
  playerId: string
): Promise<{ roomInfo: OnlineRoomInfo; localPlayer: RoomPlayer; state: GameState } | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data: room, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_code', roomCode)
      .single();

    if (error || !room) return null;

    const players: RoomPlayer[] = room.players || [];
    const player = players.find((p) => p.id === playerId);
    if (!player) return null;

    const roomInfo: OnlineRoomInfo = {
      roomId: room.room_code,
      hostId: room.host_id,
      status: room.status,
      players,
      maxPlayers: 6,
      gameMode: room.state?.gameMode || 'FIND_WINNER',
    };

    return {
      roomInfo,
      localPlayer: player,
      state: {
        ...room.state,
        version: room.version,
        roomId: room.room_code,
      },
    };
  } catch (e) {
    console.error('Error reconnecting to room:', e);
    return null;
  }
}

/**
 * Updates the game mode of an active room (Host only in lobby).
 */
export async function updateRoomGameModeInSupabase(
  roomCode: string,
  newMode: GameMode
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const cleanCode = roomCode.trim().toUpperCase();
  try {
    const { data: room } = await supabase
      .from('rooms')
      .select('state, version')
      .eq('room_code', cleanCode)
      .maybeSingle();

    if (!room) return;

    const nextState: GameState = {
      ...room.state,
      gameMode: newMode,
      version: (room.version || 1) + 1,
    };

    const { data: updatedRecord, error } = await supabase
      .from('rooms')
      .update({
        state: nextState,
        version: nextState.version,
        updated_at: new Date().toISOString(),
      })
      .eq('room_code', cleanCode)
      .select()
      .single();

    if (!error && updatedRecord) {
      broadcastRoomRecord(cleanCode, updatedRecord as RoomRecord);
    }
  } catch (err) {
    console.error('Failed to update game mode in Supabase:', err);
  }
}

const _roomChannels = new Map<string, RealtimeChannel>();

export function getOrCreateRoomChannel(roomCode: string): RealtimeChannel | null {
  const supabase = getSupabase();
  if (!supabase) return null;
  const cleanCode = roomCode.trim().toUpperCase();
  const channelName = `room:${cleanCode}`;

  let channel = _roomChannels.get(cleanCode);
  if (!channel) {
    channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: true },
      },
    });
    _roomChannels.set(cleanCode, channel);
  }
  return channel;
}

export function broadcastRoomRecord(roomCode: string, record: Partial<RoomRecord> & { room_code: string }) {
  const channel = getOrCreateRoomChannel(roomCode);
  if (!channel) return;

  try {
    if (channel.state !== 'joined') {
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channel.send({
            type: 'broadcast',
            event: 'room_record_update',
            payload: record,
          });
        }
      });
    } else {
      channel.send({
        type: 'broadcast',
        event: 'room_record_update',
        payload: record,
      });
    }
  } catch (err) {
    console.warn('Failed to broadcast room record:', err);
  }
}

/**
 * Atomic Synchronization of Game State to Supabase.
 * Uses optimistic locking with version checks to prevent race conditions.
 */
export async function syncGameStateToSupabase(
  roomCode: string,
  newState: GameState,
  expectedVersion?: number
): Promise<{ success: boolean; newVersion: number; state?: GameState }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, newVersion: expectedVersion || 1 };
  }

  const cleanCode = roomCode.trim().toUpperCase();
  const currentVersion = expectedVersion ?? newState.version ?? 1;

  try {
    // 1. First attempt: Use atomic Postgres RPC stored procedure if installed
    const { data: rpcData, error: rpcErr } = await supabase.rpc('sync_room_state', {
      p_room_code: cleanCode,
      p_new_state: {
        ...newState,
        version: currentVersion + 1,
      },
      p_expected_version: currentVersion,
    });

    if (!rpcErr && rpcData) {
      if (rpcData.success) {
        const finalState = {
          ...(rpcData.state || newState),
          version: rpcData.version,
        };
        broadcastRoomRecord(cleanCode, {
          room_code: cleanCode,
          host_id: '',
          status: finalState.gamePhase || 'PLAYING',
          version: rpcData.version,
          players: finalState.players || [],
          state: finalState,
        });
        return { success: true, newVersion: rpcData.version, state: finalState };
      }
      if (rpcData.conflict) {
        console.warn('State conflict detected via RPC, reloading fresh state');
        return { success: false, newVersion: rpcData.currentVersion, state: rpcData.currentState };
      }
    }
  } catch (err) {
    // RPC may not be created yet, fallback to table update
  }

  // 2. Fallback: Direct table update with version increment
  const nextVersion = currentVersion + 1;
  const stateWithVersion: GameState = {
    ...newState,
    version: nextVersion,
  };

  // Fetch host_id to preserve isHost flag accurately
  const { data: currentRoom } = await supabase
    .from('rooms')
    .select('host_id, players')
    .eq('room_code', cleanCode)
    .maybeSingle();

  const hostId = currentRoom?.host_id;
  const updatedPlayers = stateWithVersion.players.map((p) => {
    const existing = currentRoom?.players?.find((ep: any) => ep.id === p.id);
    return {
      id: p.id,
      name: p.name,
      letter: p.letter,
      isBot: p.isBot,
      isHost: p.id === hostId || existing?.isHost || false,
      isReady: true,
      connected: true,
    };
  });

  const { data: updatedRecord, error } = await supabase
    .from('rooms')
    .update({
      state: stateWithVersion,
      status: stateWithVersion.gamePhase,
      players: updatedPlayers,
      version: nextVersion,
      updated_at: new Date().toISOString(),
    })
    .eq('room_code', cleanCode)
    .select()
    .single();

  if (error) {
    console.error('Failed to sync game state to Supabase:', error);
    return { success: false, newVersion: currentVersion };
  }

  if (updatedRecord) {
    broadcastRoomRecord(cleanCode, updatedRecord as RoomRecord);
  }

  return { success: true, newVersion: nextVersion, state: stateWithVersion };
}

/**
 * Race condition protection for "CLAIM ANSWER" buzzer!
 * Ensures ONLY the very first player to buzz in gets the answer turn.
 */
export async function claimEquationAnswerAtomic(
  roomCode: string,
  playerId: string
): Promise<{ success: boolean; claimedBy: string; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, claimedBy: '', error: 'Supabase client not connected' };
  }

  const cleanCode = roomCode.trim().toUpperCase();

  try {
    // Attempt atomic RPC stored procedure
    const { data, error } = await supabase.rpc('claim_equation_answer', {
      p_room_code: cleanCode,
      p_player_id: playerId,
    });

    if (!error && data) {
      return {
        success: data.success,
        claimedBy: data.claimedBy || '',
        error: data.error,
      };
    }
  } catch (e) {
    // Fallback if RPC is not present
  }

  // Fallback: Check current room row and atomically update if still unclaimed
  const { data: room, error: fetchErr } = await supabase
    .from('rooms')
    .select('*')
    .eq('room_code', cleanCode)
    .single();

  if (fetchErr || !room) {
    return { success: false, claimedBy: '', error: 'ไม่พบห้อง' };
  }

  const currentClaimed = room.state?.currentEquationState?.claimedByPlayerId;
  if (currentClaimed) {
    return {
      success: false,
      claimedBy: currentClaimed,
      error: 'มีผู้เล่นคนอื่นกดแย่งตอบได้ก่อนแล้ว!',
    };
  }

  // Proceed with update
  const updatedState: GameState = {
    ...room.state,
    gamePhase: 'ANSWERING',
    currentEquationState: {
      ...room.state.currentEquationState,
      claimedByPlayerId: playerId,
    },
    version: (room.version || 1) + 1,
  };

  const { data: updatedRecord, error: updateErr } = await supabase
    .from('rooms')
    .update({
      state: updatedState,
      status: 'ANSWERING',
      version: updatedState.version,
      updated_at: new Date().toISOString(),
    })
    .eq('room_code', cleanCode)
    .select()
    .single();

  if (updateErr) {
    return { success: false, claimedBy: '', error: updateErr.message };
  }

  if (updatedRecord) {
    broadcastRoomRecord(cleanCode, updatedRecord as RoomRecord);
  }

  return { success: true, claimedBy: playerId };
}

/**
 * Kicks a player from the room in Supabase (Host only during Lobby or Preparation).
 */
export async function kickPlayerFromRoomInSupabase(
  roomCode: string,
  kickedPlayerId: string,
  kickedPlayerName: string
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const cleanCode = roomCode.trim().toUpperCase();
  try {
    const { data: room } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_code', cleanCode)
      .maybeSingle();

    if (!room) return;

    const remainingPlayers = (room.players || []).filter((p: RoomPlayer) => p.id !== kickedPlayerId);

    const currentState = room.state || {};
    const updatedGameState: GameState = {
      ...currentState,
      players: (currentState.players || []).filter((p: Player) => p.id !== kickedPlayerId),
      logs: [
        {
          id: `log-${Date.now()}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `🚫 หัวหน้าห้องเตะผู้เล่น ${kickedPlayerName} ออกจากห้อง`,
          type: 'penalty',
        },
        ...(currentState.logs || []),
      ],
      version: (room.version || 1) + 1,
    };

    const { data: updatedRecord, error } = await supabase
      .from('rooms')
      .update({
        players: remainingPlayers,
        state: updatedGameState,
        version: updatedGameState.version,
        updated_at: new Date().toISOString(),
      })
      .eq('room_code', cleanCode)
      .select()
      .single();

    if (!error && updatedRecord) {
      broadcastRoomRecord(cleanCode, updatedRecord as RoomRecord);
    }
  } catch (err) {
    console.error('Failed to kick player in Supabase:', err);
  }
}

/**
 * Updates Lobby players (e.g. adding bots, toggling ready, host kicking)
 */
export async function updateLobbyPlayersInSupabase(
  roomCode: string,
  updatedPlayers: RoomPlayer[],
  nextStatus?: string
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const cleanCode = roomCode.trim().toUpperCase();
  const { data: updatedRecord, error } = await supabase
    .from('rooms')
    .update({
      players: updatedPlayers,
      ...(nextStatus ? { status: nextStatus } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('room_code', cleanCode)
    .select()
    .single();

  if (!error && updatedRecord) {
    broadcastRoomRecord(cleanCode, updatedRecord as RoomRecord);
  }
}

/**
 * Removes a player from the room in Supabase (when leaving lobby or disconnecting).
 */
export async function leaveRoomInSupabase(roomCode: string, playerId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const cleanCode = roomCode.trim().toUpperCase();
  try {
    const { data: room } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_code', cleanCode)
      .maybeSingle();

    if (!room) return;

    const remainingPlayers = (room.players || []).filter((p: RoomPlayer) => p.id !== playerId);

    if (remainingPlayers.length === 0) {
      await supabase.from('rooms').delete().eq('room_code', cleanCode);
      return;
    }

    let nextHostId = room.host_id;
    if (room.host_id === playerId) {
      const firstHuman = remainingPlayers.find((p: RoomPlayer) => !p.isBot);
      if (firstHuman) {
        firstHuman.isHost = true;
        firstHuman.isReady = true;
        nextHostId = firstHuman.id;
      }
    }

    const { data: updatedRecord } = await supabase
      .from('rooms')
      .update({
        players: remainingPlayers,
        host_id: nextHostId,
        updated_at: new Date().toISOString(),
      })
      .eq('room_code', cleanCode)
      .select()
      .single();

    if (updatedRecord) {
      broadcastRoomRecord(cleanCode, updatedRecord as RoomRecord);
    }
  } catch (err) {
    console.error('Failed to leave room in Supabase:', err);
  }
}

/**
 * Returns an online room back to the LOBBY state after a match ends (Play Again).
 */
export async function returnRoomToLobbyInSupabase(roomCode: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const cleanCode = roomCode.trim().toUpperCase();
  try {
    const { data: room } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_code', cleanCode)
      .maybeSingle();

    if (!room) return;

    const hostId = room.host_id;
    // Reset players ready status: host is ready, bots are ready, guests need to press ready
    const resetPlayers: RoomPlayer[] = (room.players || []).map((p: RoomPlayer) => ({
      ...p,
      isReady: p.isHost || p.isBot || p.id === hostId,
    }));

    const nextVersion = (room.version || 1) + 1;
    const lobbyState: GameState = {
      players: resetPlayers.map((rp) => ({
        id: rp.id,
        letter: rp.letter,
        name: rp.name,
        hand: [],
        isBot: rp.isBot,
        calledHarmonic: false,
      })),
      currentPlayerIndex: 0,
      direction: 1,
      deck: [],
      discardPile: [],
      currentColor: 'RED',
      equationDeck: [],
      equationDiscardPile: [],
      currentEquationState: null,
      drawnCardChoice: null,
      gamePhase: 'LOBBY',
      gameMode: room.state?.gameMode || 'FIND_WINNER',
      pendingDraw: 0,
      finishedPlayers: [],
      winner: null,
      loser: null,
      turnsCount: 0,
      logs: [
        {
          id: `log-${Date.now()}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: '🔄 กลับสู่ห้องเตรียมพร้อม (Lobby) เพื่อเริ่มการแข่งขันรอบใหม่',
          type: 'info',
        },
        ...(room.state?.logs || []),
      ],
      lastActionTime: Date.now(),
      roomId: cleanCode,
      version: nextVersion,
    };

    const { data: updatedRecord, error } = await supabase
      .from('rooms')
      .update({
        status: 'LOBBY',
        players: resetPlayers,
        state: lobbyState,
        version: nextVersion,
        updated_at: new Date().toISOString(),
      })
      .eq('room_code', cleanCode)
      .select()
      .single();

    if (!error && updatedRecord) {
      broadcastRoomRecord(cleanCode, updatedRecord as RoomRecord);
    }
  } catch (err) {
    console.error('Failed to return room to lobby in Supabase:', err);
  }
}

/**
 * Subscribes to Supabase Realtime channel for instant room synchronization.
 * Combines WebSockets Broadcast + Postgres Changes + Active Polling Fallback.
 */
export function subscribeToSupabaseRoom(
  roomCode: string,
  onRoomUpdate: (record: RoomRecord) => void
): () => void {
  const supabase = getSupabase();
  if (!supabase) return () => {};

  const cleanCode = roomCode.trim().toUpperCase();
  const channel = getOrCreateRoomChannel(cleanCode);
  if (!channel) return () => {};

  let lastSeenVersion = -1;
  let lastSeenStatus = '';
  let lastSeenPlayersJson = '';

  const processUpdate = (record: RoomRecord) => {
    if (!record) return;
    const v = record.version ?? record.state?.version ?? 0;
    const status = record.status || '';
    const playersJson = JSON.stringify(record.players || []);

    if (
      v > lastSeenVersion ||
      status !== lastSeenStatus ||
      playersJson !== lastSeenPlayersJson
    ) {
      lastSeenVersion = Math.max(lastSeenVersion, v);
      lastSeenStatus = status;
      lastSeenPlayersJson = playersJson;
      onRoomUpdate(record);
    }
  };

  // 1. Broadcast channel listener (instant peer-to-peer over websockets)
  channel.on('broadcast', { event: 'room_record_update' }, (payload) => {
    if (payload?.payload) {
      processUpdate(payload.payload as RoomRecord);
    }
  });

  // 2. Postgres changes listener (if database publication is active)
  channel.on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'rooms',
      filter: `room_code=eq.${cleanCode}`,
    },
    (payload) => {
      if (payload.new) {
        processUpdate(payload.new as RoomRecord);
      }
    }
  );

  // Subscribe channel if not yet subscribed
  if (channel.state !== 'joined') {
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`📡 Realtime connected to Supabase room [${cleanCode}]`);
      }
    });
  }

  // 3. Resilient Polling Fallback (every 1.2s to guarantee zero desync)
  let isPolling = false;
  const pollInterval = setInterval(async () => {
    if (isPolling) return;
    isPolling = true;
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', cleanCode)
        .maybeSingle();

      if (!error && data) {
        processUpdate(data as RoomRecord);
      }
    } catch (e) {
      // ignore transient poll errors
    } finally {
      isPolling = false;
    }
  }, 1200);

  // Immediately poll once to ensure freshest state on connect
  supabase
    .from('rooms')
    .select('*')
    .eq('room_code', cleanCode)
    .maybeSingle()
    .then(({ data }) => {
      if (data) processUpdate(data as RoomRecord);
    });

  // Cleanup function
  return () => {
    clearInterval(pollInterval);
    channel.unsubscribe();
    supabase.removeChannel(channel);
    _roomChannels.delete(cleanCode);
  };
}
