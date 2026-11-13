import { describe, expect, it } from 'vitest';
import { COLS, ROWS, newGame, play, type GameState } from '../src/game';

const playAll = (cols: number[], first: 1 | 2 = 1): GameState => {
  let s = newGame(first);
  for (const c of cols) {
    const r = play(s, c);
    if (!r) throw new Error(`illegal move ${c}`);
    s = r.state;
  }
  return s;
};

describe('rules', () => {
  it('drops pieces to the bottom and stacks them', () => {
    const s = playAll([3, 3]);
    expect(s.board[ROWS - 1][3]).toBe(1);
    expect(s.board[ROWS - 2][3]).toBe(2);
    expect(s.turn).toBe(1);
  });

  it('rejects a move into a full column', () => {
    const s = playAll([0, 0, 0, 0, 0, 0]);
    expect(play(s, 0)).toBeNull();
  });

  it('rejects out-of-range columns', () => {
    expect(play(newGame(), -1)).toBeNull();
    expect(play(newGame(), COLS)).toBeNull();
  });

  it('detects a horizontal win', () => {
    const s = playAll([0, 0, 1, 1, 2, 2, 3]);
    expect(s.outcome).toMatchObject({ kind: 'win', winner: 1 });
    if (s.outcome.kind === 'win') expect(s.outcome.line).toHaveLength(4);
  });

  it('detects a vertical win', () => {
    const s = playAll([4, 5, 4, 5, 4, 5, 4]);
    expect(s.outcome).toMatchObject({ kind: 'win', winner: 1 });
  });

  it('detects a ↗ diagonal win', () => {
    // Anya builds 0..3 diagonal from the bottom-left.
    const s = playAll([0, 1, 1, 2, 2, 3, 2, 3, 3, 6, 3]);
    expect(s.outcome).toMatchObject({ kind: 'win', winner: 1 });
  });

  it('detects a ↖ diagonal win', () => {
    const s = playAll([6, 5, 5, 4, 4, 3, 4, 3, 3, 0, 3]);
    expect(s.outcome).toMatchObject({ kind: 'win', winner: 1 });
  });

  it('lets Loid win when Loid moves first', () => {
    const s = playAll([0, 6, 1, 6, 2, 6, 3], 2);
    expect(s.outcome).toMatchObject({ kind: 'win', winner: 2 });
  });

  it('detects a draw on a full board with no line', () => {
    // Column fill order that produces a known drawn position.
    const order = [0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 2, 3, 2, 3, 2, 3, 3, 2, 3, 2, 3, 2, 4, 5, 4, 5, 4, 5, 5, 4, 5, 4, 5, 4, 6, 6, 6, 6, 6, 6];
    const s = playAll(order);
    expect(s.outcome.kind).toBe('draw');
  });

  it('ignores moves after the game is over', () => {
    const s = playAll([0, 0, 1, 1, 2, 2, 3]);
    expect(play(s, 5)).toBeNull();
  });
});
