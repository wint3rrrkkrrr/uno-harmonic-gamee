export type CardColor = 'RED' | 'BLUE' | 'GREEN' | 'YELLOW' | 'WILD';

export type CardType =
  | 'NUMBER'
  | 'DRAW_TWO'
  | 'SKIP'
  | 'REVERSE'
  | 'EQUATION'
  | 'WILD'
  | 'WILD_DRAW_FOUR';

export type PlayerLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export type GameMode = 'FIND_WINNER' | 'FIND_LOSER';

export interface Card {
  id: string;
  color: CardColor;
  type: CardType;
  value?: number; // 0-9 for NUMBER cards
}

export interface Player {
  id: string;
  letter: PlayerLetter;
  name: string;
  hand: Card[];
  isBot: boolean;
  calledHarmonic: boolean; // must be true when 1 card left
  isFinished?: boolean;
  finishRank?: number;
}

export interface FinishedPlayer {
  player: Player;
  rank: number;
  finishTime: number;
}

export type EquationDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface EquationBlank {
  id: string;
  variable: string; // e.g. 'f', 'T', 'k', 'm', 'A', 'ω', 'x', 't'
  nameTh: string;   // Thai explanation e.g. ความถี่ (f)
  unit: string;
  color?: 'RED' | 'BLUE' | 'GREEN' | 'YELLOW';
  assignedPlayerId: string | null;
  filledValue: number | null;
  filledCardId?: string;
}

export interface EquationCard {
  id: string;
  code: string; // E01 - E07, M01 - M07, H01 - H07
  difficulty: EquationDifficulty;
  title: string;
  formula: string;
  targetVariable: string;
  targetUnit: string;
  promptText: string;
  blanks: EquationBlank[];
  fixedConstants?: Record<string, number>;
  calculateAnswer: (inputs: Record<string, number>) => {
    numericValue: number;
    acceptableAnswers: string[]; // string variations e.g. "0.5", "1/2", "0.5 s", etc.
    displayAnswer: string;
    explanationSteps: string[];
  };
}

export type GamePhase =
  | 'LOBBY'
  | 'PLAYING'
  | 'EQUATION_ASSIGNMENT'
  | 'ANSWERING'
  | 'GAME_OVER'
  | 'MENU'
  | 'SETUP'
  | 'DRAWN_CARD_CHOICE'
  | 'WILD_COLOR_PICK'
  | 'EQUATION_ACTIVE';

export interface DrawnCardChoice {
  card: Card;
  playerId: string;
}

export interface EquationResultState {
  correct: boolean;
  answeringPlayerId?: string;
  answeredPlayerId?: string;
  submittedAnswer?: string;
  submittedText?: string;
  steps?: string[];
  correctAnswerDisplay?: string;
  pendingFreeDiscardPlayerId?: string | null;
  cardsToDiscardCount?: number; // 1 for EASY/MEDIUM, 2 for HARD
  discardedCount?: number;
  solution?: any;
}

export interface EquationActiveState {
  equation: EquationCard;
  currentBlankIndex: number;
  assignedPlayerId: string;
  candidatePlayerIndex?: number; // for cascading when player doesn't have required card
  candidatePlayerOrder?: string[]; // order of players to ask
  statusMessage?: string;
  allFilled: boolean;
  claimedByPlayerId: string | null;
  disqualifiedPlayerIds: string[]; // players who answered wrongly
  resultState?: EquationResultState | null;
}

export interface GameLogEntry {
  id: string;
  time: string;
  text: string;
  type: 'play' | 'draw' | 'equation' | 'special' | 'harmonic' | 'win' | 'penalty' | 'info';
}

export interface ActionAnnouncement {
  id: string;
  type:
    | 'PLAY_CARD'
    | 'DRAW_CARD'
    | 'DRAW_TWO'
    | 'SKIP'
    | 'REVERSE'
    | 'WILD'
    | 'EQUATION'
    | 'HARMONIC'
    | 'CATCH'
    | 'THINKING'
    | 'CORRECT'
    | 'WRONG'
    | 'INFO'
    | 'SPECIAL'
    | 'PENALTY'
    | 'PLAY'
    | 'DRAW'
    | 'WIN';
  title: string;
  description?: string;
  subtitle?: string;
  card?: Card;
  playerName?: string;
  playerLetter?: PlayerLetter;
  targetPlayerName?: string;
  durationMs?: number;
}

export interface RoomPlayer {
  id: string;
  name: string;
  letter: PlayerLetter;
  isHost: boolean;
  isBot: boolean;
  isReady: boolean;
  connected: boolean;
}

export interface OnlineRoomInfo {
  roomId: string;
  hostId: string;
  players: RoomPlayer[];
  status: 'LOBBY' | 'PLAYING' | 'ENDED';
  maxPlayers: number;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  direction: 1 | -1; // 1 = clockwise, -1 = counterclockwise
  deck: Card[];
  discardPile: Card[];
  currentColor: CardColor;
  equationDeck: EquationCard[];
  equationDiscardPile: EquationCard[];
  currentEquationState: EquationActiveState | null;
  drawnCardChoice: DrawnCardChoice | null;
  wildPickerPlayerId?: string | null;
  wildPickerPlayerName?: string | null;
  gamePhase: GamePhase;
  gameMode: GameMode;
  pendingDraw: number;
  finishedPlayers: FinishedPlayer[];
  winner: Player | null;
  loser?: Player | null;
  turnsCount: number;
  logs: GameLogEntry[];
  lastActionTime: number;
  actionAnnouncement?: ActionAnnouncement | null;
  roomId?: string;
  version?: number;
}
