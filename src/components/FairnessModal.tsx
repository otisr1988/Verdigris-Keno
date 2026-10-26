/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SeedState } from '../game/types.ts';
import { sha256, generateKenoDraw } from '../game/provablyFair.ts';
import { X, Copy, Check, RotateCcw, Shield, ExternalLink, CheckCircle } from 'lucide-react';

interface FairnessModalProps {
  isOpen: boolean;
  onClose: () => void;
  seedState: SeedState;
  onUpdateClientSeed: (seed: string) => Promise<void>;
  onRotateServerSeed: () => Promise<string>;
}

export const FairnessModal: React.FC<FairnessModalProps> = ({
  isOpen,
  onClose,
  seedState,
  onUpdateClientSeed,
  onRotateServerSeed,
}) => {
  const [clientSeedInput, setClientSeedInput] = useState<string>(seedState.clientSeed);
  const [copiedServerHash, setCopiedServerHash] = useState<boolean>(false);
  const [copiedClientSeed, setCopiedClientSeed] = useState<boolean>(false);
  const [revealedSeed, setRevealedSeed] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState<boolean>(false);

  // Verifier tool state
  const [verifyServerSeed, setVerifyServerSeed] = useState<string>('');
  const [verifyClientSeed, setVerifyClientSeed] = useState<string>('');
  const [verifyNonce, setVerifyNonce] = useState<number>(1);
  const [verifyResult, setVerifyResult] = useState<{
    drawnNumbers: number[];
    serverSeedHash: string;
  } | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, type: 'server' | 'client') => {
    navigator.clipboard?.writeText(text);
    if (type === 'server') {
      setCopiedServerHash(true);
      setTimeout(() => setCopiedServerHash(false), 2000);
    } else {
      setCopiedClientSeed(true);
      setTimeout(() => setCopiedClientSeed(false), 2000);
    }
  };

  const handleSaveClientSeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (clientSeedInput.trim()) {
      await onUpdateClientSeed(clientSeedInput.trim());
    }
  };

  const handleRotate = async () => {
    setIsRotating(true);
    try {
      const oldSeed = await onRotateServerSeed();
      setRevealedSeed(oldSeed);
      setVerifyServerSeed(oldSeed);
      setVerifyClientSeed(seedState.clientSeed);
      setVerifyNonce(seedState.nonce);
    } finally {
      setIsRotating(false);
    }
  };

  const handleRunVerify = async () => {
    if (!verifyServerSeed || !verifyClientSeed) return;
    const hash = await sha256(verifyServerSeed);
    const drawn = await generateKenoDraw(verifyServerSeed, verifyClientSeed, verifyNonce);
    setVerifyResult({
      drawnNumbers: drawn,
      serverSeedHash: hash,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl my-8 rounded-2xl bg-[#151B1C] border border-[#B9774D]/40 shadow-2xl text-[#F2ECDD] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#B9774D]/25 bg-[#092920]/60">
          <div className="flex items-center gap-2 text-[#C8B17E]">
            <Shield className="w-5 h-5 text-[#68A895]" />
            <h2 className="text-base sm:text-lg font-bold tracking-wider uppercase text-[#F2ECDD]">
              PROVABLY FAIR
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#C8B17E] hover:text-[#F2ECDD] hover:bg-[#123F35]/50 transition-colors"
            aria-label="Close fairness modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-5 flex flex-col gap-4 text-xs sm:text-sm max-h-[80vh] overflow-y-auto">
          {/* Explanation */}
          <div className="p-3 rounded-xl bg-[#092920]/40 border border-[#B9774D]/20 text-[#C8B17E] leading-relaxed">
            <p>
              Verdigris Keno utilizes Stake Engine’s verifiable cryptographic fairness protocol.
              Before any game round starts, an authoritative server seed is generated and hashed with SHA-256.
              The 10 drawn numbers are determined using HMAC-SHA256 with your Client Seed and Nonce, guaranteeing outcomes cannot be manipulated.
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-[#68A895] font-semibold">
              <a
                href="https://stake-engine.com/docs"
                target="_blank"
                rel="noreferrer"
                className="hover:underline flex items-center gap-1"
              >
                <span>Read Official Stake Engine Fairness Documentation</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Active Hashed Server Seed */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-[#C8B17E] uppercase tracking-wider text-xs">
              Hashed Server Seed (Active)
            </label>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#092920]/60 border border-[#B9774D]/30 font-mono text-xs break-all">
              <span className="flex-1 text-[#F2ECDD]">{seedState.serverSeedHash}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(seedState.serverSeedHash, 'server')}
                className="p-1.5 rounded-lg bg-[#151B1C] hover:bg-[#182324] text-[#C8B17E] hover:text-[#F2ECDD] shrink-0 border border-[#B9774D]/30"
                aria-label="Copy server seed hash"
                title="Copy hash"
              >
                {copiedServerHash ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Client Seed & Nonce */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="font-semibold text-[#C8B17E] uppercase tracking-wider text-xs">
                Client Seed
              </label>
              <form onSubmit={handleSaveClientSeed} className="flex items-center gap-2">
                <input
                  type="text"
                  value={clientSeedInput}
                  onChange={(e) => setClientSeedInput(e.target.value)}
                  className="flex-1 p-2.5 rounded-xl bg-[#092920]/60 border border-[#B9774D]/30 font-mono text-xs text-[#F2ECDD] focus:outline-none focus:border-[#D79362]"
                />
                <button
                  type="submit"
                  className="px-3 py-2.5 rounded-xl btn-copper text-white font-bold text-xs uppercase tracking-wider shrink-0"
                >
                  Update
                </button>
              </form>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-[#C8B17E] uppercase tracking-wider text-xs">
                Nonce
              </label>
              <div className="p-2.5 rounded-xl bg-[#092920]/60 border border-[#B9774D]/30 font-mono text-sm font-bold text-[#D79362] text-center">
                {seedState.nonce}
              </div>
            </div>
          </div>

          {/* Seed Rotation Button */}
          <div className="flex flex-col gap-2 pt-2 border-t border-[#B9774D]/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#F2ECDD] text-xs uppercase tracking-wider">
                  Seed Pair Rotation
                </div>
                <div className="text-[11px] text-[#C8B17E]/80">
                  Rotating reveals the private server seed of past rounds so you can verify them.
                </div>
              </div>
              <button
                type="button"
                onClick={handleRotate}
                disabled={isRotating}
                className="px-3 py-2 rounded-xl bg-[#123F35] hover:bg-[#185246] border border-[#D79362] text-[#F2ECDD] font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
                <span>Rotate Seed</span>
              </button>
            </div>

            {revealedSeed && (
              <div className="p-3 rounded-xl bg-[#123F35]/40 border border-[#68A895] flex flex-col gap-1 text-xs">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Revealed Previous Server Seed:
                </span>
                <span className="font-mono text-[11px] break-all text-[#F2ECDD]">
                  {revealedSeed}
                </span>
              </div>
            )}
          </div>

          {/* Built-in Provably Fair Verifier */}
          <div className="p-3.5 rounded-xl bg-[#092920]/70 border border-[#B9774D]/30 flex flex-col gap-2.5">
            <span className="font-bold text-[#C8B17E] uppercase tracking-wider text-xs">
              Cryptographic Outcome Verifier
            </span>
            <div className="flex flex-col gap-2 text-xs">
              <input
                type="text"
                placeholder="Server Seed (unhashed)"
                value={verifyServerSeed}
                onChange={(e) => setVerifyServerSeed(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#151B1C] border border-[#B9774D]/25 font-mono text-[11px] text-[#F2ECDD]"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Client Seed"
                  value={verifyClientSeed}
                  onChange={(e) => setVerifyClientSeed(e.target.value)}
                  className="col-span-2 p-2 rounded-lg bg-[#151B1C] border border-[#B9774D]/25 font-mono text-[11px] text-[#F2ECDD]"
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Nonce"
                  value={verifyNonce}
                  onChange={(e) => setVerifyNonce(parseInt(e.target.value, 10) || 1)}
                  className="p-2 rounded-lg bg-[#151B1C] border border-[#B9774D]/25 font-mono text-[11px] text-[#F2ECDD]"
                />
              </div>
              <button
                type="button"
                onClick={handleRunVerify}
                className="py-2 rounded-lg btn-primary-emerald text-white font-bold text-xs uppercase tracking-wider"
              >
                Verify 10 Drawn Numbers
              </button>

              {verifyResult && (
                <div className="mt-2 p-2.5 rounded-lg bg-[#151B1C] border border-[#68A895] flex flex-col gap-1.5">
                  <div className="text-[11px] text-[#C8B17E]">
                    Calculated SHA-256 Hash:{' '}
                    <span className="font-mono text-[#F2ECDD] break-all">{verifyResult.serverSeedHash}</span>
                  </div>
                  <div className="text-xs font-semibold text-[#68A895]">
                    Authoritative 10 Drawn Numbers:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {verifyResult.drawnNumbers.map((n) => (
                      <span
                        key={n}
                        className="px-2 py-1 rounded bg-[#123F35] border border-[#D79362] font-mono font-bold text-white text-xs"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
