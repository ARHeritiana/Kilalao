# Kilalao 1.2.0 release validation

Runtime source: main commit `b655170cf5f6dafd64af0312f9e9afb045d65aab` (later documentation/workflow edits do not change the APK).

- 67 game and DOM tests pass; JavaScript syntax checks pass.
- 11 browser checks, five native updater-policy tests, Android debug build and lint pass in the Android build workflow.
- Permanent signed release build, all five native policy tests and Android release lint pass locally with Gradle 8.11.1 / JDK 17 / SDK 35.
- The API 30 emulator test reaches Android Settings through the actual native updater, verifies the APK and a deliberately corrupt checksum, and checks Android Keystore encryption/removal of a fixture credential.
- After granting installation permission, the host force-stops and restarts the app. The updater recovers private pending metadata, verifies the APK again and opens Android's installer. Android replaces the lower-version baseline; the follow-up instrumentation confirms the expected installed version, saved Hanoi move, favorite and working undo history.
- Installer test uses two APKs signed by the same isolated CI test key. A repeat using the permanent release key is available once the four signing secrets are configured.

Installer evidence: [Android update installation run](https://github.com/ARHeritiana/Kilalao/actions/runs/38229624032/job/114745612467), both instrumentation stages report `OK (1 test)` and the host reports `PASS`.

## APK identity

- Package: `mg.kilalao.app`; version name `1.2.0`; version code `5`; minimum Android API `26`.
- APK bytes: `87052`.
- APK SHA-256: `5d381dcd56b837b3ac5afb83e315bb8a6d5360c11997fce1303c9d4cb6b1a41c`.
- Permanent certificate SHA-256: `4c466152505fbb2ab703611395433f28b13cfe48bf7104ce0c8f6278ba559e6f`.
- APK Signature Scheme v2 verification passes. The private key and passwords are backed up outside the repository and are never release assets.

## Remaining activation checks

The release is private. Its authenticated download check is run after publication. Future automatic release signing requires the four encrypted GitHub Actions secrets documented in `UPDATES.md`; they are not yet configured. Physical phone testing and migration from older APKs with incompatible temporary certificates remain separate from the compatible-update tests above.
