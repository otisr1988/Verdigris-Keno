/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getHypergeometricProbability } from '../src/game/kenoMath.ts';

const probs: Record<number, Record<number, number>> = {};
for (let k = 1; k <= 10; k++) {
  probs[k] = {};
  for (let h = 0; h <= k; h++) {
    probs[k][h] = getHypergeometricProbability(k, h);
  }
}

// Function to calculate RTP
function calcRtp(table: Record<number, number>, k: number): number {
  let sum = 0;
  for (let h = 0; h <= k; h++) {
    sum += (table[h] || 0) * probs[k][h];
  }
  return sum;
}

// 1. CLASSIC
const classic: Record<number, Record<number, number>> = {
  1: { 0: 0.00, 1: 3.86 }, // 0.25 * 3.86 = 96.50%
  2: { 0: 0.00, 1: 1.20, 2: 8.70 }, // 0.384615*1.2 + 0.057692*8.7 = 0.461538 + 0.50192 = 96.35% -> let's tune:
  3: { 0: 0.00, 1: 0.00, 2: 2.80, 3: 48.00 },
  4: { 0: 0.00, 1: 0.00, 2: 1.70, 3: 8.00, 4: 125.00 },
  5: { 0: 0.00, 1: 0.00, 2: 1.20, 3: 4.20, 4: 25.00, 5: 350.00 },
  6: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 3.50, 4: 12.00, 5: 90.00, 6: 1200.00 },
  7: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 2.00, 4: 7.00, 5: 35.00, 6: 250.00, 7: 2000.00 },
  8: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 0.00, 4: 5.00, 5: 20.00, 6: 95.00, 7: 600.00, 8: 4500.00 },
  9: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 0.00, 4: 3.00, 5: 11.00, 6: 45.00, 7: 250.00, 8: 1500.00, 9: 6000.00 },
  10: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 0.00, 4: 2.00, 5: 6.50, 6: 25.00, 7: 120.00, 8: 600.00, 9: 2500.00, 10: 10000.00 },
};

// Tune each to exactly ~96.50%
for (let k = 1; k <= 10; k++) {
  let rtp = calcRtp(classic[k], k);
  // Scale non-zero elements
  const currentNonZero = Object.entries(classic[k]).filter(([_, v]) => v > 0);
  // Find scaling factor
  const targetRtp = 0.965;
  const factor = targetRtp / rtp;
  for (const [h, v] of currentNonZero) {
    classic[k][Number(h)] = Number((v * factor).toFixed(2));
  }
  // Recheck
  rtp = calcRtp(classic[k], k);
  console.log(`Classic k=${k}: RTP = ${(rtp * 100).toFixed(2)}%`, classic[k]);
}

// 2. LOW RISK (payout on h=0 or h=1 for higher picks)
const low: Record<number, Record<number, number>> = {
  1: { 0: 0.70, 1: 1.76 },
  2: { 0: 0.50, 1: 1.25, 2: 3.50 },
  3: { 0: 0.00, 1: 1.10, 2: 2.20, 3: 15.00 },
  4: { 0: 0.00, 1: 0.80, 2: 1.60, 3: 4.50, 4: 40.00 },
  5: { 0: 0.00, 1: 0.50, 2: 1.40, 3: 3.20, 4: 12.00, 5: 120.00 },
  6: { 0: 0.00, 1: 0.30, 2: 1.20, 3: 2.50, 4: 7.50, 5: 40.00, 6: 300.00 },
  7: { 0: 0.00, 1: 0.20, 2: 1.00, 3: 2.00, 4: 5.00, 5: 18.00, 6: 120.00, 7: 600.00 },
  8: { 0: 0.00, 1: 0.10, 2: 0.80, 3: 1.70, 4: 3.80, 5: 10.00, 6: 45.00, 7: 250.00, 8: 1200.00 },
  9: { 0: 0.00, 1: 0.10, 2: 0.60, 3: 1.40, 4: 3.00, 5: 7.50, 6: 25.00, 7: 110.00, 8: 500.00, 9: 2000.00 },
  10: { 0: 1.20, 1: 0.00, 2: 0.50, 3: 1.20, 4: 2.40, 5: 5.00, 6: 15.00, 7: 60.00, 8: 250.00, 9: 1000.00, 10: 3000.00 },
};

for (let k = 1; k <= 10; k++) {
  let rtp = calcRtp(low[k], k);
  const targetRtp = 0.965;
  const factor = targetRtp / rtp;
  for (const [h, v] of Object.entries(low[k])) {
    if (v > 0) low[k][Number(h)] = Number((v * factor).toFixed(2));
  }
  rtp = calcRtp(low[k], k);
  console.log(`Low k=${k}: RTP = ${(rtp * 100).toFixed(2)}%`, low[k]);
}

// 3. MEDIUM RISK
const medium: Record<number, Record<number, number>> = {
  1: { 0: 0.00, 1: 3.86 },
  2: { 0: 0.00, 1: 0.90, 2: 10.50 },
  3: { 0: 0.00, 1: 0.00, 2: 2.50, 3: 52.00 },
  4: { 0: 0.00, 1: 0.00, 2: 1.50, 3: 10.00, 4: 150.00 },
  5: { 0: 0.00, 1: 0.00, 2: 1.00, 3: 4.80, 4: 32.00, 5: 480.00 },
  6: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 3.20, 4: 15.00, 5: 120.00, 6: 1500.00 },
  7: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 1.80, 4: 8.50, 5: 50.00, 6: 350.00, 7: 3000.00 },
  8: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 0.00, 4: 5.50, 5: 28.00, 6: 150.00, 7: 900.00, 8: 6000.00 },
  9: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 0.00, 4: 3.20, 5: 14.00, 6: 70.00, 7: 380.00, 8: 2200.00, 9: 8000.00 },
  10: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 0.00, 4: 2.20, 5: 7.80, 6: 38.00, 7: 180.00, 8: 950.00, 9: 4000.00, 10: 10000.00 },
};

for (let k = 1; k <= 10; k++) {
  let rtp = calcRtp(medium[k], k);
  const targetRtp = 0.965;
  const factor = targetRtp / rtp;
  for (const [h, v] of Object.entries(medium[k])) {
    if (v > 0) medium[k][Number(h)] = Number((v * factor).toFixed(2));
  }
  rtp = calcRtp(medium[k], k);
  console.log(`Medium k=${k}: RTP = ${(rtp * 100).toFixed(2)}%`, medium[k]);
}

// 4. HIGH RISK (Max volatility, 10,000x max)
const high: Record<number, Record<number, number>> = {
  1: { 0: 0.00, 1: 3.86 },
  2: { 0: 0.00, 1: 0.00, 2: 16.73 },
  3: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 79.45 },
  4: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 10.00, 4: 245.00 },
  5: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 4.80, 4: 48.00, 5: 780.00 },
  6: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 0.00, 4: 22.00, 5: 180.00, 6: 2200.00 },
  7: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 0.00, 4: 12.00, 5: 68.00, 6: 480.00, 7: 4500.00 },
  8: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 0.00, 4: 0.00, 5: 38.00, 6: 240.00, 7: 1600.00, 8: 8000.00 },
  9: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 0.00, 4: 0.00, 5: 22.00, 6: 110.00, 7: 700.00, 8: 3800.00, 9: 10000.00 },
  10: { 0: 0.00, 1: 0.00, 2: 0.00, 3: 0.00, 4: 0.00, 5: 14.00, 6: 65.00, 7: 380.00, 8: 2000.00, 9: 6500.00, 10: 10000.00 },
};

for (let k = 1; k <= 10; k++) {
  let rtp = calcRtp(high[k], k);
  const targetRtp = 0.965;
  const factor = targetRtp / rtp;
  for (const [h, v] of Object.entries(high[k])) {
    if (v > 0) high[k][Number(h)] = Number((v * factor).toFixed(2));
  }
  rtp = calcRtp(high[k], k);
  console.log(`High k=${k}: RTP = ${(rtp * 100).toFixed(2)}%`, high[k]);
}
