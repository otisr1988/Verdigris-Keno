/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BetMode, RiskMode, CurrencyCode, AutoplayConfig, GamePhase } from '../game/types.ts';
import { formatCurrency } from '../game/rgsClient.ts';
import { AutoplayPanel } from './AutoplayPanel.tsx';
import { Sparkles, Trash2, ChevronDown, Loader2 } from 'lucide-react';

interface BetControlsProps {
  betMode: BetMode;
  onSetBetMode: (mode: BetMode) => void;
  wager: number;
  onSetWager: (amount: number) => void;
  balance: number;
  currency: CurrencyCode;
  riskMode: RiskMode;
  onSetRiskMode: (risk: RiskMode) => void;
  selectedCount: number;
  phase: GamePhase;
  onAutoPick: (count?: number) => void;
  onClearTable: () => void;
  onPlayGame: () => void;
  autoplayConfig: AutoplayConfig;
  onUpdateAutoplayConfig: (config: Partial<AutoplayConfig>) => void;
  onStartAutoplay: () => void;
  onStopAutoplay: () => void;
  minBet: number;
  maxBet: number;
  stepBet: number;
  lastWinAmount: number | null;
  lastPayoutMultiplier: number | null;
}

export const BetControls: React.FC<BetControlsProps> = ({
  betMode,
  onSetBetMode,
  wager,
  onSetWager,
  balance,
  currency,
  riskMode,
  onSetRiskMode,
  selectedCount,
  phase,
  onAutoPick,
  onClearTable,
  onPlayGame,
  autoplayConfig,
  onUpdateAutoplayConfig,
  onStartAutoplay,
  onStopAutoplay,
  minBet,
  maxBet,
  stepBet,
  lastWinAmount,
  lastPayoutMultiplier,
}) => {
  const [pickCountChoice, setPickCountChoice] = useState<number>(10);
  const [showPickMenu, setShowPickMenu] = useState<boolean>(false);

  const isPlaying = phase === 'drawing' || phase === 'settling';
  const isInsufficientBalance = wager > balance;
  const canPlay = selectedCount >= 1 && selectedCount <= 10 && wager >= minBet && !isInsufficientBalance && !isPlaying;

  // 1/2 button handler
  const handleHalf = () => {
    const halved = Math.max(minBet, Math.round((wager / 2) / stepBet) * stepBet);
    onSetWager(Number(halved.toFixed(2)));
  };

  // 2x button handler
  const handleDouble = () => {
    const doubled = Math.min(Math.min(maxBet, balance > 0 ? balance : maxBet), Math.round((wager * 2) / stepBet) * stepBet);
    onSetWager(Number(doubled.toFixed(2)));
  };

  // Max button handler
  const handleMax = () => {
    const maxPermitted = Math.min(maxBet, balance);
    const normalized = Math.max(minBet, Math.floor(maxPermitted / stepBet) * stepBet);
    onSetWager(Number(normalized.toFixed(2)));
  };

  const handleWagerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onSetWager(val);
    } else {
      onSetWager(0);
    }
  };

  return (
    <div className="w-full max-w-xl flex flex-col gap-3">
      {/* Segmented Control: Manual | Auto */}
      <div 
        className="grid grid-cols-2 p-1 rounded-xl bg-[#092920]/80 border border-[#B9774D]/30 shadow-inner"
        role="tablist"
      >
        <button
          type="button"
          role="tab"
          aria-selected={betMode === 'manual'}
          onClick={() => onSetBetMode('manual')}
          disabled={isPlaying || autoplayConfig.active}
          className={`
            py-2.5 rounded-lg text-xs sm:text-sm font-bold tracking-wider uppercase transition-all
            ${
              betMode === 'manual'
                ? 'bg-gradient-to-r from-[#185246] to-[#123F35] text-[#F2ECDD] border border-[#D79362] shadow-[0_0_10px_#D79362]/30'
                : 'text-[#C8B17E]/70 hover:text-[#F2ECDD] border border-transparent'
            }
          `}
        >
          Manual
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={betMode === 'auto'}
          onClick={() => onSetBetMode('auto')}
          disabled={isPlaying || autoplayConfig.active}
          className={`
            py-2.5 rounded-lg text-xs sm:text-sm font-bold tracking-wider uppercase transition-all
            ${
              betMode === 'auto'
                ? 'bg-gradient-to-r from-[#185246] to-[#123F35] text-[#F2ECDD] border border-[#D79362] shadow-[0_0_10px_#D79362]/30'
                : 'text-[#C8B17E]/70 hover:text-[#F2ECDD] border border-transparent'
            }
          `}
        >
          Auto
        </button>
      </div>

      {/* Main Betting Panel */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#151B1C]/90 border border-[#B9774D]/25 shadow-lg flex flex-col gap-3">
        {/* Play Amount and Balance Row */}
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <label htmlFor="play-amount-input" className="font-semibold text-[#C8B17E] uppercase tracking-wider">
            Play Amount
          </label>
          <div className="flex items-center gap-1.5 text-xs text-[#C8B17E]/80">
            <span>Balance:</span>
            <strong className="text-[#F2ECDD] font-mono text-sm">
              {formatCurrency(balance, currency)}
            </strong>
          </div>
        </div>

        {/* Editable Wager Control + 1/2, 2x, Max buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#092920]/60 border border-[#B9774D]/35 focus-within:border-[#D79362]">
          <div className="pl-3 pr-1 text-sm font-bold text-[#D79362] font-mono">
            {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'BTC' ? '₿' : 'SC'}
          </div>
          <input
            id="play-amount-input"
            type="number"
            min={minBet}
            max={maxBet}
            step={stepBet}
            value={wager === 0 ? '' : wager}
            onChange={handleWagerChange}
            disabled={isPlaying || autoplayConfig.active}
            className="w-full py-1.5 bg-transparent font-mono text-sm sm:text-base font-bold text-[#F2ECDD] focus:outline-none"
            placeholder="0.00"
          />
          <button
            type="button"
            onClick={handleHalf}
            disabled={isPlaying || autoplayConfig.active}
            className="px-2.5 py-1.5 rounded-lg bg-[#151B1C] hover:bg-[#182324] text-[#C8B17E] hover:text-[#F2ECDD] text-xs font-mono font-bold border border-[#B9774D]/20 active:scale-95 transition-all"
            aria-label="Halve bet amount"
          >
            ½
          </button>
          <button
            type="button"
            onClick={handleDouble}
            disabled={isPlaying || autoplayConfig.active}
            className="px-2.5 py-1.5 rounded-lg bg-[#151B1C] hover:bg-[#182324] text-[#C8B17E] hover:text-[#F2ECDD] text-xs font-mono font-bold border border-[#B9774D]/20 active:scale-95 transition-all"
            aria-label="Double bet amount"
          >
            2×
          </button>
          <button
            type="button"
            onClick={handleMax}
            disabled={isPlaying || autoplayConfig.active}
            className="px-2.5 py-1.5 rounded-lg bg-[#151B1C] hover:bg-[#182324] text-[#C8B17E] hover:text-[#F2ECDD] text-xs font-mono font-bold border border-[#B9774D]/20 active:scale-95 transition-all"
            aria-label="Select maximum permitted bet"
          >
            Max
          </button>
        </div>

        {/* Insufficient Balance warning */}
        {isInsufficientBalance && (
          <div className="text-[11px] text-red-400 font-medium flex items-center gap-1.5">
            <span>Wager exceeds available balance ({formatCurrency(balance, currency)}).</span>
          </div>
        )}

        {/* Risk Mode Selector */}
        <div className="flex flex-col gap-1">
          <label htmlFor="risk-mode-select" className="text-xs text-[#C8B17E] uppercase tracking-wider font-semibold">
            Risk
          </label>
          <div className="relative">
            <select
              id="risk-mode-select"
              value={riskMode}
              disabled={isPlaying || autoplayConfig.active}
              onChange={(e) => onSetRiskMode(e.target.value as RiskMode)}
              className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-[#092920]/70 border border-[#B9774D]/30 text-sm font-semibold text-[#F2ECDD] focus:outline-none focus:border-[#D79362] cursor-pointer"
            >
              <option value="classic">Classic (Balanced Casino Payouts)</option>
              <option value="low">Low (High Hit Frequency)</option>
              <option value="medium">Medium (Moderate Variance)</option>
              <option value="high">High (Max Volatility · 10,000× Peak)</option>
            </select>
            <ChevronDown className="w-4 h-4 text-[#C8B17E] absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Auto Pick and Clear Table Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          {/* Auto Pick with quick count selector */}
          <div className="relative">
            <div className="flex rounded-xl overflow-hidden border border-[#D79362]/40 shadow-sm">
              <button
                type="button"
                onClick={() => onAutoPick(pickCountChoice)}
                disabled={isPlaying || autoplayConfig.active}
                className="flex-1 py-2.5 px-3 btn-copper text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={`Auto pick ${pickCountChoice} numbers`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto Pick ({pickCountChoice})</span>
              </button>
              <button
                type="button"
                onClick={() => setShowPickMenu(!showPickMenu)}
                disabled={isPlaying || autoplayConfig.active}
                className="px-2 bg-[#874e2b] hover:bg-[#9c5932] text-white border-l border-[#D79362]/40"
                aria-label="Select auto-pick count"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Pick dropdown */}
            {showPickMenu && (
              <div className="absolute bottom-full mb-1 left-0 right-0 p-2 rounded-xl bg-[#151B1C] border border-[#B9774D] shadow-2xl z-30 grid grid-cols-5 gap-1 text-center">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      setPickCountChoice(n);
                      setShowPickMenu(false);
                      onAutoPick(n);
                    }}
                    className={`p-1.5 rounded-lg text-xs font-mono font-bold ${
                      pickCountChoice === n
                        ? 'bg-[#123F35] text-[#D79362] border border-[#D79362]'
                        : 'bg-[#092920]/60 text-[#F2ECDD] hover:bg-[#123F35]'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear Table Button */}
          <button
            type="button"
            onClick={onClearTable}
            disabled={isPlaying || autoplayConfig.active || selectedCount === 0}
            className="py-2.5 px-3 rounded-xl bg-[#092920]/70 hover:bg-[#123F35]/70 text-[#C8B17E] hover:text-[#F2ECDD] font-bold text-xs sm:text-sm border border-[#B9774D]/30 flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Clear all selected numbers"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Table</span>
          </button>
        </div>

        {/* Winner Announcement Banner */}
        {phase === 'finished' && lastWinAmount !== null && lastWinAmount > 0 && (
          <div className="p-3 rounded-xl bg-gradient-to-r from-[#123F35] via-[#185246] to-[#092920] border border-[#68A895] text-center shadow-[0_0_15px_#68A895]/50 animate-pulse">
            <div className="text-[11px] uppercase tracking-widest text-[#F2ECDD]/80 font-semibold">
              ROUND WINNER!
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-[#D79362]">
              +{formatCurrency(lastWinAmount, currency)} ({lastPayoutMultiplier?.toFixed(2)}×)
            </div>
          </div>
        )}
      </div>

      {/* Autoplay Panel (when in Auto mode) */}
      {betMode === 'auto' && (
        <AutoplayPanel
          config={autoplayConfig}
          balance={balance}
          currency={currency}
          onUpdateConfig={onUpdateAutoplayConfig}
          onStartAutoplay={onStartAutoplay}
          onStopAutoplay={onStopAutoplay}
          disabled={!canPlay && !autoplayConfig.active}
        />
      )}

      {/* Sticky / Large Primary Action: PLAY GAME */}
      {betMode === 'manual' && (
        <div className="w-full sticky bottom-2 z-30 pt-1">
          <button
            type="button"
            onClick={onPlayGame}
            disabled={!canPlay}
            className={`
              w-full py-4 sm:py-4.5 rounded-2xl font-black text-base sm:text-lg tracking-[0.15em] uppercase 
              shadow-[0_8px_24px_rgba(0,0,0,0.6)] flex items-center justify-center gap-2 transition-all active:scale-[0.98]
              ${
                canPlay
                  ? 'btn-primary-emerald text-[#F2ECDD]'
                  : 'bg-[#151B1C] text-slate-500 border border-slate-700/60 cursor-not-allowed'
              }
            `}
            aria-label="Play Keno round"
          >
            {isPlaying ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#D79362]" />
                <span>DRAWING BALLS...</span>
              </span>
            ) : selectedCount === 0 ? (
              <span>PICK 1–10 NUMBERS</span>
            ) : isInsufficientBalance ? (
              <span>INSUFFICIENT BALANCE</span>
            ) : (
              <span>PLAY GAME</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
