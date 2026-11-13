// Computer opponent: negamax + alpha-beta pruning with a window-scoring heuristic.
// Runs inside a Web Worker (see ai.worker.ts) so the UI never freezes.

import { Board, COLS, Player, ROWS, cloneBoard, landingRow, other, validMoves, winningLine } from './game';

export type Level = 'easy' | 'medium' | 'hard';

const WIN = 1_000_000;
/** Centre-first move ordering makes alpha-beta prune far more. */
const ORDER = [3, 2, 4, 1, 5, 0, 6];

class Timeout extends Error {}

function scoreWindow(a: Cell4, me: Player): number {
  let mine = 0, theirs = 0, empty = 0;
  for (const c of a) {
    if (c === me) mine++;
    else if (c === 0) empty++;
    else theirs++;
  }
  if (mine === 3 && empty === 1) return 6;
  if (mine === 2 && empty === 2) return 2;
  if (theirs === 3 && empty === 1) return -8;
  if (theirs === 2 && empty === 2) return -2;
  return 0;
}
type Cell4 = [number, number, number, number];

/** Static evaluation from `me`'s point of view. */
export function evaluate(board: Board, me: Player): number {
  let score = 0;
  for (let r = 0; r < ROWS; r++) {
    const c = board[r][3];
    if (c === me) score += 3;
    else if (c !== 0) score -= 3;
  }
  const w: Cell4 = [0, 0, 0, 0];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      if (c + 3 < COLS) {
        for (let i = 0; i < 4; i++) w[i] = board[r][c + i];
        score += scoreWindow(w, me);
      }
      if (r + 3 < ROWS) {
        for (let i = 0; i < 4; i++) w[i] = board[r + i][c];
        score += scoreWindow(w, me);
        if (c + 3 < COLS) {
          for (let i = 0; i < 4; i++) w[i] = board[r + i][c + i];
          score += scoreWindow(w, me);
        }
        if (c - 3 >= 0) {
          for (let i = 0; i < 4; i++) w[i] = board[r + i][c - i];
          score += scoreWindow(w, me);
        }
      }
    }
  return score;
}

function search(board: Board, player: Player, maxDepth: number, deadline: number): { col: number; score: number }[] {
  let nodes = 0;
  const negamax = (depth: number, alpha: number, beta: number, p: Player): number => {
    if ((++nodes & 2047) === 0 && performance.now() > deadline) throw new Timeout();
    const moves = ORDER.filter((c) => board[0][c] === 0);
    if (moves.length === 0) return 0; // draw
    // Win right now?
    for (const c of moves) {
      const r = landingRow(board, c);
      board[r][c] = p;
      const won = winningLine(board, r, c) !== null;
      board[r][c] = 0;
      if (won) return WIN + depth;
    }
    if (depth === 0) return evaluate(board, p);
    let best = -Infinity;
    for (const c of moves) {
      const r = landingRow(board, c);
      board[r][c] = p;
      const s = -negamax(depth - 1, -beta, -alpha, other(p));
      board[r][c] = 0;
      if (s > best) best = s;
      if (s > alpha) alpha = s;
      if (alpha >= beta) break;
    }
    return best;
  };

  const results: { col: number; score: number }[] = [];
  for (const c of ORDER) {
    const r = landingRow(board, c);
    if (r < 0) continue;
    board[r][c] = player;
    const score = winningLine(board, r, c) ? WIN + maxDepth + 1 : -negamax(maxDepth - 1, -Infinity, Infinity, other(player));
    board[r][c] = 0;
    results.push({ col: c, score });
  }
  return results;
}

function pickBest(results: { col: number; score: number }[], rng: () => number, randomTies: boolean): number {
  const top = Math.max(...results.map((r) => r.score));
  const best = results.filter((r) => r.score === top); // already in centre-first order
  return randomTies ? best[Math.floor(rng() * best.length)].col : best[0].col;
}

export function chooseMove(board: Board, player: Player, level: Level, rng: () => number = Math.random): number {
  const moves = validMoves(board);
  if (moves.length === 0) throw new Error('No valid moves');
  if (moves.length === 1) return moves[0];
  const b = cloneBoard(board);

  if (level === 'easy') {
    if (rng() < 0.35) return moves[Math.floor(rng() * moves.length)];
    return pickBest(search(b, player, 2, Infinity), rng, true);
  }
  if (level === 'medium') return pickBest(search(b, player, 4, Infinity), rng, true);

  // Hard: iterative deepening inside a time budget; keep the deepest finished search.
  const deadline = performance.now() + 900;
  let best = pickBest(search(b, player, 4, Infinity), rng, false);
  for (let depth = 5; depth <= 14; depth++) {
    try {
      const results = search(b, player, depth, deadline);
      best = pickBest(results, rng, false);
      const top = Math.max(...results.map((r) => r.score));
      if (top >= WIN || top <= -WIN) break; // forced win found, or every move loses anyway
    } catch (e) {
      if (e instanceof Timeout) break;
      throw e;
    }
  }
  return best;
}
