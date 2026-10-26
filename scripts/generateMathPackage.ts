/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'node:fs';
import path from 'node:path';
// @ts-ignore
import { ZstdCodec } from 'zstd-codec';
import { ALL_PAYTABLES, getHypergeometricProbability } from '../src/game/kenoMath.ts';
import { RiskMode } from '../src/game/types.ts';

const MATH_DIR = path.resolve(process.cwd(), 'math');

if (!fs.existsSync(MATH_DIR)) {
  fs.mkdirSync(MATH_DIR, { recursive: true });
}

interface IndexModeEntry {
  name: string;
  cost: number;
  events: string;
  weights: string;
}

const modesList: IndexModeEntry[] = [];
const riskModes: RiskMode[] = ['classic', 'low', 'medium', 'high'];

// @ts-ignore
ZstdCodec.run((zstd: any) => {
  const simple = new zstd.Simple();

  console.log('Generating Stake Engine Math files and .jsonl.zst in', MATH_DIR);

  for (const risk of riskModes) {
    for (let k = 1; k <= 10; k++) {
      const modeName = `${risk}_${k}`;
      const weightsFileName = `lookUpTable_${modeName}_0.csv`;
      const eventsFileName = `books_${modeName}.jsonl`;
      const zstFileName = `${eventsFileName}.zst`;

      modesList.push({
        name: modeName,
        cost: 1.0,
        events: zstFileName,
        weights: weightsFileName,
      });

      const paytable = ALL_PAYTABLES[risk][k];
      const csvRows: string[] = [];
      const jsonlRows: string[] = [];

      // Each possible hit count h from 0 to k forms an outcome in the discrete book
      for (let h = 0; h <= k; h++) {
        const simulationId = h + 1;
        const prob = getHypergeometricProbability(k, h);
        // Integer weight scaled to 1 billion basis units
        const weight = Math.max(1, Math.round(prob * 1_000_000_000));
        const mult = paytable[h] || 0;
        // In Stake Engine lookup table: payout is an unsigned integer in hundredths of base bet (e.g. 100 = 1.00x)
        const payoutHundredths = Math.round(mult * 100);

        // CSV row: simulation_id,weight,payout
        csvRows.push(`${simulationId},${weight},${payoutHundredths}`);

        // Books JSONL row
        const bookEntry = {
          id: simulationId,
          payoutMultiplier: payoutHundredths,
          events: [
            {
              type: 'draw_result',
              hits: h,
              picksCount: k,
              multiplier: mult,
            },
          ],
        };
        jsonlRows.push(JSON.stringify(bookEntry));
      }

      const jsonlContent = jsonlRows.join('\n') + '\n';
      fs.writeFileSync(path.join(MATH_DIR, weightsFileName), csvRows.join('\n') + '\n');
      fs.writeFileSync(path.join(MATH_DIR, eventsFileName), jsonlContent);

      // Compress to .jsonl.zst using Zstandard
      const compressedData = simple.compress(Buffer.from(jsonlContent, 'utf-8'));
      fs.writeFileSync(path.join(MATH_DIR, zstFileName), Buffer.from(compressedData));
    }
  }

  // Write master index.json
  const indexJsonContent = {
    modes: modesList,
  };

  fs.writeFileSync(
    path.join(MATH_DIR, 'index.json'),
    JSON.stringify(indexJsonContent, null, 2) + '\n'
  );

  console.log(`Generated math package with genuine .jsonl.zst files for ${modesList.length} modes.`);
});
