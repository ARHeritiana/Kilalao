# Kilalao — mathematics at play

An offline Android app with **24 mathematical and logic game families**, touch controls, saved positions, narrated demos, and a learning library on rules, strategy, mathematical ideas and published research.

## Install

Phones already running a signed Kilalao release (1.2.0 or later) get new versions through **Progress → Check for updates**, and saved games and progress are kept. To install from scratch, download **[Kilalao-1.3.0.apk](https://github.com/ARHeritiana/Kilalao/releases/download/v1.3.0/Kilalao-1.3.0.apk)** from the private [1.3.0 release](https://github.com/ARHeritiana/Kilalao/releases/tag/v1.3.0). Open it on the device and allow installation from that source if Android asks. Requires **Android 8.0 or later**. The APK is signed with the permanent Kilalao release key; it is not a Google Play release.

Development builds from 1.0.x and 1.1.x used temporary keys. Android cannot update them in place, and uninstalling one deletes its saved games.

Play, guides and demos work offline. Source articles open in your usual browser. The app goes online only for the optional GitHub update check and download, and asks Android before installing an update. It has no analytics, ads or accounts, and keeps progress on the device. Two-player games are pass-and-play.

## Using the app

- **Bottom dock.** All game commands sit within thumb reach: **Games · Undo · Hint · New · Learn**. In a guide, the dock shows **Games · Rules · Strategy · Research · Play**. Nothing interactive sits in the status-bar strip, and drag boards keep clear of the Android back-gesture edges.
- **Direct controls.** You play by touching the pieces themselves:
  - River crossing: tap passengers to seat them, then tap the boat.
  - Rubik's Cube: swipe across the cube to turn rows and middle slices.
  - Nim: tap a counter to take it and those to its right.
  - Mastermind and the 24 Game: colour palette and number keypad.
  - Sliding puzzles: swipe blocks.
  - Peg Solitaire and Clobber highlight legal destinations; Sudoku shades the chosen square's row, column and box.
- **Demos.** **Watch a demo** (below each game's instructions, or on its Rules page) plays real moves with a finger cursor, captions and an offline recorded voice. Demos never change your saved game.
- **Sizes.** Games where size is part of the game have a size picker (table below). Changing size starts a new game; New game keeps the chosen size.
- **Screen.** Each game has **Auto / Wide / Tall** rotation and **Full screen**:
  - Wide and Tall work even when the phone's auto-rotate is off.
  - Full screen hides the system bars; swipe from an edge to see them briefly.
  - These choices apply only inside games and are remembered.
- **Look.** Playful theme with the bundled Fredoka font and a colour palette tested for contrast and colour blindness ([DESIGN.md](DESIGN.md)). Reduced-motion settings are respected.

## Games

| Family | Modes | Sizes (default in bold) |
| --- | --- | --- |
| Tower of Hanoi | Classic, four pegs, cyclic, adjacent | 3, **4**, 5, 6, 7 disks |
| Nim and heap games | Normal, misère, Wythoff, Fibonacci, subtraction {1,3,4}, Kayles, Grundy | — |
| Chomp | — | 3×4, **4×6**, 5×7, 6×8 |
| Domineering | Vertical versus horizontal | 4×4, **6×6**, 8×8 |
| Clobber | — | 4×4, **5×5**, 6×6, 7×7 |
| Hackenbush | Blue-red grounded graph | — |
| Sprouts | Freehand curves with degree and crossing checks | 2, **3**, 4, 5 dots |
| Dots and Boxes | Extra turn for each closed box | 3×3, **4×4**, 5×5, 6×6 dots |
| Hex | Classic rhombus; each player owns two opposite sides | **5×5**, 7×7, 9×9, 11×11 |
| Sim | Six vertices; avoid a triangle in your colour | — |
| Peg Solitaire | Triangular, English | — |
| Lights Out | Always solvable, algebraic hints | 3×3, 4×4, **5×5**, 6×6, 7×7 |
| Sliding puzzles | 8 Puzzle, 15 Puzzle, traffic, Klotski | — |
| Toads and Frogs | Forward-only swapping puzzle | 1, 2, **3**, 4, 5 per side |
| Sudoku | Standard 9×9, digit-permuted puzzles | — |
| Nonograms | Three 5×5 pictures | — |
| Kakuro | 3×3 practice board; any valid filling accepted | — |
| Mastermind | Four positions, six colours, repetition; random or private secret | — |
| SET | Four features, three values, five-set rounds | — |
| N-Queens | — | 4 to 10 queens (**8**) |
| Tangram | Seven draggable, rotatable, flippable pieces that snap together | — |
| Rubik's Cube | 3D 3×3 and 2×2 with swipe turns | — |
| River crossing | Farmer–wolf–goat–cabbage; missionaries and cannibals | — |
| The 24 Game | Solvable four-number challenges, safe arithmetic parser | — |

Each family has **Rules**, **Strategy** and **Research** sections.
- Research summaries link to academic resources, original papers and official rules.
- They separate existence proofs from constructive strategies, and general complexity results from the small boards played here.
- Sprouts ends by agreed concession when a player cannot draw a legal curve; the app does not detect every blocked position.

## Build from source

1. Install **JDK 17**, the Android SDK with platform **35** and build tools **35.0.0** (Android Studio includes them), and **Node 22**.
2. Run `./gradlew assembleDebug` from the repository root (`gradlew.bat` on Windows). Set `ANDROID_HOME`, or add `sdk.dir` to an untracked `local.properties` file.
3. The APK is written to `app/build/outputs/apk/debug/app-debug.apk`. It is signed with a debug key, so it cannot update a phone that has a signed release installed.

Signed releases are built only by the **Publish Android update** workflow on `main`:
- It uses the permanent key stored in encrypted Actions secrets; keys are never committed.
- It checks on an emulator that the new APK installs over the previous version and keeps saved progress.
- It publishes a GitHub Release containing the APK, `update.json` and `SHA256SUMS`.

See [UPDATES.md](UPDATES.md) for the updater and its private-repository access.

## Test

```sh
npm ci
npm test               # game rules and DOM interaction tests (jsdom)
npm run check          # JavaScript syntax
npx playwright install chromium && npm run test:browser   # layouts, sizes, demos, animations
./gradlew testDebugUnitTest lintDebug
```

- The rule tests cover all 24 families, every board size, solvability, shortest Hanoi and Toads-and-Frogs solutions, cube inverses and the arithmetic parser.
- The browser checks cover every game, mode and size at widths of 320 to 800px, landscape layouts, full screen, and all 24 demos run through the real controls.
- CI runs all of these on every pull request and push to `main`, builds the APK, and uploads it with the lint report and screenshots as workflow artifacts.

## Architecture

| Path | Role |
| --- | --- |
| `app/src/main/java/mg/kilalao/app/MainActivity.java` | Android activity. Serves the bundled assets over a local HTTPS origin, keeps content clear of system bars, and provides the Back, full-screen and rotation bridges. |
| `app/src/main/java/mg/kilalao/app/AppUpdater.java` and related classes | Verified GitHub update check, download and install. |
| `assets/engines.js` | Deterministic game rules, sizes and solvers (no DOM). |
| `assets/ui.js` | Screens, touch controls, undo, hints, saves, learning navigation. |
| `assets/display.js` | Rotation and full-screen controls. |
| `assets/demo.js`, `assets/demo-text.js`, `assets/voice/` | Narrated demos and their recorded voice clips. |
| `assets/cube3d.js`, `assets/motion.js` | 3D cube and move animations. |
| `assets/catalog.js`, `assets/learning.js` | The 24 families and their learning text. |
| `assets/style.css`, `assets/fonts/` | Theme and palette tokens; bundled Fredoka font. |
| `scripts/palette.py` | Generates and validates the palette (see DESIGN.md). |
| `scripts/make-voice.py` | Regenerates the demo narration offline. |
| `scripts/prepare-release.py`, `scripts/check-update-install.py` | Release checks run by CI. |
| `tests/` | Engine, DOM and browser tests. |

The WebView cannot read device files or load remote content; only the native updater uses the network.

## Attribution

- **Code:** MIT license.
- **Font:** Fredoka, under the SIL Open Font License ([licence](app/src/main/assets/fonts/OFL.txt)).
- **Demo voice:** generated offline with the Kokoro model (Apache-2.0) through sherpa-onnx.
- **Text and illustrations:** educational text and illustrations were written for Kilalao.
- **Trademarks:** game names and product names belong to their owners. This is an independent educational app.
- **Research:** linked research belongs to its authors and is summarised, not reproduced.
