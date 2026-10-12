package mg.kilalao.app;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.widget.Toast;
import android.widget.EditText;
import android.text.InputType;
import android.view.View;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

/** Native networking only; the game WebView remains isolated from the internet. */
final class AppUpdater {
    private final Activity activity;
    private final ExecutorService worker = Executors.newSingleThreadExecutor();
    private final AtomicBoolean busy = new AtomicBoolean();
    private volatile boolean closed;
    private volatile HttpURLConnection activeConnection;
    private AlertDialog progress;
    private volatile File ready;
    private volatile ReleaseInfo pendingInfo;
    private final UpdateCredentials credentials;
    private String downloadUrl;
    private static final class AccessRequired extends Exception {}

    AppUpdater(Activity activity) {
        this.activity = activity; credentials = new UpdateCredentials(activity);
        try {
            File metadata = pendingMetadata();
            if (metadata.isFile() && metadata.length() <= 16384) {
                String json = new String(java.nio.file.Files.readAllBytes(metadata.toPath()), StandardCharsets.UTF_8);
                pendingInfo = new ReleaseInfo(json);
                if (pendingInfo.code > installedCode()) ready = UpdateApkProvider.file(activity);
                else clearPending();
            }
        } catch (Exception e) { clearPending(); }
    }

    void showMenu() {
        if (!closed) new AlertDialog.Builder(activity).setTitle("Kilalao " + BuildConfig.VERSION_NAME)
            .setItems(new String[]{"Check for updates", "Private update access"}, (d,which) -> {
                if (which == 0) check(true); else manageAccess();
            }).setNegativeButton("Close", null).show();
    }

    void check(boolean manual) {
        if (closed) return;
        if (ready != null) { if (manual) install(); return; }
        long last = activity.getPreferences(0).getLong("update-check", 0);
        if (!manual && System.currentTimeMillis() - last < 24L*60*60*1000) return;
        if (!busy.compareAndSet(false, true)) { if (manual) toast("An update check or download is already running."); return; }
        if (manual) toast("Checking for updates…");
        worker.execute(() -> {
            try {
                String response = text("https://api.github.com/repos/" + UpdatePolicy.REPOSITORY + "/releases/latest", 256*1024);
                ReleaseInfo info = null;
                if (response != null) {
                    JSONObject release = new JSONObject(response);
                    if (release.optBoolean("draft") || release.optBoolean("prerelease")) throw new Exception("Not a stable release");
                    JSONArray assets = release.getJSONArray("assets");
                    String metadata = null;
                    String apkAsset = null;
                    for (int i=0; i<assets.length(); i++) {
                        JSONObject asset = assets.getJSONObject(i);
                        if ("update.json".equals(asset.getString("name"))) metadata = asset.getString("url");
                    }
                    if (!UpdatePolicy.apiAsset(metadata)) throw new Exception("No verified update metadata");
                    info = new ReleaseInfo(text(metadata, 16384));
                    for (int i=0; i<assets.length(); i++) {
                        JSONObject asset = assets.getJSONObject(i);
                        if (info.apk.equals(asset.getString("browser_download_url"))) apkAsset = asset.getString("url");
                    }
                    if (!UpdatePolicy.apiAsset(apkAsset)) throw new Exception("APK is missing from this release");
                    downloadUrl = apkAsset;
                } else {
                    // GitHub deliberately returns 404 for inaccessible private repositories.
                    text(UpdatePolicy.API_PREFIX.substring(0,UpdatePolicy.API_PREFIX.length()-1), 65536);
                }
                activity.getPreferences(0).edit().putLong("update-check", System.currentTimeMillis()).apply();
                if (info != null && info.code > installedCode()) {
                    ReleaseInfo next = info;
                    ui(() -> {
                        if (next.minSdk > Build.VERSION.SDK_INT) { if (manual) toast("The latest update requires a newer Android version."); return; }
                        new AlertDialog.Builder(activity).setTitle("Kilalao " + next.version + " is available")
                            .setMessage("Download the update from the Kilalao GitHub repository? Your games and progress will be kept. Android will ask you to confirm installation.")
                            .setPositiveButton("Download update", (d,w) -> download(next))
                            .setNegativeButton("Later", null).show();
                    });
                } else if (manual) toast(info == null ? "No published update is available yet." : "Kilalao is up to date.");
            } catch (AccessRequired e) { if (manual) ui(this::connectPrivateUpdates); }
            catch (Exception e) { if (manual) toast("Could not check for updates. Check your internet connection and try again."); }
            finally { busy.set(false); }
        });
    }

    private void download(ReleaseInfo info) {
        if (closed || !busy.compareAndSet(false, true)) return;
        progress = new AlertDialog.Builder(activity).setTitle("Downloading Kilalao " + info.version)
            .setMessage("Downloading and verifying the update… You can continue after this finishes.")
            .setCancelable(false).show();
        worker.execute(() -> {
            File partial = new File(activity.getFilesDir(), "update.part");
            boolean staged = false;
            try {
                MessageDigest digest = MessageDigest.getInstance("SHA-256");
                long bytes;
                try (OutputStream out = new FileOutputStream(partial)) { bytes = transfer(downloadUrl, info.size, out, digest, false); }
                if (bytes != info.size || !info.sha256.equals(hex(digest.digest()))) throw new Exception("Checksum mismatch");
                if (!verifyCandidate(partial, info)) {
                    ui(() -> new AlertDialog.Builder(activity).setTitle("This update cannot be installed safely")
                        .setMessage("The downloaded app does not match this installation's version or signing certificate. Keep this installation to preserve your saved progress. Older development builds may use a different certificate.")
                        .setPositiveButton("OK", null).show());
                    return;
                }
                File target = UpdateApkProvider.file(activity);
                if (target.exists() && !target.delete()) throw new Exception("Could not replace previous update");
                if (!partial.renameTo(target)) throw new Exception("Could not save verified update");
                rememberPending(info);
                staged = true;
            } catch (Exception e) { toast("The update could not be downloaded or verified. Your saved games are unchanged. Try again later."); }
            finally {
                if (partial.exists()) partial.delete();
                busy.set(false);
                ui(() -> { if (progress != null) { progress.dismiss(); progress = null; } });
                if (staged) ui(this::install);
            }
        });
    }

    boolean verifyCandidate(File file, ReleaseInfo info) throws Exception {
        if (!file.isFile() || file.length() != info.size) return false;
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        try (InputStream in = new java.io.FileInputStream(file)) {
            byte[] buffer = new byte[8192]; int n;
            while ((n=in.read(buffer)) != -1) digest.update(buffer,0,n);
        }
        if (!info.sha256.equals(hex(digest.digest()))) return false;
        PackageManager pm = activity.getPackageManager();
        PackageInfo apk = pm.getPackageArchiveInfo(file.getAbsolutePath(), signatureFlags());
        PackageInfo installed = pm.getPackageInfo(activity.getPackageName(), signatureFlags());
        return apk != null && activity.getPackageName().equals(apk.packageName) && versionCode(apk) == info.code
            && info.version.equals(apk.versionName) && versionCode(apk) > versionCode(installed)
            && apk.applicationInfo != null && apk.applicationInfo.minSdkVersion == info.minSdk
            && info.minSdk <= Build.VERSION.SDK_INT && UpdatePolicy.sameSigners(signers(installed), signers(apk));
    }

    private File pendingMetadata() { return new File(activity.getFilesDir(), "pending-update.json"); }

    void rememberPending(ReleaseInfo info) throws Exception {
        try (FileOutputStream out = new FileOutputStream(pendingMetadata())) {
            out.write(info.json.getBytes(StandardCharsets.UTF_8)); out.getFD().sync();
        }
        pendingInfo = info; ready = UpdateApkProvider.file(activity);
    }

    private void clearPending() {
        pendingMetadata().delete(); UpdateApkProvider.file(activity).delete();
        pendingInfo = null; ready = null;
    }

    private void install() {
        if (ready == null || !ready.isFile()) return;
        if (!activity.getPackageManager().canRequestPackageInstalls()) {
            new AlertDialog.Builder(activity).setTitle("Allow Kilalao updates")
                .setMessage("Android needs your permission to install this downloaded update. Enable “Allow from this source”, then return to Kilalao.")
                .setPositiveButton("Open Android settings", (d,w) -> {
                    try { activity.startActivity(new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + activity.getPackageName()))); }
                    catch (ActivityNotFoundException e) { toast("Update installation settings are unavailable on this device."); }
                }).setNegativeButton("Later", null).show();
            return;
        }
        if (closed || !busy.compareAndSet(false, true)) return;
        File candidate = ready; ReleaseInfo info = pendingInfo;
        worker.execute(() -> {
            try {
                if (info == null || !verifyCandidate(candidate, info)) {
                    clearPending(); toast("The saved update could not be verified. Please check for updates again.");
                    return;
                }
                ui(this::openInstaller);
            } catch (Exception e) { clearPending(); toast("The saved update could not be verified. Please check for updates again."); }
            finally { busy.set(false); }
        });
    }

    private void openInstaller() {
        Uri uri = UpdateApkProvider.uri();
        Intent intent = new Intent(Intent.ACTION_VIEW).setDataAndType(uri, "application/vnd.android.package-archive")
            .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        intent.setClipData(ClipData.newRawUri("Kilalao update", uri));
        try {
            // Game data is persisted by MainActivity.onPause before the installer replaces the app.
            activity.startActivity(intent); ready = null;
        } catch (ActivityNotFoundException e) { toast("No Android package installer is available."); }
    }

    void resume() {
        if (ready != null && activity.getPackageManager().canRequestPackageInstalls()) install();
    }

    private String text(String url, int limit) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        long size = transfer(url, limit, out, null, url.endsWith("/releases/latest"));
        return size < 0 ? null : new String(out.toByteArray(), StandardCharsets.UTF_8);
    }

    private long transfer(String start, long limit, OutputStream out, MessageDigest digest, boolean allowNotFound) throws Exception {
        String url = start;
        for (int redirect=0; redirect<6; redirect++) {
            if (closed || !UpdatePolicy.safeTransport(url)) throw new Exception("Untrusted update URL");
            HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
            activeConnection = conn;
            conn.setInstanceFollowRedirects(false); conn.setConnectTimeout(15000); conn.setReadTimeout(20000);
            conn.setRequestProperty("User-Agent", "Kilalao-Android");
            conn.setRequestProperty("Accept", UpdatePolicy.apiAsset(url) ? "application/octet-stream" : "application/vnd.github+json");
            conn.setRequestProperty("X-GitHub-Api-Version", "2022-11-28");
            // Never forward the credential to GitHub's CDN or any redirected host/path.
            try {
                if (UpdatePolicy.credentialDestination(url)) {
                    String token = credentials.read();
                    if (token != null) conn.setRequestProperty("Authorization", "Bearer " + token);
                }
                int status = conn.getResponseCode();
                if (status == 404 && allowNotFound && redirect == 0) return -1;
                if ((status == 401 || status == 403 || status == 404) && UpdatePolicy.credentialDestination(url)) throw new AccessRequired();
                if (status == 301 || status == 302 || status == 303 || status == 307 || status == 308) {
                    String location = conn.getHeaderField("Location");
                    if (location == null) throw new Exception("Missing redirect");
                    url = new URL(new URL(url), location).toString(); continue;
                }
                if (status != 200 || conn.getContentLengthLong() > limit) throw new Exception("Update unavailable");
                long total = 0;
                try (InputStream input = conn.getInputStream()) {
                    byte[] buffer = new byte[8192]; int n;
                    while ((n=input.read(buffer)) != -1) {
                        if (closed || (total += n) > limit) throw new Exception("Update too large or cancelled");
                        out.write(buffer,0,n); if (digest != null) digest.update(buffer,0,n);
                    }
                }
                return total;
            } finally { conn.disconnect(); activeConnection = null; }
        }
        throw new Exception("Too many redirects");
    }

    private void connectPrivateUpdates() {
        EditText input = new EditText(activity);
        input.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD);
        input.setImportantForAutofill(View.IMPORTANT_FOR_AUTOFILL_NO_EXCLUDE_DESCENDANTS);
        input.setHint("GitHub fine-grained access token");
        new AlertDialog.Builder(activity).setTitle("Connect private updates")
            .setMessage("This repository is private. Enter a GitHub fine-grained token limited to ARHeritiana/Kilalao with Contents: read-only. It is encrypted on this device and sent only to GitHub's API. Never enter your GitHub password here.")
            .setView(input).setPositiveButton("Connect", (d,w) -> {
                try { credentials.save(input.getText().toString().trim()); activity.getPreferences(0).edit().remove("update-check").apply(); check(true); }
                catch (Exception e) { toast("Could not save update access. Use a valid fine-grained GitHub token."); }
                input.setText("");
            }).setNeutralButton("Remove saved access", (d,w) -> { credentials.clear(); toast("Private update access removed from this device."); })
            .setNegativeButton("Cancel", (d,w) -> input.setText("")).show();
    }

    void manageAccess() { if (!closed) connectPrivateUpdates(); }

    @SuppressWarnings("deprecation")
    private static int signatureFlags() { return Build.VERSION.SDK_INT >= 28 ? PackageManager.GET_SIGNING_CERTIFICATES : PackageManager.GET_SIGNATURES; }
    @SuppressWarnings("deprecation")
    private static long versionCode(PackageInfo p) { return Build.VERSION.SDK_INT >= 28 ? p.getLongVersionCode() : p.versionCode; }
    private long installedCode() throws Exception { return versionCode(activity.getPackageManager().getPackageInfo(activity.getPackageName(), 0)); }
    @SuppressWarnings("deprecation")
    private static String[] signers(PackageInfo p) throws Exception {
        Signature[] signatures = Build.VERSION.SDK_INT >= 28 && p.signingInfo != null ? p.signingInfo.getApkContentsSigners() : p.signatures;
        if (signatures == null) return null;
        String[] result = new String[signatures.length];
        for (int i=0; i<signatures.length; i++) result[i] = hex(MessageDigest.getInstance("SHA-256").digest(signatures[i].toByteArray()));
        return result;
    }
    private static String hex(byte[] bytes) { StringBuilder s = new StringBuilder(); for (byte b:bytes) s.append(String.format(java.util.Locale.ROOT,"%02x",b & 255)); return s.toString(); }
    private void ui(Runnable action) { activity.runOnUiThread(() -> { if (!closed && !activity.isFinishing() && !activity.isDestroyed()) action.run(); }); }
    private void toast(String text) { ui(() -> Toast.makeText(activity,text,Toast.LENGTH_LONG).show()); }
    void close() {
        closed = true; HttpURLConnection conn = activeConnection; if (conn != null) conn.disconnect(); worker.shutdownNow();
        if (progress != null) { progress.dismiss(); progress = null; }
    }
}
