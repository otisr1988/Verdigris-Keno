/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PaytableEntry, RiskMode, ModeMathStats, RiskPaytables } from './types.ts';

/**
 * Calculates combinations nCr = n! / (r! * (n - r)!)
 */
export function combinations(n: number, r: number): number {
  if (r < 0 || r > n) return 0;
  if (r === 0 || r === n) return 1;
  let c = 1;
  const k = Math.min(r, n - r);
  for (let i = 1; i <= k; i++) {
    c = (c * (n - k + i)) / i;
  }
  return Math.round(c);
}

export const TOTAL_NUMBERS = 40;
export const DRAWN_COUNT = 10;
export const MAX_SELECTIONS = 10;
export const TOTAL_COMBINATIONS = combinations(TOTAL_NUMBERS, DRAWN_COUNT); // 847,660,528

/**
 * Calculates exact hypergeometric probability P(H = h | k selections)
 * P(h) = C(k, h) * C(40 - k, 10 - h) / C(40, 10)
 */
export function getHypergeometricProbability(k: number, h: number): number {
  if (h < 0 || h > k || h > DRAWN_COUNT) return 0;
  if (DRAWN_COUNT - h > TOTAL_NUMBERS - k) return 0;
  const numerator = combinations(k, h) * combinations(TOTAL_NUMBERS - k, DRAWN_COUNT - h);
  return numerator / TOTAL_COMBINATIONS;
}

/**
 * Precomputed exact probabilities for all k in [1..10], h in [0..k]
 */
export const KENO_PROBABILITIES: Record<number, Record<number, number>> = {};
for (let k = 1; k <= MAX_SELECTIONS; k++) {
  KENO_PROBABILITIES[k] = {};
  for (let h = 0; h <= k; h++) {
    KENO_PROBABILITIES[k][h] = getHypergeometricProbability(k, h);
  }
}

/**
 * Paytables for each Risk Mode and Selection Count k (1..10).
 * Values represent the multiplier awarded for h matches.
 * Multipliers are tuned to give an average RTP of ~96.50% (96.0% - 97.0%).
 */

// 1. CLASSIC MODE (Balanced, standard casino Keno)
export const CLASSIC_PAYTABLES: RiskPaytables = {
  1: { 0: 0.00, 1: 3.86 },
  2: { 0: 0.00, 1: 1.20, 2: 8.71 },
  3: { 0: 0.00, 1: 0.00, 2: 2.80, 3: 47.97 },
  4: { 0: 0.00, 1: 0.00, 2: 1.70, 3: 7.99, 4: 124.81 },
  5: { 0: 0.00, 1: 0.00, 2: 1.11, 3: 3.90, 4: 23.20, 5: 324.83 },
  6: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 3.47, 4: 11.90, 5: 89.28, 6: 1190.43 },
  7: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 1.98, 4: 6.92, 5: 34.60, 6: 247.17, 7: 1977.35 },
  8: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 0.00, 4: 6.16, 5: 24.62, 6: 116.96, 7: 738.70, 8: 5540.27 },
  9: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 0.00, 4: 3.61, 5: 13.24, 6: 54.16, 7: 300.88, 8: 1805.28, 9: 7221.12 },
  10: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 0.00, 4: 2.34, 5: 7.62, 6: 29.31, 7: 140.70, 8: 703.49, 9: 2931.22, 10: 10000.00 },
};

// 2. LOW RISK MODE (High hit frequency, smoothed volatility, payouts on low/zero hits)
export const LOW_PAYTABLES: RiskPaytables = {
  1: { 0: 0.70, 1: 1.76 },
  2: { 0: 0.50, 1: 1.25, 2: 3.51 },
  3: { 0: 0.00, 1: 1.10, 2: 2.20, 3: 14.97 },
  4: { 0: 0.00, 1: 0.80, 2: 1.60, 3: 4.49, 4: 39.91 },
  5: { 0: 0.00, 1: 0.48, 2: 1.34, 3: 3.05, 4: 11.45, 5: 114.46 },
  6: { 0: 0.00, 1: 0.27, 2: 1.06, 3: 2.22, 4: 6.65, 5: 35.48, 6: 266.10 },
  7: { 0: 0.00, 1: 0.17, 2: 0.85, 3: 1.69, 4: 4.23, 5: 15.25, 6: 101.64, 7: 508.18 },
  8: { 0: 0.00, 1: 0.08, 2: 0.66, 3: 1.41, 4: 3.15, 5: 8.28, 6: 37.25, 7: 206.96, 8: 993.39 },
  9: { 0: 0.00, 1: 0.08, 2: 0.48, 3: 1.12, 4: 2.40, 5: 6.00, 6: 20.00, 7: 87.98, 8: 399.92, 9: 1599.69 },
  10: { 0: 0.93, 1: 0.00, 2: 0.39, 3: 0.93, 4: 1.85, 5: 3.86, 6: 11.57, 7: 46.28, 8: 192.84, 9: 771.35, 10: 2314.04 },
};

// 3. MEDIUM RISK MODE (Moderate variance, solid mid-tier and high-tier rewards)
export const MEDIUM_PAYTABLES: RiskPaytables = {
  1: { 0: 0.00, 1: 3.86 },
  2: { 0: 0.00, 1: 0.91, 2: 10.64 },
  3: { 0: 0.00, 1: 0.00, 2: 2.48, 3: 51.56 },
  4: { 0: 0.00, 1: 0.00, 2: 1.37, 3: 9.10, 4: 136.57 },
  5: { 0: 0.00, 1: 0.00, 2: 0.84, 3: 4.03, 4: 26.88, 5: 403.26 },
  6: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 2.86, 4: 13.38, 5: 107.07, 6: 1338.33 },
  7: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 1.53, 4: 7.21, 5: 42.41, 6: 296.85, 7: 2544.39 },
  8: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 0.00, 4: 5.27, 5: 26.81, 6: 143.61, 7: 861.69, 8: 5744.59 },
  9: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 0.00, 4: 3.07, 5: 13.43, 6: 67.16, 7: 364.60, 8: 2110.82, 9: 7675.70 },
  10: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 0.00, 4: 2.04, 5: 7.25, 6: 35.30, 7: 167.20, 8: 882.43, 9: 3715.50, 10: 9288.74 },
};

// 4. HIGH RISK MODE (Maximum volatility, zero low hits, top ceiling of 10,000x!)
export const HIGH_PAYTABLES: RiskPaytables = {
  1: { 0: 0.00, 1: 3.86 },
  2: { 0: 0.00, 1: 0.00, 2: 16.73 },
  3: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 79.45 },
  4: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 10.08, 4: 247.08 },
  5: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 4.07, 4: 40.66, 5: 660.80 },
  6: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 0.00, 4: 21.26, 5: 173.97, 6: 2126.26 },
  7: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 0.00, 4: 10.16, 5: 57.57, 6: 406.40, 7: 3809.98 },
  8: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 0.00, 4: 0.00, 5: 42.14, 6: 266.15, 7: 1774.30, 8: 8871.51 },
  9: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 0.00, 4: 0.00, 5: 20.19, 6: 100.96, 7: 642.49, 8: 3487.78, 9: 9178.38 },
  10: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 0.00, 4: 0.00, 5: 10.38, 6: 48.20, 7: 281.79, 8: 1483.10, 9: 4820.07, 10: 10000.00 },
};

export const ALL_PAYTABLES: Record<RiskMode, RiskPaytables> = {
  classic: CLASSIC_PAYTABLES,
  low: LOW_PAYTABLES,
  medium: MEDIUM_PAYTABLES,
  high: HIGH_PAYTABLES,
};

/**
 * Calculates theoretical RTP for a given risk mode and pick count k
 */
export function calculateTheoreticalRtp(mode: RiskMode, k: number): number {
  const table = ALL_PAYTABLES[mode][k];
  if (!table) return 0;
  let rtp = 0;
  for (let h = 0; h <= k; h++) {
    const prob = KENO_PROBABILITIES[k][h] || 0;
    const mult = table[h] || 0;
    rtp += prob * mult;
  }
  return rtp;
}

/**
 * Calculates hit frequency (probability of win > 0)
 */
export function calculateHitFrequency(mode: RiskMode, k: number): number {
  const table = ALL_PAYTABLES[mode][k];
  if (!table) return 0;
  let hitProb = 0;
  for (let h = 0; h <= k; h++) {
    const mult = table[h] || 0;
    if (mult > 0) {
      hitProb += KENO_PROBABILITIES[k][h] || 0;
    }
  }
  return hitProb;
}

/**
 * Gets complete mathematical statistics for a given mode and pick count k
 */
export function getModeMathStats(mode: RiskMode, k: number): ModeMathStats {
  const table = ALL_PAYTABLES[mode][k] || {};
  const entries: PaytableEntry[] = [];
  let maxWin = 0;

  for (let h = 0; h <= k; h++) {
    const multiplier = table[h] || 0;
    const probability = KENO_PROBABILITIES[k][h] || 0;
    if (multiplier > maxWin) maxWin = multiplier;
    entries.push({
      hits: h,
      multiplier,
      probability,
    });
  }

  return {
    mode,
    picks: k,
    rtp: calculateTheoreticalRtp(mode, k),
    maxWin,
    hitFrequency: calculateHitFrequency(mode, k),
    paytable: entries,
  };
}

/**
 * Helper to get payout multiplier for (mode, k, hits)
 */
export function getPayoutMultiplier(mode: RiskMode, k: number, hits: number): number {
  const table = ALL_PAYTABLES[mode]?.[k];
  if (!table) return 0;
  return table[hits] || 0;
}
