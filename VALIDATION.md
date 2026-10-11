# Kilalao 1.0.1 validation

Validated on 2026-10-11.

- Fresh `npm ci --ignore-scripts` installation succeeded.
- 54 automated game-rule and DOM interaction checks passed (45 original checks plus nine regression checks).
- All 24 game screens and 72 main learning tabs rendered without JavaScript errors in jsdom.
- Regression coverage includes invalid Sprouts loops, legitimate strokes and endpoint junctions, Tangram bounds and saved positions, a second pointer during a drag, misère endgame hints, concession counting, and malformed saved preferences.
- JavaScript syntax checks passed.
- `npm audit --json` reported zero known vulnerabilities in the 39 development packages at review time. No JavaScript runtime dependencies are bundled.
- Android `assembleDebug` and `lintDebug` completed successfully; lint reported no issues.
- Android build-tools verified the APK signature. Its signing certificate matches version 1.0.0.
- Package: `mg.kilalao.app`; version name 1.0.1; version code 2; minimum API 26; target API 35; no requested permissions.
- Independent enumeration confirmed a unique solution for the base Sudoku and each of the three bundled Nonograms. Digit permutation preserves Sudoku uniqueness.
- Independent small-position recurrences checked the subtraction {1,3,4} remainder rule through 100 counters and the stated Grundy examples.

This is a signed development APK. No emulator or physical Android device test was performed. DOM tests do not establish device rendering, touch performance, or lifecycle behavior. GitHub Actions configuration was reviewed; its remote run result was not inspected.

`APK/SHA256SUMS` accompanies the APK. See `REVIEW.md` for the review scope, confirmed errors, corrections, and limitations.
