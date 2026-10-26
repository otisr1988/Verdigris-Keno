# Verdigris Keno — Stake Engine Casino Game

![Stake Engine Ready](https://img.shields.io/badge/Stake%20Engine-Compliant-123F35?style=for-the-badge)
![RTP](https://img.shields.io/badge/RTP-96.50%25-68A895?style=for-the-badge)
![Max Win](https://img.shields.io/badge/Max%20Win-10%2C000%C3%97-D79362?style=for-the-badge)

A premium, production-oriented 40-number Keno game engineered for submission to **Stake Engine** and publication on **Stake.com**.

---

## Visual Design Theme: Industrial Luxury
Verdigris Keno departs from the standard blue casino aesthetic by introducing a refined copper-and-emerald luxury theme:
- **Deep emerald**: `#123F35`
- **Dark charcoal**: `#151B1C`
- **Oxidized copper**: `#B9774D`
- **Warm ivory**: `#F2ECDD`
- **Muted jade**: `#68A895`
- **Antique champagne**: `#C8B17E`
- **Dark forest**: `#092920`
- **Rich copper highlight**: `#D79362`

---

## Core Game Features
1. **40-Number Keno Board**: 8 columns × 5 rows (1–40), allowing 1 to 10 unique selections with beveled metallic tiles, dynamic hover states, drawn states, and jade-illuminated winning matches.
2. **Four Validated Risk Modes**:
   - **Classic**: Balanced casino distribution (up to 10,000× peak on 10 picks, 96.50% RTP).
   - **Low**: High hit frequency with smoothing payouts on lower and zero hits.
   - **Medium**: Moderate variance casino distribution.
   - **High**: Max volatility with high tier exponential rewards.
3. **Betting Controls**:
   - 6-decimal-place integer money precision (micro-units: $1.00 = 1,000,000).
   - Exact ½, 2×, and Max bet normalizers respecting stepBet, minBet, maxBet, and wallet balance.
   - Auto Pick (with quick pick count selection 1–10) and Clear Table actions.
4. **Stake Engine Compliant Autoplay**:
   - Number of rounds (10, 25, 50, 100).
   - Stop on single win, stop on single loss, and balance threshold protection.
   - Enforces full RGS settlement lifecycle per round with safety confirmation.
5. **Provably Fair Engine (HMAC-SHA256)**:
   - Live Hashed Server Seed, customizable Client Seed, and Nonce counter.
   - One-click copy controls and seed rotation.
   - Embedded cryptographic outcome verifier allowing players to verify historical draws.
6. **Statistics & Profit Graph**:
   - Running session profit/loss SVG curve with green (gains) and copper (losses) segments.
   - Wagered, Profit, Bets, Won, Lost metrics.
   - Settled rounds history table with round replay capability.
7. **Complete Settings Drawer**:
   - Animations toggle, Instant Bet mode, Hotkeys (Spacebar to Play, A to Auto Pick, C to Clear, 1–4 to change Risk), Max Bet toggle.
   - Web Audio API procedural sound synthesis (no external audio files to fail loading) with volume slider and ambient lounge pad.
   - Currency display selector (USD $, SC Sweeps, EUR €, BTC ₿).

---

## Directory Structure
```
Verdigris-Keno/
├── math/                    # Stake Engine official math publication files
│   ├── index.json           # Declares all 40 modes, costs, books, and weights
│   ├── lookUpTable_*.csv    # Unsigned integer CSV simulation tables
│   └── books_*.jsonl        # Game outcome books (and .zst compressed)
├── src/                     # Game frontend source
│   ├── components/          # Modular UI components (Board, BetControls, Modals)
│   ├── game/                # Math, Provably Fair, Sound Engine, RGS Client
│   ├── App.tsx              # Main orchestrator
│   └── main.tsx             # Entry point
├── scripts/                 # Build and validation scripts
│   ├── monteCarloSim.ts     # 4,000,000 round Monte Carlo validation
│   ├── generateMathPackage.ts # Stake Engine publication file builder
│   ├── solveMath.ts         # Hypergeometric RTP calibration tool
│   └── createPackages.py    # Production ZIP packager & SHA-256 generator
├── docs/                    # Technical documentation
│   ├── ARCHITECTURE.md      # Stake Engine compatibility investigation
│   └── STAKE_ENGINE_APPROVAL_CHECKLIST.md # Verification matrix
├── release/                 # Output publication ZIPs and checksums
│   ├── Verdigris_Keno_Math.zip
│   ├── Verdigris_Keno_Frontend.zip
│   └── checksums.sha256
└── .github/workflows/ci.yml # Automated CI pipeline
```

---

## Reproducible Setup & Testing

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Mathematics & Provably Fair Unit Tests
```bash
npx tsx --test src/game/kenoMath.test.ts
```

### 3. Run Monte Carlo Simulation (4 Million Rounds)
```bash
npx tsx scripts/monteCarloSim.ts
```

### 4. Build Stake Engine Math Package
```bash
npx tsx scripts/generateMathPackage.ts
```

### 5. Build Production Frontend Bundle
```bash
npm run build
```

### 6. Generate Official ZIP Packages & Checksums
```bash
python3 scripts/createPackages.py
```
