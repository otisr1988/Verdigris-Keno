/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RoundHistoryItem, RiskMode } from './types.ts';
import { generateKenoDraw, generateRandomSeed, sha256 } from './provablyFair.ts';
import { getPayoutMultiplier } from './kenoMath.ts';

const MICRO_UNIT = 1_000_000;

export function toMicroUnits(amount: number): number {
  return Math.round(amount * MICRO_UNIT);
}

export function fromMicroUnits(micro: number): number {
  return micro / MICRO_UNIT;
}

/**
 * Isolated Demo Wallet Service
 * Strictly partitioned local mock wallet used solely when external RGS credentials are not provided.
 * Never leaks state or fake credits into real Stake Engine RGS sessions.
 */
export class DemoWalletService {
  private balanceMicro: number = toMicroUnits(1000.0);
  private activeServerSeed: string = '';
  private activeServerSeedHash: string = '';
  private activeClientSeed: string = 'verdigris-client-seed-2026';
  private currentNonce: number = 1;
  private roundHistory: RoundHistoryItem[] = [];

  constructor() {
    this.loadStorage();
    this.initSeeds();
  }

  private async initSeeds() {
    this.activeServerSeed = generateRandomSeed(32);
    this.activeServerSeedHash = await sha256(this.activeServerSeed);
  }

  private loadStorage() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('vk_demo_balance_micro');
      if (stored) {
        this.balanceMicro = parseInt(stored, 10);
      }
      const history = localStorage.getItem('vk_demo_round_history');
      if (history) {
        this.roundHistory = JSON.parse(history);
      }
      const seed = localStorage.getItem('vk_demo_client_seed');
      if (seed) {
        this.activeClientSeed = seed;
      }
    } catch {
      // ignore
    }
  }

  private saveStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('vk_demo_balance_micro', this.balanceMicro.toString());
      localStorage.setItem('vk_demo_round_history', JSON.stringify(this.roundHistory.slice(-100)));
      localStorage.setItem('vk_demo_client_seed', this.activeClientSeed);
    } catch {
      // ignore
    }
  }

  public getBalance(): number {
    return fromMicroUnits(this.balanceMicro);
  }

  public getBalanceMicro(): number {
    return this.balanceMicro;
  }

  public resetBalance(amount: number = 1000.0): number {
    this.balanceMicro = toMicroUnits(amount);
    this.saveStorage();
    return this.balanceMicro;
  }

  public getSeedState() {
    return {
      serverSeedHash: this.activeServerSeedHash,
      clientSeed: this.activeClientSeed,
      nonce: this.currentNonce,
    };
  }

  public async setClientSeed(newSeed: string) {
    this.activeClientSeed = newSeed.trim() || 'verdigris-client-seed';
    this.currentNonce = 1;
    this.saveStorage();
    return this.getSeedState();
  }

  public async rotateServerSeed() {
    const revealedSeed = this.activeServerSeed;
    this.activeServerSeed = generateRandomSeed(32);
    this.activeServerSeedHash = await sha256(this.activeServerSeed);
    this.currentNonce = 1;
    this.saveStorage();
    return {
      newSeedState: this.getSeedState(),
      revealedPreviousSeed: revealedSeed,
    };
  }

  public getHistory(): RoundHistoryItem[] {
    return [...this.roundHistory];
  }

  public resetHistory() {
    this.roundHistory = [];
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('vk_demo_round_history');
      } catch {
        // ignore
      }
    }
  }

  /**
   * Executes authoritative local provably fair draw simulation
   */
  public async simulatePlay(
    wagerMicro: number,
    picks: number[],
    riskMode: RiskMode
  ): Promise<{
    roundId: string;
    active: boolean;
    payoutMultiplier: number;
    winAmountMicro: number;
    newBalanceMicro: number;
    drawnNumbers: number[];
    matches: number[];
    seedState: { serverSeedHash: string; clientSeed: string; nonce: number };
  }> {
    if (wagerMicro > this.balanceMicro) {
      throw new Error('Insufficient demo balance.');
    }

    const nonce = this.currentNonce;
    this.currentNonce++;

    const drawnNumbers = await generateKenoDraw(this.activeServerSeed, this.activeClientSeed, nonce);
    const matches = picks.filter((p) => drawnNumbers.includes(p));
    const payoutMultiplier = getPayoutMultiplier(riskMode, picks.length, matches.length);
    const winAmountMicro = Math.round(wagerMicro * payoutMultiplier);

    this.balanceMicro = this.balanceMicro - wagerMicro + winAmountMicro;
    this.saveStorage();

    const roundId = `demo-round-${Date.now()}-${nonce}`;
    const roundResult: RoundHistoryItem = {
      id: roundId,
      timestamp: Date.now(),
      wager: fromMicroUnits(wagerMicro),
      payoutMultiplier,
      payoutAmount: fromMicroUnits(winAmountMicro),
      profit: fromMicroUnits(winAmountMicro - wagerMicro),
      picks: [...picks],
      drawnNumbers: [...drawnNumbers],
      matches: [...matches],
      riskMode,
      serverSeedHash: this.activeServerSeedHash,
      clientSeed: this.activeClientSeed,
      nonce,
    };

    this.roundHistory.unshift(roundResult);
    if (this.roundHistory.length > 200) this.roundHistory.pop();
    this.saveStorage();

    return {
      roundId,
      active: false,
      payoutMultiplier,
      winAmountMicro,
      newBalanceMicro: this.balanceMicro,
      drawnNumbers,
      matches,
      seedState: this.getSeedState(),
    };
  }
}

export const demoWallet = new DemoWalletService();
