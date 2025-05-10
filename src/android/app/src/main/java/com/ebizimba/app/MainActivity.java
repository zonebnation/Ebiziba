package com.ebizimba.islam;

import android.os.Bundle;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.content.pm.ActivityInfo;
import android.webkit.JavascriptInterface;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.ImageView;
import android.view.View;
import android.os.Handler;
import android.os.Looper;
import android.content.SharedPreferences;
import android.provider.Settings.Secure;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private boolean isBookViewer = false;
    private View splashScreen;
    private WebView webView;
    private static final String PREFS_NAME = "AppPrefs";
    private static final String FIRST_LAUNCH_KEY = "firstLaunch";
    private String deviceId;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Prevent screenshots and screen recording
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        );

        super.onCreate(savedInstanceState);
        
        // Keep screen on while app is running
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        
        // Get device ID
        deviceId = Secure.getString(getContentResolver(), Secure.ANDROID_ID);
        
        // Set up splash screen
        setupSplashScreen();
        
        // Get WebView instance
        webView = getBridge().getWebView();
        webView.setVisibility(View.INVISIBLE); // Hide initially
        
        WebSettings settings = webView.getSettings();
        
        // Enable hardware acceleration
        webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null);
        
        // Enable DOM storage and database
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        
        // Set cache mode
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        
        // Enable better memory management
        settings.setRenderPriority(WebSettings.RenderPriority.HIGH);
        
        // Enable JavaScript optimizations
        settings.setJavaScriptEnabled(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        
        // Enable better resource handling
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setLoadsImagesAutomatically(true);
        
        // Enable viewport meta tag
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        
        // Enable mixed content mode
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        
        // Enable better text rendering
        settings.setGeolocationEnabled(true);
        
        // Enable better scrolling
        webView.setScrollBarStyle(WebView.SCROLLBARS_INSIDE_OVERLAY);
        webView.setHorizontalScrollBarEnabled(false);
        
        // Enable better touch handling
        webView.setHapticFeedbackEnabled(true);

        // Add JavaScript interface for rotation control and device ID
        webView.addJavascriptInterface(new WebAppInterface(), "Android");

        // Set default orientation to portrait
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        
        // Hide splash screen after a shorter delay (2 seconds)
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            hideSplashScreen();
        }, 2000);
        
        // Check if this is first launch
        checkFirstLaunch();
    }
    
    private void checkFirstLaunch() {
        SharedPreferences settings = getSharedPreferences(PREFS_NAME, 0);
        boolean isFirstLaunch = settings.getBoolean(FIRST_LAUNCH_KEY, true);
        
        if (isFirstLaunch) {
            // This is the first launch
            // We'll let the React app handle showing the onboarding
            // Just save that it's no longer the first launch
            SharedPreferences.Editor editor = settings.edit();
            editor.putBoolean(FIRST_LAUNCH_KEY, false);
            editor.apply();
            
            // Inject JavaScript to tell the app this is first launch
            new Handler(Looper.getMainLooper()).postDelayed(() -> {
                webView.evaluateJavascript(
                    "localStorage.removeItem('onboarding-completed');", 
                    null
                );
            }, 2500);
        }
    }
    
    private void setupSplashScreen() {
        // Add splash screen view
        splashScreen = getLayoutInflater().inflate(R.layout.splash_screen, null);
        addContentView(splashScreen, new WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT
        ));
        
        // Start animations
        ImageView logoView = splashScreen.findViewById(R.id.splashLogo);
        Animation fadeIn = AnimationUtils.loadAnimation(this, R.anim.fade_in);
        logoView.startAnimation(fadeIn);
    }
    
    private void hideSplashScreen() {
        if (splashScreen != null) {
            Animation fadeOut = AnimationUtils.loadAnimation(this, R.anim.fade_out);
            fadeOut.setAnimationListener(new Animation.AnimationListener() {
                @Override
                public void onAnimationStart(Animation animation) {}
                
                @Override
                public void onAnimationEnd(Animation animation) {
                    splashScreen.setVisibility(View.GONE);
                    webView.setVisibility(View.VISIBLE);
                }
                
                @Override
                public void onAnimationRepeat(Animation animation) {}
            });
            
            splashScreen.startAnimation(fadeOut);
        }
    }

    private class WebAppInterface {
        @JavascriptInterface
        public void enableRotation() {
            runOnUiThread(() -> {
                isBookViewer = true;
                setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
            });
        }

        @JavascriptInterface
        public void disableRotation() {
            runOnUiThread(() -> {
                isBookViewer = false;
                setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
            });
        }
        
        @JavascriptInterface
        public boolean isFirstLaunch() {
            SharedPreferences settings = getSharedPreferences(PREFS_NAME, 0);
            return settings.getBoolean(FIRST_LAUNCH_KEY, true);
        }
        
        @JavascriptInterface
        public String getDeviceId() {
            return deviceId;
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        // Prevent WebView from being destroyed
        getBridge().getWebView().onPause();
    }

    @Override
    public void onResume() {
        super.onResume();
        // Resume WebView
        getBridge().getWebView().onResume();
        
        // Clear WebView cache if needed
        getBridge().getWebView().clearCache(false);

        // Reset orientation based on current state
        setRequestedOrientation(isBookViewer ? 
            ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED : 
            ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
        );
    }

    @Override
    public void onDestroy() {
        // Clean up WebView
        WebView webView = getBridge().getWebView();
        webView.clearCache(true);
        webView.clearHistory();
        super.onDestroy();
    }
    
    // Override back button behavior to let the web app handle it
    @Override
    public void onBackPressed() {
        // Let Capacitor handle the back button
        // The App plugin will emit the 'backButton' event
        super.onBackPressed();
    }
}
