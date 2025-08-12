# Mancala (Kalah)

This is a small, self‑contained browser implementation of the classic
Mancala variant **Kalah**.  Open `index.html` in any modern browser to
play a local two–player game – no build step or server needed.

## Features

- Local 1v1 play with customisable player names
- Responsive SVG board
- Kalah rule set: extra turns, captures and game end detection
- Light/Dark theme toggle and optional sound effects
- Keyboard shortcuts: `R` restart, `M` mute
- Settings persisted to `localStorage`

## File overview

```
index.html          – entry point with three screens (home, game, end)
styles/styles.css   – basic styling and themes
src/engine.js       – pure game logic
src/ui.js           – SVG board rendering and animations
src/main.js         – application glue
src/sounds.js       – simple sound effect wrapper
src/storage.js      – saving/loading player preferences
src/theme.js        – theme handling
src/utils.js        – helper functions
```

Assets such as icons and (very small placeholder) sound effects live in
`assets/`.

## Rules

Kalah is played on a board with six pits per player and one store (or
"mancala") each.  On a turn a player selects one of their pits, picks
up all stones from it and sows them counter‑clockwise one by one into
subsequent pits, skipping the opponent’s store.  If the last stone
lands in the player’s store they take another turn.  If it lands in an
empty pit on their side and the opposite pit holds stones, those stones
(and the last stone) are captured into the player’s store.  The game
ends when one side of the board is empty; remaining stones on the other
side are swept into that player’s store.  The highest store count wins.

## Testing the engine

There is no automated test suite, but the logic in `src/engine.js` is
kept small and documented so it can easily be inspected or exercised
from the browser console.
