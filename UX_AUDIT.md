# Kilalao user-experience audit — 2026-10-12

Scope: how each of the 24 games is controlled on a phone, what feedback it gives, and how a newcomer learns it. The method was to read every renderer and input handler and play each game in a 390 px browser viewport. Findings below are limited to what was observed; physical Android devices were not used.

## Cross-cutting findings

| Finding | Change |
| --- | --- |
| Many games used indirect controls: a button row or number box beside the board instead of the pieces themselves. | Pieces are now the controls wherever that is natural (river passengers, Nim counters, cube stickers, Klotski blocks, 8/15 tiles). |
| Nothing taught a game except text. | Every game has a narrated demo (▶ Demo in the action dock, or *Watch the demo* on the Rules page). A finger uses the real controls while a recorded voice explains; captions show the same words. |
| After choosing a piece, legal destinations were not shown. | Peg Solitaire and Clobber highlight every legal landing square; Sudoku shades the row, column and box of the chosen square. |
| Precise placement relied on the player's accuracy. | Tangram pieces snap; Domineering accepts a tap on either square of the domino. |

## Game by game

| Game | Before | Now |
| --- | --- | --- |
| Tower of Hanoi | Selecting a peg nudged its disk up 18 px; moves went straight across. | The top disk rises clear of all pegs when its peg is chosen. A move glides across, pauses over the target and drops with a small settle. |
| Nim (7 modes) | Choose a heap, type an amount, press Remove. | Tap a counter: it and every counter to its right are marked; confirm with *Take n*. Grundy: tap where to split. Kayles: tap a pin, and a neighbour for a pair. |
| Chomp | Direct tap. | Unchanged; demo added. |
| Domineering | Had to tap the top or left square exactly. | Tap either square; the domino fits itself where it can. |
| Clobber | Select, then capture, with no hint of legal captures. | Capturable stones pulse once a stone is selected. |
| Hackenbush, Hex, Sim, Dots and Boxes, Lights Out, Frogs, N-Queens, SET, Chomp | Direct and clear. | Demos added. |
| Sprouts | Freehand drawing. | Unchanged; demo draws real curves. |
| Peg Solitaire | Select a peg, guess the hole. | Legal landing holes show a dashed ring. |
| Sliding: 8/15 | Only tiles touching the gap moved. | Tap any tile in the gap's row or column; the whole run slides in one animation. |
| Sliding: Traffic/Klotski | Select a block, then press arrow buttons. | Swipe a block; a longer swipe moves it further. Arrows remain for keyboards. |
| Sudoku | No guidance. | Row, column and box of the chosen square are shaded; equal digits are emphasised. |
| Nonograms, Kakuro | Workable. | Demos added. Drag-painting nonograms is a remaining suggestion. |
| Mastermind | Each slot cycled through up to six colours one tap at a time. | Tap a colour from a palette; it fills the active slot and the next slot is chosen. |
| Tangram | Free dragging with 10-unit rounding: 45°-rotated corners could never meet exactly. Rotate needed a separate button. | Corners snap to the target grid, to other pieces' corners or to their edges, preferring the shift that seats the most corners. A ring shows the snap. Tapping a selected piece rotates it; rotation and flip re-snap. A test drops every piece 9 units off target and the puzzle still completes. |
| Rubik's Cube | Choose one of six face buttons, then one of two direction buttons. | Swipe across stickers to turn the row or column under the finger, including middle slices (new M, E, S moves). Drag beside the cube to look around. A slim side rail turns whole faces, with one direction toggle. This follows the common pattern of mobile cube apps: swipe on the cube to turn it, drag the background to orbit. |
| River crossing | Buttons below the scene ("Take Goat", "MC"…). | Tap passengers on the boat's bank to seat them, tap a seated passenger to let them off, tap the boat to row. The farmer always rows. Boarding glides, riders stay seated mid-river, arrivals hop ashore. Boarding someone on the far bank, overfilling the boat or rowing an empty boat (missionaries) gives a short message and a gentle shake. |
| The 24 Game | Typing with the phone keyboard. | On-screen keypad: the four numbers (each greys out once used), operators, brackets, delete and clear. Typing still works. |

## Demos and narration

- 76 narrated lines, 6.1 minutes in total, bundled as 1.4 MB of Opus audio, so demos work offline.
- Voice: Kokoro v1.0 neural TTS (`af_heart`, speed 0.93), rendered offline with sherpa-onnx by `scripts/make-voice.py`. The text lives in `demo-text.js`; changed lines are re-rendered on the next run.
- Demos play on a separate board. The player's position, Undo history and selection are restored afterwards, and nothing from a demo is saved or counted as a completion. Back, Escape, leaving the screen or Stop end a demo at once.
- A mute button keeps the captions. If audio cannot play, captions advance on a timer.

## Validation

- 77 rule and DOM tests and 14 browser checks pass. New checks cover: swipe direction for every sticker under random camera angles (projection matches the browser's own `DOMMatrix`); real mouse swipes and orbit; slice moves in the engine and 3D renderer; boarding, capacity and crossing in both river puzzles; Hanoi's lift, pause and drop; Tangram snapping solving the square from imprecise drops; Nim, Kayles and Grundy selection; Domineering placement; the Mastermind palette; the 24 keypad; run slides and Klotski swipes; legal-target highlighting.
- Every one of the 24 demos runs to completion through the real controls, makes only legal moves and restores the player's game exactly (browser test).
- Not verified: listening quality on a phone speaker, Android WebView audio playback through the app's asset interceptor (the MIME type for `.ogg` and gesture-free playback were added for this), and touch feel on physical devices.

## Remaining suggestions

- Drag-to-paint for Nonograms.
- Drag a Hanoi disk directly as an alternative to two taps.
- A first-visit prompt suggesting the demo.
