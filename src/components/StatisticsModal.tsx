/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RoundHistoryItem, CurrencyCode } from '../game/types.ts';
import { formatCurrency } from '../game/rgsClient.ts';
import { X, BarChart2, TrendingUp, TrendingDown, RotateCcw, Play } from 'lucide-react';

interface StatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: RoundHistoryItem[];
  currency: CurrencyCode;
  onResetStatistics: () => void;
  onReplayRound?: (round: RoundHistoryItem) => void;
}

export const StatisticsModal: React.FC<StatisticsModalProps> = ({
  isOpen,
  onClose,
  history,
  currency,
  onResetStatistics,
  onReplayRound,
}) => {
  if (!isOpen) return null;

  // Calculate stats from actual settled rounds
  const totalBets = history.length;
  const totalWagered = history.reduce((sum, item) => sum + item.wager, 0);
  const totalWon = history.reduce((sum, item) => sum + item.payoutAmount, 0);
  const netProfit = totalWon - totalWagered;
  const wonCount = history.filter((item) => item.payoutMultiplier > 1.0).length;
  const lostCount = history.filter((item) => item.payoutMultiplier < 1.0).length;

  // Build points for running profit graph (ordered chronologically oldest to newest)
  const chronologicalHistory = [...history].reverse();
  let cumulativeProfit = 0;
  const points: { index: number; profit: number }[] = [{ index: 0, profit: 0 }];

  chronologicalHistory.forEach((item, idx) => {
    cumulativeProfit += item.profit;
    points.push({ index: idx + 1, profit: cumulativeProfit });
  });

  // Calculate SVG graph dimensions and scaling
  const width = 500;
  const height = 180;
  const padding = 28;

  const minProfit = points.length > 0 ? Math.min(0, ...points.map((p) => p.profit)) : 0;
  const maxProfit = points.length > 0 ? Math.max(0, ...points.map((p) => p.profit)) : 10;
  const range = Math.max(1, maxProfit - minProfit);

  const getX = (idx: number) => {
    if (points.length <= 1) return padding;
    return padding + (idx / (points.length - 1)) * (width - 2 * padding);
  };

  const getY = (profit: number) => {
    return height - padding - ((profit - minProfit) / range) * (height - 2 * padding);
  };

  const zeroY = getY(0);

  // SVG path
  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.index)} ${getY(p.profit)}`)
    .join(' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl my-8 rounded-2xl bg-[#151B1C] border border-[#B9774D]/40 shadow-2xl text-[#F2ECDD] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#B9774D]/25 bg-[#092920]/60">
          <div className="flex items-center gap-2 text-[#C8B17E]">
            <BarChart2 className="w-5 h-5 text-[#68A895]" />
            <h2 className="text-base sm:text-lg font-bold tracking-wider uppercase text-[#F2ECDD]">
              STATISTICS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#C8B17E] hover:text-[#F2ECDD] hover:bg-[#123F35]/50 transition-colors"
            aria-label="Close statistics modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 flex flex-col gap-4 max-h-[82vh] overflow-y-auto">
          {/* Main 5 Metric Cards matching Screenshot 4 */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div className="p-3 rounded-xl bg-[#092920]/60 border border-[#B9774D]/25 flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-[#C8B17E] font-semibold">
                Wagered
              </span>
              <span className="text-sm sm:text-base font-bold font-mono text-[#F2ECDD] mt-1">
                {formatCurrency(totalWagered, currency)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#092920]/60 border border-[#B9774D]/25 flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-[#C8B17E] font-semibold">
                Profit
              </span>
              <span
                className={`text-sm sm:text-base font-bold font-mono mt-1 ${
                  netProfit >= 0 ? 'text-[#68A895]' : 'text-[#D79362]'
                }`}
              >
                {netProfit >= 0 ? '+' : ''}
                {formatCurrency(netProfit, currency)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#092920]/60 border border-[#B9774D]/25 flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-[#C8B17E] font-semibold">
                Bets
              </span>
              <span className="text-sm sm:text-base font-bold font-mono text-[#F2ECDD] mt-1">
                {totalBets}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#092920]/60 border border-[#B9774D]/25 flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-[#68A895] font-semibold">
                Won
              </span>
              <span className="text-sm sm:text-base font-bold font-mono text-[#68A895] mt-1">
                {wonCount}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#092920]/60 border border-[#B9774D]/25 flex flex-col col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase tracking-wider text-[#D79362] font-semibold">
                Lost
              </span>
              <span className="text-sm sm:text-base font-bold font-mono text-[#D79362] mt-1">
                {lostCount}
              </span>
            </div>
          </div>

          {/* Running Net Profit / Performance Graph */}
          <div className="p-3 sm:p-4 rounded-xl bg-[#092920]/50 border border-[#B9774D]/30 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-[#C8B17E] flex items-center gap-1.5">
                {netProfit >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-[#68A895]" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-[#D79362]" />
                )}
                Running Net Profit History
              </span>
              <span className="text-[#C8B17E]/70 font-mono text-[11px]">
                {points.length - 1} Rounds
              </span>
            </div>

            <div className="w-full bg-[#151B1C] rounded-lg p-2 border border-[#B9774D]/20 overflow-hidden">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36 sm:h-44">
                {/* Zero baseline */}
                <line
                  x1={padding}
                  y1={zeroY}
                  x2={width - padding}
                  y2={zeroY}
                  stroke="#68A895"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.4"
                />
                <text
                  x={padding + 4}
                  y={zeroY - 4}
                  fill="#C8B17E"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  0.00
                </text>

                {/* Profit Line */}
                {points.length > 1 && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke={netProfit >= 0 ? '#68A895' : '#D79362'}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Data Points */}
                {points.map((p, i) => (
                  <circle
                    key={i}
                    cx={getX(p.index)}
                    cy={getY(p.profit)}
                    r="3"
                    fill={p.profit >= 0 ? '#68A895' : '#D79362'}
                  />
                ))}
              </svg>
            </div>
          </div>

          {/* Recent Rounds Log with Replay Action */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-[#C8B17E] text-xs">
                Recent Settled Rounds
              </span>
              <button
                type="button"
                onClick={onResetStatistics}
                className="px-2.5 py-1 rounded-lg bg-[#123F35]/50 hover:bg-[#123F35] text-[#C8B17E] hover:text-[#F2ECDD] text-xs flex items-center gap-1 border border-[#B9774D]/25 transition-colors"
                title="Reset local statistics"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Local Stats</span>
              </button>
            </div>

            {history.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#092920]/40 border border-[#B9774D]/20 text-center text-xs text-[#C8B17E]/70">
                No rounds played in this session yet. Place a bet to generate authoritative statistics.
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto rounded-xl border border-[#B9774D]/20 divide-y divide-[#B9774D]/15 bg-[#092920]/40 text-xs">
                {history.slice(0, 20).map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 flex items-center justify-between hover:bg-[#123F35]/30 transition-colors"
                  >
                    <div className="flex flex-col">
                      <div className="font-mono text-[#F2ECDD] font-semibold">
                        {item.matches.length}/{item.picks.length} Matches ·{' '}
                        <span className="text-[#D79362]">{item.payoutMultiplier.toFixed(2)}×</span>
                      </div>
                      <div className="text-[10px] text-[#C8B17E]/70 font-mono">
                        Wager: {formatCurrency(item.wager, currency)} · Nonce #{item.nonce}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono font-bold ${
                          item.profit >= 0 ? 'text-[#68A895]' : 'text-slate-400'
                        }`}
                      >
                        {item.profit >= 0 ? '+' : ''}
                        {formatCurrency(item.profit, currency)}
                      </span>
                      {onReplayRound && (
                        <button
                          type="button"
                          onClick={() => {
                            onReplayRound(item);
                            onClose();
                          }}
                          className="p-1 rounded bg-[#123F35] text-[#C8B17E] hover:text-white"
                          title="Replay this round"
                          aria-label={`Replay round ${item.id}`}
                        >
                          <Play className="w-3 h-3 fill-current" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
