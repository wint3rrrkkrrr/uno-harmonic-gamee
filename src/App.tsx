import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ActionAnnouncement,
  Card,
  CardColor,
  EquationActiveState,
  EquationCard,
  GameLogEntry,
  GamePhase,
  GameState,
  OnlineRoomInfo,
  Player,
  PlayerLetter,
  RoomPlayer,
} from './types/game';
import { EQUATION_CARDS_DATA } from './data/equations';
import {
  createMainDeck,
  shuffle,
  canPlayCard,
  checkAnswerMath,
  PLAYER_LETTERS,
  COLORS,
} from './utils/cardUtils';
import { saveGameState, loadSavedGameState, clearSavedGameState } from './utils/storage';
import { StartScreen } from './components/StartScreen';
import { GameBoard } from './components/GameBoard';
import { WildColorModal } from './components/WildColorModal';
import { EquationModal } from './components/EquationModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { AboutModal } from './components/AboutModal';
import { GameOverModal } from './components/GameOverModal';
import { OnlineLobbyModal } from './components/OnlineLobbyModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import {
  isSupabaseConfigured,
  createRoomInSupabase,
  joinRoomInSupabase,
  reconnectRoomInSupabase,
  syncGameStateToSupabase,
  claimEquationAnswerAtomic,
  updateLobbyPlayersInSupabase,
  subscribeToSupabaseRoom,
  getSavedRoomSession,
  clearRoomSession,
  saveRoomSession,
  RoomRecord,
} from './utils/supabaseClient';

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [hasSavedGame, setHasSavedGame] = useState<boolean>(false);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [showAbout, setShowAbout] = useState<boolean>(false);
  const [wildPickerPlayer, setWildPickerPlayer] = useState<Player | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Online Multiplayer State (Supabase Realtime)
  const [showOnlineLobby, setShowOnlineLobby] = useState<boolean>(false);
  const [showSupabaseConfig, setShowSupabaseConfig] = useState<boolean>(false);
  const [isSupabaseReady, setIsSupabaseReady] = useState<boolean>(isSupabaseConfigured());
  const [onlineRoomInfo, setOnlineRoomInfo] = useState<OnlineRoomInfo | null>(null);
  const [localOnlinePlayer, setLocalOnlinePlayer] = useState<{
    id: string;
    name: string;
    letter: string;
    isHost: boolean;
    isReady?: boolean;
  } | null>(null);
  const [onlineError, setOnlineError] = useState<string | null>(null);
  const supabaseUnsubRef = useRef<(() => void) | null>(null);

  // Check saved game on mount: auto-resume if game was actively running
  useEffect(() => {
    const saved = loadSavedGameState();
    if (saved && saved.gamePhase !== 'GAME_OVER' && saved.gamePhase !== 'MENU') {
      setGameState(saved);
      showToast('🔄 กู้คืนเกมที่เล่นอยู่เรียบร้อยแล้ว');
    }
  }, []);

  // Show temporary toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Trigger Action Announcement with auto-clear
  const triggerAnnouncement = useCallback(
    (announcement: Omit<ActionAnnouncement, 'id'>, durationMs = 2500) => {
      const fullAnnouncement: ActionAnnouncement = {
        ...announcement,
        id: `ann-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        durationMs,
      };

      setGameState((prev) => (prev ? { ...prev, actionAnnouncement: fullAnnouncement } : null));

      setTimeout(() => {
        setGameState((prev) => {
          if (prev && prev.actionAnnouncement?.id === fullAnnouncement.id) {
            return { ...prev, actionAnnouncement: null };
          }
          return prev;
        });
      }, durationMs);
    },
    []
  );

  // Add Log Entry Helper
  const createLog = (text: string, type: GameLogEntry['type'] = 'play'): GameLogEntry => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      time: timeStr,
      text,
      type,
    };
  };

  // Save current game state automatically on key changes (singleplayer only)
  useEffect(() => {
    if (gameState && gameState.gamePhase !== 'MENU' && !gameState.roomId) {
      saveGameState(gameState);
    }
  }, [gameState]);

  // ================= SUPABASE REALTIME MULTIPLAYER =================
  // Handle Realtime updates from Supabase for current room
  const handleRoomRecordUpdate = useCallback((record: RoomRecord) => {
    // 1. Update online room information
    setOnlineRoomInfo((prev) => ({
      roomId: record.room_code,
      hostId: record.host_id,
      status: record.status as any,
      players: record.players || [],
      maxPlayers: 6,
    }));

    // 2. Update Game State if record has state and version is >= current
    if (record.state) {
      const incomingState = record.state;
      setGameState((prevState) => {
        const prevVersion = prevState?.version ?? 0;
        const incomingVersion = incomingState.version ?? 0;

        if (!prevState || incomingVersion >= prevVersion) {
          // If room transitions to PLAYING, dismiss lobby modal
          if (incomingState.gamePhase !== 'LOBBY' && incomingState.gamePhase !== 'MENU') {
            setShowOnlineLobby(false);
          }
          return {
            ...incomingState,
            roomId: record.room_code,
            version: incomingVersion,
          };
        }
        return prevState;
      });
    }
  }, []);

  const setupRoomSubscription = useCallback(
    (roomCode: string) => {
      if (supabaseUnsubRef.current) {
        supabaseUnsubRef.current();
      }
      const unsub = subscribeToSupabaseRoom(roomCode, handleRoomRecordUpdate);
      supabaseUnsubRef.current = unsub;
    },
    [handleRoomRecordUpdate]
  );

  // Restore room session on mount if one was saved
  useEffect(() => {
    const session = getSavedRoomSession();
    if (session && isSupabaseConfigured()) {
      reconnectRoomInSupabase(session.roomCode, session.player.id)
        .then((res) => {
          if (res) {
            setOnlineRoomInfo(res.roomInfo);
            setLocalOnlinePlayer(res.localPlayer);
            if (res.state && res.state.gamePhase !== 'MENU') {
              setGameState(res.state);
              if (res.state.gamePhase !== 'LOBBY') {
                setShowOnlineLobby(false);
              }
            }
            setupRoomSubscription(res.roomInfo.roomId);
            showToast(`🔄 เชื่อมต่อห้อง ${res.roomInfo.roomId} สำเร็จ!`);
          } else {
            clearRoomSession();
          }
        })
        .catch(() => {
          clearRoomSession();
        });
    }

    return () => {
      if (supabaseUnsubRef.current) {
        supabaseUnsubRef.current();
      }
    };
  }, [setupRoomSubscription]);

  // Sync game state to Supabase Realtime (Source of Truth)
  const syncOnlineGameState = useCallback(
    async (newState: GameState, announcement?: ActionAnnouncement) => {
      if (!newState.roomId) return;
      const currentVer = newState.version || 1;
      const stateToSync: GameState = {
        ...newState,
        version: currentVer + 1,
        actionAnnouncement: announcement || newState.actionAnnouncement || null,
        lastActionTime: Date.now(),
      };

      try {
        await syncGameStateToSupabase(newState.roomId, stateToSync, stateToSync.version);
      } catch (err: any) {
        console.error('Failed to sync state to Supabase:', err);
      }
    },
    []
  );

  // Online Lobby Handlers
  const handleCreateRoom = async (playerName: string) => {
    setOnlineError(null);
    if (!isSupabaseConfigured()) {
      setShowSupabaseConfig(true);
      setOnlineError('กรุณาตั้งค่า Supabase URL และ Anon Key ก่อนสร้างห้องออนไลน์');
      return;
    }

    try {
      const { roomInfo, localPlayer, state } = await createRoomInSupabase(playerName);
      setOnlineRoomInfo(roomInfo);
      setLocalOnlinePlayer(localPlayer);
      setGameState(state);
      setupRoomSubscription(roomInfo.roomId);
      showToast(`🎉 สร้างห้อง ${roomInfo.roomId} สำเร็จ! ส่งรหัสให้เพื่อนเข้าเล่นได้เลย`);
    } catch (err: any) {
      console.error('Create room error:', err);
      setOnlineError(err?.message || 'ไม่สามารถสร้างห้องได้ กรุณาตรวจสอบการตั้งค่า Supabase');
    }
  };

  const handleJoinRoom = async (roomId: string, playerName: string) => {
    setOnlineError(null);
    if (!isSupabaseConfigured()) {
      setShowSupabaseConfig(true);
      setOnlineError('กรุณาตั้งค่า Supabase URL และ Anon Key ก่อนเข้าร่วมห้อง');
      return;
    }

    try {
      const { roomInfo, localPlayer, state } = await joinRoomInSupabase(roomId, playerName);
      setOnlineRoomInfo(roomInfo);
      setLocalOnlinePlayer(localPlayer);
      setGameState(state);
      setupRoomSubscription(roomInfo.roomId);
      showToast(`👋 เข้าร่วมห้อง ${roomInfo.roomId} สำเร็จ!`);
      if (state.gamePhase !== 'LOBBY' && state.gamePhase !== 'MENU') {
        setShowOnlineLobby(false);
      }
    } catch (err: any) {
      console.error('Join room error:', err);
      setOnlineError(err?.message || 'ไม่สามารถเข้าร่วมห้องได้ ตรวจสอบรหัสห้องอีกครั้ง');
    }
  };

  const handleAddBotToRoom = async () => {
    if (!onlineRoomInfo || !localOnlinePlayer?.isHost) return;
    if (onlineRoomInfo.players.length >= 6) {
      setOnlineError('ห้องเต็มแล้ว (จำกัดสูงสุด 6 คน)');
      return;
    }

    const botIdx = onlineRoomInfo.players.length;
    const botLetters: PlayerLetter[] = ['B', 'C', 'D', 'E', 'F'];
    const nextLetter =
      botLetters.find((l) => !onlineRoomInfo.players.some((p) => p.letter === l)) || 'B';
    const newBot: RoomPlayer = {
      id: `bot-${Date.now()}`,
      name: `บอท SHM ${botIdx}`,
      letter: nextLetter,
      isHost: false,
      isBot: true,
      isReady: true,
      connected: true,
    };

    const updatedPlayers = [...onlineRoomInfo.players, newBot];
    setOnlineRoomInfo({ ...onlineRoomInfo, players: updatedPlayers });
    await updateLobbyPlayersInSupabase(onlineRoomInfo.roomId, updatedPlayers);
  };

  const handleRemoveBotFromRoom = async (botId: string) => {
    if (!onlineRoomInfo || !localOnlinePlayer?.isHost) return;
    const updatedPlayers = onlineRoomInfo.players.filter((p) => p.id !== botId);
    setOnlineRoomInfo({ ...onlineRoomInfo, players: updatedPlayers });
    await updateLobbyPlayersInSupabase(onlineRoomInfo.roomId, updatedPlayers);
  };

  const handleToggleReady = async () => {
    if (!onlineRoomInfo || !localOnlinePlayer) return;
    const newReady = !localOnlinePlayer.isReady;
    setLocalOnlinePlayer({ ...localOnlinePlayer, isReady: newReady });

    const updatedPlayers = onlineRoomInfo.players.map((p) =>
      p.id === localOnlinePlayer.id ? { ...p, isReady: newReady } : p
    );
    setOnlineRoomInfo({ ...onlineRoomInfo, players: updatedPlayers });
    await updateLobbyPlayersInSupabase(onlineRoomInfo.roomId, updatedPlayers);
  };

  const handleLeaveRoom = () => {
    if (supabaseUnsubRef.current) {
      supabaseUnsubRef.current();
      supabaseUnsubRef.current = null;
    }
    clearRoomSession();
    setOnlineRoomInfo(null);
    setLocalOnlinePlayer(null);
    setGameState(null);
    setShowOnlineLobby(false);
    showToast('🚪 ออกจากห้องออนไลน์แล้ว');
  };

  const handleStartOnlineGame = async () => {
    if (!onlineRoomInfo || onlineRoomInfo.players.length < 2) return;

    // Host initializes game state
    const deck = createMainDeck();
    const equationDeck = shuffle(
      EQUATION_CARDS_DATA.map((eq) => ({
        ...eq,
        blanks: eq.blanks.map((b) => ({ ...b, assignedPlayerId: null, filledValue: null })),
      }))
    );

    const players: Player[] = onlineRoomInfo.players.map((rp) => {
      const hand = deck.splice(0, 7);
      return {
        id: rp.id,
        letter: rp.letter,
        name: rp.name,
        hand,
        isBot: rp.isBot,
        calledHarmonic: false,
      };
    });

    let firstCard = deck.shift()!;
    let attempts = 0;
    while (
      (firstCard.type === 'WILD' || firstCard.type === 'EQUATION' || firstCard.type === 'DRAW_TWO') &&
      attempts < 10
    ) {
      deck.push(firstCard);
      firstCard = deck.shift()!;
      attempts++;
    }

    const initialAnnouncement: ActionAnnouncement = {
      id: `ann-${Date.now()}`,
      title: '🎮 เริ่มต้นเกมออนไลน์ HARMONIC!',
      subtitle: `แจกไพ่คนละ 7 ใบ ไพ่เปิดใบแรกคือ ${firstCard.color} ${firstCard.value ?? firstCard.type}`,
      type: 'INFO',
      card: firstCard,
      durationMs: 3000,
    };

    const initialLogs: GameLogEntry[] = [
      createLog(`🎮 ห้อง ${onlineRoomInfo.roomId}: เริ่มเกมแล้ว! แจกไพ่คนละ 7 ใบ`, 'info'),
      createLog(`ไพ่ใบแรกบนกองทิ้งคือ ${firstCard.color} ${firstCard.value ?? firstCard.type}`, 'play'),
    ];

    const initialGameState: GameState = {
      players,
      currentPlayerIndex: 0,
      direction: 1,
      deck,
      discardPile: [firstCard],
      currentColor: firstCard.color === 'WILD' ? 'RED' : firstCard.color,
      equationDeck,
      equationDiscardPile: [],
      currentEquationState: null,
      drawnCardChoice: null,
      gamePhase: 'PLAYING',
      winner: null,
      turnsCount: 1,
      logs: initialLogs,
      lastActionTime: Date.now(),
      roomId: onlineRoomInfo.roomId,
      actionAnnouncement: initialAnnouncement,
      version: 1,
    };

    setGameState(initialGameState);
    setShowOnlineLobby(false);
    await syncGameStateToSupabase(onlineRoomInfo.roomId, initialGameState, 1);
  };

  // ================= START GAME / NEW GAME (SINGLEPLAYER) =================
  const handleStartNewGame = (
    configs: { name: string; letter: PlayerLetter; isBot: boolean }[]
  ) => {
    const deck = createMainDeck();
    const equationDeck = shuffle(
      EQUATION_CARDS_DATA.map((eq) => ({
        ...eq,
        blanks: eq.blanks.map((b) => ({ ...b, assignedPlayerId: null, filledValue: null })),
      }))
    );

    // Deal 7 cards to each player
    const players: Player[] = configs.map((cfg, idx) => {
      const hand = deck.splice(0, 7);
      return {
        id: `p-${idx + 1}-${cfg.letter}`,
        letter: cfg.letter,
        name: cfg.name,
        hand,
        isBot: cfg.isBot,
        calledHarmonic: false,
      };
    });

    let firstCard = deck.shift()!;
    let attempts = 0;
    while (
      (firstCard.type === 'WILD' || firstCard.type === 'EQUATION' || firstCard.type === 'DRAW_TWO') &&
      attempts < 10
    ) {
      deck.push(firstCard);
      firstCard = deck.shift()!;
      attempts++;
    }

    const startAnnouncement: ActionAnnouncement = {
      id: `ann-${Date.now()}`,
      title: '🎮 เริ่มเกม HARMONIC!',
      subtitle: `แจกไพ่คนละ 7 ใบ ไพ่ใบแรกคือ ${firstCard.color} ${firstCard.value ?? firstCard.type}`,
      type: 'INFO',
      card: firstCard,
      durationMs: 2500,
    };

    const initialLogs: GameLogEntry[] = [
      createLog('🎮 เกม HARMONIC เริ่มต้นขึ้นแล้ว! แจกไพ่คนละ 7 ใบ', 'info'),
      createLog(`ไพ่ใบแรกบนกองทิ้งคือ ${firstCard.color} ${firstCard.value ?? firstCard.type}`, 'play'),
    ];

    const newState: GameState = {
      players,
      currentPlayerIndex: 0,
      direction: 1,
      deck,
      discardPile: [firstCard],
      currentColor: firstCard.color === 'WILD' ? 'RED' : firstCard.color,
      equationDeck,
      equationDiscardPile: [],
      currentEquationState: null,
      drawnCardChoice: null,
      gamePhase: 'PLAYING',
      winner: null,
      turnsCount: 1,
      logs: initialLogs,
      lastActionTime: Date.now(),
      actionAnnouncement: startAnnouncement,
    };

    setGameState(newState);
    setHasSavedGame(true);
  };

  const handleContinueGame = () => {
    const saved = loadSavedGameState();
    if (saved) {
      setGameState(saved);
      showToast('💾 โหลดเกมที่บันทึกไว้สำเร็จแล้ว!');
    }
  };

  const handleResetGame = () => {
    clearSavedGameState();
    setHasSavedGame(false);
    setGameState(null);
    setOnlineRoomInfo(null);
    setLocalOnlinePlayer(null);
  };

  // Helper to ensure deck has cards (recycle discard pile if needed)
  const ensureDeckCards = (st: GameState, count = 1): GameState => {
    if (st.deck.length >= count) return st;

    if (st.discardPile.length <= 1) {
      const fresh = createMainDeck();
      return {
        ...st,
        deck: [...st.deck, ...fresh],
      };
    }

    const topCard = st.discardPile[st.discardPile.length - 1];
    const recycled = shuffle(st.discardPile.slice(0, st.discardPile.length - 1));
    return {
      ...st,
      deck: [...st.deck, ...recycled],
      discardPile: [topCard],
      logs: [createLog('♻️ กองไพ่จั่วหมดแล้ว! สับไพ่จากกองทิ้งกลับเข้าสู่สำรับ', 'info'), ...st.logs],
    };
  };

  // Turn Advancement
  const advanceTurn = useCallback(
    (prevState: GameState, step = 1, customWinner: Player | null = null): GameState => {
      if (customWinner) {
        return {
          ...prevState,
          gamePhase: 'GAME_OVER',
          winner: customWinner,
          logs: [createLog(`🏆 HARMONIC! ผู้เล่น ${customWinner.name} ชนะเกมแล้ว!`, 'win'), ...prevState.logs],
        };
      }

      const totalPlayers = prevState.players.length;
      const nextIndex =
        (prevState.currentPlayerIndex + prevState.direction * step + totalPlayers * 100) % totalPlayers;

      return {
        ...prevState,
        currentPlayerIndex: nextIndex,
        turnsCount: prevState.turnsCount + 1,
        drawnCardChoice: null,
        lastActionTime: Date.now(),
      };
    },
    []
  );

  // ================= ACTION: PLAY CARD =================
  const handlePlayCard = (card: Card) => {
    if (!gameState || gameState.gamePhase !== 'PLAYING') return;

    let st = { ...gameState };
    const player = st.players[st.currentPlayerIndex];
    if (!player) return;

    // Remove card from player hand
    const updatedHand = player.hand.filter((c) => c.id !== card.id);
    const updatedPlayer: Player = {
      ...player,
      hand: updatedHand,
      calledHarmonic: updatedHand.length === 1 ? player.calledHarmonic : false,
    };

    const updatedPlayers = [...st.players];
    updatedPlayers[st.currentPlayerIndex] = updatedPlayer;

    // Check Win Condition: Hand is empty!
    if (updatedHand.length === 0) {
      st = {
        ...st,
        players: updatedPlayers,
        discardPile: [...st.discardPile, card],
        currentColor: card.color === 'WILD' ? st.currentColor : card.color,
      };

      const winAnnouncement: ActionAnnouncement = {
        id: `ann-${Date.now()}`,
        title: `🏆 ${player.name} เป็นผู้ชนะเกม!`,
        subtitle: 'ลงไพ่ในมือจนหมดเกลี้ยง จบการประลอง SHM',
        type: 'WIN',
        card,
        durationMs: 4000,
      };

      const finalState = { ...advanceTurn(st, 1, updatedPlayer), actionAnnouncement: winAnnouncement };
      setGameState(finalState);
      syncOnlineGameState(finalState, winAnnouncement);
      return;
    }

    // Check 1 Card warning
    if (updatedHand.length === 1 && !updatedPlayer.calledHarmonic) {
      showToast(`⚠️ ${player.name} เหลือไพ่ 1 ใบ! (อย่าลืมกดปุ่ม HARMONIC)`);
    }

    // Push card onto discard pile
    st.discardPile = [...st.discardPile, card];
    st.players = updatedPlayers;

    // Handle Card Types:
    if (card.type === 'WILD') {
      if (player.isBot) {
        const chosenColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        st.currentColor = chosenColor;
        const announcement: ActionAnnouncement = {
          id: `ann-${Date.now()}`,
          title: `★ ${player.name} เล่น WILD!`,
          subtitle: `เลือกเปลี่ยนทิศทางสีเป็น: ${chosenColor}`,
          type: 'SPECIAL',
          card,
          durationMs: 2500,
        };
        st.actionAnnouncement = announcement;
        st.logs = [
          createLog(`Player ${player.letter} (${player.name}) เล่น WILD และเลือกเปลี่ยนเป็นสี ${chosenColor}`, 'special'),
          ...st.logs,
        ];
        const nextState = advanceTurn(st, 1);
        setGameState(nextState);
        syncOnlineGameState(nextState, announcement);
      } else {
        st.gamePhase = 'WILD_COLOR_PICK';
        setWildPickerPlayer(player);
        setGameState(st);
      }
      return;
    }

    st.currentColor = card.color;

    if (card.type === 'NUMBER') {
      const announcement: ActionAnnouncement = {
        id: `ann-${Date.now()}`,
        title: `${player.name} ลงไพ่เลข ${card.value}`,
        subtitle: `สี ${card.color} • สอดคล้องกับตัวแปร SHM`,
        type: 'PLAY',
        card,
        durationMs: 2000,
      };
      st.actionAnnouncement = announcement;
      st.logs = [
        createLog(`Player ${player.letter} (${player.name}) ลงไพ่ ${card.color} ${card.value}`, 'play'),
        ...st.logs,
      ];
      const nextState = advanceTurn(st, 1);
      setGameState(nextState);
      syncOnlineGameState(nextState, announcement);
    } else if (card.type === 'DRAW_TWO') {
      // +2 ENERGY LOSS
      st = ensureDeckCards(st, 2);
      const nextPlayerIdx = (st.currentPlayerIndex + st.direction + st.players.length) % st.players.length;
      const targetPlayer = st.players[nextPlayerIdx];
      const drawnCards = st.deck.splice(0, 2);

      const targetUpdated: Player = {
        ...targetPlayer,
        hand: [...targetPlayer.hand, ...drawnCards],
      };
      st.players[nextPlayerIdx] = targetUpdated;

      const announcement: ActionAnnouncement = {
        id: `ann-${Date.now()}`,
        title: `⚡ +2 ENERGY LOSS!`,
        subtitle: `${player.name} ลงไพ่ +2 ⟹ ${targetPlayer.name} โดนจั่ว 2 ใบ และข้ามตาเล่น!`,
        type: 'PENALTY',
        card,
        durationMs: 2800,
      };
      st.actionAnnouncement = announcement;
      st.logs = [
        createLog(
          `⚡ +2 ENERGY LOSS! Player ${player.letter} ลงไพ่ +2 ⟹ Player ${targetPlayer.letter} (${targetPlayer.name}) ต้องจั่ว 2 ใบ และเสียตาเล่น!`,
          'penalty'
        ),
        ...st.logs,
      ];
      const nextState = advanceTurn(st, 2);
      setGameState(nextState);
      syncOnlineGameState(nextState, announcement);
    } else if (card.type === 'SKIP') {
      // SKIP EQUILIBRIUM STOP
      const nextPlayerIdx = (st.currentPlayerIndex + st.direction + st.players.length) % st.players.length;
      const targetPlayer = st.players[nextPlayerIdx];

      const announcement: ActionAnnouncement = {
        id: `ann-${Date.now()}`,
        title: `⏭ ข้ามตาเล่น (EQUILIBRIUM STOP)!`,
        subtitle: `${player.name} ลง SKIP ⟹ ข้ามตา ${targetPlayer.name} ในรอบนี้!`,
        type: 'SPECIAL',
        card,
        durationMs: 2600,
      };
      st.actionAnnouncement = announcement;
      st.logs = [
        createLog(
          `⏭ EQUILIBRIUM STOP! Player ${player.letter} ลงไพ่ SKIP ⟹ ข้ามตา Player ${targetPlayer.letter} (${targetPlayer.name})`,
          'special'
        ),
        ...st.logs,
      ];
      const nextState = advanceTurn(st, 2);
      setGameState(nextState);
      syncOnlineGameState(nextState, announcement);
    } else if (card.type === 'REVERSE') {
      // REVERSE INVERSION
      const newDirection = (st.direction * -1) as 1 | -1;
      st.direction = newDirection;

      const announcement: ActionAnnouncement = {
        id: `ann-${Date.now()}`,
        title: `🔄 สลับทิศทางการเล่น (REVERSE)!`,
        subtitle: `เปลี่ยนทิศทางรอบโต๊ะเป็น: ${newDirection === 1 ? 'ตามเข็มนาฬิกา ↻' : 'ทวนเข็มนาฬิกา ↺'}`,
        type: 'SPECIAL',
        card,
        durationMs: 2600,
      };
      st.actionAnnouncement = announcement;
      st.logs = [
        createLog(
          `🔄 REVERSE! Player ${player.letter} ลงไพ่ Reverse ⟹ ทิศทางการเล่นสลับเป็น ${
            newDirection === 1 ? 'ตามเข็ม ↻' : 'ทวนเข็ม ↺'
          }`,
          'special'
        ),
        ...st.logs,
      ];
      const step = st.players.length === 2 ? 2 : 1;
      const nextState = advanceTurn(st, step);
      setGameState(nextState);
      syncOnlineGameState(nextState, announcement);
    } else if (card.type === 'EQUATION') {
      triggerEquationChallenge(st, player, card);
    }
  };

  // ================= ACTION: WILD COLOR SELECTION =================
  const handleSelectWildColor = (chosenColor: CardColor) => {
    if (!gameState || !wildPickerPlayer) return;

    let st = { ...gameState };
    st.currentColor = chosenColor;
    st.gamePhase = 'PLAYING';

    const announcement: ActionAnnouncement = {
      id: `ann-${Date.now()}`,
      title: `★ เปลี่ยนสีเป็น: ${chosenColor}`,
      subtitle: `${wildPickerPlayer.name} ได้เลือกเปลี่ยนทิศทางสีของเกม`,
      type: 'SPECIAL',
      durationMs: 2200,
    };
    st.actionAnnouncement = announcement;
    st.logs = [
      createLog(`Player ${wildPickerPlayer.letter} (${wildPickerPlayer.name}) เลือกเปลี่ยนเป็นสี ${chosenColor}`, 'special'),
      ...st.logs,
    ];
    setWildPickerPlayer(null);
    const nextState = advanceTurn(st, 1);
    setGameState(nextState);
    syncOnlineGameState(nextState, announcement);
  };

  // ================= ACTION: DRAW CARD =================
  const handleDrawCard = () => {
    if (!gameState || gameState.gamePhase !== 'PLAYING') return;

    let st = ensureDeckCards({ ...gameState }, 1);
    const player = st.players[st.currentPlayerIndex];
    if (!player || st.deck.length === 0) return;

    const drawnCard = st.deck.shift()!;
    const topCard = st.discardPile[st.discardPile.length - 1];
    const isPlayable = canPlayCard(drawnCard, topCard, st.currentColor);

    const updatedPlayer: Player = {
      ...player,
      hand: [...player.hand, drawnCard],
    };
    st.players[st.currentPlayerIndex] = updatedPlayer;

    const announcement: ActionAnnouncement = {
      id: `ann-${Date.now()}`,
      title: `🎴 ${player.name} จั่วไพ่ 1 ใบ`,
      subtitle: isPlayable ? 'ได้ไพ่ที่สามารถลงต่อได้!' : 'ไม่สามารถลงได้ จึงเก็บเข้ามือและจบตา',
      type: 'DRAW',
      card: drawnCard,
      durationMs: 2200,
    };
    st.actionAnnouncement = announcement;
    st.logs = [createLog(`Player ${player.letter} (${player.name}) จั่วไพ่ 1 ใบ`, 'draw'), ...st.logs];

    if (player.isBot) {
      if (isPlayable) {
        setGameState(st);
        setTimeout(() => handlePlayCard(drawnCard), 1600);
      } else {
        const nextState = advanceTurn(st, 1);
        setGameState(nextState);
        syncOnlineGameState(nextState, announcement);
      }
    } else {
      if (isPlayable) {
        st.drawnCardChoice = { card: drawnCard, playerId: player.id };
        setGameState(st);
      } else {
        showToast(`🎴 จั่วได้ ${drawnCard.color} ${drawnCard.value ?? drawnCard.type} (ลงไม่ได้ จบตา)`);
        const nextState = advanceTurn(st, 1);
        setGameState(nextState);
        syncOnlineGameState(nextState, announcement);
      }
    }
  };

  const handlePlayDrawnCardChoice = (playNow: boolean) => {
    if (!gameState || !gameState.drawnCardChoice) return;
    const card = gameState.drawnCardChoice.card;
    const st = { ...gameState, drawnCardChoice: null };

    if (playNow) {
      setGameState(st);
      handlePlayCard(card);
    } else {
      const nextState = advanceTurn(st, 1);
      setGameState(nextState);
      syncOnlineGameState(nextState);
    }
  };

  // ================= ACTION: CALL HARMONIC & CATCH =================
  const handleCallHarmonic = (playerId: string) => {
    if (!gameState) return;
    const st = { ...gameState };
    const p = st.players.find((player) => player.id === playerId);
    if (!p) return;

    if (p.hand.length <= 2) {
      p.calledHarmonic = true;
      const announcement: ActionAnnouncement = {
        id: `ann-${Date.now()}`,
        title: `🎵 HARMONIC!`,
        subtitle: `${p.name} ประกาศ “HARMONIC!” (เหลือไพ่เพียง 1-2 ใบ)`,
        type: 'HARMONIC',
        durationMs: 2500,
      };
      st.actionAnnouncement = announcement;
      st.logs = [
        createLog(`🎵 HARMONIC! Player ${p.letter} (${p.name}) ประกาศ “HARMONIC!” แล้ว!`, 'harmonic'),
        ...st.logs,
      ];
      setGameState({ ...st });
      syncOnlineGameState(st, announcement);
    } else {
      showToast('⚠️ คุณยังไม่สามารถประกาศ HARMONIC ได้ (ต้องเหลือไพ่ 1-2 ใบ)');
    }
  };

  const handleCatchHarmonic = (targetPlayerId: string) => {
    if (!gameState) return;
    let st = ensureDeckCards({ ...gameState }, 2);
    const target = st.players.find((p) => p.id === targetPlayerId);
    if (!target || target.hand.length !== 1 || target.calledHarmonic) return;

    const penaltyCards = st.deck.splice(0, 2);
    target.hand.push(...penaltyCards);
    target.calledHarmonic = false;

    const announcement: ActionAnnouncement = {
      id: `ann-${Date.now()}`,
      title: `🚨 จับได้! ลืมประกาศ HARMONIC!`,
      subtitle: `${target.name} เหลือ 1 ใบแต่ลืมพูด ⟹ โดนปรับจั่ว 2 ใบ!`,
      type: 'PENALTY',
      durationMs: 3000,
    };
    st.actionAnnouncement = announcement;
    st.logs = [
      createLog(
        `🚨 จับได้! Player ${target.letter} (${target.name}) ลืมประกาศ HARMONIC โดนปรับจั่ว 2 ใบ!`,
        'penalty'
      ),
      ...st.logs,
    ];
    setGameState({ ...st });
    syncOnlineGameState(st, announcement);
  };

  // ================= ACTION: TRIGGER EQUATION CHALLENGE =================
  const triggerEquationChallenge = (st: GameState, playedByPlayer: Player, card: Card) => {
    let eqDeck = [...st.equationDeck];
    let eqDiscard = [...st.equationDiscardPile];

    if (eqDeck.length === 0) {
      eqDeck = shuffle(eqDiscard);
      eqDiscard = [];
    }

    const equationCard = eqDeck.shift()!;
    eqDiscard.push(equationCard);

    const activePlayerIds = st.players.map((p) => p.id);
    const shuffledPlayerIds = shuffle([...activePlayerIds]);

    const updatedBlanks = equationCard.blanks.map((b, idx) => ({
      ...b,
      assignedPlayerId: shuffledPlayerIds[idx % shuffledPlayerIds.length],
      filledValue: null,
    }));

    const populatedEquation: EquationCard = {
      ...equationCard,
      blanks: updatedBlanks,
    };

    const initialEqState: EquationActiveState = {
      equation: populatedEquation,
      currentBlankIndex: 0,
      assignedPlayerId: updatedBlanks[0].assignedPlayerId!,
      allFilled: false,
      claimedByPlayerId: null,
      disqualifiedPlayerIds: [],
      resultState: null,
    };

    const announcement: ActionAnnouncement = {
      id: `ann-${Date.now()}`,
      title: `∿ เปิดโจทย์ฟิสิกส์ SHM! (${equationCard.title})`,
      subtitle: `${playedByPlayer.name} ลงไพ่ E ⟹ ผู้เล่นตาม Player Card ต้องนำตัวเลขสีที่ตรงกันมาเติมค่า`,
      type: 'EQUATION',
      card,
      durationMs: 3200,
    };

    st.equationDeck = eqDeck;
    st.equationDiscardPile = eqDiscard;
    st.currentEquationState = initialEqState;
    st.gamePhase = 'EQUATION_ACTIVE';
    st.actionAnnouncement = announcement;
    st.logs = [
      createLog(`∿ ไพ่ E ทำงาน! เปิดโจทย์ SHM: "${equationCard.title}" (${equationCard.difficulty})`, 'special'),
      ...st.logs,
    ];

    setGameState(st);
    syncOnlineGameState(st, announcement);
  };

  // Handlers for Equation Challenge
  const handleFillBlank = (blankIdx: number, numberCard: Card, playerId: string) => {
    if (!gameState || !gameState.currentEquationState) return;

    const eqState = { ...gameState.currentEquationState };
    const player = gameState.players.find((p) => p.id === playerId);
    if (!player) return;

    const updatedHand = player.hand.filter((c) => c.id !== numberCard.id);
    const updatedPlayers = gameState.players.map((p) =>
      p.id === playerId ? { ...p, hand: updatedHand } : p
    );

    const targetBlank = eqState.equation.blanks[blankIdx];
    targetBlank.filledValue = numberCard.value ?? 1;

    const nextBlankIdx = blankIdx + 1;
    const isFinished = nextBlankIdx >= eqState.equation.blanks.length;

    eqState.currentBlankIndex = isFinished ? blankIdx : nextBlankIdx;
    eqState.allFilled = isFinished;
    if (!isFinished) {
      eqState.assignedPlayerId = eqState.equation.blanks[nextBlankIdx].assignedPlayerId!;
    }

    const nextState: GameState = {
      ...gameState,
      players: updatedPlayers,
      currentEquationState: eqState,
      logs: [
        createLog(
          `Player ${player.letter} เติมค่า ${targetBlank.variable} = ${targetBlank.filledValue} (${targetBlank.color})`,
          'play'
        ),
        ...gameState.logs,
      ],
    };

    setGameState(nextState);
    syncOnlineGameState(nextState);
  };

  const handlePlayerDrawForColor = (playerId: string, blankIdx: number) => {
    if (!gameState || !gameState.currentEquationState) return;

    let st = ensureDeckCards({ ...gameState }, 1);
    const player = st.players.find((p) => p.id === playerId);
    const blank = st.currentEquationState.equation.blanks[blankIdx];
    if (!player || !blank || st.deck.length === 0) return;

    const drawnCard = st.deck.shift()!;
    player.hand.push(drawnCard);

    showToast(`🎴 ${player.name} จั่วไพ่ 1 ใบ`);

    if (drawnCard.type === 'NUMBER' && drawnCard.color === blank.color) {
      handleFillBlank(blankIdx, drawnCard, playerId);
    } else {
      handleSkipPlayerCascading(blankIdx);
    }
  };

  const handleSkipPlayerCascading = (blankIdx: number) => {
    if (!gameState || !gameState.currentEquationState) return;

    const eqState = { ...gameState.currentEquationState };
    const blank = eqState.equation.blanks[blankIdx];
    const playerList = gameState.players;

    const currentAssigneeIdx = playerList.findIndex((p) => p.id === blank.assignedPlayerId);
    const nextPlayer = playerList[(currentAssigneeIdx + 1) % playerList.length];

    blank.assignedPlayerId = nextPlayer.id;
    eqState.assignedPlayerId = nextPlayer.id;

    const nextState = {
      ...gameState,
      currentEquationState: eqState,
      logs: [
        createLog(
          `ส่งต่อการเติมช่อง ${blank.variable} ให้ Player ${nextPlayer.letter} (${nextPlayer.name})`,
          'info'
        ),
        ...gameState.logs,
      ],
    };

    setGameState(nextState);
    syncOnlineGameState(nextState);
  };

  const handleClaimAnswer = async (playerId: string) => {
    if (!gameState || !gameState.currentEquationState || gameState.currentEquationState.claimedByPlayerId)
      return;

    // Supabase race condition prevention via atomic claim
    if (gameState.roomId) {
      try {
        const claimResult = await claimEquationAnswerAtomic(gameState.roomId, playerId);
        if (!claimResult.success) {
          showToast(claimResult.error || '⚠️ มีผู้เล่นคนอื่นกดแย่งตอบได้เร็วกว่าคุณเสี้ยววินาที!');
          return;
        }
      } catch (err: any) {
        showToast('⚠️ เกิดข้อผิดพลาดในการแย่งตอบ');
        return;
      }
    }

    const eqState = { ...gameState.currentEquationState, claimedByPlayerId: playerId };
    const player = gameState.players.find((p) => p.id === playerId);

    const nextState: GameState = {
      ...gameState,
      gamePhase: 'ANSWERING',
      currentEquationState: eqState,
      version: (gameState.version || 0) + 1,
      logs: [
        createLog(`⚡ Player ${player?.letter} (${player?.name}) ชิงสิทธิ์กดตอบโจทย์ได้ก่อน!`, 'harmonic'),
        ...gameState.logs,
      ],
    };

    setGameState(nextState);
    syncOnlineGameState(nextState);
  };

  const handleSubmitAnswer = (playerId: string, answerText: string) => {
    if (!gameState || !gameState.currentEquationState) return;

    const eq = gameState.currentEquationState.equation;
    const player = gameState.players.find((p) => p.id === playerId);
    if (!player) return;

    const inputs: Record<string, number> = {};
    for (const b of eq.blanks) {
      inputs[b.variable] = b.filledValue ?? 1;
    }

    const sol = eq.calculateAnswer(inputs);
    const isCorrect = checkAnswerMath(answerText, sol.acceptableAnswers, sol.numericValue);

    let updatedPlayers = [...gameState.players];
    let newDisqualified = [...gameState.currentEquationState.disqualifiedPlayerIds];
    let pendingFreeDiscard: string | null = null;

    if (isCorrect) {
      pendingFreeDiscard = playerId;
    } else {
      let st = ensureDeckCards({ ...gameState }, 1);
      const drawnPenalty = st.deck.shift();
      if (drawnPenalty) {
        player.hand.push(drawnPenalty);
      }
      newDisqualified.push(playerId);
    }

    const resultState = {
      answeredPlayerId: playerId,
      submittedText: answerText,
      correct: isCorrect,
      solution: sol,
      pendingFreeDiscardPlayerId: pendingFreeDiscard,
    };

    const updatedEqState: EquationActiveState = {
      ...gameState.currentEquationState,
      claimedByPlayerId: null,
      disqualifiedPlayerIds: newDisqualified,
      resultState,
    };

    const nextState: GameState = {
      ...gameState,
      players: updatedPlayers,
      currentEquationState: updatedEqState,
      logs: [
        createLog(
          isCorrect
            ? `✅ ถูกต้อง! Player ${player.letter} ตอบถูก (${answerText} ${sol.unit}) ได้สิทธิ์ทิ้งไพ่ฟรี 1 ใบ!`
            : `❌ ตอบผิด! Player ${player.letter} ตอบ (${answerText}) ถูกปรับจั่ว 1 ใบ และหมดสิทธิ์ตอบข้อนี้`,
          isCorrect ? 'win' : 'penalty'
        ),
        ...gameState.logs,
      ],
    };

    setGameState(nextState);
    syncOnlineGameState(nextState);
  };

  const handleFreeDiscardCard = (playerId: string, cardId: string) => {
    if (!gameState || !gameState.currentEquationState?.resultState) return;

    const player = gameState.players.find((p) => p.id === playerId);
    if (!player) return;

    const discardedCard = player.hand.find((c) => c.id === cardId);
    if (!discardedCard) return;

    const updatedHand = player.hand.filter((c) => c.id !== cardId);
    const updatedPlayers = gameState.players.map((p) =>
      p.id === playerId ? { ...p, hand: updatedHand } : p
    );

    const updatedResult = {
      ...gameState.currentEquationState.resultState,
      pendingFreeDiscardPlayerId: null,
    };

    const updatedEqState = {
      ...gameState.currentEquationState,
      resultState: updatedResult,
    };

    const nextState = {
      ...gameState,
      players: updatedPlayers,
      discardPile: [...gameState.discardPile, discardedCard],
      currentEquationState: updatedEqState,
      logs: [
        createLog(
          `🎉 Player ${player.letter} ใช้สิทธิ์ตอบถูก ทิ้งไพ่ฟรี (${discardedCard.color} ${
            discardedCard.value ?? discardedCard.type
          }) ออกจากมือ!`,
          'special'
        ),
        ...gameState.logs,
      ],
    };

    setGameState(nextState);
    syncOnlineGameState(nextState);
  };

  const handleCloseEquation = () => {
    if (!gameState) return;

    const nextState = advanceTurn({
      ...gameState,
      currentEquationState: null,
      gamePhase: 'PLAYING',
    });

    setGameState(nextState);
    syncOnlineGameState(nextState);
  };

  // ================= BOT AUTOPLAY LOGIC (PACED & SLOWED DOWN) =================
  useEffect(() => {
    if (!gameState) return;

    // Bot playing main turns
    if (gameState.gamePhase === 'PLAYING') {
      const currentP = gameState.players[gameState.currentPlayerIndex];
      if (currentP && currentP.isBot) {
        // Slow down bot turns to ~2.2s so user can read what's happening
        const botTimer = setTimeout(() => {
          const topCard = gameState.discardPile[gameState.discardPile.length - 1];
          const playableCards = currentP.hand.filter((c) =>
            canPlayCard(c, topCard, gameState.currentColor)
          );

          if (playableCards.length > 0) {
            const chosen = playableCards[0];
            if (currentP.hand.length === 2) {
              handleCallHarmonic(currentP.id);
            }
            handlePlayCard(chosen);
          } else {
            handleDrawCard();
          }
        }, 2200);

        return () => clearTimeout(botTimer);
      }
    }

    // Bot filling blanks in Equation Modal
    if (gameState.gamePhase === 'EQUATION_ACTIVE' && gameState.currentEquationState) {
      const eqState = gameState.currentEquationState;
      if (!eqState.allFilled) {
        const assignedP = gameState.players.find((p) => p.id === eqState.assignedPlayerId);
        if (assignedP && assignedP.isBot) {
          const fillTimer = setTimeout(() => {
            const currentBlank = eqState.equation.blanks[eqState.currentBlankIndex];
            if (!currentBlank) return;

            const matching = assignedP.hand.filter(
              (c) => c.type === 'NUMBER' && c.color === currentBlank.color
            );

            if (matching.length > 0) {
              handleFillBlank(eqState.currentBlankIndex, matching[0], assignedP.id);
            } else {
              handlePlayerDrawForColor(assignedP.id, eqState.currentBlankIndex);
            }
          }, 2400);

          return () => clearTimeout(fillTimer);
        }
      } else if (eqState.allFilled && !eqState.claimedByPlayerId && !eqState.resultState) {
        // Bot buzz-in if all blanks filled
        const eligibleBots = gameState.players.filter(
          (p) => p.isBot && !eqState.disqualifiedPlayerIds.includes(p.id)
        );
        if (eligibleBots.length > 0) {
          const buzzTimer = setTimeout(() => {
            const randomBot = eligibleBots[Math.floor(Math.random() * eligibleBots.length)];
            handleClaimAnswer(randomBot.id);

            // Bot submits answer after thinking
            setTimeout(() => {
              const inputs: Record<string, number> = {};
              for (const b of eqState.equation.blanks) {
                inputs[b.variable] = b.filledValue ?? 1;
              }
              const sol = eqState.equation.calculateAnswer(inputs);
              const isSmart = Math.random() < 0.85;
              const botAns = isSmart ? String(sol.numericValue) : '99';
              handleSubmitAnswer(randomBot.id, botAns);
            }, 2000);
          }, 4500);

          return () => clearTimeout(buzzTimer);
        }
      } else if (eqState.resultState?.correct && eqState.resultState.pendingFreeDiscardPlayerId) {
        const rewardingBot = gameState.players.find(
          (p) => p.id === eqState.resultState?.pendingFreeDiscardPlayerId && p.isBot
        );
        if (rewardingBot && rewardingBot.hand.length > 0) {
          const discardTimer = setTimeout(() => {
            handleFreeDiscardCard(rewardingBot.id, rewardingBot.hand[0].id);
          }, 2000);
          return () => clearTimeout(discardTimer);
        }
      }
    }
  }, [
    gameState?.gamePhase,
    gameState?.currentPlayerIndex,
    gameState?.currentEquationState?.currentBlankIndex,
    gameState?.currentEquationState?.allFilled,
    gameState?.currentEquationState?.claimedByPlayerId,
    gameState?.currentEquationState?.resultState,
  ]);

  // Determine which player is the local viewer on this browser
  const localPlayerId = localOnlinePlayer?.id || gameState?.players[0]?.id;

  // ================= MAIN RENDER =================
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 glass-panel-elevated border border-indigo-400/80 rounded-2xl shadow-2xl text-white font-bold text-xs sm:text-sm shadow-indigo-950/60 flex items-center gap-2 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          <span className="text-cyan-300 text-base">✦</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen 1: Start Screen */}
      {!gameState || gameState.gamePhase === 'MENU' ? (
        <StartScreen
          onStartNewGame={handleStartNewGame}
          onOpenOnlineLobby={() => {
            setShowOnlineLobby(true);
          }}
          onOpenHowToPlay={() => setShowHowToPlay(true)}
          onOpenAbout={() => setShowAbout(true)}
        />
      ) : (
        /* Screen 2: Main Game Board */
        <GameBoard
          state={gameState}
          localPlayerId={localPlayerId}
          isOnlineMode={!!gameState.roomId}
          onPlayCard={handlePlayCard}
          onDrawCard={handleDrawCard}
          onCallHarmonic={handleCallHarmonic}
          onCatchHarmonic={handleCatchHarmonic}
          onPlayDrawnCardChoice={handlePlayDrawnCardChoice}
          onOpenHowToPlay={() => setShowHowToPlay(true)}
          onSaveGame={() => {
            saveGameState(gameState);
          }}
          onResetGame={handleResetGame}
        />
      )}

      {/* Online Multiplayer Lobby Modal */}
      <OnlineLobbyModal
        isOpen={showOnlineLobby}
        onClose={() => setShowOnlineLobby(false)}
        roomInfo={onlineRoomInfo}
        localPlayer={localOnlinePlayer}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        onAddBot={handleAddBotToRoom}
        onRemoveBot={handleRemoveBotFromRoom}
        onToggleReady={handleToggleReady}
        onStartGame={handleStartOnlineGame}
        onLeaveRoom={handleLeaveRoom}
        onOpenSupabaseConfig={() => setShowSupabaseConfig(true)}
        isSupabaseReady={isSupabaseReady}
        isConnected={isSupabaseReady}
        errorMsg={onlineError}
        onClearError={() => setOnlineError(null)}
      />

      {/* Wild Color Selection Modal */}
      {gameState?.gamePhase === 'WILD_COLOR_PICK' && wildPickerPlayer && (
        <WildColorModal
          isOpen={true}
          playerName={wildPickerPlayer.name}
          onSelectColor={handleSelectWildColor}
        />
      )}

      {/* Equation Challenge Modal */}
      {gameState?.gamePhase === 'EQUATION_ACTIVE' && gameState.currentEquationState && (
        <EquationModal
          isOpen={true}
          state={gameState.currentEquationState}
          players={gameState.players}
          mainDeckCount={gameState.deck.length}
          localPlayerId={gameState.roomId ? localOnlinePlayer?.id : undefined}
          onFillBlank={handleFillBlank}
          onPlayerDrawForColor={handlePlayerDrawForColor}
          onSkipPlayerCascading={handleSkipPlayerCascading}
          onClaimAnswer={handleClaimAnswer}
          onSubmitAnswer={handleSubmitAnswer}
          onFreeDiscardCard={handleFreeDiscardCard}
          onCloseEquation={handleCloseEquation}
        />
      )}

      {/* Supabase Database / Netlify Configuration Modal */}
      <SupabaseConfigModal
        isOpen={showSupabaseConfig}
        onClose={() => {
          setShowSupabaseConfig(false);
          setIsSupabaseReady(isSupabaseConfigured());
        }}
        onSaveSuccess={() => {
          setIsSupabaseReady(true);
          showToast('✅ บันทึกและเชื่อมต่อ Supabase สำเร็จ!');
        }}
      />

      {/* Game Over Modal */}
      {gameState?.gamePhase === 'GAME_OVER' && (
        <GameOverModal
          winner={gameState.winner}
          turnsCount={gameState.turnsCount}
          players={gameState.players}
          onPlayAgain={() => {
            if (gameState.roomId) {
              handleStartOnlineGame();
            } else {
              const configs = gameState.players.map((p) => ({
                name: p.name,
                letter: p.letter,
                isBot: p.isBot,
              }));
              handleStartNewGame(configs);
            }
          }}
          onBackToMenu={handleResetGame}
        />
      )}

      {/* Rules Modal */}
      <HowToPlayModal isOpen={showHowToPlay} onClose={() => setShowHowToPlay(false)} />

      {/* About Modal */}
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </div>
  );
}
