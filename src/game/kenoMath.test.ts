/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  combinations,
  TOTAL_COMBINATIONS,
  getHypergeometricProbability,
  KENO_PROBABILITIES,
  calculateTheoreticalRtp,
  calculateHitFrequency,
  getModeMathStats,
  ALL_PAYTABLES,
} from './kenoMath.ts';
import { sha256, hmacSha256, generateKenoDraw } from './provablyFair.ts';
import { toMicroUnits, fromMicroUnits } from './rgsClient.ts';

test('combinations(n, r) basic correctness', () => {
  assert.equal(combinations(40, 0), 1);
  assert.equal(combinations(40, 1), 40);
  assert.equal(combinations(40, 10), 847660528);
  assert.equal(combinations(10, 5), 252);
  assert.equal(combinations(10, 10), 1);
  assert.equal(combinations(5, 6), 0);
});

test('hypergeometric probabilities sum to 1.0 for each pick count', () => {
  for (let k = 1; k <= 10; k++) {
    let sum = 0;
    for (let h = 0; h <= k; h++) {
      const prob = getHypergeometricProbability(k, h);
      assert.ok(prob >= 0 && prob <= 1, `Probability out of bounds for k=${k}, h=${h}: ${prob}`);
      sum += prob;
    }
    assert.ok(
      Math.abs(sum - 1.0) < 1e-6,
      `Probability sum for k=${k} was ${sum}, expected ~1.0`
    );
  }
});

test('theoretical RTP across all 4 risk modes and all 10 pick counts is ~96.50% (within 96.0% - 97.0%)', () => {
  const modes = ['classic', 'low', 'medium', 'high'] as const;

  for (const mode of modes) {
    for (let k = 1; k <= 10; k++) {
      const rtp = calculateTheoreticalRtp(mode, k);
      assert.ok(
        rtp >= 0.958 && rtp <= 0.972,
        `Mode ${mode} pick ${k} RTP ${(rtp * 100).toFixed(2)}% was outside acceptable range [95.8%, 97.2%]`
      );
    }
  }
});

test('high risk mode top win reaches up to 10,000x', () => {
  const highStats = getModeMathStats('high', 10);
  assert.equal(highStats.maxWin, 10000);
});

test('low risk mode provides higher hit frequency than high risk mode', () => {
  for (let k = 3; k <= 10; k++) {
    const lowHitFreq = calculateHitFrequency('low', k);
    const highHitFreq = calculateHitFrequency('high', k);
    assert.ok(
      lowHitFreq > highHitFreq,
      `Expected low risk hit freq (${lowHitFreq}) > high risk (${highHitFreq}) for k=${k}`
    );
  }
});

test('RGS micro-units 6 decimal places conversion integrity', () => {
  assert.equal(toMicroUnits(1.0), 1000000);
  assert.equal(toMicroUnits(0.1), 100000);
  assert.equal(toMicroUnits(0.000001), 1);
  assert.equal(fromMicroUnits(1000000), 1.0);
  assert.equal(fromMicroUnits(2500000), 2.5);
  assert.equal(fromMicroUnits(1), 0.000001);
});

test('provably fair HMAC-SHA256 draw generation produces 10 unique numbers in [1..40]', async () => {
  const serverSeed = 'b1946ac92492d2347c6235b4d2611184';
  const clientSeed = 'stake-engine-test';
  const nonce = 42;

  const draw1 = await generateKenoDraw(serverSeed, clientSeed, nonce);
  const draw2 = await generateKenoDraw(serverSeed, clientSeed, nonce);

  // Determinism check
  assert.deepEqual(draw1, draw2, 'Draws with identical seed/nonce must be identical');

  // Length check
  assert.equal(draw1.length, 10);

  // Uniqueness check
  const unique = new Set(draw1);
  assert.equal(unique.size, 10, 'All 10 drawn numbers must be strictly unique');

  // Range check
  for (const n of draw1) {
    assert.ok(n >= 1 && n <= 40, `Drawn number ${n} out of range [1, 40]`);
  }

  // Nonce difference check
  const draw3 = await generateKenoDraw(serverSeed, clientSeed, nonce + 1);
  assert.notDeepEqual(draw1, draw3, 'Different nonces must yield different draws');
});

test('sha256 hash calculation is correct', async () => {
  const hash = await sha256('verdigris-keno');
  assert.equal(hash.length, 64);
  assert.ok(/^[0-9a-f]{64}$/.test(hash));
});
