# Sprites

This folder is intentionally lightweight “plumbing” for an eventual full sprite remaster.

Current behavior:

- The game still renders with CSS colors by default.
- A simple sprite pipeline exists but is **disabled** unless explicitly enabled.

Enabling sprites (for local testing):

1. Open the game in your browser.
2. Open the developer console.
3. Run:
   - `Sprites.setEnabled(true)`
4. Refresh the page.

Sprite mapping:

- The mapping lives in `finalproject/src/sprites.js` (`Sprites.map`).
- Replace the PNGs in this folder, or change the mapping, to swap art.

Notes:

- Sprite URLs are resolved relative to `levels/l02-endless.html` using `../assets/sprites/...`.
- The CSS class used for sprite rendering is `.entitySprite` in `styles/game.css`.
