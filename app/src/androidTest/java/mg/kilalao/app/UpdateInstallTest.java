package mg.kilalao.app;

import android.app.Instrumentation;
import android.content.Context;
import android.content.pm.PackageInfo;
import android.webkit.WebView;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import androidx.test.rule.ActivityTestRule;
import androidx.test.uiautomator.By;
import androidx.test.uiautomator.UiDevice;
import androidx.test.uiautomator.Until;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import static org.junit.Assert.*;

/** Two stages: prepare through Kilalao's real installer path; verify after replacement. */
@RunWith(AndroidJUnit4.class)
public class UpdateInstallTest {
    @Rule public ActivityTestRule<MainActivity> activityRule = new ActivityTestRule<>(MainActivity.class);
    private final Instrumentation instrumentation = InstrumentationRegistry.getInstrumentation();
    private WebView web() throws Exception {
        Field f = MainActivity.class.getDeclaredField("web"); f.setAccessible(true); return (WebView) f.get(activityRule.getActivity());
    }
    private String js(String source) throws Exception {
        CountDownLatch latch = new CountDownLatch(1); AtomicReference<String> result = new AtomicReference<>();
        WebView web = web();
        instrumentation.runOnMainSync(() -> web.evaluateJavascript(source, value -> { result.set(value); latch.countDown(); }));
        assertTrue("WebView response timed out",latch.await(15, TimeUnit.SECONDS)); return result.get();
    }
    private void waitForGame() throws Exception {
        for (int i=0;i<50;i++) { if ("true".equals(js("typeof transact === 'function'"))) return; Thread.sleep(200); }
        fail("Bundled game did not load: "+js("JSON.stringify({url:location.href,agent:navigator.userAgent,engine:typeof KilalaoEngine,ui:typeof transact})"));
    }
    private String metadata() throws Exception {
        try (InputStream input=instrumentation.getContext().getAssets().open("candidate.json")) {
            java.io.ByteArrayOutputStream out=new java.io.ByteArrayOutputStream();byte[] b=new byte[4096];int n;
            while((n=input.read(b))!=-1)out.write(b,0,n);return new String(out.toByteArray(),StandardCharsets.UTF_8);
        }
    }
    @Test public void prepareInstallerAndPermissionRoundTrip() throws Exception {
        waitForGame();
        assertEquals("1",js("location.hash='game/hanoi';route();current=E.init('hanoi');history=[];transact({from:0,to:1});data.favorites=['hanoi'];persist();current.moves"));
        Context target = instrumentation.getTargetContext();
        UpdateCredentials vault = new UpdateCredentials(target);
        String fixture = "github_pat_AndroidOnlyTestFixture000001";
        vault.save(fixture); assertEquals(fixture, vault.read());
        String ciphertext = target.getSharedPreferences("private-updates",0).getString("credential", "");
        assertFalse("Credential was stored in plaintext",ciphertext.contains(fixture));
        vault.clear(); assertNull(vault.read());
        File apk = UpdateApkProvider.file(target);
        try (InputStream input=instrumentation.getContext().getAssets().open("candidate.apk");FileOutputStream out=new FileOutputStream(apk)) {
            byte[] b=new byte[8192];int n;while((n=input.read(b))!=-1)out.write(b,0,n);
        }
        String json=metadata();
        ReleaseInfo info=new ReleaseInfo(json);
        Field f=MainActivity.class.getDeclaredField("updater");f.setAccessible(true);
        AppUpdater updater=(AppUpdater)f.get(activityRule.getActivity());
        assertTrue("Signed release failed the real APK checks",updater.verifyCandidate(apk,info));
        ReleaseInfo bad=new ReleaseInfo(json.replace(info.sha256,new String(new char[64]).replace('\0','0')));
        assertFalse("Corrupt checksum passed",updater.verifyCandidate(apk,bad));
        updater.rememberPending(info);
        Method install=AppUpdater.class.getDeclaredMethod("install");install.setAccessible(true);
        instrumentation.runOnMainSync(()->{try{install.invoke(updater);}catch(Exception e){throw new RuntimeException(e);}});
        UiDevice device=UiDevice.getInstance(instrumentation);
        assertTrue(device.wait(Until.hasObject(By.text("Allow Kilalao updates")),15000));
        androidx.test.uiautomator.UiObject2 settings=device.wait(Until.findObject(By.text(java.util.regex.Pattern.compile("(?i)open android settings"))),15000);
        assertNotNull("Android settings button is missing",settings);settings.click();
        assertTrue(device.wait(Until.hasObject(By.text("Allow from this source")),15000));
        // Changing this permission can kill the app. The host completes the round-trip
        // after instrumentation exits, then tests pending-update recovery on restart.
    }
    @Test public void verifyAfterReplacement() throws Exception {
        PackageInfo installed=instrumentation.getTargetContext().getPackageManager().getPackageInfo("mg.kilalao.app",0);
        ReleaseInfo expected=new ReleaseInfo(metadata());
        assertEquals(expected.code,installed.getLongVersionCode());
        waitForGame();
        assertEquals("1",js("JSON.parse(localStorage.getItem('kilalao-v1')).sessions.hanoi.state.moves"));
        assertEquals("true",js("JSON.parse(localStorage.getItem('kilalao-v1')).favorites.includes('hanoi')"));
        assertEquals(org.json.JSONObject.quote(expected.version),js("KilalaoUpdates.version()"));
        assertEquals("false",js("location.hash='game/hanoi';route();undo();current.moves!==0"));
    }
    @Test public void verifyAuthenticatedPrivateReleaseDownload() throws Exception {
        String token=InstrumentationRegistry.getArguments().getString("githubToken");
        assertNotNull("The private download check requires an ephemeral CI token",token);
        Context target=instrumentation.getTargetContext();UpdateCredentials vault=new UpdateCredentials(target);
        vault.save(token);
        try {
            Field field=MainActivity.class.getDeclaredField("updater");field.setAccessible(true);
            AppUpdater updater=(AppUpdater)field.get(activityRule.getActivity());
            Method text=AppUpdater.class.getDeclaredMethod("text",String.class,int.class);text.setAccessible(true);
            String json=(String)text.invoke(updater,UpdatePolicy.API_PREFIX+"releases/latest",256*1024);
            assertNotNull("There is no published private release to test",json);
            org.json.JSONArray assets=new org.json.JSONObject(json).getJSONArray("assets");
            String metadataUrl=null;
            for(int i=0;i<assets.length();i++)if("update.json".equals(assets.getJSONObject(i).getString("name")))metadataUrl=assets.getJSONObject(i).getString("url");
            assertTrue(UpdatePolicy.apiAsset(metadataUrl));
            ReleaseInfo info=new ReleaseInfo((String)text.invoke(updater,metadataUrl,16384));
            String apkUrl=null;
            for(int i=0;i<assets.length();i++)if(info.apk.equals(assets.getJSONObject(i).getString("browser_download_url")))apkUrl=assets.getJSONObject(i).getString("url");
            assertTrue(UpdatePolicy.apiAsset(apkUrl));
            File apk=new File(target.getFilesDir(),"private-download-test.apk");
            java.security.MessageDigest digest=java.security.MessageDigest.getInstance("SHA-256");
            Method transfer=AppUpdater.class.getDeclaredMethod("transfer",String.class,long.class,java.io.OutputStream.class,java.security.MessageDigest.class,boolean.class);transfer.setAccessible(true);
            try(FileOutputStream out=new FileOutputStream(apk)) {
                assertEquals(info.size,((Long)transfer.invoke(updater,apkUrl,info.size,out,digest,false)).longValue());
            }
            StringBuilder hash=new StringBuilder();for(byte b:digest.digest())hash.append(String.format(java.util.Locale.ROOT,"%02x",b&255));
            assertEquals(info.sha256,hash.toString());
            PackageInfo downloaded=target.getPackageManager().getPackageArchiveInfo(apk.getAbsolutePath(),0);
            assertNotNull(downloaded);assertEquals("mg.kilalao.app",downloaded.packageName);assertEquals(info.code,downloaded.getLongVersionCode());
            assertTrue(apk.delete());
        } finally { vault.clear(); }
    }
}
