/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Stake-standard Provably Fair Generation and Verification Engine
 * Uses HMAC-SHA256(serverSeed, clientSeed:nonce:round)
 */

export interface GeneratedDrawResult {
  drawnNumbers: number[];
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
}

/**
 * Helper to compute SHA-256 hex string in universal browser/node environment
 */
export async function sha256(text: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const msgUint8 = new TextEncoder().encode(text);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Node.js fallback
    const crypto = await import('node:crypto');
    return crypto.createHash('sha256').update(text).digest('hex');
  }
}

/**
 * Helper to compute HMAC-SHA256 hex string in universal environment
 */
export async function hmacSha256(key: string, message: string): Promise<Uint8Array> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const enc = new TextEncoder();
    const keyData = enc.encode(key);
    const msgData = enc.encode(message);

    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: { name: 'SHA-256' } },
      false,
      ['sign']
    );

    const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, msgData);
    return new Uint8Array(signature);
  } else {
    // Node.js fallback
    const crypto = await import('node:crypto');
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(message);
    return new Uint8Array(hmac.digest());
  }
}

/**
 * Generates 10 unique numbers from 1 to 40 using HMAC-SHA256
 */
export async function generateKenoDraw(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): Promise<number[]> {
  const drawnNumbers: number[] = [];
  const pool = Array.from({ length: 40 }, (_, i) => i + 1); // 1..40

  let round = 0;
  let byteIndex = 0;
  let currentHmac: Uint8Array | null = null;

  while (drawnNumbers.length < 10) {
    if (!currentHmac || byteIndex + 4 > currentHmac.length) {
      currentHmac = await hmacSha256(serverSeed, `${clientSeed}:${nonce}:${round}`);
      byteIndex = 0;
      round++;
    }

    // Read 4 bytes as unsigned 32-bit big-endian integer
    const b0 = currentHmac[byteIndex];
    const b1 = currentHmac[byteIndex + 1];
    const b2 = currentHmac[byteIndex + 2];
    const b3 = currentHmac[byteIndex + 3];
    byteIndex += 4;

    const randInt = ((b0 << 24) >>> 0) + (b1 << 16) + (b2 << 8) + b3;
    const randFloat = randInt / 0x100000000; // [0, 1)

    // Rejection / Fisher-Yates pick from remaining pool
    const selectedIdx = Math.floor(randFloat * pool.length);
    const chosenNumber = pool[selectedIdx];
    pool.splice(selectedIdx, 1);
    drawnNumbers.push(chosenNumber);
  }

  return drawnNumbers;
}

/**
 * Creates a cryptographically strong random hex seed
 */
export function generateRandomSeed(byteLength: number = 32): string {
  const bytes = new Uint8Array(byteLength);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(bytes);
  } else {
    // Node fallback
    import('node:crypto').then(c => c.randomFillSync(bytes));
    for (let i = 0; i < byteLength; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
