package mg.kilalao.app;

import android.app.Activity;
import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JsPromptResult;
import android.webkit.JsResult;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.EditText;
import android.widget.Toast;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.net.URLConnection;
import java.util.HashMap;
import java.util.Map;

/** Offline games with a separate native updater; remote WebView content stays blocked. */
public final class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private WebView web;
    private AppUpdater updater;
    // The bundled game UI requires JS; remote content and file access are blocked.
    @SuppressLint("SetJavaScriptEnabled")
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        updater = new AppUpdater(this);
        web = new WebView(this);
        web.setBackgroundColor(Color.rgb(246,245,238));
        web.setOnApplyWindowInsetsListener((view,insets) -> {
            view.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(), insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            return insets.consumeSystemWindowInsets();
        });
        WebSettings settings=web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSupportMultipleWindows(false);
        web.addJavascriptInterface(new Object() {
            @JavascriptInterface public void checkForUpdates() { runOnUiThread(() -> updater.check(true)); }
            @JavascriptInterface public String version() { return BuildConfig.VERSION_NAME; }
        }, "KilalaoUpdates");
        web.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri=request.getUrl();
                if(!"https".equals(uri.getScheme()) || !HOST.equals(uri.getHost())) return empty(403,"Forbidden");
                String path=uri.getPath();
                if(path==null||!path.startsWith("/assets/")||path.contains("..")||path.contains("\\")) return empty(404,"Not Found");
                String name=path.substring(8);
                try {
                    String mime=URLConnection.guessContentTypeFromName(name);
                    if(name.endsWith(".js")) mime="application/javascript";
                    if(name.endsWith(".css")) mime="text/css";
                    if(mime==null) mime="application/octet-stream";
                    Map<String,String> headers=new HashMap<>();
                    headers.put("Cache-Control","no-cache");
                    headers.put("Content-Security-Policy","default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'self'");
                    return new WebResourceResponse(mime,"UTF-8",200,"OK",headers,getAssets().open(name));
                } catch(IOException e) { return empty(404,"Not Found"); }
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri=request.getUrl();
                if("https".equals(uri.getScheme())&&HOST.equals(uri.getHost())) return false;
                if("https".equals(uri.getScheme())||"http".equals(uri.getScheme())) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW,uri)); }
                    catch(ActivityNotFoundException e) { Toast.makeText(MainActivity.this,"No browser is installed.",Toast.LENGTH_SHORT).show(); }
                }
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onJsConfirm(WebView v,String url,String message,JsResult result) {
                new AlertDialog.Builder(MainActivity.this).setMessage(message).setPositiveButton("Yes",(d,w)->result.confirm()).setNegativeButton("Cancel",(d,w)->result.cancel()).setOnCancelListener(d->result.cancel()).show();return true;
            }
            @Override public boolean onJsPrompt(WebView v,String url,String message,String defaultValue,JsPromptResult result) {
                EditText input=new EditText(MainActivity.this);input.setText(defaultValue);
                new AlertDialog.Builder(MainActivity.this).setMessage(message).setView(input).setPositiveButton("Save",(d,w)->result.confirm(input.getText().toString())).setNegativeButton("Cancel",(d,w)->result.cancel()).setOnCancelListener(d->result.cancel()).show();return true;
            }
        });
        setContentView(web);
        web.requestApplyInsets();
        web.loadUrl("https://"+HOST+"/assets/index.html");
        updater.check(false);
    }
    private static WebResourceResponse empty(int status,String reason) {
        return new WebResourceResponse("text/plain","UTF-8",status,reason,null,new ByteArrayInputStream(new byte[0]));
    }
    @Override public void onBackPressed() {
        web.evaluateJavascript("navigateBack()",value -> {
            if(!"true".equals(value)) finish();
        });
    }
    @Override protected void onPause() { web.evaluateJavascript("saveGame()",null);web.onPause();super.onPause(); }
    @Override protected void onResume() { super.onResume();if(web!=null)web.onResume();if(updater!=null)updater.resume(); }
    @Override protected void onDestroy() { if(updater!=null)updater.close();if(web!=null){web.removeJavascriptInterface("KilalaoUpdates");web.destroy();web=null;}super.onDestroy(); }
}
