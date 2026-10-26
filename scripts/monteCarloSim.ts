/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ALL_PAYTABLES, TOTAL_NUMBERS, DRAWN_COUNT } from '../src/game/kenoMath.ts';
import { RiskMode } from '../src/game/types.ts';

/**
 * High-speed Monte Carlo simulation for Keno
 */
export function runMonteCarlo(
  mode: RiskMode,
  picksCount: number,
  rounds: number = 4_000_000
): {
  rounds: number;
  mode: RiskMode;
  picks: number;
  empiricalRtp: number;
  hitCountBreakdown: number[];
  maxObservedPayout: number;
  hitFrequency: number;
} {
  const paytable = ALL_PAYTABLES[mode][picksCount];
  const hitCounts = new Array(picksCount + 1).fill(0);
  let totalWager = rounds;
  let totalWin = 0;
  let maxWin = 0;
  let winRounds = 0;

  // Pre-generate pool
  const pool = new Int32Array(TOTAL_NUMBERS);
  for (let i = 0; i < TOTAL_NUMBERS; i++) pool[i] = i + 1;

  // Fast Fisher-Yates partial shuffle to draw 10 numbers
  for (let r = 0; r < rounds; r++) {
    // Reset pool
    for (let i = 0; i < TOTAL_NUMBERS; i++) pool[i] = i + 1;

    let hits = 0;
    // Assume player picks numbers 1..picksCount
    for (let i = 0; i < DRAWN_COUNT; i++) {
      const j = i + Math.floor(Math.random() * (TOTAL_NUMBERS - i));
      const drawn = pool[j];
      pool[j] = pool[i];
      pool[i] = drawn;

      if (drawn <= picksCount) {
        hits++;
      }
    }

    hitCounts[hits]++;
    const mult = paytable[hits] || 0;
    if (mult > 0) {
      winRounds++;
      totalWin += mult;
      if (mult > maxWin) maxWin = mult;
    }
  }

  const empiricalRtp = totalWin / totalWager;
  const hitFrequency = winRounds / rounds;

  return {
    rounds,
    mode,
    picks: picksCount,
    empiricalRtp,
    hitCountBreakdown: hitCounts,
    maxObservedPayout: maxWin,
    hitFrequency,
  };
}

if (process.argv[1]?.endsWith('monteCarloSim.ts')) {
  console.log('Running Monte Carlo Validation (4,000,000 rounds)...');
  const res = runMonteCarlo('classic', 5, 4_000_000);
  console.log(`Results for Classic 5-picks:`);
  console.log(`- Empirical RTP: ${(res.empiricalRtp * 100).toFixed(3)}%`);
  console.log(`- Hit Frequency: ${(res.hitFrequency * 100).toFixed(2)}%`);
  console.log(`- Max Payout: ${res.maxObservedPayout}x`);
}
