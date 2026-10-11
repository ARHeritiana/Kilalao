# Android updates

Kilalao 1.2.0 adds an **Updates** button in the app header and a startup check at most once every 24 hours after a successful check. Games and learning remain offline. Only the native updater contacts GitHub; the game WebView still cannot load remote scripts or make network requests. Failed automatic checks are silent; the button reports errors and can retry immediately.

The updater reads this repository's latest stable GitHub Release and its `update.json` asset. It offers a newer compatible Android version, downloads only after the user agrees, verifies the exact byte count and SHA-256, and checks application ID, version code/name, and all signing certificates against the installed app. HTTP and unknown download/redirect hosts are rejected. Downloads are bounded to 64 MiB. Android then asks the user to allow installation from Kilalao, if needed, and to confirm the update. A normal compatible update preserves local games and progress. No storage permission or analytics is added.

## Release activation

The old 1.0.x, 1.1.0 and 1.1.1 APKs used different temporary signing certificates. None of their private signing keys is available in the resumed workspace. Android cannot update these installations with a newly signed release. The updater rejects such mismatches and never instructs the user to uninstall. Keep any installation whose saved progress you need. The first permanent release will require a separate migration decision for old installations; this version does not implement progress export/import.

Before publishing the first stable APK, retain a permanent Java keystore **outside this public repository** and configure these repository Actions secrets:

| Secret | Value |
| --- | --- |
| `KILALAO_KEYSTORE_BASE64` | Base64 of the permanent keystore, stored only as an encrypted GitHub secret |
| `KILALAO_STORE_PASSWORD` | Keystore password |
| `KILALAO_KEY_ALIAS` | Signing key alias |
| `KILALAO_KEY_PASSWORD` | Private key password |

Keep a private backup of that keystore and its passwords. Use the same key for every future release. No signing keys or passwords belong in source, artifacts, or release assets. The workflow fails when any signing secret is missing; it never publishes a runner's temporary debug certificate.

1. Commit source changes and increment both `versionCode` and `versionName` in `app/build.gradle`; keep `package.json`, `package-lock.json`, and the browser fallback label in `updates.js` consistent.
2. Run **Publish Android update** from the Actions page on **main**. It refuses other branches.
3. The workflow runs game/DOM checks, browser checks, Android unit tests and release lint, builds with the persistent certificate, verifies the APK signature, and publishes an APK, `update.json`, and `SHA256SUMS` in a stable GitHub Release for the tested main commit.
4. The repository must be public so devices can fetch the release without an account or embedded token. The app's next startup check or Updates button then discovers it.

Debug APKs and build artifacts are for testing and are never advertised as stable updates. Existing release tags are not overwritten. Cancelled or failed downloads leave saved game data untouched. Physical device coverage (permission round-trip, package installer, and progress retention across two permanently signed versions) is still required before claiming end-to-end installation verification.
