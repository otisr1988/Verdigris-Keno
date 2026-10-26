/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TOTAL_NUMBERS, MAX_SELECTIONS } from '../game/kenoMath.ts';
import { RiskMode, GamePhase } from '../game/types.ts';
import { getModeMathStats } from '../game/kenoMath.ts';

interface KenoBoardProps {
  selectedNumbers: number[];
  drawnNumbers: number[];
  matches: number[];
  phase: GamePhase;
  riskMode: RiskMode;
  onToggleNumber: (num: number) => void;
  disabled: boolean;
}

export const KenoBoard: React.FC<KenoBoardProps> = ({
  selectedNumbers,
  drawnNumbers,
  matches,
  phase,
  riskMode,
  onToggleNumber,
  disabled,
}) => {
  const numbers = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1);
  const mathStats = selectedNumbers.length > 0 ? getModeMathStats(riskMode, selectedNumbers.length) : null;

  return (
    <div className="w-full flex flex-col items-center">
      {/* 40-number Board: 8 cols x 5 rows */}
      <div 
        className="w-full max-w-xl grid grid-cols-8 gap-1.5 sm:gap-2.5 p-2.5 sm:p-4 rounded-2xl bg-[#092920]/70 border border-[#B9774D]/30 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md"
        role="grid"
        aria-label="Keno 40-Number Selection Board"
      >
        {numbers.map((num) => {
          const isSelected = selectedNumbers.includes(num);
          const isDrawn = drawnNumbers.includes(num);
          const isMatch = matches.includes(num);
          const isMissed = phase === 'finished' && isSelected && !isDrawn;

          let tileClass = 'bg-[#151B1C] text-[#F2ECDD] hover:border-[#68A895]/60 hover:bg-[#182324]';

          if (isMatch) {
            tileClass = 'keno-tile-match text-white font-bold scale-[1.04] z-10';
          } else if (isDrawn) {
            tileClass = 'keno-tile-drawn text-white font-semibold';
          } else if (isSelected) {
            tileClass = 'keno-tile-selected font-semibold';
          } else if (isMissed) {
            tileClass = 'keno-tile-missed bg-[#123F35]/40 text-[#F2ECDD]/60 border border-transparent';
          }

          return (
            <button
              key={num}
              type="button"
              onClick={() => onToggleNumber(num)}
              disabled={disabled || (phase !== 'idle' && phase !== 'finished')}
              className={`
                keno-tile relative flex items-center justify-center 
                aspect-square rounded-xl text-base sm:text-lg font-mono 
                border border-[#B9774D]/25 select-none 
                disabled:cursor-not-allowed
                ${tileClass}
              `}
              aria-label={`Number ${num}${isSelected ? ', selected' : ''}${isMatch ? ', winning match' : ''}${isDrawn ? ', drawn' : ''}`}
              aria-pressed={isSelected}
            >
              <span className="relative z-10">{num}</span>

              {/* Match Star Indicator */}
              {isMatch && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#F2ECDD] shadow-[0_0_6px_#FFFFFF] animate-ping" />
              )}
            </button>
          );
        })}
      </div>

      {/* Status Panel beneath grid */}
      <div className="w-full max-w-xl mt-3 px-4 py-2.5 rounded-xl bg-[#151B1C]/80 border border-[#B9774D]/20 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-[#C8B17E]">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#F2ECDD]">
            {selectedNumbers.length === 0 ? (
              <span className="text-[#68A895]">Select 1–10 numbers to play</span>
            ) : (
              <span>
                Selected: <strong className="text-[#D79362]">{selectedNumbers.length}</strong> / {MAX_SELECTIONS}
              </span>
            )}
          </span>
        </div>

        {mathStats && (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-[#68A895] uppercase tracking-wider font-semibold">
              {riskMode}
            </span>
            <span className="text-[#F2ECDD]/80">
              Max: <strong className="text-[#D79362] font-mono">{mathStats.maxWin}×</strong>
            </span>
            <span className="text-[#C8B17E]/70">
              RTP: <strong className="text-[#F2ECDD] font-mono">{(mathStats.rtp * 100).toFixed(2)}%</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
