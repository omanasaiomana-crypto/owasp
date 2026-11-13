# Notes for Antigravity (AI agent)

This is a finished, working prototype. Please **keep the existing behaviour** when making changes.

## Project structure
```
professor-bingo/
├── index.html        # Markup: scene, title bar, board, side panels, win modal, intro
├── css/style.css     # All styles (theme variables live in :root at the top)
├── js/app.js         # All logic in a single IIFE, in these sections:
│                     #   - procedural scenery (pagodas, wisteria)
│                     #   - data (PRESETS, RANKS, LINES)
│                     #   - state + localStorage (key "professorBingo.v3")
│                     #   - validation of custom phrases
│                     #   - render() and gameplay (toggle, check, celebrate)
│                     #   - audio (WebAudio, silent in quiet mode)
│                     #   - FX: water ripple on every click, fire on BINGO
│                     #   - event wiring + keyboard shortcuts
├── docs/screenshots/ # Proof of the working flow
└── README.md         # Documentation for judges
```

## Run
Open `index.html` in a browser, or serve the folder with any static server (for example `npx serve .`). There is no build step, no dependencies, no `.env`, and no API.

## Rules to keep (hackathon constraints)
- Browser only: no external API, backend, login, database or secret keys. Google Fonts is the only network request, and the page falls back to system fonts without it.
- Use fictional or sample data only.
- The judge path must keep working:
  1. Tick squares until a row, column or diagonal is complete.
  2. The win state (fire plus the BINGO modal) appears.
  3. Quiet Classroom Mode is turned on (no sound or FX, wins show as a toast), then "Generate fresh card" deals a new card.
- Don't add copyrighted characters, logos or names. All art is original CSS, SVG or canvas.

## Testing hooks
`window.__bingo` exposes `state`, `toggle(i)`, `newCard()` and `LINES` for quick checks in the console.
