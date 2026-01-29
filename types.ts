
export type Move = 'FOCUS' | 'WASTE';
export type FutureMove = 'COOPERATE' | 'DEFECT';

export interface GameState {
  score: number;
  streak: number;
  lastDecisionHour: number; // Unix timestamp for start of hour
  beastTask: string;
}

export interface Outcome {
  presentMove: Move;
  futureMove: FutureMove;
  scoreChange: number;
  streakChange: number;
  message: string;
  subMessage: string;
}
