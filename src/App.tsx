import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ActionAnnouncement,
  Card,
  CardColor,
  EquationActiveState,
  EquationCard,
  EquationResultState,
  FinishedPlayer,
  GameLogEntry,
  GameMode,
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
  leaveRoomInSupabase,
  subscribeToSupabaseRoom,
  getSavedRoomSession,
  clearRoomSession,
  saveRoomSession,
  RoomRecord,
} from './utils/supabaseClient';

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const gameStateRef = useRef<GameState | null>(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

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
  const [localSinglePlayerId, setLocalSinglePlayerId] = useState<string | null>(() => {
    try {
      const saved = loadSavedGameState();
      if (saved && saved.players) {
        const human = saved.players.find((p) => !p.isBot);
        return human ? human.id : null;
      }
    } catch {
      // ignore
    }
    return null;
  });
  const supabaseUnsubRef = useRef<(() => void) | null>(null);

  // Check saved game on mount: auto-resume if game was actively running
  useEffect(() => {
    const saved = loadSavedGameState();
    if (saved && saved.gamePhase !== 'GAME_OVER' && saved.gamePhase !== 'MENU') {
      const human = saved.players.find((p) => !p.isBot) || saved.players[0];
      if (human) setLocalSinglePlayerId(human.id);
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
      version: record.version,
    } as any));

    // Update localOnlinePlayer state from latest players list
    setLocalOnlinePlayer((prev) => {
      if (!prev || !record.players) return prev;
      const meInRecord = record.players.find((p) => p.id === prev.id);
      return meInRecord ? { ...prev, ...meInRecord } : prev;
    });

    // 2. Update Game State if record has state and version is >= current
    if (record.state) {
      let incomingState = record.state;

      // Rehydrate calculateAnswer function from EQUATION_CARDS_DATA if missing
      if (incomingState.currentEquationState?.equation) {
        const masterEq = EQUATION_CARDS_DATA.find(
          (e) => e.id === incomingState.currentEquationState!.equation.id
        );
        if (masterEq) {
          incomingState = {
            ...incomingState,
            currentEquationState: {
              ...incomingState.currentEquationState,
              equation: {
                ...masterEq,
                ...incomingState.currentEquationState.equation,
                calculateAnswer: masterEq.calculateAnswer,
              },
            },
          };
        }
      }

      setGameState((prevState) => {
        const prevVersion = prevState?.version ?? 0;
        const incomingVersion = incomingState.version ?? record.version ?? 0;
        const isGameStarting =
          (prevState?.gamePhase === 'LOBBY' || prevState?.gamePhase === 'MENU' || !prevState) &&
          incomingState.gamePhase !== 'LOBBY' &&
          incomingState.gamePhase !== 'MENU';

        if (!prevState || incomingVersion >= prevVersion || isGameStarting) {
          // If room transitions to PLAYING, dismiss lobby modal immediately
          if (incomingState.gamePhase !== 'LOBBY' && incomingState.gamePhase !== 'MENU') {
            setShowOnlineLobby(false);
          }
          return {
            ...incomingState,
            roomId: record.room_code,
            version: Math.max(incomingVersion, prevVersion),
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
      const baseVersion = newState.version || 1;
      const stateToSync: GameState = {
        ...newState,
        version: baseVersion + 1,
        actionAnnouncement: announcement || newState.actionAnnouncement || null,
        lastActionTime: Date.now(),
      };

      try {
        const result = await syncGameStateToSupabase(newState.roomId, stateToSync, baseVersion);
        if (result.success && result.newVersion) {
          setGameState((prev) => (prev ? { ...prev, version: result.newVersion } : prev));
        } else if (!result.success && result.state) {
          console.warn('Sync conflict: reconciling with server state version', result.newVersion);
          setGameState({
            ...result.state,
            roomId: newState.roomId,
            version: result.newVersion,
          });
        }
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

  const handleLeaveRoom = async () => {
    if (onlineRoomInfo && localOnlinePlayer) {
      await leaveRoomInSupabase(onlineRoomInfo.roomId, localOnlinePlayer.id);
    }
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
    if (!onlineRoomInfo) return;
    if (onlineRoomInfo.players.length < 2) {
      showToast('⚠️ ต้องมีผู้เล่นอย่างน้อย 2 คนขึ้นไป (กดเพิ่มบอทช่วยเล่นได้)');
      return;
    }

    // Verify all non-bot guests are ready
    const humanGuests = onlineRoomInfo.players.filter((p) => !p.isHost && !p.isBot);
    const unreadyGuests = humanGuests.filter((p) => !p.isReady);
    if (unreadyGuests.length > 0) {
      showToast(
        `⚠️ ยังเริ่มเกมไม่ได้: รอให้ ${unreadyGuests.map((u) => u.name).join(', ')} กดพร้อมเล่นก่อน`
      );
      return;
    }

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

    const currentRoomVersion =
      (onlineRoomInfo as any).version ?? (gameState?.version ?? 1);
    const startVersion = Math.max(currentRoomVersion + 1, 2);

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
      gameMode: 'FIND_WINNER',
      pendingDraw: 0,
      finishedPlayers: [],
      winner: null,
      turnsCount: 1,
      logs: initialLogs,
      lastActionTime: Date.now(),
      roomId: onlineRoomInfo.roomId,
      actionAnnouncement: initialAnnouncement,
      version: startVersion,
    };

    setGameState(initialGameState);
    setShowOnlineLobby(false);
    await syncGameStateToSupabase(onlineRoomInfo.roomId, initialGameState, currentRoomVersion);
  };

  // ================= START GAME / NEW GAME (SINGLEPLAYER) =================
  const handleStartNewGame = (
    configs: { name: string; letter: PlayerLetter; isBot: boolean }[],
    selectedMode: GameMode = 'FIND_WINNER'
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

    const modeText =
      selectedMode === 'FIND_LOSER'
        ? 'โหมด: ผู้เหลือไพ่คนสุดท้าย (Last Man Standing)'
        : 'โหมด: ใครหมดก่อนชนะ (First to Finish)';

    const startAnnouncement: ActionAnnouncement = {
      id: `ann-${Date.now()}`,
      title: '🎮 เริ่มเกม HARMONIC!',
      subtitle: `${modeText} | ไพ่ใบแรกคือ ${firstCard.color} ${firstCard.value ?? firstCard.type}`,
      type: 'INFO',
      card: firstCard,
      durationMs: 2500,
    };

    const initialLogs: GameLogEntry[] = [
      createLog(`🎮 เกม HARMONIC เริ่มต้นขึ้นแล้ว! (${modeText}) แจกไพ่คนละ 7 ใบ`, 'info'),
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
      gameMode: selectedMode,
      pendingDraw: 0,
      finishedPlayers: [],
      winner: null,
      turnsCount: 1,
      logs: initialLogs,
      lastActionTime: Date.now(),
      actionAnnouncement: startAnnouncement,
    };

    const human = players.find((p) => !p.isBot) || players[0];
    setLocalSinglePlayerId(human.id);
    setGameState(newState);
    setHasSavedGame(true);
  };

  const handleContinueGame = () => {
    const saved = loadSavedGameState();
    if (saved) {
      const human = saved.players.find((p) => !p.isBot) || saved.players[0];
      if (human) setLocalSinglePlayerId(human.id);
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

  // Helper: Find next active player index (skipping finished players)
  const getNextActivePlayerIndex = (
    players: Player[],
    currentIndex: number,
    direction: 1 | -1,
    steps: number = 1
  ): number => {
    const total = players.length;
    const activePlayers = players.filter((p) => !p.isFinished && p.hand.length > 0);
    if (activePlayers.length <= 1) return currentIndex;

    let nextIdx = currentIndex;
    let countedSteps = 0;
    let safety = 0;

    while (countedSteps < steps && safety < total * 4) {
      safety++;
      nextIdx = (nextIdx + direction + total) % total;
      const candidate = players[nextIdx];
      if (candidate && !candidate.isFinished && candidate.hand.length > 0) {
        countedSteps++;
      }
    }
    return nextIdx;
  };

  // Helper: Get target player index for penalty cards (+2, SKIP) skipping finished players
  const getNextTargetPlayerIndex = (
    players: Player[],
    currentIndex: number,
    direction: 1 | -1
  ): number => {
    return getNextActivePlayerIndex(players, currentIndex, direction, 1);
  };

  // Turn Advancement
  const advanceTurn = useCallback(
    (
      prevState: GameState,
      step = 1,
      customWinner: Player | null = null,
      customLoser: Player | null = null
    ): GameState => {
      if (customWinner) {
        return {
          ...prevState,
          gamePhase: 'GAME_OVER',
          winner: customWinner,
          logs: [createLog(`🏆 HARMONIC! ผู้เล่น ${customWinner.name} ชนะเกมแล้ว!`, 'win'), ...prevState.logs],
        };
      }

      if (customLoser) {
        return {
          ...prevState,
          gamePhase: 'GAME_OVER',
          loser: customLoser,
          logs: [
            createLog(
              `💀 LAST MAN STANDING! ผู้เล่น ${customLoser.name} เป็นผู้เหลือไพ่คนสุดท้าย (Loser)!`,
              'penalty'
            ),
            ...prevState.logs,
          ],
        };
      }

      const nextIndex = getNextActivePlayerIndex(
        prevState.players,
        prevState.currentPlayerIndex,
        prevState.direction,
        step
      );

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

    // Turn Guard in online mode: only active player (or host for bots) can play
    if (gameState.roomId) {
      if (player.isBot) {
        if (!localOnlinePlayer?.isHost) return;
      } else {
        if (player.id !== localPlayerId) {
          showToast('⚠️ ยังไม่ถึงตาเล่นของคุณ!');
          return;
        }
      }
    }

    // Remove card from player hand
    const updatedHand = player.hand.filter((c) => c.id !== card.id);
    let calledHarmonic = updatedHand.length === 1 ? player.calledHarmonic : false;

    // If bot has 1 card left, bot decides whether to call Harmonic (90% success, 10% forgets)
    if (player.isBot && updatedHand.length === 1) {
      const botCalls = Math.random() < 0.90;
      calledHarmonic = botCalls;
      if (botCalls) {
        st.logs = [
          createLog(`🎵 HARMONIC! Player ${player.letter} (${player.name}) ประกาศ “HARMONIC!” (เหลือไพ่ 1 ใบ)`, 'harmonic'),
          ...st.logs,
        ];
      }
    }

    const updatedPlayer: Player = {
      ...player,
      hand: updatedHand,
      calledHarmonic,
    };

    const updatedPlayers = [...st.players];
    updatedPlayers[st.currentPlayerIndex] = updatedPlayer;

    // Check Win/Finish Condition: Hand is empty!
    if (updatedHand.length === 0) {
      st = {
        ...st,
        players: updatedPlayers,
        discardPile: [...st.discardPile, card],
        currentColor: card.color === 'WILD' ? st.currentColor : card.color,
      };

      if (st.gameMode === 'FIND_LOSER') {
        // Mode: Find Loser (Last Man Standing)
        const prevFinished = st.finishedPlayers || [];
        const nextRank = prevFinished.length + 1;
        const finishedRecord: FinishedPlayer = {
          player: updatedPlayer,
          rank: nextRank,
          finishTime: Date.now(),
        };
        const updatedFinished = [...prevFinished, finishedRecord];

        // Mark player as finished
        const finalizedPlayers = updatedPlayers.map((p) =>
          p.id === updatedPlayer.id ? { ...p, isFinished: true, finishRank: nextRank } : p
        );
        st.players = finalizedPlayers;
        st.finishedPlayers = updatedFinished;

        const remainingActive = finalizedPlayers.filter(
          (p) => !p.isFinished && p.hand.length > 0
        );

        if (remainingActive.length <= 1) {
          // Exactly 1 or 0 remaining -> Game Ends, Last player is LOSER!
          const loserPlayer = remainingActive[0] || null;
          const endAnnouncement: ActionAnnouncement = {
            id: `ann-${Date.now()}`,
            title: `💀 จบการแข่งขัน LAST MAN STANDING!`,
            subtitle: loserPlayer
              ? `ผู้เหลือไพ่คนสุดท้ายคือ ${loserPlayer.name} (Loser)!`
              : 'จบการแข่งขัน',
            type: 'PENALTY',
            card,
            durationMs: 4500,
          };
          const finalState: GameState = {
            ...advanceTurn(st, 1, null, loserPlayer),
            actionAnnouncement: endAnnouncement,
          };
          setGameState(finalState);
          syncOnlineGameState(finalState, endAnnouncement);
          return;
        } else {
          // More than 1 player remaining -> Announce finish and continue game
          const finishAnnouncement: ActionAnnouncement = {
            id: `ann-${Date.now()}`,
            title: `🎉 ${player.name} ทิ้งไพ่หมดมือแล้ว! (อันดับ #${nextRank})`,
            subtitle: `ผ่านเข้ารอบสำเร็จ! การแข่งขันดำเนินต่อเพื่อหาผู้เหลือไพ่คนสุดท้าย...`,
            type: 'SPECIAL',
            card,
            durationMs: 3200,
          };
          st.actionAnnouncement = finishAnnouncement;
          st.logs = [
            createLog(
              `🎉 Player ${player.letter} (${player.name}) ทิ้งไพ่หมดมือ ได้อันดับ #${nextRank}! (เหลือผู้เล่นอีก ${remainingActive.length} คน)`,
              'win'
            ),
            ...st.logs,
          ];
          const nextState = advanceTurn(st, 1);
          setGameState(nextState);
          syncOnlineGameState(nextState, finishAnnouncement);
          return;
        }
      } else {
        // Mode: Find Winner (First to empty hand wins!)
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
        // Pick the color the bot has the most cards of in its remaining hand
        const availableColors: CardColor[] = ['RED', 'BLUE', 'GREEN', 'YELLOW'];
        const colorCounts: Record<string, number> = { RED: 0, BLUE: 0, GREEN: 0, YELLOW: 0 };
        updatedHand.forEach((c) => {
          if (c.color !== 'WILD') colorCounts[c.color] = (colorCounts[c.color] || 0) + 1;
        });
        const chosenColor = availableColors.reduce((a, b) =>
          colorCounts[a] >= colorCounts[b] ? a : b
        );
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
        st.wildPickerPlayerId = player.id;
        st.wildPickerPlayerName = player.name;
        setWildPickerPlayer(player);
        const announcement: ActionAnnouncement = {
          id: `ann-${Date.now()}`,
          title: `★ ไพ่เปลี่ยนสี WILD!`,
          subtitle: `${player.name} กำลังเลือกสีนำของเกม...`,
          type: 'SPECIAL',
          card,
          durationMs: 2500,
        };
        st.actionAnnouncement = announcement;
        st.logs = [
          createLog(`★ WILD! Player ${player.letter} (${player.name}) เล่น WILD และกำลังเลือกสีใหม่`, 'special'),
          ...st.logs,
        ];
        setGameState(st);
        syncOnlineGameState(st, announcement);
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
      const targetPlayerIdx = getNextTargetPlayerIndex(st.players, st.currentPlayerIndex, st.direction);
      const targetPlayer = st.players[targetPlayerIdx];
      const drawnCards = st.deck.splice(0, 2);

      const targetUpdated: Player = {
        ...targetPlayer,
        hand: [...targetPlayer.hand, ...drawnCards],
      };
      st.players[targetPlayerIdx] = targetUpdated;

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
      const targetPlayerIdx = getNextTargetPlayerIndex(st.players, st.currentPlayerIndex, st.direction);
      const targetPlayer = st.players[targetPlayerIdx];

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
      const activeCount = st.players.filter((p) => !p.isFinished && p.hand.length > 0).length;
      const step = activeCount === 2 ? 2 : 1;
      const nextState = advanceTurn(st, step);
      setGameState(nextState);
      syncOnlineGameState(nextState, announcement);
    } else if (card.type === 'EQUATION') {
      triggerEquationChallenge(st, player, card);
    }
  };

  // ================= ACTION: WILD COLOR SELECTION =================
  const handleSelectWildColor = (chosenColor: CardColor) => {
    if (!gameState) return;
    const pickerId = gameState.wildPickerPlayerId || wildPickerPlayer?.id;
    const picker = gameState.players.find((p) => p.id === pickerId) || wildPickerPlayer;
    if (!picker) return;

    let st = { ...gameState };
    st.currentColor = chosenColor;
    st.gamePhase = 'PLAYING';
    st.wildPickerPlayerId = null;
    st.wildPickerPlayerName = null;

    const announcement: ActionAnnouncement = {
      id: `ann-${Date.now()}`,
      title: `★ เปลี่ยนสีเป็น: ${chosenColor}`,
      subtitle: `${picker.name} ได้เลือกเปลี่ยนสีนำของเกม`,
      type: 'SPECIAL',
      durationMs: 2200,
    };
    st.actionAnnouncement = announcement;
    st.logs = [
      createLog(`Player ${picker.letter} (${picker.name}) เลือกเปลี่ยนเป็นสี ${chosenColor}`, 'special'),
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

    // Turn Guard in online mode: only active player (or host for bots) can draw
    if (gameState.roomId) {
      if (player.isBot) {
        if (!localOnlinePlayer?.isHost) return;
      } else {
        if (player.id !== localPlayerId) {
          showToast('⚠️ ยังไม่ถึงตาเล่นของคุณ!');
          return;
        }
      }
    }

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
        st.drawnCardChoice = { card: drawnCard, playerId: player.id };
        setGameState(st);
        setTimeout(() => {
          if (gameStateRef.current?.drawnCardChoice?.playerId === player.id) {
            handlePlayDrawnCardChoice(true);
          }
        }, 1500);
      } else {
        const nextState = advanceTurn(st, 1);
        setGameState(nextState);
        syncOnlineGameState(nextState, announcement);
      }
    } else {
      if (isPlayable) {
        st.drawnCardChoice = { card: drawnCard, playerId: player.id };
        setGameState(st);
        syncOnlineGameState(st, announcement);
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
    // In online mode, you can only declare Harmonic for yourself
    if (gameState.roomId && playerId !== localPlayerId) return;
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
    const updatedPlayers = st.players.map((p) => {
      if (p.id === targetPlayerId) {
        return {
          ...p,
          hand: [...p.hand, ...penaltyCards],
          calledHarmonic: false,
        };
      }
      return p;
    });
    st.players = updatedPlayers;

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

    // Check Win Condition: Player emptied their hand filling the equation!
    if (updatedHand.length === 0) {
      const winAnnouncement: ActionAnnouncement = {
        id: `ann-${Date.now()}`,
        title: `🏆 ${player.name} เป็นผู้ชนะเกม!`,
        subtitle: 'ใช้ไพ่ใบสุดท้ายเติมตัวแปรสมการจนหมดมือเกลี้ยง!',
        type: 'WIN',
        card: numberCard,
        durationMs: 4500,
      };
      const finalState: GameState = {
        ...gameState,
        gamePhase: 'GAME_OVER',
        winner: player,
        players: updatedPlayers,
        actionAnnouncement: winAnnouncement,
        currentEquationState: null,
      };
      setGameState(finalState);
      syncOnlineGameState(finalState, winAnnouncement);
      return;
    }

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
    const playerIndex = st.players.findIndex((p) => p.id === playerId);
    const blank = st.currentEquationState.equation.blanks[blankIdx];
    if (playerIndex === -1 || !blank || st.deck.length === 0) return;

    const drawnCard = st.deck.shift()!;
    const targetPlayer = st.players[playerIndex];
    const updatedPlayer: Player = {
      ...targetPlayer,
      hand: [...targetPlayer.hand, drawnCard],
    };
    const updatedPlayers = [...st.players];
    updatedPlayers[playerIndex] = updatedPlayer;
    st.players = updatedPlayers;

    showToast(`🎴 ${targetPlayer.name} จั่วไพ่ 1 ใบ`);

    if (drawnCard.type === 'NUMBER' && drawnCard.color === blank.color) {
      setGameState(st);
      handleFillBlank(blankIdx, drawnCard, playerId);
    } else {
      setGameState(st);
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

    const masterEq = EQUATION_CARDS_DATA.find((e) => e.id === eq.id) || eq;
    let sol;
    if (typeof masterEq.calculateAnswer === 'function') {
      sol = masterEq.calculateAnswer(inputs);
    } else {
      const val = inputs[eq.targetVariable] ?? 0;
      sol = {
        numericValue: val,
        acceptableAnswers: [String(val)],
        displayAnswer: `${eq.targetVariable} = ${val} ${eq.targetUnit}`,
        explanationSteps: [`แทนค่าตัวแปรในสมการ ${eq.formula}`],
      };
    }

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
        updatedPlayers = updatedPlayers.map((p) =>
          p.id === playerId ? { ...p, hand: [...p.hand, drawnPenalty] } : p
        );
      }
      newDisqualified.push(playerId);
    }

    const resultState: EquationResultState = {
      answeredPlayerId: playerId,
      answeringPlayerId: playerId,
      submittedText: answerText,
      correct: isCorrect,
      solution: sol,
      steps: sol.explanationSteps || [],
      correctAnswerDisplay: sol.displayAnswer,
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
            ? `✅ ถูกต้อง! Player ${player.letter} ตอบถูก (${answerText} ${eq.targetUnit}) ได้สิทธิ์ทิ้งไพ่ฟรี 1 ใบ!`
            : `❌ ตอบผิด! Player ${player.letter} ตอบ (${answerText}) ถูกปรับจั่ว 1 ใบ และหมดสิทธิ์ตอบข้อนี้`,
          isCorrect ? 'win' : 'penalty'
        ),
        ...gameState.logs,
      ],
    };

    setGameState(nextState);
    syncOnlineGameState(nextState);

    // Bot automation after answering
    if (isCorrect && player.isBot) {
      setTimeout(() => {
        const latestState = gameStateRef.current;
        const botP = latestState?.players.find((p) => p.id === playerId);
        if (botP && botP.hand.length > 0) {
          handleFreeDiscardCard(playerId, botP.hand[0].id);
          setTimeout(() => {
            handleCloseEquation();
          }, 2400);
        } else {
          handleCloseEquation();
        }
      }, 1500);
    } else if (!isCorrect) {
      if (newDisqualified.length >= gameState.players.length) {
        // Everyone was disqualified, auto-close after 3.2s
        setTimeout(() => {
          handleCloseEquation();
        }, 3200);
      } else {
        // Other players can still answer, reset buzzer after 3.5s
        setTimeout(() => {
          handleResetEquationForRetry();
        }, 3500);
      }
    }
  };

  const handleResetEquationForRetry = () => {
    if (!gameState || !gameState.currentEquationState) return;
    const eqState: EquationActiveState = {
      ...gameState.currentEquationState,
      claimedByPlayerId: null,
      resultState: null,
    };
    const nextState: GameState = {
      ...gameState,
      gamePhase: 'EQUATION_ACTIVE',
      currentEquationState: eqState,
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

    // Check Win/Finish Condition: Player emptied hand with free discard!
    if (updatedHand.length === 0) {
      if (gameState.gameMode === 'FIND_LOSER') {
        const prevFinished = gameState.finishedPlayers || [];
        const nextRank = prevFinished.length + 1;
        const finishedRecord: FinishedPlayer = {
          player: { ...player, hand: [] },
          rank: nextRank,
          finishTime: Date.now(),
        };
        const updatedFinished = [...prevFinished, finishedRecord];

        const finalizedPlayers = updatedPlayers.map((p) =>
          p.id === playerId ? { ...p, isFinished: true, finishRank: nextRank } : p
        );

        const remainingActive = finalizedPlayers.filter(
          (p) => !p.isFinished && p.hand.length > 0
        );

        if (remainingActive.length <= 1) {
          const loserPlayer = remainingActive[0] || null;
          const endAnnouncement: ActionAnnouncement = {
            id: `ann-${Date.now()}`,
            title: `💀 จบการแข่งขัน LAST MAN STANDING!`,
            subtitle: loserPlayer
              ? `ผู้เหลือไพ่คนสุดท้ายคือ ${loserPlayer.name} (Loser)!`
              : 'จบการแข่งขัน',
            type: 'PENALTY',
            card: discardedCard,
            durationMs: 4500,
          };
          const finalState: GameState = {
            ...gameState,
            gamePhase: 'GAME_OVER',
            loser: loserPlayer,
            players: finalizedPlayers,
            finishedPlayers: updatedFinished,
            discardPile: [...gameState.discardPile, discardedCard],
            actionAnnouncement: endAnnouncement,
            currentEquationState: null,
          };
          setGameState(finalState);
          syncOnlineGameState(finalState, endAnnouncement);
          return;
        } else {
          const finishAnnouncement: ActionAnnouncement = {
            id: `ann-${Date.now()}`,
            title: `🎉 ${player.name} ทิ้งไพ่ฟรีจนหมดมือ! (อันดับ #${nextRank})`,
            subtitle: `ผ่านเข้ารอบสำเร็จ! การแข่งขันดำเนินต่อ...`,
            type: 'SPECIAL',
            card: discardedCard,
            durationMs: 3200,
          };
          const nextState: GameState = {
            ...gameState,
            players: finalizedPlayers,
            finishedPlayers: updatedFinished,
            discardPile: [...gameState.discardPile, discardedCard],
            actionAnnouncement: finishAnnouncement,
            currentEquationState: null,
            logs: [
              createLog(
                `🎉 Player ${player.letter} (${player.name}) ทิ้งไพ่ฟรีจากสมการจนหมดมือ ได้อันดับ #${nextRank}!`,
                'win'
              ),
              ...gameState.logs,
            ],
          };
          setGameState(nextState);
          syncOnlineGameState(nextState, finishAnnouncement);
          return;
        }
      } else {
        const winAnnouncement: ActionAnnouncement = {
          id: `ann-${Date.now()}`,
          title: `🏆 ${player.name} เป็นผู้ชนะเกม!`,
          subtitle: 'ใช้สิทธิ์ทิ้งไพ่ฟรีจากสมการ SHM จนหมดมือเกลี้ยง!',
          type: 'WIN',
          card: discardedCard,
          durationMs: 4500,
        };
        const finalState: GameState = {
          ...gameState,
          gamePhase: 'GAME_OVER',
          winner: player,
          players: updatedPlayers,
          actionAnnouncement: winAnnouncement,
          currentEquationState: null,
        };
        setGameState(finalState);
        syncOnlineGameState(finalState, winAnnouncement);
        return;
      }
    }

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

    // Auto-close equation 2.2 seconds after human player completes free discard
    if (!player.isBot) {
      setTimeout(() => {
        handleCloseEquation();
      }, 2200);
    }
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

    // In online rooms, only the Host should run bot autoplay logic to prevent duplicate actions
    if (gameState.roomId && !localOnlinePlayer?.isHost) return;

    // Bot catching players who forgot Harmonic:
    const uncalled = gameState.players.filter((p) => p.hand.length === 1 && !p.calledHarmonic);
    if (uncalled.length > 0 && gameState.gamePhase === 'PLAYING') {
      const observingBots = gameState.players.filter((p) => p.isBot && p.id !== uncalled[0].id);
      if (observingBots.length > 0) {
        const catchTimer = setTimeout(() => {
          const target = gameStateRef.current?.players.find((p) => p.id === uncalled[0].id);
          if (target && target.hand.length === 1 && !target.calledHarmonic) {
            handleCatchHarmonic(target.id);
          }
        }, 4000);
        return () => clearTimeout(catchTimer);
      }
    }

    // Bot playing main turns
    if (gameState.gamePhase === 'PLAYING') {
      // If drawnCardChoice is active for a bot, play it after delay
      if (gameState.drawnCardChoice) {
        const choicePlayer = gameState.players.find((p) => p.id === gameState.drawnCardChoice?.playerId);
        if (choicePlayer && choicePlayer.isBot) {
          const choiceTimer = setTimeout(() => {
            handlePlayDrawnCardChoice(true);
          }, 1400);
          return () => clearTimeout(choiceTimer);
        }
        return;
      }

      const currentP = gameState.players[gameState.currentPlayerIndex];
      if (currentP && currentP.isBot) {
        // Slow down bot turns to ~2.0s so user can read what's happening
        const botTimer = setTimeout(() => {
          const latest = gameStateRef.current;
          if (!latest || latest.gamePhase !== 'PLAYING' || latest.currentPlayerIndex !== gameState.currentPlayerIndex) return;

          const topCard = latest.discardPile[latest.discardPile.length - 1];
          const botPlayer = latest.players[latest.currentPlayerIndex];
          if (!botPlayer) return;

          const playableCards = botPlayer.hand.filter((c) =>
            canPlayCard(c, topCard, latest.currentColor)
          );

          if (playableCards.length > 0) {
            handlePlayCard(playableCards[0]);
          } else {
            handleDrawCard();
          }
        }, 2000);

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
            const latestEq = gameStateRef.current?.currentEquationState;
            if (!latestEq || latestEq.allFilled) return;

            const currentBlank = latestEq.equation.blanks[latestEq.currentBlankIndex];
            if (!currentBlank) return;

            const bot = gameStateRef.current?.players.find((p) => p.id === assignedP.id);
            if (!bot) return;

            const matching = bot.hand.filter(
              (c) => c.type === 'NUMBER' && c.color === currentBlank.color
            );

            if (matching.length > 0) {
              handleFillBlank(latestEq.currentBlankIndex, matching[0], assignedP.id);
            } else {
              handlePlayerDrawForColor(assignedP.id, latestEq.currentBlankIndex);
            }
          }, 2000);

          return () => clearTimeout(fillTimer);
        }
      } else if (eqState.allFilled && !eqState.claimedByPlayerId && !eqState.resultState) {
        // Bot buzz-in if all blanks filled and no one has buzzed in yet
        const eligibleBots = gameState.players.filter(
          (p) => p.isBot && !eqState.disqualifiedPlayerIds.includes(p.id)
        );
        if (eligibleBots.length > 0) {
          const buzzTimer = setTimeout(() => {
            const latest = gameStateRef.current;
            const latestEq = latest?.currentEquationState;
            if (
              latest?.gamePhase === 'EQUATION_ACTIVE' &&
              latestEq &&
              latestEq.allFilled &&
              !latestEq.claimedByPlayerId &&
              !latestEq.resultState
            ) {
              const currentEligibleBots = latest.players.filter(
                (p) => p.isBot && !latestEq.disqualifiedPlayerIds.includes(p.id)
              );
              if (currentEligibleBots.length > 0) {
                const randomBot = currentEligibleBots[Math.floor(Math.random() * currentEligibleBots.length)];
                handleClaimAnswer(randomBot.id);
              }
            }
          }, 3600);

          return () => clearTimeout(buzzTimer);
        }
      }
    }

    // Bot answering in Equation Modal (gamePhase === 'ANSWERING')
    if (gameState.gamePhase === 'ANSWERING' && gameState.currentEquationState) {
      const eqState = gameState.currentEquationState;
      const claimant = gameState.players.find((p) => p.id === eqState.claimedByPlayerId);
      if (claimant && claimant.isBot && !eqState.resultState) {
        const answerTimer = setTimeout(() => {
          const latest = gameStateRef.current;
          const latestEq = latest?.currentEquationState;
          if (
            latest?.gamePhase === 'ANSWERING' &&
            latestEq &&
            latestEq.claimedByPlayerId === claimant.id &&
            !latestEq.resultState
          ) {
            const inputs: Record<string, number> = {};
            for (const b of latestEq.equation.blanks) {
              inputs[b.variable] = b.filledValue ?? 1;
            }
            const masterEq = EQUATION_CARDS_DATA.find((e) => e.id === latestEq.equation.id) || latestEq.equation;
            let botAns = '99';
            if (typeof masterEq.calculateAnswer === 'function') {
              const sol = masterEq.calculateAnswer(inputs);
              const isSmart = Math.random() < 0.85;
              botAns = isSmart ? String(sol.numericValue) : '99';
            }
            handleSubmitAnswer(claimant.id, botAns);
          }
        }, 2200);

        return () => clearTimeout(answerTimer);
      }
    }
  }, [
    gameState?.gamePhase,
    gameState?.currentPlayerIndex,
    gameState?.drawnCardChoice,
    gameState?.currentEquationState?.currentBlankIndex,
    gameState?.currentEquationState?.allFilled,
    gameState?.currentEquationState?.claimedByPlayerId,
    gameState?.currentEquationState?.resultState,
  ]);

  // Determine which player is the local viewer on this browser
  const localPlayerId =
    localOnlinePlayer?.id ||
    localSinglePlayerId ||
    gameState?.players.find((p) => !p.isBot)?.id ||
    gameState?.players[0]?.id;

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
      {gameState?.gamePhase === 'WILD_COLOR_PICK' && (
        (() => {
          const pickerId = gameState.wildPickerPlayerId || wildPickerPlayer?.id;
          const picker = gameState.players.find((p) => p.id === pickerId) || wildPickerPlayer;
          const isMyPick = !gameState.roomId || (localPlayerId && pickerId === localPlayerId);

          if (isMyPick) {
            return (
              <WildColorModal
                isOpen={true}
                playerName={picker?.name || 'คุณ'}
                onSelectColor={handleSelectWildColor}
              />
            );
          } else {
            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
                <div className="glass-panel-elevated rounded-3xl p-6 text-center space-y-3 max-w-sm w-full border border-cyan-400/40 shadow-2xl">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white animate-spin [animation-duration:8s]">
                    <span className="text-xl">🎨</span>
                  </div>
                  <h3 className="text-base font-black text-white">กำลังรอการเลือกสีใหม่</h3>
                  <p className="text-xs text-slate-300">
                    {picker?.name || 'ผู้เล่น'} กำลังเลือกสีนำของเกม (แดง / ฟ้า / เขียว / เหลือง)
                  </p>
                </div>
              </div>
            );
          }
        })()
      )}

      {/* Equation Challenge Modal */}
      {(gameState?.gamePhase === 'EQUATION_ACTIVE' || gameState?.gamePhase === 'ANSWERING') &&
        gameState.currentEquationState && (
          <EquationModal
            isOpen={true}
            state={gameState.currentEquationState}
            players={gameState.players}
            mainDeckCount={gameState.deck.length}
            localPlayerId={localPlayerId}
            isHost={localOnlinePlayer?.isHost ?? true}
            isOnline={Boolean(gameState.roomId)}
            onFillBlank={handleFillBlank}
            onPlayerDrawForColor={handlePlayerDrawForColor}
            onSkipPlayerCascading={handleSkipPlayerCascading}
            onClaimAnswer={handleClaimAnswer}
            onSubmitAnswer={handleSubmitAnswer}
            onFreeDiscardCard={handleFreeDiscardCard}
            onCloseEquation={handleCloseEquation}
            onResetEquationForRetry={handleResetEquationForRetry}
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
          loser={gameState.loser}
          gameMode={gameState.gameMode}
          finishedPlayers={gameState.finishedPlayers}
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
              handleStartNewGame(configs, gameState.gameMode);
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
