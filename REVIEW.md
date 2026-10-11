# Kilalao review — 2026-10-11

Reviewed baseline: e83a641583f15a734ff86be961994f968e47bc09 (1.0.0). Corrections are delivered in version 1.0.1.

## Scope and method

Read the implementations of all 24 game families, UI routing and controls, saved-state and completion handling, learning guides and variant notes, native Android Activity, manifest, backup rules, Gradle configuration, wrapper configuration, dependency lockfile, CI workflow, and existing checks. Reproduced confirmed failures before fixing them and reviewed the resulting source changes.

Research review checked central historical and mathematical assertions against the cited original papers, author pages, journal records, and university resources. This was a source and consistency review, not a new survey of all research or independent proof of every cited theorem.

## Confirmed errors and corrections

| Area | Failure in 1.0.0 | Correction |
| --- | --- | --- |
| Sprouts geometry | A path from a dot out along a segment and directly back was accepted as a loop despite overlapping itself. Junction exemptions skipped entire segments. | Check intersections of every segment pair; allow a shared endpoint alone, never a shared interval. |
| Sprouts input | A legal straight stroke with only two sampled points was rejected. Repeated endpoint samples could make valid connections fail, and splitting a curve could create zero-length edge segments. | Normalize duplicate samples, accept legal straight strokes, preserve valid endpoint junctions, and normalize older stored edge samples during validation. |
| Tangram bounds | Only a piece's anchor was bounded, allowing the entire polygon to disappear outside the board. | Bound the full transformed polygon after dragging, rotating, or flipping. Repair off-board pieces when opening or undoing an older saved position. |
| Multitouch | A second pointer could replace the active Tangram drag and move the wrong piece. Sprouts also had no active-pointer ownership. | Bind each drawing/drag gesture to its starting pointer and ignore other pointers until completion/cancellation. |
| Misère Nim hint | Two single-counter heaps were incorrectly described as having no forced win because the normal-play XOR label was reused. | Apply the misère singleton parity rule separately, with an explicit distinction between even and odd counts. |
| Sprouts progress | Finishing by agreed concession did not update the completed-games counter. | Use the same once-per-session completion bookkeeping as other games, including protection against duplicate counting after undo. |
| Saved preferences | Valid JSON of the wrong type, including `null`, could stop startup or crash favorites/progress views. | Validate the root object, preferences, and completion-stat structure before use; retain valid sections. This does not claim to repair every possible corruption of a game board. |
| Learning wording | The general backward-analysis recipe said no-move positions lose without restricting that statement to normal play. The Sprouts rule prohibited all contact with existing curves, omitting shared endpoint dots. | State the normal-play qualification and the precise Sprouts endpoint exception. |

No confirmed incorrect author attribution or major theorem claim was found in the research assertions checked. Mathematical checks included the classic and restricted Hanoi move counts, normal/misère Nim distinction, Fibonacci/Wythoff and subtraction descriptions, Kayles/Grundy examples, frog and river crossing counts, Sudoku's 17-clue result, generalized puzzle complexity qualifications, Tangram's 13 convex shapes, and the cube's 20-face-turn metric qualification.

## Verification

See `VALIDATION.md` for build and test results. All 54 automated checks pass. Android lint reports no issues; the APK is signed with the same certificate as 1.0.0 and has version code 2. No runtime dependencies or device permissions were introduced.

The existing engine checks cover every family but do not exhaust every state of every game. Interaction checks cover all game screens and learning tabs, plus representative complete control flows. Separate enumeration checked uniqueness of the included Sudoku and all three Nonograms.

## Limits of the review

- No physical-device or emulator run; screen layout, Android lifecycle behavior, accessibility, and touch performance remain unverified on real hardware.
- Sprouts remains a sampled drawing implementation with a minimum curve length and agreed concession; this review does not establish a complete topological end-of-game detector.
- Source retrieval succeeded for the checked academic records, but one publisher's Lights Out DOI page could not be retrieved through the review browser. The independent academic Lights Out reference was accessible; the publisher error was not treated as proof of a broken DOI.
- Automated checks and dependency audit results describe this build and the review date, not a guarantee that every possible defect has been eliminated.

Only confirmed-error corrections, regression checks, version/build metadata, and the rebuilt APK are included. Product and design recommendations are reported in the conversation and were not implemented.
