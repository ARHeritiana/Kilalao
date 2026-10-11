# Kilalao — mathematics at play

An offline Android app with **24 mathematical and logic game families**, touch controls, saved positions, and a learning library explaining rules, strategies, mathematical ideas, and published research.

## Install

Download **[Kilalao-1.1.0-debug.apk](APK/Kilalao-1.1.0-debug.apk)** from this repository, open it on your Android device, and allow installation from that download source if Android asks. Requires **Android 8.0 or later** and an up-to-date Android System WebView. The APK is a signed development build, suitable for trying the app; it is not a Google Play release.

Play and the learning guides work without an internet connection. Source articles open in your usual browser. The app requests **no device or internet permissions**, contains no analytics or advertisements, and stores progress only on the device. Two-player games use pass-and-play; no account or online opponent is needed.

## Interface in 1.1.0

The phone interface has a compact game header, full-width boards, separate Play/Learn controls, and a fixed Undo/Hint/New game dock. Home navigation uses a bottom bar. Moves animate with moving disks/tiles, fading captures, drawn connections, and cell feedback; reduced-motion settings are respected. Both cube sizes have an orbitable CSS 3D display, labeled faces, and animated layer turns. No game families or variants were added.

**Upgrade from 1.0.x:** the earlier development signing key was lost when the previous workspace was cleared. This APK uses a new development certificate, so Android cannot install it over 1.0.x. Uninstalling the older app first deletes its locally saved games and progress. The new signing key is kept separately from the source repository for future builds.

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

No API key, server, OpenAI API usage, or paid service is required. The Android app bundles all its assets. Its local WebView cannot read arbitrary files or load remote content.

## Attribution

Source code retains this repository’s MIT license. Educational text and illustrations were written for Kilalao. Named games, commercial product names, and their trademarks belong to their respective owners; this is an independent educational app, not an official product of those publishers. Linked research belongs to its authors and is summarized, not reproduced.
