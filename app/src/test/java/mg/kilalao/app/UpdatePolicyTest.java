package mg.kilalao.app;

import org.junit.Test;
import static org.junit.Assert.*;

public class UpdatePolicyTest {
    private String metadata() {
        return "{\"applicationId\":\"mg.kilalao.app\",\"versionCode\":6,\"versionName\":\"1.2.1\",\"minSdk\":26,\"size\":100000,\"sha256\":\"" + "a".repeat(64)
            + "\",\"apkUrl\":\"" + UpdatePolicy.RELEASE_PREFIX + "v1.2.1/Kilalao-1.2.1.apk\"}";
    }
    @Test public void onlyOurReleaseAssetsAreAccepted() {
        assertTrue(UpdatePolicy.releaseAsset(UpdatePolicy.RELEASE_PREFIX+"v1.2.1/Kilalao.apk"));
        assertFalse(UpdatePolicy.releaseAsset("https://github.com/attacker/Kilalao/releases/download/v1/app.apk"));
        assertFalse(UpdatePolicy.releaseAsset("http://github.com/ARHeritiana/Kilalao/releases/download/v1/app.apk"));
        assertFalse(UpdatePolicy.safeTransport("https://github.com.evil.test/file"));
        assertFalse(UpdatePolicy.safeTransport("https://github.com@evil.test/file"));
        assertFalse(UpdatePolicy.safeTransport("https://github.com:444/file"));
        assertFalse(UpdatePolicy.safeTransport("file:///tmp/app.apk"));
        assertTrue(UpdatePolicy.safeTransport("https://release-assets.githubusercontent.com/path?token=test"));
    }
    @Test public void allSignersMustMatch() {
        assertTrue(UpdatePolicy.sameSigners(new String[]{"A","B"}, new String[]{"B","A"}));
        assertFalse(UpdatePolicy.sameSigners(new String[]{"A"}, new String[]{"B"}));
        assertFalse(UpdatePolicy.sameSigners(new String[]{"A","B"}, new String[]{"A"}));
        assertFalse(UpdatePolicy.sameSigners(null, new String[]{"A"}));
        assertFalse(UpdatePolicy.sameSigners(new String[0], new String[0]));
    }
    @Test public void validMetadataParses() throws Exception {
        ReleaseInfo info = new ReleaseInfo(metadata());
        assertEquals(6, info.code); assertEquals("1.2.1", info.version); assertEquals(100000, info.size);
    }
    @Test public void invalidMetadataIsRejected() throws Exception {
        String[] bad = {metadata().replace("mg.kilalao.app", "evil.app"), metadata().replace("100000", "999999999"),
            metadata().replace("100000", "0"), metadata().replace("\"versionCode\":6", "\"versionCode\":0"),
            metadata().replace("1.2.1", "<script>"), metadata().replace("a".repeat(64), "bad"),
            metadata().replace("ARHeritiana", "attacker"), "{}", "not JSON"};
        for (String json:bad) { try { new ReleaseInfo(json); fail("Accepted invalid metadata"); } catch (Exception expected) { /* rejected */ } }
    }
}
