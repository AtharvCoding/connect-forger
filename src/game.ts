// Pure game rules: no DOM, no timers. Shared by the UI, the AI worker and (later) online play.

export const COLS = 7;
export const ROWS = 6;

/** 0 = empty, 1 = Anya, 2 = Loid */
export type Cell = 0 | 1 | 2;
export type Player = 1 | 2;
/** Column-major is awkward to read, so the board is row-major with row 0 at the TOP. */
export type Board = Cell[][];
export type Pos = { row: number; col: number };

export const other = (p: Player): Player => (p === 1 ? 2 : 1);

export function createBoard(): Board {
  return Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(0));
}

export function cloneBoard(board: Board): Board {
  return board.map((r) => r.slice());
}

/** Row a piece would land in, or -1 if the column is full. */
export function landingRow(board: Board, col: number): number {
  if (col < 0 || col >= COLS) return -1;
  for (let row = ROWS - 1; row >= 0; row--) if (board[row][col] === 0) return row;
  return -1;
}

export function validMoves(board: Board): number[] {
  const moves: number[] = [];
  for (let c = 0; c < COLS; c++) if (board[0][c] === 0) moves.push(c);
  return moves;
}

export function isFull(board: Board): boolean {
  return board[0].every((c) => c !== 0);
}

const DIRECTIONS = [
  [0, 1], // horizontal
  [1, 0], // vertical
  [1, 1], // diagonal ↘
  [1, -1], // diagonal ↙
] as const;

/** If the piece at (row, col) completes four (or more) in a row, return those cells. */
export function winningLine(board: Board, row: number, col: number): Pos[] | null {
  const p = board[row]?.[col];
  if (!p) return null;
  for (const [dr, dc] of DIRECTIONS) {
    const line: Pos[] = [{ row, col }];
    for (const sign of [1, -1]) {
      let r = row + dr * sign, c = col + dc * sign;
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === p) {
        line.push({ row: r, col: c });
        r += dr * sign;
        c += dc * sign;
      }
    }
    if (line.length >= 4) return line.sort((a, b) => a.row - b.row || a.col - b.col);
  }
  return null;
}

export type Outcome =
  | { kind: 'playing' }
  | { kind: 'win'; winner: Player; line: Pos[] }
  | { kind: 'draw' };

export type GameState = {
  board: Board;
  turn: Player;
  outcome: Outcome;
  moves: Pos[];
};

export function newGame(first: Player = 1): GameState {
  return { board: createBoard(), turn: first, outcome: { kind: 'playing' }, moves: [] };
}

/** Apply a move immutably. Returns null for an illegal move (full column, game over, out of range). */
export function play(state: GameState, col: number): { state: GameState; pos: Pos } | null {
  if (state.outcome.kind !== 'playing') return null;
  const row = landingRow(state.board, col);
  if (row < 0) return null;
  const board = cloneBoard(state.board);
  board[row][col] = state.turn;
  const pos = { row, col };
  const line = winningLine(board, row, col);
  const outcome: Outcome = line
    ? { kind: 'win', winner: state.turn, line }
    : isFull(board)
      ? { kind: 'draw' }
      : { kind: 'playing' };
  return {
    state: { board, turn: other(state.turn), outcome, moves: [...state.moves, pos] },
    pos,
  };
}
