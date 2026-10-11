# Kilalao mobile UI review — 2026-10-11

Reviewed `ARHeritiana/Kilalao`, starting at main commit `6ecbc9d1f1e80620b4caacb2b7df7cc9f7da391d`. The repository already contained the 1.1.0 redesign, including full-width boards, a game action dock, move animations, and orbitable 3D cubes. This follow-up addresses defects left in that version.

## Findings and changes

| Concern | Verified finding | Result in 1.1.1 |
| --- | --- | --- |
| Cramped controls at the top | Phone mode selectors shared a tight row with status. | Status occupies its own row and the selector uses the available width. Existing 48px Back and favorite buttons remain. |
| Hidden menu choices | Category buttons were in a horizontally scrolling strip with no visible scrollbar. The 390px Home screenshot hid later categories. | Categories wrap into visible rows with targets at least 48px tall. |
| Counterintuitive navigation | Learning tabs changed the rendered screen without changing its URL. Reload lost the selected tab. Native Back jumped directly to Home. | Tabs have persistent URLs; browser Back restores the preceding section. Native Back and Escape return from learning to Play, then to Home. The saved position and Undo history survive. |
| Controls losing keyboard focus | Rebuilding the board removed the focused control. | Focus returns to the matching rebuilt control without forcing a scroll. |
| Game animations | The existing implementation animated real disks, tiles, captures, connections and cube layers. Hanoi disks followed a straight path through the pegs. | Hanoi disks now lift above the pegs. Existing cancellation, immediate saving, Undo and reduced-motion behavior are retained. |
| Rubik's cube in 3D | Both sizes already used CSS 3D cubies and actual engine sticker permutations. The 390px screenshot showed the cube rendered in perspective. | Retained orbit gestures, face selection and layer turns. Tests verify all six faces in both directions and both sizes. |

The expanded short-phone test also caught automatic scrolling placing cube controls behind the fixed action dock. Page scroll padding and control scroll margins now account for that dock.

No game families, variants, rule engines or research text were changed.

## Validation

- All 65 rule and DOM interaction tests pass locally, including three new navigation/focus regressions and the Hanoi lift assertion.
- JavaScript syntax checks pass.
- All ten browser checks passed in [GitHub Actions run #6](https://github.com/ARHeritiana/Kilalao/actions/runs/38158249345). They cover all available modes across 320, 360, 390, 480 and 800px widths; short phones and landscape; reachable controls; URL/reload/Back behavior; animations; reduced motion; cube turns; and phone screenshots.
- Local browser installation failed because the download returned an invalid archive. Browser checks passed remotely for source commit `a7cdca2aa681f60c367896e2874fca7bbc5a61ff`; Android assembleDebug and lintDebug also passed.
- Inspected the generated 390×844 Home, cube and Sudoku screenshots. All category buttons are visible, the mode selector spans its row, and cube turns and the Sudoku keypad fit above the dock.
- Physical Android appearance, touch handling and animation performance still require device testing. The Java-to-JavaScript Back bridge is covered by compilation/lint and its JavaScript behavior is tested; it has not been exercised on a device in this session.

## Delivery

These changes were merged into `main` through [PR #1](https://github.com/ARHeritiana/Kilalao/pull/1), merge commit `7c83c057e9285be7165249056b90ed11641ced17`. This review records the historical 1.1.1 validation; see [UPDATES.md](UPDATES.md) for the subsequent updater.

The tested APK is bundled as `APK/Kilalao-1.1.1-debug.apk`, with its checksum in `APK/SHA256SUMS`. Every bundled asset matches the reviewed source byte for byte. APK SHA-256: `d86073c8be12a85823fab9503ce827435ce9e45e87f312b6669c5a1c0e3e450e`.

The APK's debug signing certificate SHA-256 is `0d2d12cc83e689251b7f06391423e4b3622343aa9d1d238f7d758e60fd4b9d29`. It differs from the bundled 1.1.0 certificate, so Android cannot update that installation in place. Uninstalling an older installation deletes its saved games and progress. This is a development build, not a production release.
