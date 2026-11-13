import { describe, expect, it } from 'vitest';
import { chooseMove } from '../src/ai';
import { newGame, play, type GameState } from '../src/game';

const playAll = (cols: number[]): GameState => {
  let s = newGame(1);
  for (const c of cols) s = play(s, c)!.state;
  return s;
};

describe('ai', () => {
  for (const level of ['medium', 'hard'] as const) {
    it(`${level}: takes an immediate win`, () => {
      // Loid (2) has three stacked in column 6; it's Loid's turn.
      const s = playAll([0, 6, 1, 6, 0, 6, 5]);
      expect(s.turn).toBe(2);
      expect(chooseMove(s.board, 2, level)).toBe(6);
    });

    it(`${level}: blocks an immediate loss`, () => {
      // Anya (1) has 0,1,2 on the bottom row; Loid must block column 3.
      const s = playAll([0, 6, 1, 6, 2]);
      expect(chooseMove(s.board, 2, level)).toBe(3);
    });
  }

  it('hard: answers within the time budget', () => {
    const t = performance.now();
    chooseMove(newGame().board, 1, 'hard');
    expect(performance.now() - t).toBeLessThan(1500);
  });

  it('hard beats easy most of the time', () => {
    let hardWins = 0;
    const games = 4;
    for (let g = 0; g < games; g++) {
      let s = newGame(g % 2 === 0 ? 1 : 2);
      while (s.outcome.kind === 'playing') {
        const col = chooseMove(s.board, s.turn, s.turn === 1 ? 'hard' : 'easy');
        s = play(s, col)!.state;
      }
      if (s.outcome.kind === 'win' && s.outcome.winner === 1) hardWins++;
    }
    expect(hardWins).toBeGreaterThanOrEqual(3);
  }, 60_000);
});
