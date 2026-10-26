/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, Settings, Maximize2, Minimize2, BarChart2, BookOpen, Volume2, VolumeX, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  onOpenFairness: () => void;
  onOpenSettings: () => void;
  onOpenStatistics: () => void;
  onOpenRules: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onResetGame: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenFairness,
  onOpenSettings,
  onOpenStatistics,
  onOpenRules,
  soundEnabled,
  onToggleSound,
  isFullscreen,
  onToggleFullscreen,
  onResetGame,
}) => {
  return (
    <header className="w-full max-w-5xl mx-auto px-4 py-3 flex items-center justify-between border-b border-[#B9774D]/20 bg-[#151B1C]/90 backdrop-blur-md sticky top-0 z-40">
      {/* Left Navigation: Back arrow */}
      <div className="flex items-center gap-2">
        <button
          onClick={onResetGame}
          className="p-2 rounded-lg text-[#C8B17E] hover:text-[#F2ECDD] hover:bg-[#123F35]/50 active:scale-95 transition-colors flex items-center justify-center border border-transparent hover:border-[#B9774D]/30"
          aria-label="Reset or exit game"
          title="Reset board"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onClick={onOpenRules}
          className="p-2 rounded-lg text-[#C8B17E] hover:text-[#F2ECDD] hover:bg-[#123F35]/50 active:scale-95 transition-colors flex items-center justify-center border border-transparent hover:border-[#B9774D]/30"
          aria-label="Game rules and paytables"
          title="Game Rules & Paytables"
        >
          <BookOpen className="w-5 h-5" />
        </button>
      </div>

      {/* Centered Game Title */}
      <div className="flex flex-col items-center px-1">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B9774D] shadow-[0_0_6px_#D79362]" />
          <h1 className="text-xs sm:text-base md:text-lg font-bold tracking-[0.14em] sm:tracking-[0.2em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#F2ECDD] via-[#C8B17E] to-[#D79362] whitespace-nowrap">
            VERDIGRIS KENO
          </h1>
          <span className="w-1.5 h-1.5 rounded-full bg-[#68A895] shadow-[0_0_6px_#68A895]" />
        </div>
        <div className="text-[9px] sm:text-[10px] tracking-wider sm:tracking-widest uppercase text-[#68A895] font-medium whitespace-nowrap">
          STAKE ENGINE · 96.50% RTP
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-0.5 sm:gap-1.5">
        <button
          onClick={onToggleSound}
          className="p-1.5 sm:p-2 rounded-lg text-[#C8B17E] hover:text-[#F2ECDD] hover:bg-[#123F35]/50 active:scale-95 transition-colors border border-transparent hover:border-[#B9774D]/30"
          aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
          title={soundEnabled ? 'Sound On' : 'Sound Off'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />}
        </button>

        <button
          onClick={onOpenFairness}
          className="p-1.5 sm:p-2 rounded-lg text-[#C8B17E] hover:text-[#F2ECDD] hover:bg-[#123F35]/50 active:scale-95 transition-colors border border-transparent hover:border-[#B9774D]/30"
          aria-label="Provably Fair Information"
          title="Provably Fair Verification"
        >
          <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button
          onClick={onOpenStatistics}
          className="p-1.5 sm:p-2 rounded-lg text-[#C8B17E] hover:text-[#F2ECDD] hover:bg-[#123F35]/50 active:scale-95 transition-colors border border-transparent hover:border-[#B9774D]/30"
          aria-label="Game Statistics"
          title="Statistics & Performance Graph"
        >
          <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button
          onClick={onToggleFullscreen}
          className="p-1.5 sm:p-2 rounded-lg text-[#C8B17E] hover:text-[#F2ECDD] hover:bg-[#123F35]/50 active:scale-95 transition-colors border border-transparent hover:border-[#B9774D]/30 hidden md:flex"
          aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>

        <button
          onClick={onOpenSettings}
          className="p-1.5 sm:p-2 rounded-lg text-[#C8B17E] hover:text-[#F2ECDD] hover:bg-[#123F35]/50 active:scale-95 transition-colors border border-transparent hover:border-[#B9774D]/30"
          aria-label="Settings"
          title="Game Settings"
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </header>
  );
};
