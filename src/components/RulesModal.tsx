/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RiskMode } from '../game/types.ts';
import { getModeMathStats } from '../game/kenoMath.ts';
import { X, BookOpen, Calculator, Award, Shield, Keyboard } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRiskMode: RiskMode;
}

export const RulesModal: React.FC<RulesModalProps> = ({
  isOpen,
  onClose,
  currentRiskMode,
}) => {
  const [selectedRisk, setSelectedRisk] = useState<RiskMode>(currentRiskMode);
  const [selectedPicks, setSelectedPicks] = useState<number>(10);

  if (!isOpen) return null;

  const mathStats = getModeMathStats(selectedRisk, selectedPicks);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl my-8 rounded-2xl bg-[#151B1C] border border-[#B9774D]/40 shadow-2xl text-[#F2ECDD] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#B9774D]/25 bg-[#092920]/60">
          <div className="flex items-center gap-2 text-[#C8B17E]">
            <BookOpen className="w-5 h-5 text-[#68A895]" />
            <h2 className="text-base sm:text-lg font-bold tracking-wider uppercase text-[#F2ECDD]">
              GAME RULES & MATHEMATICS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#C8B17E] hover:text-[#F2ECDD] hover:bg-[#123F35]/50 transition-colors"
            aria-label="Close rules modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex flex-col gap-4 text-xs sm:text-sm max-h-[82vh] overflow-y-auto">
          {/* Overview */}
          <div className="p-3.5 rounded-xl bg-[#092920]/50 border border-[#B9774D]/20 leading-relaxed text-[#C8B17E]">
            <p className="font-semibold text-[#F2ECDD] mb-1">How to Play Verdigris Keno</p>
            <p>
              The board contains 40 numbers arranged in an 8×5 grid. You select between 1 and 10 unique numbers.
              Upon starting the round, exactly 10 winning numbers are drawn at random without replacement.
              Winnings are determined by how many of your selected numbers match the drawn numbers, according to the active risk paytable.
            </p>
          </div>

          {/* Interactive Paytable & Odds Explorer */}
          <div className="p-3.5 rounded-xl bg-[#092920]/60 border border-[#B9774D]/30 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-[#C8B17E] flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-[#D79362]" />
                Interactive Paytable & Odds
              </span>
              <span className="text-[11px] text-[#68A895] font-semibold">
                RTP: {(mathStats.rtp * 100).toFixed(2)}%
              </span>
            </div>

            {/* Risk Mode Selector */}
            <div className="grid grid-cols-4 gap-1.5">
              {(['classic', 'low', 'medium', 'high'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRisk(r)}
                  className={`py-1.5 rounded-lg font-bold uppercase text-[11px] transition-all border ${
                    selectedRisk === r
                      ? 'bg-[#123F35] text-[#F2ECDD] border-[#D79362]'
                      : 'bg-[#151B1C] text-[#C8B17E]/70 border-transparent hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Pick Count Selector 1..10 */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              <span className="text-[11px] text-[#C8B17E] shrink-0 mr-1">Picks:</span>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setSelectedPicks(k)}
                  className={`px-2.5 py-1 rounded-md font-mono text-xs font-bold transition-all border shrink-0 ${
                    selectedPicks === k
                      ? 'bg-[#D79362] text-black border-[#F2ECDD]'
                      : 'bg-[#151B1C] text-[#F2ECDD] border-[#B9774D]/25 hover:border-[#D79362]'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>

            {/* Table of Hits, Multipliers, Exact Probabilities */}
            <div className="rounded-lg border border-[#B9774D]/20 overflow-hidden">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-[#151B1C] text-[#C8B17E] border-b border-[#B9774D]/20">
                  <tr>
                    <th className="py-2 px-3">Hits</th>
                    <th className="py-2 px-3">Multiplier</th>
                    <th className="py-2 px-3 text-right">Probability</th>
                    <th className="py-2 px-3 text-right">Odds</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#B9774D]/10 bg-[#092920]/40">
                  {mathStats.paytable.map((row) => (
                    <tr key={row.hits} className="hover:bg-[#123F35]/30">
                      <td className="py-1.5 px-3 font-semibold text-[#F2ECDD]">
                        {row.hits} / {selectedPicks}
                      </td>
                      <td className={`py-1.5 px-3 font-bold ${row.multiplier > 0 ? 'text-[#D79362]' : 'text-slate-500'}`}>
                        {row.multiplier.toFixed(2)}×
                      </td>
                      <td className="py-1.5 px-3 text-right text-[#C8B17E]/90">
                        {(row.probability * 100).toFixed(4)}%
                      </td>
                      <td className="py-1.5 px-3 text-right text-[#C8B17E]/70 text-[11px]">
                        {row.probability > 0 ? `1 in ${(1 / row.probability).toFixed(1)}` : '0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mathematical Formulation */}
          <div className="p-3.5 rounded-xl bg-[#092920]/50 border border-[#B9774D]/20 flex flex-col gap-1.5 text-xs">
            <span className="font-bold text-[#C8B17E] uppercase tracking-wider">
              Exact Hypergeometric Formulation
            </span>
            <p className="text-[#C8B17E]/90">
              For <strong className="text-[#F2ECDD]">k</strong> selected numbers and{' '}
              <strong className="text-[#F2ECDD]">h</strong> matches from 10 drawn numbers out of 40:
            </p>
            <div className="p-2.5 rounded-lg bg-[#151B1C] border border-[#B9774D]/30 font-mono text-center text-[#D79362]">
              P(H = h) = [ C(k, h) × C(40 - k, 10 - h) ] / C(40, 10)
            </div>
            <p className="text-[11px] text-[#C8B17E]/70 mt-1">
              Where total combinations C(40, 10) = 847,660,528. Rounds are completely mathematically independent.
            </p>
          </div>

          {/* Hotkeys */}
          <div className="p-3.5 rounded-xl bg-[#092920]/50 border border-[#B9774D]/20 flex flex-col gap-2">
            <span className="font-bold text-[#C8B17E] uppercase tracking-wider flex items-center gap-1.5">
              <Keyboard className="w-4 h-4 text-[#68A895]" />
              Keyboard Shortcuts
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-[#151B1C] border border-[#B9774D]/20 flex justify-between">
                <span className="text-[#C8B17E]">Spacebar</span>
                <span className="text-[#F2ECDD]">Play Game</span>
              </div>
              <div className="p-2 rounded bg-[#151B1C] border border-[#B9774D]/20 flex justify-between">
                <span className="text-[#C8B17E]">Key 'A'</span>
                <span className="text-[#F2ECDD]">Auto Pick</span>
              </div>
              <div className="p-2 rounded bg-[#151B1C] border border-[#B9774D]/20 flex justify-between">
                <span className="text-[#C8B17E]">Key 'C'</span>
                <span className="text-[#F2ECDD]">Clear Table</span>
              </div>
              <div className="p-2 rounded bg-[#151B1C] border border-[#B9774D]/20 flex justify-between">
                <span className="text-[#C8B17E]">Keys 1–4</span>
                <span className="text-[#F2ECDD]">Change Risk</span>
              </div>
            </div>
          </div>

          {/* Legal and Stake Engine Compliance */}
          <div className="p-3 rounded-xl bg-[#123F35]/30 border border-[#B9774D]/20 text-[11px] text-[#C8B17E]/80 leading-normal">
            <strong className="text-[#F2ECDD]">Disclaimer:</strong> Verdigris Keno conforms to Stake Engine standards.
            Past results do not influence future drawing probabilities. Maximum theoretical payout ceiling is 10,000× your wager.
          </div>
        </div>
      </div>
    </div>
  );
};
