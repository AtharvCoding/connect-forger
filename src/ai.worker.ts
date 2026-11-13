import { chooseMove, type Level } from './ai';
import type { Board, Player } from './game';

export type AiRequest = { id: number; board: Board; player: Player; level: Level };
export type AiResponse = { id: number; col: number };

self.onmessage = (e: MessageEvent<AiRequest>) => {
  const { id, board, player, level } = e.data;
  const col = chooseMove(board, player, level);
  (self as unknown as Worker).postMessage({ id, col } satisfies AiResponse);
};
