# Kilalao — mathematics at play

An offline Android app with **24 mathematical and logic game families**, touch controls, saved positions, and a learning library explaining rules, strategies, mathematical ideas, and published research.

## Install

Installed 1.2.x apps are offered 1.3.0 by **Check for updates**; progress is kept because both use the permanent signing key. Or download **[Kilalao-1.3.0.apk](https://github.com/ARHeritiana/Kilalao/releases/download/v1.3.0/Kilalao-1.3.0.apk)** from the private [1.3.0 release](https://github.com/ARHeritiana/Kilalao/releases/tag/v1.3.0), open it on your Android device, and allow installation from that download source if Android asks. Requires **Android 8.0 or later**. This APK uses the permanent Kilalao release signing certificate; it is not a Google Play release.

Play and the learning guides work without an internet connection. Source articles open in your usual browser. The app uses internet access only for optional GitHub update checks/downloads and asks Android for permission to install a verified update. It contains no analytics or advertisements and stores progress only on the device. Two-player games use pass-and-play; no account or online opponent is needed.

## Sizes, rotation and full screen in 1.3.0

Ten games have a size picker below the mode selector. Changing the size starts a new game, after you confirm if a game is in progress, and New game keeps the chosen size. Defaults are the original editions.

| Game | Sizes (default in bold) |
| --- | --- |
| Tower of Hanoi | 3, **4**, 5, 6, 7 disks |
| Chomp | 3×4, **4×6**, 5×7, 6×8 |
| Domineering | 4×4, **6×6**, 8×8 |
| Clobber | 4×4, **5×5**, 6×6, 7×7 |
| Sprouts | 2, **3**, 4, 5 dots |
| Dots and Boxes | 3×3, **4×4**, 5×5, 6×6 dots |
| Hex | **5×5**, 7×7, 9×9, 11×11 |
| Lights Out | 3×3, 4×4, **5×5**, 6×6, 7×7 |
| Toads and Frogs | 1, 2, **3**, 4, 5 per side |
| N-Queens | 4 to 10 queens (**8**); replaces the former 5/8 modes |

Every game screen has a screen bar. **Auto** follows the phone's rotation setting. **Wide** and **Tall** turn the app sideways or keep it upright, even when auto-rotate is off. **Full screen** hides the status and navigation bars; swiping from an edge shows them briefly, and Back keeps working. These choices apply only inside games and are remembered on the device. Sideways, drawn boards shrink to fit above the dock, so a whole game needs no scrolling. In a browser, the same buttons use the Fullscreen and Screen Orientation APIs, where the browser supports them.

## Playful interface in 1.3.0

Category colours from a tested palette (WCAG contrast and colour-blind separation; see [DESIGN.md](DESIGN.md)), chunky press-down buttons, rounded type (the bundled [Fredoka](app/src/main/assets/fonts/OFL.txt) font, SIL Open Font License) and a small celebration when a puzzle is solved. All game commands sit in a bottom thumb dock: **Games · Undo · Hint · New · Learn**; in the learning guide the same dock shows **Games · Rules · Strategy · Research · Play**. Nim's amount has −/+ steppers, so no keyboard is needed. **Check for updates** is now on the Progress screen. The Android app keeps every control clear of the status bar, display cutout, navigation/gesture bar and on-screen keyboard. This also applies on Android 15, which forces edge-to-edge display. Drag-to-play boards (Tangram, Sprouts, Hackenbush, the cube) keep a 24px margin away from the back-gesture edges.

## Interface in 1.1.1

The phone interface has a compact game header, full-width boards, separate Play/Learn controls, and a fixed Undo/Hint/New game dock. Home navigation uses a bottom bar. Moves animate with moving disks/tiles, fading captures, drawn connections, and cell feedback; reduced-motion settings are respected. Both cube sizes have an orbitable CSS 3D display, labeled faces, and animated layer turns. No game families or variants were added.

**Installation over an older build:** the permanent 1.2.0 signing certificate differs from the temporary 1.0.x/1.1.x development certificates. Android cannot update those installations in place. Uninstalling an older installation deletes its saved games and progress; keep it if those saves matter. Future compatible releases use the same permanent key and preserve progress. See [release validation](RELEASE_VALIDATION.md).

## Updates in 1.2.0

The app now has an **Updates** button and a daily startup check. It downloads newer stable releases after your agreement, verifies their checksum and signing certificate, and opens Android’s install confirmation. Games still work offline. Private updates use a device-local fine-grained GitHub token with read-only access; future release builds require the permanent signing key in encrypted Actions secrets; see [UPDATES.md](UPDATES.md) for setup and the older development APK compatibility limits. The signed 1.2.1 release includes this updater and supports GitHub’s longer JWT installation tokens. Pending downloads survive the Android installation-permission restart and are verified again before installation.

## Games

| Family | Playable edition / modes |
| --- | --- |
| Tower of Hanoi | Four disks; classic, four pegs, cyclic, adjacent |
| Nim and heap games | Normal, misère, Wythoff, Fibonacci, subtraction {1,3,4}, Kayles, Grundy |
| Chomp | 4×6 chocolate grid |
| Domineering | 6×6, vertical versus horizontal |
| Clobber | 5×5 capture game |
| Hackenbush | Blue-red grounded graph |
| Sprouts | Freehand curves, degree and intersection validation |
| Dots and Boxes | 4×4 dots, extra-turn scoring |
| Hex | 5×5 hexagonal board |
| Sim | Six vertices and monochromatic triangle avoidance |
| Peg Solitaire | Triangular and English boards |
| Lights Out | Solvable 5×5 boards, algebraic hints |
| Sliding puzzles | 8 Puzzle, 15 Puzzle, original traffic puzzle, classic Klotski |
| Toads and Frogs | Three pieces per side, forward-only swapping puzzle |
| Sudoku | Standard 9×9, digit-permuted puzzles |
| Nonograms | Three 5×5 picture challenges |
| Kakuro | Small 3×3 arithmetic practice board; any valid filling accepted |
| Mastermind | Four positions, six colors, repetition; random or privately entered secret |
| SET | Four features, three values, five-set practice rounds |
| N-Queens | Five or eight queens |
| Tangram | Seven draggable, rotatable, flippable pieces; classic square challenge |
| Rubik’s Cube | Interactive 3D 3×3 and 2×2 cubes, animated face turns |
| River crossing | Farmer–wolf–goat–cabbage; missionaries and cannibals |
| The 24 Game | Solvable four-number challenges and a safe arithmetic parser |

Each family has **Rules**, **Strategy**, and **Research** tabs. Research summaries link to academic resources, original papers, and official rules. They distinguish existence proofs from constructive strategies, and generalized complexity results from individual small boards. Sprouts uses an agreed concession to end play when a player cannot draw a legal curve; automatic recognition of every planar position is not implemented.

## Build from source

1. Install Android Studio (or Android SDK command-line tools), **JDK 17**, Android platform **35**, and build tools **35.0.0**.
2. Clone this repository and open it in Android Studio. Let Gradle sync.
3. From the repository root, run:

```sh
./gradlew assembleDebug
```

The output is `app/build/outputs/apk/debug/app-debug.apk`. On Windows, use `gradlew.bat assembleDebug`. Outside Android Studio, set `ANDROID_HOME` to your SDK directory, or add its path as `sdk.dir` in an untracked `local.properties` file. The wrapper downloads pinned Gradle 8.11.1; AGP is pinned to 8.9.2. An internet connection is needed only to fetch build tools and dependencies.

For a production release, provide your own protected signing configuration and run `assembleRelease`. Signing keys must never be committed to this repository.

## Test

Node 22 or later is recommended. The game engines have no JavaScript runtime dependencies; DOM interaction tests use jsdom; browser layout checks use Playwright. Both are development-only dependencies:

```sh
npm ci
npm test
npm run check
./gradlew lintDebug
```

The rule tests cover all 24 families, including shortest Hanoi solutions, legal traffic/frog/river solutions, both cube sizes and their inverse turns, Sudoku completion, Lights Out solvability, repeated-color feedback, tangram overlap detection, and arithmetic parser validation.

For browser checks, run `npx playwright install chromium` followed by `npm run test:browser`. These check all 24 screens at five viewport widths, move animations, reduced motion, and the 3D cube; screenshots are workflow artifacts for review.

The GitHub Actions workflow runs these checks, builds the Android APK, and uploads the APK and lint report as workflow artifacts on pushes and pull requests.

## Architecture

- `app/src/main/java/mg/kilalao/app/MainActivity.java`: native Android Activity, local HTTPS asset interception, external browser links, Android back handling and dialogs.
- `app/src/main/assets/engines.js`: deterministic, DOM-independent game rules and solving helpers.
- `app/src/main/assets/ui.js`: responsive touch interface, undo, hints, local saves and learning navigation.
- `app/src/main/assets/cube3d.js`: local 3D cubies, sticker rendering, orbit controls, and layer animations.
- `app/src/main/assets/motion.js`: move animations and reduced-motion handling.
- `app/src/main/assets/catalog.js`: exactly 24 families; variants belong inside each family.
- `app/src/main/assets/learning.js`: original educational summaries and source links.
- `tests/engines.test.js`: game correctness tests.
- `tests/ui.test.js`: DOM interaction checks for navigation, saved games, controls, and drawing gestures. These are not a substitute for testing on an Android device.

No OpenAI API key, server, OpenAI API usage, or paid service is required. Games work offline; optional private updates require a read-only GitHub access token. The Android app bundles all its assets. Its local WebView cannot read arbitrary files or load remote content.

## Attribution

Source code retains this repository’s MIT license. Educational text and illustrations were written for Kilalao. Named games, commercial product names, and their trademarks belong to their respective owners; this is an independent educational app, not an official product of those publishers. Linked research belongs to its authors and is summarized, not reproduced.

### Mobile usability follow-up · 1.1.1

Category buttons wrap so every category is visible. On phones, the mode selector spans the available width and displays longer names clearly. Learning sections have persistent URLs; reloading retains the selected section and Android Back or Escape returns to Play before the catalogue. Keyboard focus survives board updates. Hanoi disks lift above the pegs during moves. The existing animated, orbitable 3D cubes are retained, with both sizes and all twelve turn directions covered by tests.

The expanded browser checks cover every available mode at five widths, short phones, landscape controls, and navigation across reloads and Back. Android builds and browser screenshots are available in the workflow artifacts.
