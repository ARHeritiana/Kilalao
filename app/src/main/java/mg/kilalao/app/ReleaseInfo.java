package mg.kilalao.app;

import org.json.JSONObject;

final class ReleaseInfo {
    final int code, minSdk;
    final long size;
    final String version, apk, sha256;

    ReleaseInfo(String json) throws Exception {
        JSONObject o = new JSONObject(json);
        code = o.getInt("versionCode");
        minSdk = o.getInt("minSdk");
        size = o.getLong("size");
        version = o.getString("versionName");
        apk = o.getString("apkUrl");
        sha256 = o.getString("sha256");
        if (!"mg.kilalao.app".equals(o.getString("applicationId")) || code < 1 || minSdk < 26
            || size < 1 || size > UpdatePolicy.MAX_APK_BYTES || !version.matches("[0-9]+\\.[0-9]+\\.[0-9]+")
            || !sha256.matches("[0-9a-f]{64}") || !UpdatePolicy.releaseAsset(apk) || !apk.endsWith(".apk"))
            throw new IllegalArgumentException("Invalid update metadata");
    }
}
