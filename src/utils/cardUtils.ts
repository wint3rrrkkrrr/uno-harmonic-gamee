import { Card, CardColor, CardType, Player, PlayerLetter } from '../types/game';
import { EQUATION_CARDS_DATA } from '../data/equations';

export const COLORS: CardColor[] = ['RED', 'BLUE', 'GREEN', 'YELLOW'];

export const PLAYER_LETTERS: PlayerLetter[] = ['A', 'B', 'C', 'D', 'E', 'F'];

/**
 * Creates a brand new shuffled main deck
 */
export function createMainDeck(): Card[] {
  const cards: Card[] = [];
  let cardSeq = 1;

  // Number cards (0-9 twice per color = 80 cards)
  for (const color of COLORS) {
    for (let count = 0; count < 2; count++) {
      for (let num = 0; num <= 9; num++) {
        cards.push({
          id: `c-${cardSeq++}-${color}-${num}-${count}`,
          color,
          type: 'NUMBER',
          value: num,
        });
      }
    }
  }

  // Special Action cards (2 of each color for +2, SKIP, REVERSE, E)
  for (const color of COLORS) {
    for (let i = 0; i < 2; i++) {
      // +2 (DRAW_TWO)
      cards.push({
        id: `c-${cardSeq++}-${color}-DRAW2-${i}`,
        color,
        type: 'DRAW_TWO',
      });
      // SKIP
      cards.push({
        id: `c-${cardSeq++}-${color}-SKIP-${i}`,
        color,
        type: 'SKIP',
      });
      // REVERSE
      cards.push({
        id: `c-${cardSeq++}-${color}-REVERSE-${i}`,
        color,
        type: 'REVERSE',
      });
      // E - EQUATION
      cards.push({
        id: `c-${cardSeq++}-${color}-E-${i}`,
        color,
        type: 'EQUATION',
      });
    }
  }

  // 4 WILD cards
  for (let i = 0; i < 4; i++) {
    cards.push({
      id: `c-${cardSeq++}-WILD-${i}`,
      color: 'WILD',
      type: 'WILD',
    });
  }

  // 4 WILD +4 (WILD_DRAW_FOUR) cards
  for (let i = 0; i < 4; i++) {
    cards.push({
      id: `c-${cardSeq++}-WILD4-${i}`,
      color: 'WILD',
      type: 'WILD_DRAW_FOUR',
    });
  }

  return shuffle(cards);
}

/**
 * Shuffles an array in place using Fisher-Yates
 */
export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Checks if a card is legally playable on the current discard top card
 */
export function canPlayCard(
  card: Card,
  topCard: Card,
  currentColor: CardColor,
  pendingDraw: number = 0
): boolean {
  // If there is an active pending draw (+2 or +4 stack active):
  if (pendingDraw > 0) {
    // Only +2 (DRAW_TWO) and +4 (WILD_DRAW_FOUR) can be stacked!
    return card.type === 'DRAW_TWO' || card.type === 'WILD_DRAW_FOUR';
  }

  // Wild and Wild+4 can be played on any card
  if (card.type === 'WILD' || card.type === 'WILD_DRAW_FOUR') {
    return true;
  }

  // Color match (respecting active currentColor, which accounts for previous Wild plays)
  if (card.color === currentColor) {
    return true;
  }

  // Type match
  if (card.type === topCard.type) {
    // If number card, value must match
    if (card.type === 'NUMBER') {
      return card.value === topCard.value;
    }
    // If action card (+2, SKIP, REVERSE, EQUATION), same action card can be played on another
    return true;
  }

  return false;
}

/**
 * Parses math answer string from player and evaluates if correct
 */
export function checkAnswerMath(
  userInput: string,
  acceptableAnswers: string[],
  numericExpected: number
): boolean {
  if (!userInput) return false;
  const cleaned = userInput.trim().toLowerCase();

  // Direct match against acceptable answers
  for (const acc of acceptableAnswers) {
    if (cleaned === acc.toLowerCase().trim()) return true;
    // Also compare without spaces
    if (cleaned.replace(/\s+/g, '') === acc.toLowerCase().replace(/\s+/g, '')) return true;
  }

  // Try to parse clean numeric value from user input
  // e.g. "0.5 s" -> "0.5", "1/2" -> 0.5, "4pi" -> 4*3.14159, "4*pi"
  const stripped = cleaned
    .replace(/[a-zก-๙²³^/]/g, (match) => {
      // keep / for fraction and pi for math
      if (match === '/' || match === '^') return match;
      return '';
    })
    .replace(/\s+/g, '');

  // Check fraction e.g. "1/2", "8/4", "pi/2", "π/4"
  if (cleaned.includes('/')) {
    const parts = cleaned.split('/');
    if (parts.length === 2) {
      let numPart = 0;
      const rawNum = parts[0];
      if (rawNum.includes('pi') || rawNum.includes('π')) {
        const factor = parseFloat(rawNum.replace(/(pi|π|[^\d.-])/gi, ''));
        numPart = (isNaN(factor) ? 1 : factor) * Math.PI;
      } else {
        numPart = parseFloat(rawNum.replace(/[^\d.-]/g, ''));
      }

      let denPart = 0;
      const rawDen = parts[1];
      if (rawDen.includes('pi') || rawDen.includes('π')) {
        const factor = parseFloat(rawDen.replace(/(pi|π|[^\d.-])/gi, ''));
        denPart = (isNaN(factor) ? 1 : factor) * Math.PI;
      } else {
        denPart = parseFloat(rawDen.replace(/[^\d.-]/g, ''));
      }

      if (!isNaN(numPart) && !isNaN(denPart) && denPart !== 0) {
        const val = numPart / denPart;
        if (Math.abs(val - numericExpected) < 0.08) return true;
      }
    }
  }

  // Check pi expressions e.g. "4pi", "4*pi", "4 π", "0.5pi"
  if (cleaned.includes('pi') || cleaned.includes('π')) {
    const numPart = parseFloat(cleaned.replace(/(pi|π|[^\d.-])/gi, ''));
    const piVal = (isNaN(numPart) ? 1 : numPart) * Math.PI;
    if (Math.abs(piVal - numericExpected) < 0.1) return true;
  }

  // Check float direct
  const parsedFloat = parseFloat(stripped);
  if (!isNaN(parsedFloat)) {
    if (Math.abs(parsedFloat - numericExpected) < 0.05) {
      return true;
    }
  }

  return false;
}

export function getColorBg(color: CardColor): string {
  switch (color) {
    case 'RED':
      return 'bg-rose-600';
    case 'BLUE':
      return 'bg-cyan-600';
    case 'GREEN':
      return 'bg-emerald-600';
    case 'YELLOW':
      return 'bg-amber-500';
    case 'WILD':
      return 'bg-gradient-to-br from-rose-500 via-emerald-500 to-cyan-500';
    default:
      return 'bg-slate-700';
  }
}

export function getColorBorder(color: CardColor): string {
  switch (color) {
    case 'RED':
      return 'border-rose-500 shadow-rose-500/20';
    case 'BLUE':
      return 'border-cyan-500 shadow-cyan-500/20';
    case 'GREEN':
      return 'border-emerald-500 shadow-emerald-500/20';
    case 'YELLOW':
      return 'border-amber-400 shadow-amber-400/20';
    case 'WILD':
      return 'border-purple-400 shadow-purple-500/30';
    default:
      return 'border-slate-600';
  }
}

export function getColorText(color: CardColor): string {
  switch (color) {
    case 'RED':
      return 'text-rose-400';
    case 'BLUE':
      return 'text-cyan-400';
    case 'GREEN':
      return 'text-emerald-400';
    case 'YELLOW':
      return 'text-amber-400';
    case 'WILD':
      return 'text-purple-300';
    default:
      return 'text-slate-200';
  }
}
