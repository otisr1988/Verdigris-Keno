/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header.tsx';
import { KenoBoard } from './components/KenoBoard.tsx';
import { PaytableStrip } from './components/PaytableStrip.tsx';
import { BetControls } from './components/BetControls.tsx';
import { FairnessModal } from './components/FairnessModal.tsx';
import { StatisticsModal } from './components/StatisticsModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { RulesModal } from './components/RulesModal.tsx';
import { ReplayPanel } from './components/ReplayPanel.tsx';

import {
  BetMode,
  RiskMode,
  GamePhase,
  GameSettings,
  AutoplayConfig,
  SeedState,
  RoundHistoryItem,
} from './game/types.ts';
import { rgsClient, toMicroUnits, fromMicroUnits } from './game/rgsClient.ts';
import { soundEngine } from './game/soundEffects.ts';

export default function App() {
  // Game & Wager State
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [matches, setMatches] = useState<number[]>([]);
  const [currentHits, setCurrentHits] = useState<number | null>(null);
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [betMode, setBetMode] = useState<BetMode>('manual');
  const [wager, setWager] = useState<number>(1.0);
  const [balance, setBalance] = useState<number>(1000.0);
  const [riskMode, setRiskMode] = useState<RiskMode>('classic');

  // Wager Limits from RGS
  const [minBet, setMinBet] = useState<number>(0.1);
  const [maxBet, setMaxBet] = useState<number>(100.0);
  const [stepBet, setStepBet] = useState<number>(0.1);

  // Results & History
  const [lastWinAmount, setLastWinAmount] = useState<number | null>(null);
  const [lastPayoutMultiplier, setLastPayoutMultiplier] = useState<number | null>(null);
  const [history, setHistory] = useState<RoundHistoryItem[]>([]);
  const [seedState, setSeedState] = useState<SeedState>({
    serverSeedHash: '',
    clientSeed: 'verdigris-client-seed',
    nonce: 1,
  });

  // Settings
  const [settings, setSettings] = useState<GameSettings>({
    animations: true,
    instantBet: false,
    hotkeys: true,
    maxBetToggle: true,
    soundEnabled: true,
    musicEnabled: false,
    masterVolume: 0.7,
    reducedMotion: false,
    currency: 'USD',
  });

  // Autoplay
  const [autoplayConfig, setAutoplayConfig] = useState<AutoplayConfig>({
    rounds: 10,
    stopOnWin: 0,
    stopOnLoss: 0,
    stopBalanceBelow: 0,
    stopBalanceAbove: 0,
    active: false,
    currentRound: 0,
    totalProfit: 0,
  });

  // Modals & UI
  const [isFairnessOpen, setIsFairnessOpen] = useState<boolean>(false);
  const [isStatisticsOpen, setIsStatisticsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Replay Mode
  const [replayTargetRound, setReplayTargetRound] = useState<RoundHistoryItem | null>(null);
  const [isReplayActive, setIsReplayActive] = useState<boolean>(false);

  // References to keep autoplay handlers and timers clean
  const autoplayRef = useRef(autoplayConfig);
  autoplayRef.current = autoplayConfig;
  const isPlayingRef = useRef(false);
  isPlayingRef.current = phase === 'drawing' || phase === 'settling';

  // 1. Initial Authentication & Load
  useEffect(() => {
    async function loadAuth() {
      const auth = await rgsClient.authenticate();
      setBalance(fromMicroUnits(auth.balanceMicro));
      setMinBet(fromMicroUnits(auth.minBetMicro));
      setMaxBet(fromMicroUnits(auth.maxBetMicro));
      setStepBet(fromMicroUnits(auth.stepBetMicro));
      setSettings((prev) => ({ ...prev, currency: auth.currency }));
      setSeedState(rgsClient.getSeedState());
      const loadedHistory = rgsClient.getHistory();
      setHistory(loadedHistory);

      // If URL has replay
      if (rgsClient.isReplay()) {
        const replayId = rgsClient.getReplayRoundId();
        const found = loadedHistory.find((h) => h.id === replayId) || loadedHistory[0];
        if (found) {
          setIsReplayActive(true);
          setReplayTargetRound(found);
          replayRound(found);
        }
      }
    }
    loadAuth();
  }, []);

  // Sync sound settings with SoundEngine
  useEffect(() => {
    soundEngine.setSoundEnabled(settings.soundEnabled);
    soundEngine.setMusicEnabled(settings.musicEnabled);
    soundEngine.setMasterVolume(settings.masterVolume);
  }, [settings.soundEnabled, settings.musicEnabled, settings.masterVolume]);

  // Number selection toggle
  const handleToggleNumber = (num: number) => {
    if (isPlayingRef.current) return;
    if (selectedNumbers.includes(num)) {
      soundEngine.playDeselect();
      setSelectedNumbers((prev) => prev.filter((n) => n !== num));
    } else {
      if (selectedNumbers.length >= 10) return;
      soundEngine.playSelect();
      setSelectedNumbers((prev) => [...prev, num].sort((a, b) => a - b));
    }
  };

  // Auto Pick numbers
  const handleAutoPick = (count: number = 10) => {
    if (isPlayingRef.current) return;
    soundEngine.playAutoPick();
    const targetCount = Math.max(1, Math.min(10, count));
    const pool = Array.from({ length: 40 }, (_, i) => i + 1);
    const picks: number[] = [];
    while (picks.length < targetCount && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      picks.push(pool[idx]);
      pool.splice(idx, 1);
    }
    picks.sort((a, b) => a - b);
    setSelectedNumbers(picks);
  };

  // Clear Table
  const handleClearTable = () => {
    if (isPlayingRef.current) return;
    soundEngine.playClear();
    setSelectedNumbers([]);
    setDrawnNumbers([]);
    setMatches([]);
    setCurrentHits(null);
    setPhase('idle');
  };

  // Reset entire board
  const handleResetGame = () => {
    if (isPlayingRef.current) return;
    soundEngine.playClick();
    setSelectedNumbers([]);
    setDrawnNumbers([]);
    setMatches([]);
    setCurrentHits(null);
    setPhase('idle');
    setLastWinAmount(null);
    setLastPayoutMultiplier(null);
  };

  // Play Game Handler (Authority via RGS Client)
  const handlePlayGame = useCallback(async () => {
    if (selectedNumbers.length < 1 || selectedNumbers.length > 10) return;
    if (wager <= 0 || wager > balance) return;
    if (isPlayingRef.current) return;

    soundEngine.playBetLaunch();
    setPhase('drawing');
    setDrawnNumbers([]);
    setMatches([]);
    setCurrentHits(0);
    setLastWinAmount(null);
    setLastPayoutMultiplier(null);

    // Tentatively deduct wager from UI balance
    setBalance((prev) => Math.max(0, prev - wager));

    try {
      const wagerMicro = toMicroUnits(wager);
      const playRes = await rgsClient.play(wagerMicro, selectedNumbers, riskMode);

      setSeedState(playRes.seedState);

      // Playback Draw Sequence
      const authorDraw = playRes.drawnNumbers;
      const authorMatches = playRes.matches;
      const mult = playRes.payoutMultiplier;
      const winAmt = fromMicroUnits(playRes.winAmountMicro);

      if (settings.instantBet || !settings.animations) {
        // Fast instant reveal
        setDrawnNumbers(authorDraw);
        setMatches(authorMatches);
        setCurrentHits(authorMatches.length);
        settleRound(playRes.newBalanceMicro, mult, winAmt);
      } else {
        // Timed ball by ball reveal animation
        const delay = 120; // 120ms per ball
        const currentRevealed: number[] = [];
        const currentMatched: number[] = [];

        for (let i = 0; i < authorDraw.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          const num = authorDraw[i];
          currentRevealed.push(num);
          setDrawnNumbers([...currentRevealed]);
          soundEngine.playBallDraw(i);

          if (selectedNumbers.includes(num)) {
            currentMatched.push(num);
            setMatches([...currentMatched]);
            setCurrentHits(currentMatched.length);
            soundEngine.playMatchHit(currentMatched.length);
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 150));
        settleRound(playRes.newBalanceMicro, mult, winAmt);
      }
    } catch (err: unknown) {
      console.error('Play round failed:', err);
      setPhase('idle');
      // Restore balance on error
      const auth = await rgsClient.authenticate();
      setBalance(fromMicroUnits(auth.balanceMicro));
      stopAutoplay();
    }
  }, [selectedNumbers, wager, balance, riskMode, settings.instantBet, settings.animations]);

  // Round Settlement
  const settleRound = (newBalanceMicro: number, mult: number, winAmt: number) => {
    const finalBalance = fromMicroUnits(newBalanceMicro);
    setBalance(finalBalance);
    setPhase('finished');
    setLastWinAmount(winAmt);
    setLastPayoutMultiplier(mult);
    setHistory(rgsClient.getHistory());

    // Celebratory effects
    if (mult >= 10.0) {
      soundEngine.playBigWin();
      confetti({
        particleCount: 50,
        spread: 70,
        colors: ['#D79362', '#68A895', '#F2ECDD', '#123F35'],
      });
    } else if (mult > 1.0) {
      soundEngine.playWin();
    }

    // Process Autoplay
    handleAutoplayProgression(winAmt, mult, finalBalance);
  };

  // Autoplay progression handler
  const handleAutoplayProgression = (winAmt: number, mult: number, currentBalance: number) => {
    const auto = autoplayRef.current;
    if (!auto.active) return;

    const roundIndex = auto.currentRound + 1;
    const profit = winAmt - wager;
    const newTotalProfit = auto.totalProfit + profit;

    // Check stop conditions
    let shouldStop = false;
    let stopReason = '';

    if (auto.stopOnWin > 0 && winAmt >= auto.stopOnWin) {
      shouldStop = true;
      stopReason = `Single win of ${winAmt} reached stop threshold!`;
    } else if (auto.stopOnLoss > 0 && profit < 0 && Math.abs(profit) >= auto.stopOnLoss) {
      shouldStop = true;
      stopReason = `Single loss reached stop threshold!`;
    } else if (auto.stopBalanceBelow > 0 && currentBalance <= auto.stopBalanceBelow) {
      shouldStop = true;
      stopReason = `Balance dropped below threshold!`;
    } else if (currentBalance < wager) {
      shouldStop = true;
      stopReason = `Insufficient balance to continue autoplay!`;
    } else if (roundIndex >= auto.rounds) {
      shouldStop = true;
      stopReason = `Completed all ${auto.rounds} autoplay rounds!`;
    }

    if (shouldStop) {
      setAutoplayConfig((prev) => ({
        ...prev,
        active: false,
        currentRound: roundIndex,
        totalProfit: newTotalProfit,
      }));
    } else {
      setAutoplayConfig((prev) => ({
        ...prev,
        currentRound: roundIndex,
        totalProfit: newTotalProfit,
      }));
      // Schedule next round with short interval
      setTimeout(() => {
        if (autoplayRef.current.active) {
          handlePlayGame();
        }
      }, 500);
    }
  };

  const startAutoplay = () => {
    setAutoplayConfig((prev) => ({ ...prev, active: true, currentRound: 0, totalProfit: 0 }));
    handlePlayGame();
  };

  const stopAutoplay = () => {
    setAutoplayConfig((prev) => ({ ...prev, active: false }));
  };

  // Replay Past Round per Stake Engine requirements
  const replayRound = async (round: RoundHistoryItem, animated: boolean = false) => {
    setReplayTargetRound(round);
    setIsReplayActive(true);
    setSelectedNumbers([...round.picks]);
    setWager(round.wager);
    setRiskMode(round.riskMode);
    setLastWinAmount(round.payoutAmount);
    setLastPayoutMultiplier(round.payoutMultiplier);

    if (!animated) {
      setDrawnNumbers([...round.drawnNumbers]);
      setMatches([...round.matches]);
      setCurrentHits(round.matches.length);
      setPhase('finished');
    } else {
      setPhase('drawing');
      setDrawnNumbers([]);
      setMatches([]);
      setCurrentHits(0);
      const currentRev: number[] = [];
      const currentMat: number[] = [];

      for (let i = 0; i < round.drawnNumbers.length; i++) {
        await new Promise((r) => setTimeout(r, 100));
        const num = round.drawnNumbers[i];
        currentRev.push(num);
        setDrawnNumbers([...currentRev]);
        soundEngine.playBallDraw(i);
        if (round.picks.includes(num)) {
          currentMat.push(num);
          setMatches([...currentMat]);
          setCurrentHits(currentMat.length);
          soundEngine.playMatchHit(currentMat.length);
        }
      }
      setPhase('finished');
      if (round.payoutMultiplier > 1.0) {
        soundEngine.playWin();
      }
    }
  };

  // Keyboard Hotkeys
  useEffect(() => {
    if (!settings.hotkeys) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (!isPlayingRef.current && selectedNumbers.length >= 1 && wager <= balance) {
          handlePlayGame();
        }
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleClearTable();
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleAutoPick(10);
      } else if (e.key === '1') {
        setRiskMode('classic');
      } else if (e.key === '2') {
        setRiskMode('low');
      } else if (e.key === '3') {
        setRiskMode('medium');
      } else if (e.key === '4') {
        setRiskMode('high');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.hotkeys, selectedNumbers, wager, balance, handlePlayGame]);

  // Fullscreen toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#0c1212] text-[#F2ECDD] selection:bg-[#B9774D] selection:text-white pb-6">
      {/* Top Navigation */}
      <Header
        onOpenFairness={() => setIsFairnessOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenStatistics={() => setIsStatisticsOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() => setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onResetGame={handleResetGame}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-4 py-3 sm:py-5 flex flex-col items-center">
        {/* Layout: Desktop 2-column, Mobile 1-column */}
        <div className="w-full flex flex-col lg:flex-row gap-4 sm:gap-6 items-center lg:items-start justify-center">
          {/* Left / Center Column: Keno Board & Paytable */}
          <div className="w-full max-w-xl flex flex-col items-center">
            {/* Number Grid */}
            <KenoBoard
              selectedNumbers={selectedNumbers}
              drawnNumbers={drawnNumbers}
              matches={matches}
              phase={phase}
              riskMode={riskMode}
              onToggleNumber={handleToggleNumber}
              disabled={autoplayConfig.active}
            />

            {/* Payout Table Strip */}
            <PaytableStrip
              picksCount={selectedNumbers.length}
              riskMode={riskMode}
              currentHits={currentHits}
              phase={phase}
            />
          </div>

          {/* Right Column: Betting & Autoplay Controls OR Replay Panel */}
          <div className="w-full max-w-xl lg:max-w-md flex flex-col">
            {isReplayActive ? (
              <ReplayPanel
                round={replayTargetRound}
                currency={settings.currency}
                onPlayReplay={() => replayTargetRound && replayRound(replayTargetRound, true)}
                onExitReplay={() => {
                  setIsReplayActive(false);
                  setPhase('idle');
                }}
                isPlaying={phase === 'drawing'}
              />
            ) : (
              <BetControls
                betMode={betMode}
                onSetBetMode={setBetMode}
                wager={wager}
                onSetWager={setWager}
                balance={balance}
                currency={settings.currency}
                riskMode={riskMode}
                onSetRiskMode={setRiskMode}
                selectedCount={selectedNumbers.length}
                phase={phase}
                onAutoPick={handleAutoPick}
                onClearTable={handleClearTable}
                onPlayGame={handlePlayGame}
                autoplayConfig={autoplayConfig}
                onUpdateAutoplayConfig={(c) => setAutoplayConfig((prev) => ({ ...prev, ...c }))}
                onStartAutoplay={startAutoplay}
                onStopAutoplay={stopAutoplay}
                minBet={minBet}
                maxBet={maxBet}
                stepBet={stepBet}
                lastWinAmount={lastWinAmount}
                lastPayoutMultiplier={lastPayoutMultiplier}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer information */}
      <footer className="w-full max-w-5xl mx-auto px-4 py-3 flex items-center justify-between text-[11px] text-[#C8B17E]/60 border-t border-[#B9774D]/15">
        <div className="flex items-center gap-2">
          <span>Verdigris Keno · Stake Engine Compliant</span>
          {rgsClient.isDemo() && (
            <span className="px-1.5 py-0.5 rounded bg-[#123F35] text-[#68A895] text-[10px] font-mono border border-[#68A895]/30">
              DEMO WALLET ISOLATED
            </span>
          )}
        </div>
        <div className="font-mono">RGS v2.4 · SHA-256 HMAC Verified</div>
      </footer>

      {/* Modals */}
      <FairnessModal
        isOpen={isFairnessOpen}
        onClose={() => setIsFairnessOpen(false)}
        seedState={seedState}
        onUpdateClientSeed={async (newSeed) => {
          const updated = await rgsClient.setClientSeed(newSeed);
          setSeedState(updated);
        }}
        onRotateServerSeed={async () => {
          const { newSeedState, revealedPreviousSeed } = await rgsClient.rotateServerSeed();
          setSeedState(newSeedState);
          return revealedPreviousSeed;
        }}
      />

      <StatisticsModal
        isOpen={isStatisticsOpen}
        onClose={() => setIsStatisticsOpen(false)}
        history={history}
        currency={settings.currency}
        onResetStatistics={() => {
          rgsClient.resetLocalHistory();
          setHistory([]);
        }}
        onReplayRound={replayRound}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
        onResetBalance={() => {
          const newBalMicro = rgsClient.resetBalance(1000.0);
          setBalance(fromMicroUnits(newBalMicro));
        }}
      />

      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        currentRiskMode={riskMode}
      />
    </div>
  );
}
