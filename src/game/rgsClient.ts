/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CurrencyCode,
  RgsAuthenticationResponse,
  RgsPlayResponse,
  RiskMode,
  SeedState,
  RoundHistoryItem,
} from './types.ts';
import { demoWallet, toMicroUnits, fromMicroUnits } from './demoWallet.ts';
import { ALL_PAYTABLES, TOTAL_NUMBERS } from './kenoMath.ts';

export { toMicroUnits, fromMicroUnits };

export function formatCurrency(amount: number, currency: CurrencyCode = 'USD'): string {
  if (currency === 'SC') {
    return `${amount.toFixed(2)} SC`;
  }
  if (currency === 'BTC') {
    return `₿ ${amount.toFixed(6)}`;
  }
  if (currency === 'EUR') {
    return `€${amount.toFixed(2)}`;
  }
  return `$${amount.toFixed(2)}`;
}

/**
 * Stake Engine Official Remote Gaming Server (RGS) Client
 * Conforms to Stake Engine RGS specification:
 * - /wallet/authenticate
 * - /wallet/play (sessionID, amount, mode, currency)
 * - /wallet/end-round (sessionID, roundID)
 * - /wallet/round-details (replay fetching)
 */
export class StakeRgsClient {
  private rgsUrl: string | null = null;
  private sessionID: string | null = null;
  private isDemoMode: boolean = true;
  private currentCurrency: CurrencyCode = 'USD';
  private operatorName: string = 'Stake Engine Sandbox';
  private replayRoundId: string | null = null;

  constructor() {
    this.initFromUrl();
  }

  private initFromUrl() {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    this.sessionID = params.get('sessionID') || params.get('token');
    this.rgsUrl = params.get('rgsUrl') || params.get('rgs_url');
    const curr = params.get('currency');
    if (curr === 'SC' || curr === 'EUR' || curr === 'BTC' || curr === 'USD') {
      this.currentCurrency = curr;
    }
    const op = params.get('operator');
    if (op) this.operatorName = op;

    const replay = params.get('replay');
    if (replay && replay !== 'true') {
      this.replayRoundId = replay;
    }
  }

  public isDemo(): boolean {
    return this.isDemoMode;
  }

  public isReplay(): boolean {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('replay') === 'true' || !!this.replayRoundId;
  }

  public getReplayRoundId(): string | null {
    return this.replayRoundId;
  }

  public getSeedState(): SeedState {
    if (this.isDemoMode) {
      return demoWallet.getSeedState();
    }
    return {
      serverSeedHash: 'RGS-MANAGED-CRYPTOGRAPHIC-SEED',
      clientSeed: 'RGS-MANAGED-CLIENT-SEED',
      nonce: 0,
    };
  }

  public async setClientSeed(newClientSeed: string): Promise<SeedState> {
    if (this.isDemoMode) {
      return await demoWallet.setClientSeed(newClientSeed);
    }
    return this.getSeedState();
  }

  public async rotateServerSeed(): Promise<{ newSeedState: SeedState; revealedPreviousSeed: string }> {
    if (this.isDemoMode) {
      return await demoWallet.rotateServerSeed();
    }
    return {
      newSeedState: this.getSeedState(),
      revealedPreviousSeed: 'RGS-SERVER-ROTATED',
    };
  }

  /**
   * /wallet/authenticate
   */
  public async authenticate(): Promise<RgsAuthenticationResponse> {
    // If real RGS URL and session are present, authenticate with live Stake Engine RGS
    if (this.rgsUrl && this.sessionID) {
      try {
        const response = await fetch(`${this.rgsUrl}/wallet/authenticate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionID: this.sessionID }),
        });

        if (response.ok) {
          const data = await response.json();
          this.isDemoMode = false;
          return {
            authenticated: true,
            sessionId: this.sessionID,
            playerId: data.playerID || data.playerId || 'stake-player',
            currency: (data.currency as CurrencyCode) || this.currentCurrency,
            balanceMicro: data.balanceMicro ?? toMicroUnits(data.balance ?? 100.0),
            minBetMicro: data.minBetMicro ?? toMicroUnits(data.minBet ?? 0.1),
            maxBetMicro: data.maxBetMicro ?? toMicroUnits(data.maxBet ?? 100.0),
            stepBetMicro: data.stepBetMicro ?? toMicroUnits(data.stepBet ?? 0.1),
            betLevelsMicro: (data.betLevels || []).map((l: number) => toMicroUnits(l)),
            operator: data.operator || this.operatorName,
            isDemo: false,
          };
        }
      } catch (err) {
        console.warn('Official RGS endpoint unreachable, isolating to Demo Wallet session:', err);
      }
    }

    // Isolated Demo Wallet mode
    this.isDemoMode = true;
    return {
      authenticated: true,
      sessionId: 'demo-session-' + Date.now(),
      playerId: 'demo-player',
      currency: this.currentCurrency,
      balanceMicro: demoWallet.getBalanceMicro(),
      minBetMicro: toMicroUnits(0.1),
      maxBetMicro: toMicroUnits(100.0),
      stepBetMicro: toMicroUnits(0.1),
      betLevelsMicro: [
        toMicroUnits(0.1),
        toMicroUnits(0.2),
        toMicroUnits(0.5),
        toMicroUnits(1.0),
        toMicroUnits(2.0),
        toMicroUnits(5.0),
        toMicroUnits(10.0),
        toMicroUnits(20.0),
        toMicroUnits(50.0),
        toMicroUnits(100.0),
      ],
      operator: 'Verdigris Demo / Stake Engine Sandbox',
      isDemo: true,
    };
  }

  /**
   * /wallet/play
   * Communicates with Stake Engine Remote Game Server.
   * On win (round.active === true), automatically calls /wallet/end-round to finalize settlement!
   */
  public async play(
    wagerMicro: number,
    picks: number[],
    riskMode: RiskMode
  ): Promise<RgsPlayResponse> {
    if (picks.length < 1 || picks.length > 10) {
      throw new Error('Invalid selections: pick 1–10 numbers.');
    }
    if (wagerMicro <= 0) {
      throw new Error('Invalid bet amount.');
    }

    // 1. Live Stake Engine RGS Request
    if (this.rgsUrl && this.sessionID && !this.isDemoMode) {
      const modeName = `${riskMode}_${picks.length}`;
      const wagerStandard = fromMicroUnits(wagerMicro);

      const playResponse = await fetch(`${this.rgsUrl}/wallet/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionID: this.sessionID,
          amount: wagerStandard,
          mode: modeName,
          currency: this.currentCurrency,
        }),
      });

      if (!playResponse.ok) {
        const errText = await playResponse.text();
        throw new Error(`RGS Play Error (${playResponse.status}): ${errText}`);
      }

      const playData = await playResponse.json();
      const round = playData.round || playData;
      const roundID = round.roundID || round.id;
      const payoutMultiplier = round.payoutMultiplier ?? 0;
      let newBalance = round.balance ?? round.newBalance;

      // Finalize active round via /wallet/end-round if win
      if (round.active) {
        try {
          const endResponse = await fetch(`${this.rgsUrl}/wallet/end-round`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionID: this.sessionID,
              roundID: roundID,
            }),
          });
          if (endResponse.ok) {
            const endData = await endResponse.json();
            if (endData.balance !== undefined) {
              newBalance = endData.balance;
            }
          }
        } catch (endErr) {
          console.warn('RGS end-round notification error:', endErr);
        }
      }

      // Reconstruct uniform drawn numbers conditional on the server-authoritative payoutMultiplier
      const { drawnNumbers, matches } = this.reconstructDrawConditionalOnPayout(
        picks,
        riskMode,
        payoutMultiplier
      );

      const winAmountMicro = Math.round(wagerMicro * payoutMultiplier);
      const newBalanceMicro = toMicroUnits(newBalance);

      return {
        roundId: roundID,
        active: false,
        payoutMultiplier,
        winAmountMicro,
        newBalanceMicro,
        drawnNumbers,
        matches,
        events: round.events || [],
        seedState: this.getSeedState(),
      };
    }

    // 2. Isolated Demo Simulation
    const simRes = await demoWallet.simulatePlay(wagerMicro, picks, riskMode);
    return {
      roundId: simRes.roundId,
      active: simRes.active,
      payoutMultiplier: simRes.payoutMultiplier,
      winAmountMicro: simRes.winAmountMicro,
      newBalanceMicro: simRes.newBalanceMicro,
      drawnNumbers: simRes.drawnNumbers,
      matches: simRes.matches,
      events: [
        { type: 'wager', winAmountMicro: wagerMicro },
        { type: 'draw', numbers: simRes.drawnNumbers, matches: simRes.matches },
        { type: 'settle', payoutMultiplier: simRes.payoutMultiplier, winAmountMicro: simRes.winAmountMicro },
      ],
      seedState: simRes.seedState,
    };
  }

  /**
   * Reconstructs 10 drawn numbers from 1..40 conditional on server-authoritative payoutMultiplier.
   * Preserves 100% server authority over financial outcome while integrating player selections.
   */
  private reconstructDrawConditionalOnPayout(
    picks: number[],
    riskMode: RiskMode,
    payoutMultiplier: number
  ): { drawnNumbers: number[]; matches: number[] } {
    const table = ALL_PAYTABLES[riskMode]?.[picks.length] || {};
    // Find the hit count h that corresponds to payoutMultiplier
    let targetHits = 0;
    for (const [hitsStr, mult] of Object.entries(table)) {
      if (Math.abs(mult - payoutMultiplier) < 0.001) {
        targetHits = Number(hitsStr);
        break;
      }
    }

    // 1. Uniformly sample targetHits numbers from player picks
    const shuffledPicks = [...picks].sort(() => Math.random() - 0.5);
    const matches = shuffledPicks.slice(0, targetHits);

    // 2. Uniformly sample (10 - targetHits) numbers from unselected numbers (40 - picks.length)
    const unselectedPool = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1).filter(
      (n) => !picks.includes(n)
    );
    unselectedPool.sort(() => Math.random() - 0.5);
    const nonMatches = unselectedPool.slice(0, 10 - targetHits);

    // 3. Union and shuffle to reveal in natural random order
    const drawnNumbers = [...matches, ...nonMatches].sort(() => Math.random() - 0.5);

    return { drawnNumbers, matches };
  }

  public getHistory(): RoundHistoryItem[] {
    return demoWallet.getHistory();
  }

  public resetLocalHistory() {
    demoWallet.resetHistory();
  }

  public resetBalance(newBalance: number = 1000.0) {
    return demoWallet.resetBalance(newBalance);
  }
}

export const rgsClient = new StakeRgsClient();
