/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RoundHistoryItem, CurrencyCode } from '../game/types.ts';
import { formatCurrency } from '../game/rgsClient.ts';
import { Play, RotateCcw, Award } from 'lucide-react';

interface ReplayPanelProps {
  round: RoundHistoryItem | null;
  currency: CurrencyCode;
  onPlayReplay: () => void;
  onExitReplay: () => void;
  isPlaying: boolean;
}

export const ReplayPanel: React.FC<ReplayPanelProps> = ({
  round,
  currency,
  onPlayReplay,
  onExitReplay,
  isPlaying,
}) => {
  if (!round) {
    return (
      <div className="w-full p-4 rounded-2xl bg-[#151B1C]/95 border border-[#B9774D]/30 text-center text-xs text-[#C8B17E]">
        Loading round replay data...
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl p-4 sm:p-5 rounded-2xl bg-[#151B1C]/95 border border-[#D79362]/50 shadow-2xl flex flex-col gap-4 text-[#F2ECDD]">
      <div className="flex items-center justify-between border-b border-[#B9774D]/30 pb-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[#D79362]" />
          <h3 className="font-bold uppercase tracking-wider text-sm sm:text-base text-[#F2ECDD]">
            GAME REPLAY MODE
          </h3>
        </div>
        <button
          type="button"
          onClick={onExitReplay}
          className="text-xs text-[#C8B17E] hover:text-[#F2ECDD] underline"
        >
          Exit Replay
        </button>
      </div>

      {/* Round Details */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
        <div className="p-2.5 rounded-xl bg-[#092920]/60 border border-[#B9774D]/25">
          <div className="text-[10px] uppercase text-[#C8B17E]">Bet Amount</div>
          <div className="font-mono font-bold text-sm text-[#F2ECDD] mt-0.5">
            {formatCurrency(round.wager, currency)}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#092920]/60 border border-[#B9774D]/25">
          <div className="text-[10px] uppercase text-[#C8B17E]">Multiplier</div>
          <div className="font-mono font-bold text-sm text-[#D79362] mt-0.5">
            {round.payoutMultiplier.toFixed(2)}×
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#092920]/60 border border-[#B9774D]/25">
          <div className="text-[10px] uppercase text-[#C8B17E]">Payout</div>
          <div className="font-mono font-bold text-sm text-[#68A895] mt-0.5">
            {formatCurrency(round.payoutAmount, currency)}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#092920]/60 border border-[#B9774D]/25">
          <div className="text-[10px] uppercase text-[#C8B17E]">Matches</div>
          <div className="font-mono font-bold text-sm text-[#F2ECDD] mt-0.5">
            {round.matches.length} / {round.picks.length}
          </div>
        </div>
      </div>

      <div className="text-[11px] font-mono text-[#C8B17E]/80 truncate">
        Round ID: {round.id}
      </div>

      {/* Replay Action Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPlayReplay}
          disabled={isPlaying}
          className="flex-1 py-3.5 rounded-xl btn-primary-emerald text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isPlaying ? 'Playing Replay...' : 'Watch Replay'}</span>
        </button>

        <button
          type="button"
          onClick={onPlayReplay}
          disabled={isPlaying}
          className="px-4 py-3.5 rounded-xl bg-[#092920]/70 hover:bg-[#123F35] border border-[#B9774D]/30 text-[#C8B17E] hover:text-[#F2ECDD] font-bold text-xs uppercase flex items-center gap-1.5"
          title="Play Again"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Rewatch</span>
        </button>
      </div>
    </div>
  );
};
