# Professor Bingo 🎓 — Lecture Demon Hunt

A high-polish, anime-themed bingo game where every professor cliché is a demon to slay. Built purely for the browser with zero backend, zero external APIs, zero paid dependencies, and zero database requirements.

**Live Stack:** Vanilla HTML5, CSS3, JavaScript (ES6+), Three.js (r160 via CDN), and Google Fonts. Data is stored entirely in the browser's `localStorage` wrapped in defensive `try/catch` blocks.

---

## 3D Characters (original, built with Three.js primitives)

All 3D character models are **100% original designs** created procedurally out of Three.js geometric primitives (`SphereGeometry`, `CylinderGeometry`, `ConeGeometry`, `TorusGeometry`, `BoxGeometry`) with custom `MeshToonMaterial`, inverted-hull ink outline meshes (`THREE.BackSide`), and warm moonlit rim lighting. No external 3D model files (GLTF, OBJ, FBX) are loaded.

1. **Kai — The Lecture Hunter (Left Column Stage, 300px)**:
   - **Visuals:** Spiky dark-navy hair with 8 directional spikes, white cloth headband with flowing tails, deep-blue haori outer coat with gold wave trim ring, black inner slayer uniform, hakama pants, straw sandals, and a glowing cyan katana with an animated curved blade slash trail.
   - **Animations:**
     - `idle`: Procedural breathing, head tilts, subtle katana sway, and drifting sakura petals.
     - `slash`: Responsive two-handed vertical katana slash with an animated translucent ribbon arc when squares are ticked. Spawns an arc of water droplets from Kai directly to the clicked bingo square.
     - `victory`: Celebratory jumps, glowing flame blade, and confident head nod.
     - `modal celebration`: Stands triumphant in the BINGO modal (`#modalLeft`) with raised fist pump, smiling closed eyes (`^ ^`), and gentle bounce loop.

2. **Yuki — The Lantern Spirit (Right Column Stage, 350px)**:
   - **Visuals:** Flowing snow-white hair tied with crimson beads, pointed fox ears with soft pink inner cones, a fluffy white fox tail with crimson tip, traditional crimson-and-white layered kimono with gold obi sash, and a warm glowing paper lantern powered by an active Three.js `PointLight`.
   - **Animations:**
     - `idle`: Gentle float, breathing, curious ear twitches, swaying lantern, and drifting golden fireflies.
     - `cheer`: Joyful hop with swinging lantern, ear flutter, and lantern light pulse when demon squares are slain.
     - `victory`: Rhythmic celebratory clapping, enthusiastic hopping, and lantern radiance.
     - `modal celebration`: Stands gracefully in the BINGO modal (`#modalRight`) with hands clasped over her chest, smiling expression, happy curved eyes, and a gentle floating bounce loop.

3. **Performance & Lifecycle Optimization**:
   - Both characters run on separate lightweight WebGL renderers capped at ~60fps.
   - All render loops automatically pause when the tab is backgrounded (`document.hidden`).
   - The celebratory modal renderers (`#modalLeft` and `#modalRight`) **only render while the BINGO modal is open** (`#overlay.classList.contains("show")`), consuming 0 GPU cycles during normal gameplay.
   - On screens `<= 940px` (tablets and mobile phones), character stages automatically unmount/hide (`display: none !important;`) to ensure maximum battery life and performance.

---

## Hunter Login & Scoreboard (local only, fictional data)

1. **Local-Only Hunter Login ("ENTER THE HUNT")**:
   - Appears as a Japanese parchment entrance card with an embossed crimson demon seal (`鬼`).
   - **Hunter Name Input:** Strict client-side validation requiring 2–16 characters (letters, numbers, spaces only). Displays immediate inline red feedback if invalid and disables the start button.
   - **Sacred Emblem Picker:** 4 original hand-crafted SVG emblems:
     - 🌊 **Wave** (Water Breathing)
     - 🔥 **Flame** (Demon Flame)
     - 🌙 **Moon** (Pale Moonlit Night)
     - 🌸 **Sakura** (Crimson Petals)
   - **Instant Judge Access:** A prominent *"Play as guest"* button enables judges to bypass name entry and start playing instantly with the default `Guest Hunter` identity.
   - **Titlebar Profile:** The top navigation displays the hunter's sacred emblem badge, their active name, and a *"Switch hunter"* link to reopen the login card at any time.

2. **"HALL OF HUNTERS" Scoreboard (`#scoreboardOverlay`)**:
   - Full-screen Japanese parchment scroll modal framed in dark lacquer with rolled wooden bar caps and gold corner ornaments.
   - Accessible via the **🏆 SCOREBOARD** tab in the main sidebar and via the **🏆 Scoreboard** button inside the BINGO victory modal.
   - **Columns:** Rank · Sacred Emblem · Hunter Name · Rank Title · XP · Bingos · Best Combo.
   - **7 Fictional Sample Hunters:** Preloaded with balanced, realistic stats:
     - *Moonblade Riku* (Shadow Master · 1,420 XP · 11 Bingos · x7 Combo)
     - *Ember Sana* (Crimson Ronin · 980 XP · 7 Bingos · x5 Combo)
     - *Quiet Kenji* (Crimson Ronin · 750 XP · 6 Bingos · x6 Combo)
     - *Lantern Mei* (Moon Blade · 520 XP · 4 Bingos · x4 Combo)
     - *Ink Daichi* (Moon Blade · 390 XP · 3 Bingos · x4 Combo)
     - *Petal Aiko* (Lantern Scout · 240 XP · 2 Bingos · x3 Combo)
     - *Storm Haru* (Ink Novice · 80 XP · 0 Bingos · x2 Combo)
   - **Live Player Row Highlight:** The player's row is highlighted with a glowing gold border (`.player-row`) and live-updates in real time with every tick, line, bingo, and combo.
   - **Medal Badges & Staggered Animations:** Top 3 ranks display 🥇 Gold, 🥈 Silver, and 🥉 Bronze medals. Rows animate in with smooth staggered CSS slide transitions (`animation-delay: calc(var(--i) * 0.04s)`).
   - **Tabs:** Switch seamlessly between **"All time"** and **"This session"** stats.
   - **In-Page Reset Dialog:** Clicking *"Reset my score"* opens `#resetConfirmDialog` with *"Yes, reset"* and *"Cancel"* options. Strictly zero `window.alert()` or `window.confirm()` calls are used. Resets the user's XP and rank progress on the device without affecting sample leaderboard data.

---

## Quiet Mode Behaviour

The **Quiet Classroom Mode** (`#quietBtn`, keyboard shortcut: `Q`) acts as a stealth mode for lecture halls and silent study environments:
- **Audio Silence:** Completely mutes 100% of WebAudio sound effects (no splash sounds, no katana slice audio, no victory flame whooshes, no taiko drum rolls).
- **Subtle Visuals:** Visual particle effects operate at 50% scale. Button clicks still produce subtle water ripples and small droplets, maintaining tactile UI feedback without distracting neighbors.
- **Stealth Victory Notifications:** When a BINGO line is completed while Quiet Mode is active, the game suppresses the full-screen celebratory modal and instead presents a discreet, elegant toast in the bottom corner (e.g. `✓ Bingo · Row 1 complete · +100 XP`).
- **3D Character Restraint:** Kai and Yuki switch from energetic victory jumps to calm, subtle nods and ear twitches (`chars.setQuiet(true)`).
- **Visual Dimming:** Dims background moon glow and shifts the theme to quiet stealth tones.

---

## Screenshots

All screenshots are stored in `docs/screenshots/`:

| Screenshot | Description |
|---|---|
| ![Hunter Login](docs/screenshots/01-hunter-login.png) | **Hunter Login Card** — Name validation, 4 sacred emblems, and "Play as guest" button |
| ![Gameplay Board](docs/screenshots/02-gameplay-board.png) | **3-Column Desktop View** — 3D Kai, 5x5 demon bingo board, scrolls, and 3D Yuki |
| ![BINGO Win Modal](docs/screenshots/03-bingo-win-modal.png) | **BINGO Victory Modal** — Celebratory Kai (fist raised) & Yuki (clasped hands), flame text, achievements |
| ![Scoreboard](docs/screenshots/04-hall-of-hunters-scoreboard.png) | **Hall of Hunters Scoreboard** — Fictional hunters, player highlight, medals, All-time/Session tabs |
| ![Quiet Mode](docs/screenshots/05-quiet-mode.png) | **Quiet Classroom Mode** — Stealth mode with muted audio, subtle water effects, and toast wins |
| ![Mobile View](docs/screenshots/06-mobile-view-390px.png) | **Mobile 390px View** — Clean single-column layout, characters hidden, fully touch-optimized |

---

## Judge Verification Path

To verify the complete user journey end-to-end:
1. **Enter the Hunt:** Click **"Play as guest"** on the initial entrance card.
2. **Tick Squares:** Click 5 squares in Row 1 (or any line). Notice water splash ripples on every click and Kai's katana slash.
3. **BINGO Win Modal:** Upon completing the line, the BINGO modal appears with burning brush fire text, achievement checklist, and 3D Kai and Yuki celebrating in the side slots.
4. **View Scoreboard:** Click **"🏆 Scoreboard"** inside the modal. Verify that your player row is highlighted in gold with live XP and combo stats.
5. **Return & Stealth Test:** Click **"Return to Hunt"**, toggle **Quiet Classroom Mode** (`Q`), and click **"Generate fresh card"** (`N`). Confirm all sound is muted while subtle water ripples remain active.

---

## Hackathon Compliance & Validation

- **Browser-Only:** No backend server, no Docker, no external database, no real authentication provider.
- **No Secret Keys:** No `.env` files, no OAuth tokens, no API keys.
- **Clean Fallbacks:** If WebGL or Three.js is disabled, the game gracefully hides character stages and maintains 100% playable 2D gameplay.
- **Phrase Validation:** The card editor requires at least 24 unique phrases (25 without free space) and rejects lines over 60 characters with clear inline guidance.
- **Zero Console Errors:** Thoroughly audited and verified with automated headless Chrome test suites.
