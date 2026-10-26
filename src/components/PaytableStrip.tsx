/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RiskMode, GamePhase } from '../game/types.ts';
import { ALL_PAYTABLES } from '../game/kenoMath.ts';

interface PaytableStripProps {
  picksCount: number;
  riskMode: RiskMode;
  currentHits: number | null;
  phase: GamePhase;
}

export const PaytableStrip: React.FC<PaytableStripProps> = ({
  picksCount,
  riskMode,
  currentHits,
  phase,
}) => {
  if (picksCount <= 0) return null;

  const paytable = ALL_PAYTABLES[riskMode]?.[picksCount] || {};
  const tiers = Object.entries(paytable)
    .map(([hits, mult]) => ({ hits: Number(hits), mult }))
    .sort((a, b) => a.hits - b.hits);

  return (
    <div 
      className="w-full max-w-xl my-2 p-2 rounded-xl bg-[#151B1C]/80 border border-[#B9774D]/25 shadow-inner overflow-x-auto scrollbar-none"
      role="region"
      aria-label="Current Payout Table"
    >
      <div className="flex items-center justify-between gap-1.5 min-w-max">
        {tiers.map((tier) => {
          const isWinningTier = tier.mult > 0;
          const isActive = (phase === 'drawing' || phase === 'finished') && currentHits === tier.hits;
          
          let cardStyle = 'bg-[#092920]/40 border-transparent text-[#F2ECDD]/60';
          if (isActive) {
            cardStyle = 'bg-[#68A895]/20 border-[#68A895] text-[#F2ECDD] shadow-[0_0_12px_#68A895] scale-105';
          } else if (isWinningTier) {
            cardStyle = 'bg-[#123F35]/50 border-[#B9774D]/30 text-[#F2ECDD]';
          }

          return (
            <div
              key={tier.hits}
              className={`
                px-2.5 py-1.5 rounded-lg border text-center transition-all duration-200 flex-1 min-w-[56px]
                ${cardStyle}
              `}
            >
              <div className="text-[10px] uppercase font-mono tracking-wider text-[#C8B17E]">
                {tier.hits} {tier.hits === 1 ? 'Hit' : 'Hits'}
              </div>
              <div className={`text-xs sm:text-sm font-bold font-mono ${isActive ? 'text-[#D79362]' : isWinningTier ? 'text-[#F2ECDD]' : 'text-slate-500'}`}>
                {tier.mult.toFixed(tier.mult >= 100 ? 0 : 2)}×
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
