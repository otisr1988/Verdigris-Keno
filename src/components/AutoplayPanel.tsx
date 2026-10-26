/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AutoplayConfig, CurrencyCode } from '../game/types.ts';
import { formatCurrency } from '../game/rgsClient.ts';
import { Play, Square, AlertCircle } from 'lucide-react';

interface AutoplayPanelProps {
  config: AutoplayConfig;
  balance: number;
  currency: CurrencyCode;
  onUpdateConfig: (newConfig: Partial<AutoplayConfig>) => void;
  onStartAutoplay: () => void;
  onStopAutoplay: () => void;
  disabled: boolean;
}

export const AutoplayPanel: React.FC<AutoplayPanelProps> = ({
  config,
  balance,
  currency,
  onUpdateConfig,
  onStartAutoplay,
  onStopAutoplay,
  disabled,
}) => {
  const [rounds, setRounds] = useState<number>(config.rounds || 10);
  const [stopOnWin, setStopOnWin] = useState<string>(config.stopOnWin > 0 ? config.stopOnWin.toString() : '');
  const [stopOnLoss, setStopOnLoss] = useState<string>(config.stopOnLoss > 0 ? config.stopOnLoss.toString() : '');
  const [stopBalanceBelow, setStopBalanceBelow] = useState<string>(
    config.stopBalanceBelow > 0 ? config.stopBalanceBelow.toString() : ''
  );
  const [confirmed, setConfirmed] = useState<boolean>(false);

  const roundPresets = [10, 25, 50, 100];

  const handleStart = () => {
    onUpdateConfig({
      rounds: rounds,
      stopOnWin: parseFloat(stopOnWin) || 0,
      stopOnLoss: parseFloat(stopOnLoss) || 0,
      stopBalanceBelow: parseFloat(stopBalanceBelow) || 0,
      currentRound: 0,
      totalProfit: 0,
    });
    onStartAutoplay();
  };

  return (
    <div className="w-full p-4 rounded-2xl bg-[#151B1C]/90 border border-[#B9774D]/30 shadow-lg flex flex-col gap-3 text-xs sm:text-sm text-[#F2ECDD]">
      <div className="flex items-center justify-between border-b border-[#B9774D]/20 pb-2">
        <span className="font-bold tracking-wider uppercase text-[#C8B17E]">
          Autoplay Settings
        </span>
        {config.active && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 text-xs font-semibold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Active · Round {config.currentRound + 1} / {config.rounds}
          </span>
        )}
      </div>

      {/* Rounds Selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-[#C8B17E]/90 font-medium">Number of Rounds</label>
        <div className="grid grid-cols-4 gap-2">
          {roundPresets.map((count) => (
            <button
              key={count}
              type="button"
              disabled={config.active || disabled}
              onClick={() => {
                setRounds(count);
                onUpdateConfig({ rounds: count });
              }}
              className={`
                py-2 rounded-lg font-mono font-semibold transition-all border
                ${
                  rounds === count
                    ? 'bg-[#123F35] text-[#F2ECDD] border-[#D79362] shadow-[0_0_8px_#D79362]/40'
                    : 'bg-[#092920]/40 text-[#C8B17E] border-[#B9774D]/20 hover:border-[#B9774D]/50'
                }
              `}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      {/* Stop on Single Win */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[#C8B17E]/90">Stop if Single Win Exceeds</label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="1"
              placeholder="0 (Disabled)"
              disabled={config.active || disabled}
              value={stopOnWin}
              onChange={(e) => setStopOnWin(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#092920]/50 border border-[#B9774D]/30 text-[#F2ECDD] font-mono text-xs focus:outline-none focus:border-[#D79362]"
            />
          </div>
        </div>

        {/* Stop on Single Loss */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[#C8B17E]/90">Stop if Single Loss Exceeds</label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="1"
              placeholder="0 (Disabled)"
              disabled={config.active || disabled}
              value={stopOnLoss}
              onChange={(e) => setStopOnLoss(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#092920]/50 border border-[#B9774D]/30 text-[#F2ECDD] font-mono text-xs focus:outline-none focus:border-[#D79362]"
            />
          </div>
        </div>
      </div>

      {/* Stop if Balance drops below */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-[#C8B17E]/90">
          Stop if Balance drops below (Current: {formatCurrency(balance, currency)})
        </label>
        <input
          type="number"
          min="0"
          step="5"
          placeholder="0 (Disabled)"
          disabled={config.active || disabled}
          value={stopBalanceBelow}
          onChange={(e) => setStopBalanceBelow(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-[#092920]/50 border border-[#B9774D]/30 text-[#F2ECDD] font-mono text-xs focus:outline-none focus:border-[#D79362]"
        />
      </div>

      {/* Stake Engine Compliance Disclaimer & Confirmation */}
      {!config.active && (
        <div className="mt-1 flex items-start gap-2 p-2.5 rounded-lg bg-[#123F35]/40 border border-[#B9774D]/30 text-[11px] text-[#C8B17E]">
          <AlertCircle className="w-4 h-4 text-[#D79362] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span>
              In accordance with Stake Engine responsible gaming standards, every automated round completes its full RGS settlement cycle before the next round begins.
            </span>
            <label className="flex items-center gap-2 mt-1 cursor-pointer select-none text-[#F2ECDD]">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="rounded border-[#B9774D] text-emerald-600 focus:ring-0"
              />
              <span className="font-medium">I confirm this autoplay configuration</span>
            </label>
          </div>
        </div>
      )}

      {/* Action Button: Start or Stop */}
      <div className="mt-2">
        {config.active ? (
          <button
            type="button"
            onClick={onStopAutoplay}
            className="w-full py-3 rounded-xl bg-red-900/80 hover:bg-red-800 text-white font-bold tracking-wider uppercase border border-red-500 shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Square className="w-4 h-4 fill-current" />
            Stop Autoplay ({config.rounds - config.currentRound} remaining)
          </button>
        ) : (
          <button
            type="button"
            disabled={!confirmed || disabled}
            onClick={handleStart}
            className={`
              w-full py-3 rounded-xl font-bold tracking-wider uppercase border shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]
              ${
                confirmed && !disabled
                  ? 'btn-primary-emerald text-[#F2ECDD]'
                  : 'bg-[#151B1C] text-slate-500 border-slate-700 cursor-not-allowed'
              }
            `}
          >
            <Play className="w-4 h-4 fill-current" />
            Start Autoplay ({rounds} Rounds)
          </button>
        )}
      </div>
    </div>
  );
};
