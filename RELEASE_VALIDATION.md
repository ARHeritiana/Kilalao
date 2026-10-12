# Kilalao 1.2.1 release validation

Runtime source: main commit `6a6054d31254cbaa6cf9674ceb488adf7a631486` (later documentation/workflow edits do not change the APK).

- 67 game and DOM tests pass; JavaScript syntax checks pass.
- 11 browser checks, six native updater-policy tests, Android debug build and lint pass in the Android build workflow.
- Permanent signed release build, all six native policy tests and Android release lint pass locally with Gradle 8.11.1 / JDK 17 / SDK 35.
- The API 30 emulator test reaches Android Settings through the actual native updater, verifies the APK and a deliberately corrupt checksum, and checks Android Keystore encryption/removal of a fixture credential.
- After granting installation permission, the host force-stops and restarts the app. The updater recovers private pending metadata, verifies the APK again and opens Android's installer. Android replaces the lower-version baseline; the follow-up instrumentation confirms the expected installed version, saved Hanoi move, favorite and working undo history.
- The installer and authenticated-download checks were repeated successfully using the permanent release key from the four encrypted repository Actions secrets on 2026-10-12. The recovered key's certificate fingerprint matches the published 1.2.1 APK.

Installer evidence: [Android update installation run](https://github.com/ARHeritiana/Kilalao/actions/runs/38232967158/job/114756656539), both instrumentation stages report `OK (1 test)` and the host reports `PASS`.

The build and installer workflows above both completed successfully. Credential regression tests cover variable-length JWT tokens, bounds, whitespace and header-injection rejection.

## APK identity

- Package: `mg.kilalao.app`; version name `1.2.1`; version code `6`; minimum Android API `26`.
- APK bytes: `87084`.
- APK SHA-256: `55b844a19b989e7170e631e5d08ffb518871e6345aae065c23e3e02acef600fd`.
- Permanent certificate SHA-256: `4c466152505fbb2ab703611395433f28b13cfe48bf7104ce0c8f6278ba559e6f`.
- APK Signature Scheme v2 verification passes. The private key and passwords are backed up outside the repository and are never release assets.

## Release activation completed

The release is private. The [authenticated native download run](https://github.com/ARHeritiana/Kilalao/actions/runs/38233559659/job/114758602527) completed successfully after publication: all three instrumentation stages passed. The native updater retrieved the latest private release and its metadata/APK with an ephemeral Contents: read-only Actions token, verified downloaded size/checksum/package/version, then removed that device credential. All four encrypted GitHub Actions signing secrets documented in `UPDATES.md` are now configured. The [permanent-key installation and private-download run](https://github.com/ARHeritiana/Kilalao/actions/runs/38252805781/job/114823129990) completed successfully on main commit `f161908d2186edef92572c2a7ee912b7f03df87b`: the release APK, lower-version baseline and test harness built with the permanent key; all three instrumentation stages reported `OK (1 test)`, and the installer/progress-retention host check reported `PASS`. The workflow removed its temporary signing material afterward. No signing or authenticated-release activation task remains. Physical phone testing and migration from older APKs with incompatible temporary certificates remain separate from the compatible-update tests above.
