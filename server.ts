import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = 3000;

app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: Date.now() });
});

// Types for Online Rooms
interface PlayerConnection {
  id: string;
  name: string;
  letter: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  isHost: boolean;
  isBot: boolean;
  isReady: boolean;
  ws?: WebSocket;
}

interface Room {
  id: string;
  hostId: string;
  status: 'LOBBY' | 'PLAYING' | 'ENDED';
  players: PlayerConnection[];
  gameState: any | null;
  createdAt: number;
}

const rooms = new Map<string, Room>();

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Broadcast room lobby update to all clients in room
function broadcastRoomUpdate(room: Room) {
  const payload = JSON.stringify({
    type: 'ROOM_UPDATE',
    room: {
      id: room.id,
      hostId: room.hostId,
      status: room.status,
      players: room.players.map((p) => ({
        id: p.id,
        name: p.name,
        letter: p.letter,
        isHost: p.isHost,
        isBot: p.isBot,
        isReady: p.isReady,
        connected: !!p.ws && p.ws.readyState === WebSocket.OPEN,
      })),
    },
  });

  room.players.forEach((p) => {
    if (p.ws && p.ws.readyState === WebSocket.OPEN) {
      p.ws.send(payload);
    }
  });
}

// Broadcast sanitized game state to all players in room
function broadcastGameState(room: Room, actionAnnouncement?: any) {
  if (!room.gameState) return;

  room.players.forEach((p) => {
    if (!p.ws || p.ws.readyState !== WebSocket.OPEN) return;

    // Sanitize state for this player:
    // This player sees their own hand face-up.
    // Opponent players' cards are masked so opponents' cards cannot be snooped!
    const sanitizedPlayers = room.gameState.players.map((player: any) => {
      if (player.id === p.id) {
        return player; // Full hand
      }
      // Mask opponent's cards
      return {
        ...player,
        hand: player.hand.map((card: any) => ({
          id: card.id,
          color: 'WILD',
          type: 'NUMBER',
          isMasked: true,
        })),
      };
    });

    const sanitizedState = {
      ...room.gameState,
      players: sanitizedPlayers,
      actionAnnouncement: actionAnnouncement || room.gameState.actionAnnouncement || null,
      roomId: room.id,
    };

    p.ws.send(
      JSON.stringify({
        type: 'GAME_STATE_UPDATE',
        state: sanitizedState,
      })
    );
  });
}

// WebSocket Server
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  let currentRoomId: string | null = null;
  let currentUserId: string | null = null;

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case 'CREATE_ROOM': {
          let code = generateRoomCode();
          while (rooms.has(code)) {
            code = generateRoomCode();
          }

          const playerName = (message.playerName || 'ผู้เล่น 1').trim().substring(0, 16);
          const playerId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

          const hostPlayer: PlayerConnection = {
            id: playerId,
            name: playerName,
            letter: 'A',
            isHost: true,
            isBot: false,
            isReady: true,
            ws,
          };

          const newRoom: Room = {
            id: code,
            hostId: playerId,
            status: 'LOBBY',
            players: [hostPlayer],
            gameState: null,
            createdAt: Date.now(),
          };

          rooms.set(code, newRoom);
          currentRoomId = code;
          currentUserId = playerId;

          ws.send(
            JSON.stringify({
              type: 'ROOM_CREATED',
              roomId: code,
              player: {
                id: playerId,
                name: playerName,
                letter: 'A',
                isHost: true,
              },
            })
          );

          broadcastRoomUpdate(newRoom);
          break;
        }

        case 'JOIN_ROOM': {
          const code = (message.roomId || '').toUpperCase().trim();
          const room = rooms.get(code);

          if (!room) {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'ไม่พบห้องนี้ กรุณาตรวจสอบรหัสห้องอีกครั้ง' }));
            return;
          }

          if (room.status === 'PLAYING') {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'เกมในห้องนี้ได้เริ่มเล่นไปแล้ว' }));
            return;
          }

          if (room.players.length >= 6) {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'ห้องนี้มีผู้เล่นเต็มแล้ว (สูงสุด 6 คน)' }));
            return;
          }

          const letters: ('A' | 'B' | 'C' | 'D' | 'E' | 'F')[] = ['A', 'B', 'C', 'D', 'E', 'F'];
          const usedLetters = room.players.map((p) => p.letter);
          const nextLetter = letters.find((l) => !usedLetters.includes(l)) || 'B';

          const playerName = (message.playerName || `ผู้เล่น ${room.players.length + 1}`).trim().substring(0, 16);
          const playerId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

          const newPlayer: PlayerConnection = {
            id: playerId,
            name: playerName,
            letter: nextLetter,
            isHost: false,
            isBot: false,
            isReady: false,
            ws,
          };

          room.players.push(newPlayer);
          currentRoomId = code;
          currentUserId = playerId;

          ws.send(
            JSON.stringify({
              type: 'ROOM_JOINED',
              roomId: code,
              player: {
                id: playerId,
                name: playerName,
                letter: nextLetter,
                isHost: false,
              },
            })
          );

          broadcastRoomUpdate(room);
          break;
        }

        case 'ADD_BOT': {
          if (!currentRoomId) return;
          const room = rooms.get(currentRoomId);
          if (!room || room.status !== 'LOBBY' || room.players.length >= 6) return;

          const letters: ('A' | 'B' | 'C' | 'D' | 'E' | 'F')[] = ['A', 'B', 'C', 'D', 'E', 'F'];
          const usedLetters = room.players.map((p) => p.letter);
          const nextLetter = letters.find((l) => !usedLetters.includes(l)) || 'B';

          const botId = `bot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          const botPlayer: PlayerConnection = {
            id: botId,
            name: `บอท SHM ${nextLetter}`,
            letter: nextLetter,
            isHost: false,
            isBot: true,
            isReady: true,
          };

          room.players.push(botPlayer);
          broadcastRoomUpdate(room);
          break;
        }

        case 'REMOVE_BOT': {
          if (!currentRoomId) return;
          const room = rooms.get(currentRoomId);
          if (!room || room.status !== 'LOBBY') return;

          const botIndex = room.players.findIndex((p) => p.id === message.botId && p.isBot);
          if (botIndex !== -1) {
            room.players.splice(botIndex, 1);
            broadcastRoomUpdate(room);
          }
          break;
        }

        case 'TOGGLE_READY': {
          if (!currentRoomId || !currentUserId) return;
          const room = rooms.get(currentRoomId);
          if (!room) return;

          const player = room.players.find((p) => p.id === currentUserId);
          if (player) {
            player.isReady = !player.isReady;
            broadcastRoomUpdate(room);
          }
          break;
        }

        case 'SYNC_GAME_ACTION': {
          // Sync an authorized game mutation from host or active player
          if (!currentRoomId) return;
          const room = rooms.get(currentRoomId);
          if (!room) return;

          room.gameState = message.state;
          room.status = 'PLAYING';
          broadcastGameState(room, message.actionAnnouncement);
          break;
        }

        case 'SEND_CHAT': {
          if (!currentRoomId) return;
          const room = rooms.get(currentRoomId);
          if (!room) return;

          const sender = room.players.find((p) => p.id === currentUserId);
          const chatMsg = {
            id: `chat-${Date.now()}`,
            senderName: sender?.name || 'ผู้เล่น',
            senderLetter: sender?.letter || 'A',
            text: (message.text || '').substring(0, 100),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          const payload = JSON.stringify({ type: 'CHAT_MESSAGE', message: chatMsg });
          room.players.forEach((p) => {
            if (p.ws && p.ws.readyState === WebSocket.OPEN) {
              p.ws.send(payload);
            }
          });
          break;
        }
      }
    } catch (e) {
      console.error('WebSocket message parsing error:', e);
    }
  });

  ws.on('close', () => {
    if (currentRoomId && currentUserId) {
      const room = rooms.get(currentRoomId);
      if (room) {
        const player = room.players.find((p) => p.id === currentUserId);
        if (player) {
          player.ws = undefined;
          if (room.status === 'LOBBY') {
            room.players = room.players.filter((p) => p.id !== currentUserId);
            // If host left, assign new host or delete empty room
            if (room.players.length === 0) {
              rooms.delete(currentRoomId);
            } else {
              if (room.hostId === currentUserId) {
                const newHost = room.players.find((p) => !p.isBot) || room.players[0];
                newHost.isHost = true;
                room.hostId = newHost.id;
              }
              broadcastRoomUpdate(room);
            }
          } else {
            // In game: mark disconnected
            broadcastRoomUpdate(room);
          }
        }
      }
    }
  });
});

// Periodic cleanup of empty or abandoned rooms (older than 4 hours)
setInterval(() => {
  const now = Date.now();
  rooms.forEach((room, id) => {
    if (now - room.createdAt > 4 * 60 * 60 * 1000) {
      rooms.delete(id);
    }
  });
}, 30 * 60 * 1000);

// Setup Vite middleware in development or static serve in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`HARMONIC Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
