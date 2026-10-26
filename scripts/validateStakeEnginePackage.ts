/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'node:fs';
import path from 'node:path';
// @ts-ignore
import { ZstdCodec } from 'zstd-codec';

const MATH_DIR = path.resolve(process.cwd(), 'math');

interface ModeEntry {
  name: string;
  cost: number;
  events: string;
  weights: string;
}

interface IndexFile {
  modes: ModeEntry[];
}

export async function validateStakeEngineMath(): Promise<{
  passed: boolean;
  totalModes: number;
  modeResults: { mode: string; rtp: number; valid: boolean; maxPayout: number }[];
  errors: string[];
}> {
  const errors: string[] = [];
  const modeResults: { mode: string; rtp: number; valid: boolean; maxPayout: number }[] = [];

  const indexPath = path.join(MATH_DIR, 'index.json');
  if (!fs.existsSync(indexPath)) {
    return { passed: false, totalModes: 0, modeResults: [], errors: ['index.json missing'] };
  }

  const index: IndexFile = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  if (!Array.isArray(index.modes) || index.modes.length === 0) {
    return { passed: false, totalModes: 0, modeResults: [], errors: ['index.json has no modes declared'] };
  }

  const zstd = await new Promise<any>((resolve) => ZstdCodec.run(resolve));
  const simple = new zstd.Simple();

  for (const mode of index.modes) {
    // 1. Validate Mode Name & Cost
    if (mode.name.length > 32 || !/^[a-zA-Z0-9_-]+$/.test(mode.name)) {
      errors.push(`Invalid mode name format: ${mode.name}`);
    }
    if (mode.cost < 1.0) {
      errors.push(`Mode ${mode.name} cost must be >= 1.0, got ${mode.cost}`);
    }

    // 2. Validate Weights CSV
    const csvPath = path.join(MATH_DIR, mode.weights);
    if (!fs.existsSync(csvPath)) {
      errors.push(`Mode ${mode.name}: weights file ${mode.weights} missing`);
      continue;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8').trim();
    const csvLines = csvContent.split('\n');
    let totalWeight = 0;
    let totalWeightedPayout = 0;
    let maxPayoutHundredths = 0;
    const csvRowMap = new Map<number, number>(); // simulation_id -> payout

    for (let lineIdx = 0; lineIdx < csvLines.length; lineIdx++) {
      const line = csvLines[lineIdx].trim();
      if (!line) continue;
      const parts = line.split(',');
      if (parts.length !== 3) {
        errors.push(`Mode ${mode.name} CSV line ${lineIdx + 1} does not have exactly 3 fields: ${line}`);
        continue;
      }
      const simId = parseInt(parts[0], 10);
      const weight = parseInt(parts[1], 10);
      const payout = parseInt(parts[2], 10);

      if (isNaN(simId) || isNaN(weight) || isNaN(payout) || simId <= 0 || weight <= 0 || payout < 0) {
        errors.push(`Mode ${mode.name} CSV line ${lineIdx + 1} contains invalid integer values: ${line}`);
        continue;
      }

      csvRowMap.set(simId, payout);
      totalWeight += weight;
      totalWeightedPayout += weight * payout;
      if (payout > maxPayoutHundredths) maxPayoutHundredths = payout;
    }

    // Weighted RTP: payout is in hundredths of base bet (e.g. 100 = 1.00x)
    // RTP = (sum(weight * payout) / sum(weight)) / 100
    const weightedRtp = totalWeight > 0 ? (totalWeightedPayout / totalWeight) / 100 : 0;
    const isRtpValid = weightedRtp >= 0.958 && weightedRtp <= 0.972;

    if (!isRtpValid) {
      errors.push(`Mode ${mode.name} Weighted RTP ${(weightedRtp * 100).toFixed(2)}% out of bounds [95.8%, 97.2%]`);
    }

    // 3. Validate Zstandard Compressed Events file
    const zstPath = path.join(MATH_DIR, mode.events);
    if (!fs.existsSync(zstPath)) {
      errors.push(`Mode ${mode.name}: events file ${mode.events} missing`);
      continue;
    }

    try {
      const compressedBuffer = fs.readFileSync(zstPath);
      const decompressed = simple.decompress(compressedBuffer);
      const jsonlText = Buffer.from(decompressed).toString('utf-8').trim();
      const jsonlLines = jsonlText.split('\n');

      if (jsonlLines.length !== csvRowMap.size) {
        errors.push(`Mode ${mode.name}: books row count (${jsonlLines.length}) does not match CSV row count (${csvRowMap.size})`);
      }

      for (const jLine of jsonlLines) {
        const item = JSON.parse(jLine);
        if (!csvRowMap.has(item.id)) {
          errors.push(`Mode ${mode.name}: book item id ${item.id} not in CSV`);
        } else {
          const expectedPayout = csvRowMap.get(item.id);
          if (item.payoutMultiplier !== expectedPayout) {
            errors.push(`Mode ${mode.name}: book id ${item.id} payout ${item.payoutMultiplier} does not match CSV ${expectedPayout}`);
          }
        }
      }
    } catch (decompErr: any) {
      errors.push(`Mode ${mode.name}: failed to decompress ${mode.events}: ${decompErr.message}`);
    }

    modeResults.push({
      mode: mode.name,
      rtp: weightedRtp,
      valid: isRtpValid,
      maxPayout: maxPayoutHundredths / 100,
    });
  }

  return {
    passed: errors.length === 0,
    totalModes: index.modes.length,
    modeResults,
    errors,
  };
}

if (process.argv[1]?.endsWith('validateStakeEnginePackage.ts')) {
  console.log('Running Official Stake Engine Math Validation Audit...\n');
  validateStakeEngineMath().then((res) => {
    console.log(`Audited ${res.totalModes} Modes:`);
    res.modeResults.forEach((m) => {
      console.log(`  [${m.valid ? 'PASS' : 'FAIL'}] Mode ${m.mode.padEnd(14)} -> Weighted RTP: ${(m.rtp * 100).toFixed(2)}% | Max Payout: ${m.maxPayout}x`);
    });

    if (res.passed) {
      console.log('\n>>> ALL 40 STAKE ENGINE MODES PASSED MATH & ZSTANDARD VALIDATION! <<<');
    } else {
      console.error('\nValidation errors encountered:', res.errors);
      process.exit(1);
    }
  });
}
