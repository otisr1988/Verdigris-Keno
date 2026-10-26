/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RiskMode = 'classic' | 'low' | 'medium' | 'high';
export type CurrencyCode = 'USD' | 'SC' | 'EUR' | 'BTC';
export type BetMode = 'manual' | 'auto';
export type GamePhase = 'idle' | 'drawing' | 'settling' | 'finished';

export interface PaytableEntry {
  hits: number;
  multiplier: number; // e.g. 3.86 means 3.86x payout
  probability: number; // exact probability
}

export type RiskPaytables = Record<number, Record<number, number>>; // [picks][hits] -> multiplier

export interface ModeMathStats {
  mode: RiskMode;
  picks: number;
  rtp: number; // e.g. 0.965 (96.50%)
  maxWin: number;
  hitFrequency: number; // Probability of multiplier > 0
  paytable: PaytableEntry[];
}

export interface AutoplayConfig {
  rounds: number; // total rounds to play (e.g. 10, 25, 50, 100, Infinity)
  stopOnWin: number; // stop if single win >= amount (0 = disabled)
  stopOnLoss: number; // stop if single loss >= amount (0 = disabled)
  stopBalanceBelow: number; // stop if balance drops below this amount (0 = disabled)
  stopBalanceAbove: number; // stop if balance rises above this amount (0 = disabled)
  active: boolean;
  currentRound: number;
  totalProfit: number;
}

export interface SeedState {
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  previousServerSeed?: string;
  previousServerSeedHash?: string;
  previousClientSeed?: string;
  previousNonce?: number;
}

export interface RoundHistoryItem {
  id: string;
  timestamp: number;
  wager: number;
  payoutMultiplier: number;
  payoutAmount: number;
  profit: number;
  picks: number[];
  drawnNumbers: number[];
  matches: number[];
  riskMode: RiskMode;
  serverSeedHash: string;
  revealedServerSeed?: string;
  clientSeed: string;
  nonce: number;
}

export interface GameSettings {
  animations: boolean;
  instantBet: boolean;
  hotkeys: boolean;
  maxBetToggle: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  masterVolume: number; // 0.0 to 1.0
  reducedMotion: boolean;
  currency: CurrencyCode;
}

export interface RgsAuthenticationResponse {
  authenticated: boolean;
  sessionId: string;
  playerId: string;
  currency: CurrencyCode;
  balanceMicro: number; // 6 decimal places: 1.000000 = 1000000
  minBetMicro: number;
  maxBetMicro: number;
  stepBetMicro: number;
  betLevelsMicro: number[];
  operator: string;
  isDemo: boolean;
}

export interface RgsEvent {
  type: 'wager' | 'draw' | 'match' | 'settle';
  numbers?: number[];
  matches?: number[];
  payoutMultiplier?: number;
  winAmountMicro?: number;
}

export interface RgsPlayResponse {
  roundId: string;
  active: boolean;
  payoutMultiplier: number;
  winAmountMicro: number;
  newBalanceMicro: number;
  drawnNumbers: number[];
  matches: number[];
  events: RgsEvent[];
  seedState: SeedState;
}
