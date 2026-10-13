# Android updates

Kilalao has a **Check for updates** button on the Progress screen and a startup check at most once every 24 hours after a successful check. Games and learning remain offline. Private releases are supported with a device-local GitHub fine-grained token limited to this repository and Contents: read-only. Choose **Check for updates → Private update access** to connect or remove it. Android Keystore encrypts the token; neither JavaScript nor the APK contains it. It is sent only to exact GitHub API endpoints for this repository, never to redirected CDN hosts. Only the native updater contacts GitHub; the game WebView still cannot load remote scripts or make network requests. Failed automatic checks are silent; the button reports errors and can retry immediately.

The updater reads this repository's latest stable GitHub Release and its `update.json` asset. It offers a newer compatible Android version, downloads only after the user agrees, verifies the exact byte count and SHA-256, and checks application ID, version code/name, and all signing certificates against the installed app. HTTP and unknown download/redirect hosts are rejected. Downloads are bounded to 64 MiB. Android then asks the user to allow installation from Kilalao, if needed, and to confirm the update. Verified pending updates are stored privately, survive an app-process restart during the permission step, and are checked again before installation. A normal compatible update preserves local games and progress. No storage permission or analytics is added.

## Release activation

Every stable release since 1.2.0 is signed with the permanent Kilalao certificate, so each one updates the previous one in place and keeps progress. The updater accepts GitHub's variable-length JWT installation tokens and rejects whitespace and header-injection characters.

The 1.0.x and 1.1.x development APKs used temporary certificates whose keys no longer exist. Android cannot update those installations. The updater rejects the mismatch and never asks the user to uninstall. Progress export/import is not implemented.

The release workflow needs the permanent Java keystore, kept **outside this repository**, in these repository Actions secrets:

| Secret | Value |
| --- | --- |
| `KILALAO_KEYSTORE_BASE64` | Base64 of the permanent keystore, stored only as an encrypted GitHub secret |
| `KILALAO_STORE_PASSWORD` | Keystore password |
| `KILALAO_KEY_ALIAS` | Signing key alias |
| `KILALAO_KEY_PASSWORD` | Private key password |

Keep a private backup of that keystore and its passwords. Use the same key for every future release. No signing keys or passwords belong in source, artifacts, or release assets. The workflow fails when any signing secret is missing; it never publishes a runner's temporary debug certificate.

1. Commit source changes and increment both `versionCode` and `versionName` in `app/build.gradle`; keep `package.json`, `package-lock.json` and the browser fallback version in `updates.js` and `ui.js` consistent.
2. Run **Publish Android update** from the Actions page on **main**. It refuses other branches.
3. The workflow runs game/DOM checks, browser checks, Android unit tests and release lint, builds with the persistent certificate, verifies the APK signature, installs it over the previous version on an emulator to confirm progress is kept, and publishes an APK, `update.json`, and `SHA256SUMS` in a stable GitHub Release for the tested main commit.
4. Keep the repository private. On each authorized device, connect private update access using a fine-grained GitHub token for this repository with Contents: read-only. The app's next startup check, or **Check for updates**, then finds the release. If the repository later becomes public, no device token is required.

Debug APKs and build artifacts are for testing and are never advertised as stable updates. Existing release tags are not overwritten. Cancelled or failed downloads leave saved game data untouched. Physical phone performance still needs user device testing.
