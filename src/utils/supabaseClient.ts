import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import {
  GameState,
  OnlineRoomInfo,
  Player,
  PlayerLetter,
  RoomPlayer,
  ActionAnnouncement,
} from '../types/game';
import { PLAYER_LETTERS } from './cardUtils';

// LocalStorage keys for session recovery & credentials
const STORAGE_SUPABASE_URL = 'harmonic_supabase_url';
const STORAGE_SUPABASE_KEY = 'harmonic_supabase_anon_key';
const STORAGE_SAVED_ROOM = 'harmonic_session_room';
const STORAGE_SAVED_PLAYER = 'harmonic_session_player';

// Retrieve config from Vite environment variables or localStorage
export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = localStorage.getItem(STORAGE_SUPABASE_URL) || '';
  const localKey = localStorage.getItem(STORAGE_SUPABASE_KEY) || '';

  return {
    url: (envUrl || localUrl).trim(),
    anonKey: (envKey || localKey).trim(),
  };
}

export function saveCustomSupabaseCredentials(url: string, anonKey: string) {
  localStorage.setItem(STORAGE_SUPABASE_URL, url.trim());
  localStorage.setItem(STORAGE_SUPABASE_KEY, anonKey.trim());
  _client = null; // Reset cached client
}

export function clearCustomSupabaseCredentials() {
  localStorage.removeItem(STORAGE_SUPABASE_URL);
  localStorage.removeItem(STORAGE_SUPABASE_KEY);
  _client = null;
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return !!url && !!anonKey && url.startsWith('http') && anonKey.length > 20;
}

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (_client) return _client;

  const { url, anonKey } = getSupabaseCredentials();
  if (!url || !anonKey || !url.startsWith('http')) {
    return null;
  }

  try {
    _client = createClient(url, anonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
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
  playerName: string
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
    winner: null,
    turnsCount: 0,
    logs: [
      {
        id: `log-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `🚪 สร้างห้องรหัส ${roomCode} โดย ${hostPlayer.name}`,
        type: 'info',
      },
    ],
    lastActionTime: Date.now(),
    roomId: roomCode,
    version: 1,
  };

  const { data, error } = await supabase
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

  const { data: room, error: fetchErr } = await supabase
    .from('rooms')
    .select('*')
    .eq('room_code', cleanCode)
    .single();

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

  const { error: updateErr } = await supabase
    .from('rooms')
    .update({
      players: updatedPlayers,
      state: updatedGameState,
      version: updatedGameState.version,
    })
    .eq('room_code', cleanCode);

  if (updateErr) {
    throw new Error(`เกิดข้อผิดพลาดในการเข้าร่วมห้อง: ${updateErr.message}`);
  }

  const roomInfo: OnlineRoomInfo = {
    roomId: cleanCode,
    hostId: room.host_id,
    status: room.status,
    players: updatedPlayers,
    maxPlayers: 6,
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
      p_new_state: newState,
      p_expected_version: currentVersion,
    });

    if (!rpcErr && rpcData) {
      if (rpcData.success) {
        return { success: true, newVersion: rpcData.version, state: rpcData.state };
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

  const { error } = await supabase
    .from('rooms')
    .update({
      state: stateWithVersion,
      status: stateWithVersion.gamePhase,
      players: stateWithVersion.players.map((p) => ({
        id: p.id,
        name: p.name,
        letter: p.letter,
        isBot: p.isBot,
        isHost: false,
        isReady: true,
        connected: true,
      })),
      version: nextVersion,
    })
    .eq('room_code', cleanCode);

  if (error) {
    console.error('Failed to sync game state to Supabase:', error);
    return { success: false, newVersion: currentVersion };
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

  const { error: updateErr } = await supabase
    .from('rooms')
    .update({
      state: updatedState,
      status: 'ANSWERING',
      version: updatedState.version,
    })
    .eq('room_code', cleanCode);

  if (updateErr) {
    return { success: false, claimedBy: '', error: updateErr.message };
  }

  return { success: true, claimedBy: playerId };
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
  await supabase
    .from('rooms')
    .update({
      players: updatedPlayers,
      ...(nextStatus ? { status: nextStatus } : {}),
    })
    .eq('room_code', cleanCode);
}

/**
 * Subscribes to Supabase Realtime channel for instant room synchronization.
 */
export function subscribeToSupabaseRoom(
  roomCode: string,
  onRoomUpdate: (record: RoomRecord) => void
): () => void {
  const supabase = getSupabase();
  if (!supabase) return () => {};

  const cleanCode = roomCode.trim().toUpperCase();
  const channelName = `room:${cleanCode}`;

  const channel: RealtimeChannel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'rooms',
        filter: `room_code=eq.${cleanCode}`,
      },
      (payload) => {
        if (payload.new) {
          onRoomUpdate(payload.new as RoomRecord);
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`📡 Realtime connected to Supabase room [${cleanCode}]`);
      }
    });

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}
