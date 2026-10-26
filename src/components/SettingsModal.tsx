/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameSettings, CurrencyCode } from '../game/types.ts';
import { X, Settings, Volume2, Sparkles, Zap, Keyboard, Award, ShieldAlert } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onResetBalance: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetBalance,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg my-8 rounded-2xl bg-[#151B1C] border border-[#B9774D]/40 shadow-2xl text-[#F2ECDD] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#B9774D]/25 bg-[#092920]/60">
          <div className="flex items-center gap-2 text-[#C8B17E]">
            <Settings className="w-5 h-5 text-[#68A895]" />
            <h2 className="text-base sm:text-lg font-bold tracking-wider uppercase text-[#F2ECDD]">
              SETTINGS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#C8B17E] hover:text-[#F2ECDD] hover:bg-[#123F35]/50 transition-colors"
            aria-label="Close settings modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex flex-col gap-4 text-xs sm:text-sm max-h-[82vh] overflow-y-auto">
          {/* 4 Primary Settings from Screenshot 5 */}
          <div className="flex flex-col gap-3">
            {/* 1. Animations Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#092920]/50 border border-[#B9774D]/20">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#D79362]" />
                <div className="flex flex-col">
                  <span className="font-bold text-[#F2ECDD]">Animations</span>
                  <span className="text-[11px] text-[#C8B17E]/80">
                    Smooth ball reveal, match illumination, and win celebrations
                  </span>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.animations}
                onClick={() => onUpdateSettings({ animations: !settings.animations })}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 border ${
                  settings.animations
                    ? 'bg-[#123F35] border-[#68A895]'
                    : 'bg-[#151B1C] border-slate-700'
                }`}
              >
                <div
                  className={`w-4.5 h-4.5 rounded-full bg-[#F2ECDD] transition-transform ${
                    settings.animations ? 'translate-x-6 bg-[#68A895]' : 'translate-x-0 bg-slate-500'
                  }`}
                />
              </button>
            </div>

            {/* 2. Instant Bet Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#092920]/50 border border-[#B9774D]/20">
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-[#D79362]" />
                <div className="flex flex-col">
                  <span className="font-bold text-[#F2ECDD]">Instant Bet</span>
                  <span className="text-[11px] text-[#C8B17E]/80">
                    Skip ball drawing animation delay while preserving RGS settlement
                  </span>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.instantBet}
                onClick={() => onUpdateSettings({ instantBet: !settings.instantBet })}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 border ${
                  settings.instantBet
                    ? 'bg-[#123F35] border-[#68A895]'
                    : 'bg-[#151B1C] border-slate-700'
                }`}
              >
                <div
                  className={`w-4.5 h-4.5 rounded-full bg-[#F2ECDD] transition-transform ${
                    settings.instantBet ? 'translate-x-6 bg-[#68A895]' : 'translate-x-0 bg-slate-500'
                  }`}
                />
              </button>
            </div>

            {/* 3. Hotkeys Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#092920]/50 border border-[#B9774D]/20">
              <div className="flex items-center gap-2.5">
                <Keyboard className="w-4 h-4 text-[#D79362]" />
                <div className="flex flex-col">
                  <span className="font-bold text-[#F2ECDD]">Hotkeys</span>
                  <span className="text-[11px] text-[#C8B17E]/80">
                    Enable keyboard shortcuts: Space (Play), C (Clear), A (Auto Pick)
                  </span>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.hotkeys}
                onClick={() => onUpdateSettings({ hotkeys: !settings.hotkeys })}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 border ${
                  settings.hotkeys
                    ? 'bg-[#123F35] border-[#68A895]'
                    : 'bg-[#151B1C] border-slate-700'
                }`}
              >
                <div
                  className={`w-4.5 h-4.5 rounded-full bg-[#F2ECDD] transition-transform ${
                    settings.hotkeys ? 'translate-x-6 bg-[#68A895]' : 'translate-x-0 bg-slate-500'
                  }`}
                />
              </button>
            </div>

            {/* 4. Max Bet Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#092920]/50 border border-[#B9774D]/20">
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-[#D79362]" />
                <div className="flex flex-col">
                  <span className="font-bold text-[#F2ECDD]">Max Bet</span>
                  <span className="text-[11px] text-[#C8B17E]/80">
                    Display quick Max Bet shortcut in wagering panel
                  </span>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.maxBetToggle}
                onClick={() => onUpdateSettings({ maxBetToggle: !settings.maxBetToggle })}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 border ${
                  settings.maxBetToggle
                    ? 'bg-[#123F35] border-[#68A895]'
                    : 'bg-[#151B1C] border-slate-700'
                }`}
              >
                <div
                  className={`w-4.5 h-4.5 rounded-full bg-[#F2ECDD] transition-transform ${
                    settings.maxBetToggle ? 'translate-x-6 bg-[#68A895]' : 'translate-x-0 bg-slate-500'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Audio Controls */}
          <div className="p-3.5 rounded-xl bg-[#092920]/50 border border-[#B9774D]/20 flex flex-col gap-3">
            <span className="font-bold uppercase tracking-wider text-[#C8B17E] text-xs flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#68A895]" />
              Audio Settings
            </span>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
                  className="rounded border-[#B9774D] text-emerald-600 focus:ring-0"
                />
                <span className="text-xs text-[#F2ECDD]">Sound Effects</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.musicEnabled}
                  onChange={(e) => onUpdateSettings({ musicEnabled: e.target.checked })}
                  className="rounded border-[#B9774D] text-emerald-600 focus:ring-0"
                />
                <span className="text-xs text-[#F2ECDD]">Ambient Lounge</span>
              </label>
            </div>

            <div className="flex flex-col gap-1 mt-1">
              <div className="flex justify-between text-[11px] text-[#C8B17E]">
                <span>Master Volume</span>
                <span>{Math.round(settings.masterVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.masterVolume}
                onChange={(e) => onUpdateSettings({ masterVolume: parseFloat(e.target.value) })}
                className="w-full accent-[#D79362] cursor-pointer"
              />
            </div>
          </div>

          {/* Currency Display Selector */}
          <div className="p-3.5 rounded-xl bg-[#092920]/50 border border-[#B9774D]/20 flex flex-col gap-2">
            <label htmlFor="currency-display-select" className="font-bold uppercase tracking-wider text-[#C8B17E] text-xs">
              Display Currency / Denomination
            </label>
            <select
              id="currency-display-select"
              value={settings.currency}
              onChange={(e) => onUpdateSettings({ currency: e.target.value as CurrencyCode })}
              className="w-full p-2.5 rounded-xl bg-[#151B1C] border border-[#B9774D]/30 text-xs font-semibold text-[#F2ECDD] focus:outline-none focus:border-[#D79362]"
            >
              <option value="USD">USD ($) · Standard Fiat</option>
              <option value="SC">SC (Sweeps Coins) · Social Casino</option>
              <option value="EUR">EUR (€) · Euro</option>
              <option value="BTC">BTC (₿) · Crypto</option>
            </select>
          </div>

          {/* Demo Balance Reset */}
          <div className="p-3.5 rounded-xl bg-[#123F35]/30 border border-[#B9774D]/20 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-semibold text-[#F2ECDD] text-xs">Reset Demo Balance</span>
              <span className="text-[11px] text-[#C8B17E]/70">Restore balance to $1,000.00 / 1,000.00 SC</span>
            </div>
            <button
              type="button"
              onClick={onResetBalance}
              className="px-3 py-1.5 rounded-lg btn-copper text-white font-bold text-xs"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
