# Verdigris Keno — Stake Engine Approval & Screenshot Verification Checklist

This audit verifies **Verdigris Keno** against the five reference screenshots provided in the specification, as well as the 6 critical product quality criteria:
1. It exists.
2. It visually works.
3. It responds to user input.
4. It uses real state or supported platform data.
5. It handles errors.
6. It works on mobile.

---

## Screenshot 1 — Main Keno Board & Top Navigation

| Feature / Component | Status | Verification Detail |
| :--- | :---: | :--- |
| **Back Arrow Navigation** | Verified | Functional header icon to reset board / exit round |
| **Centered Game Title** | Verified | "VERDIGRIS KENO" with elegant copper/gold metallic gradient & RTP badge |
| **Fairness Icon (Shield)** | Verified | Opens dedicated Provably Fair modal with real cryptographic info |
| **Settings Icon (Gear)** | Verified | Opens settings drawer with animations, instant bet, sound, hotkeys |
| **Fullscreen Icon** | Verified | Toggles browser HTML5 fullscreen mode |
| **Statistics Icon (Chart)** | Verified | Opens real-time performance metrics and running profit graph |
| **40-Number Grid (8×5)** | Verified | 8 cols × 5 rows (1–8, 9–16, 17–24, 25–32, 33–40) |
| **Number States** | Verified | Unselected (charcoal/ivory), Selected (emerald/copper), Drawn (copper), Match (pulsing jade glow), Missed (dimmed) |
| **1–10 Unique Selections** | Verified | Enforces 1 to 10 picks ceiling; clickable deselect; live count |
| **Status Panel** | Verified | "Select 1–10 numbers to play" on empty; shows count, mode, max win when selected |
| **Live Paytable Strip** | Verified | Dynamic horizontal bar displaying hit multipliers; lights up on win |
| **Sticky Play Game Button** | Verified | Large bottom button; emerald/jade styling; mobile sticky & safe-area compliant |

---

## Screenshot 2 — Manual / Auto Controls, Bet Panel & Risk Selector

| Feature / Component | Status | Verification Detail |
| :--- | :---: | :--- |
| **Manual / Auto Tabs** | Verified | Raised emerald/copper segmented control; disables during active rounds |
| **Play Amount Panel** | Verified | Live amount display in RGS currency (USD, SC, EUR, BTC) |
| **Editable Wager Input** | Verified | Validates minBet ($0.10), maxBet ($100.00), stepBet ($0.10) |
| **½ Button** | Verified | Halves current wager and normalizes to stepBet increment |
| **2× Button** | Verified | Doubles current wager respecting maxBet and available balance |
| **Max Button** | Verified | Selects largest permitted bet: min(maxBet, balance) |
| **Balance Display** | Verified | Live balance from RGS / local wallet; disables bet when wager > balance |
| **Risk Selector** | Verified | Functional dropdown: Classic, Low, Medium, High; updates paytables & RTP immediately |
| **Auto Pick Button** | Verified | Random selection of unique numbers (1–10); animated picks; quick pick count picker |
| **Clear Table Button** | Verified | Clears selections, resets highlights, resets paytable display |
| **Double-Submission Guard**| Verified | Prevents re-clicking Play while round is drawing or settling |

---

## Screenshot 3 — Provably Fair Information

| Feature / Component | Status | Verification Detail |
| :--- | :---: | :--- |
| **Fairness Modal** | Verified | Dedicated modal accessed from header shield icon |
| **System Explanation** | Verified | Explains Stake Engine cryptographic commitment & link to documentation |
| **Hashed Server Seed** | Verified | SHA-256 hash of active server seed with 1-click Copy button |
| **Client Seed** | Verified | Player-customizable seed with update form and Copy button |
| **Nonce Counter** | Verified | Real incrementing round counter; resets on seed change per standard |
| **Seed Rotation Control** | Verified | Generates new server seed and reveals previously hidden server seed |
| **Cryptographic Verifier** | Verified | Embedded tool: input seed, client seed, nonce to re-calculate exact 10 drawn numbers |

---

## Screenshot 4 — Statistics Interface & Profit Graph

| Feature / Component | Status | Verification Detail |
| :--- | :---: | :--- |
| **Wagered Metric** | Verified | Total amount debited for completed bets in current session |
| **Profit Metric** | Verified | Net winnings minus wagers; emerald for positive, copper for negative |
| **Bets Metric** | Verified | Total count of completed betting rounds |
| **Won Metric** | Verified | Number of rounds with payout multiplier > 1.0 |
| **Lost Metric** | Verified | Number of rounds with payout multiplier < 1.0 |
| **Running Profit Graph** | Verified | Responsive SVG curve with zero-line, green above baseline, copper below |
| **Settled Rounds Table** | Verified | Recent rounds list with picks, matches, multiplier, profit, and Replay button |
| **Reset Statistics** | Verified | Resets local session history without modifying player wallet balance |

---

## Screenshot 5 — Settings Panel

| Feature / Component | Status | Verification Detail |
| :--- | :---: | :--- |
| **Animations Toggle** | Verified | ON/OFF toggle: switches between full draw reveals and instant settlement |
| **Instant Bet Toggle** | Verified | ON/OFF toggle: immediate settlement skipping animation delay |
| **Hotkeys Toggle** | Verified | ON/OFF toggle: enables Spacebar (Play), A (Auto Pick), C (Clear), 1–4 (Risk) |
| **Max Bet Preference** | Verified | ON/OFF toggle: displays convenient Max button preference |
| **Sound Effects Toggle** | Verified | Toggles procedural Web Audio API clicks, chimes, and fanfares |
| **Ambient Music Toggle** | Verified | Toggles soothing ambient casino lounge synth pad |
| **Master Volume Slider** | Verified | 0% to 100% volume scaling |
| **Currency Display** | Verified | Supports USD ($), SC (Social Casino Sweeps), EUR (€), BTC (₿) |
| **Demo Balance Reset** | Verified | Button to restore demo balance to $1,000.00 / 1,000.00 SC |

---

## 6 Quality Criteria Checklist

1. **It exists**: Every component from the 5 screenshots is implemented and rendered.
2. **It visually works**: Industrial-luxury theme with beveled buttons, metallic gradients, pulsing matches.
3. **It responds to user input**: Tiles, tabs, inputs, dropdowns, and modals react instantaneously.
4. **It uses real state or supported platform data**: RGS client, 6-decimal micro-units, real HMAC-SHA256 math.
5. **It handles errors**: Insufficient balance warnings, invalid selections, network retry fallbacks.
6. **It works on mobile**: Tested on narrow screens (390px iPhone width) with no horizontal scroll or overlapping controls.
