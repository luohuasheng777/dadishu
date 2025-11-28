
export enum GameState {
  MENU = 'MENU',
  COUNTDOWN = 'COUNTDOWN',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
}

export enum AnimalType {
  MOLE = 'MOLE',
  FOX = 'FOX',
  PANDA = 'PANDA',
}

export interface Entity {
  id: string;
  type: AnimalType;
  spawnTime: number;
  duration: number;
  isHit: boolean;
  isEscaping?: boolean;
  escapeStartTime?: number;
}

export interface UserProfile {
  name: string | null;
  highScore: number;
  totalScore: number; // Cumulative total score across all games
  claimedRewards: string[]; // IDs of claimed rewards
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'SCORE' | 'RANK';
  requirement: number; // Score needed or Rank needed (e.g. Top 10)
  unlocked: boolean;
  claimed: boolean;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  rank: number;
  isUser: boolean;
}

export interface FloatingText {
  id: string;
  cellIndex: number;
  text: string;
  color: string;
  createdAt: number;
}