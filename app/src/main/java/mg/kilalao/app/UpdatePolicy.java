package mg.kilalao.app;

import java.net.URI;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/** Shared, testable limits for the native updater. */
final class UpdatePolicy {
    static final String REPOSITORY = "ARHeritiana/Kilalao";
    static final String RELEASE_PREFIX = "https://github.com/" + REPOSITORY + "/releases/download/";
    static final String API_PREFIX = "https://api.github.com/repos/" + REPOSITORY + "/";
    static final long MAX_APK_BYTES = 64L * 1024 * 1024;
    private UpdatePolicy() {}

    static boolean releaseAsset(String url) {
        return url != null && url.startsWith(RELEASE_PREFIX) && safeTransport(url);
    }

    static boolean apiAsset(String url) {
        return url != null && url.matches(java.util.regex.Pattern.quote(API_PREFIX + "releases/assets/") + "[1-9][0-9]*");
    }

    static boolean credentialDestination(String url) {
        return API_PREFIX.concat("releases/latest").equals(url) || API_PREFIX.substring(0,API_PREFIX.length()-1).equals(url) || apiAsset(url);
    }

    static boolean safeTransport(String url) {
        try {
            URI u = new URI(url);
            return "https".equals(u.getScheme()) && u.getUserInfo() == null
                && (u.getPort() == -1 || u.getPort() == 443)
                && ("api.github.com".equals(u.getHost()) || "github.com".equals(u.getHost())
                    || "release-assets.githubusercontent.com".equals(u.getHost()));
        } catch (Exception e) { return false; }
    }

    static boolean sameSigners(String[] installed, String[] downloaded) {
        if (installed == null || downloaded == null || installed.length == 0 || downloaded.length == 0) return false;
        Set<String> a = new HashSet<>(Arrays.asList(installed));
        Set<String> b = new HashSet<>(Arrays.asList(downloaded));
        return a.equals(b);
    }
}
