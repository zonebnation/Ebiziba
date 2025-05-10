package com.ebizimba.islam;

import android.os.Bundle;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.content.pm.ActivityInfo;
import android.webkit.JavascriptInterface;
import android.view.View;
import android.os.Handler;
import android.os.Looper;
import android.content.SharedPreferences;
import android.provider.Settings.Secure;
import android.content.Intent;
import android.util.Log;
import android.view.KeyEvent;
import java.io.File;

import com.getcapacitor.BridgeActivity;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;

public class MainActivity extends BridgeActivity {
    private boolean isBookViewer = false;
    private WebView webView;
    private static final String PREFS_NAME = "AppPrefs";
    private static final String FIRST_LAUNCH_KEY = "firstLaunch";
    private String deviceId;
    private static final int RC_SIGN_IN = 9001;
    private GoogleSignInClient mGoogleSignInClient;
    private static final String TAG = "MainActivity";
    private QuranPageDownloader quranDownloader;
    private long lastPauseTime = 0;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Prevent screenshots and screen recording
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        );

        // Set flags for fullscreen
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
        );

        super.onCreate(savedInstanceState);
        
        // Keep screen on while app is running
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        
        // Get device ID
        deviceId = Secure.getString(getContentResolver(), Secure.ANDROID_ID);
        
        // Get WebView instance
        webView = getBridge().getWebView();
        
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
        
        // Initialize Quran page downloader
        quranDownloader = new QuranPageDownloader(this);
        
        // Configure Google Sign-In
        configureGoogleSignIn();
        
        // Check if this is first launch
        checkFirstLaunch();
    }
    
    // Override volume key handling to notify JavaScript
    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        int action = event.getAction();
        int keyCode = event.getKeyCode();
        
        // Check if it's a volume button press
        if ((keyCode == KeyEvent.KEYCODE_VOLUME_UP || keyCode == KeyEvent.KEYCODE_VOLUME_DOWN) && 
            action == KeyEvent.ACTION_DOWN) {
            
            // Notify JavaScript about volume button press
            webView.post(() -> {
                webView.evaluateJavascript(
                    "if (window.handleVolumeButtonPress) window.handleVolumeButtonPress();",
                    null
                );
                
                // Also dispatch a custom event for components that listen for it
                webView.evaluateJavascript(
                    "window.dispatchEvent(new Event('volumeButtonPressed'));",
                    null
                );
            });
            
            // Still allow the system to handle the volume change
            return super.dispatchKeyEvent(event);
        }
        
        return super.dispatchKeyEvent(event);
    }
    
    private void configureGoogleSignIn() {
        try {
            // Configure sign-in to request the user's ID, email address, and basic profile
            GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                    .requestIdToken(getString(R.string.server_client_id))
                    .requestEmail()
                    .requestProfile()
                    .build();

            // Build a GoogleSignInClient with the options specified by gso
            mGoogleSignInClient = GoogleSignIn.getClient(this, gso);
            
            // Log success
            Log.d(TAG, "Google Sign-In configured successfully");
        } catch (Exception e) {
            Log.e(TAG, "Error configuring Google Sign-In: " + e.getMessage(), e);
        }
    }
    
    public void signInWithGoogle() {
        try {
            // Sign out first to ensure we get the account picker dialog
            mGoogleSignInClient.signOut().addOnCompleteListener(this, task -> {
                // Start the sign-in flow
                Intent signInIntent = mGoogleSignInClient.getSignInIntent();
                startActivityForResult(signInIntent, RC_SIGN_IN);
            });
        } catch (Exception e) {
            Log.e(TAG, "Error starting Google Sign-In: " + e.getMessage(), e);
            // Notify the WebView of the error
            webView.post(() -> {
                webView.evaluateJavascript(
                    String.format("window.handleGoogleSignInError('%s')", e.getMessage()),
                    null
                );
            });
        }
    }
    
    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        // Result returned from launching the Intent from GoogleSignInClient.getSignInIntent(...);
        if (requestCode == RC_SIGN_IN) {
            try {
                Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
                handleSignInResult(task);
            } catch (Exception e) {
                Log.e(TAG, "Error in onActivityResult: " + e.getMessage(), e);
                webView.post(() -> {
                    webView.evaluateJavascript(
                        String.format("window.handleGoogleSignInError('Error processing sign-in result: %s')", e.getMessage()),
                        null
                    );
                });
            }
        }
    }
    
    private void handleSignInResult(Task<GoogleSignInAccount> completedTask) {
        try {
            GoogleSignInAccount account = completedTask.getResult(ApiException.class);
            
            // Send the account info to the WebView
            if (account != null) {
                String idToken = account.getIdToken();
                if (idToken == null) {
                    Log.e(TAG, "ID token is null");
                    webView.post(() -> {
                        webView.evaluateJavascript(
                            "window.handleGoogleSignInError('ID token is null')",
                            null
                        );
                    });
                    return;
                }
                
                String email = account.getEmail();
                String name = account.getDisplayName();
                String id = account.getId();
                String photoUrl = account.getPhotoUrl() != null ? account.getPhotoUrl().toString() : "";
                
                Log.d(TAG, "Google Sign-In successful: " + email);
                
                // Create JSON object to pass to WebView
                String accountJson = String.format(
                    "{\"idToken\":\"%s\",\"email\":\"%s\",\"name\":\"%s\",\"id\":\"%s\",\"photoUrl\":\"%s\"}",
                    idToken, email, name, id, photoUrl
                );
                
                // Call JavaScript function in WebView
                webView.post(() -> {
                    webView.evaluateJavascript(
                        String.format("window.handleGoogleSignInResult(%s)", accountJson),
                        null
                    );
                });
            } else {
                Log.e(TAG, "Google Sign-In account is null");
                webView.post(() -> {
                    webView.evaluateJavascript(
                        "window.handleGoogleSignInError('Account is null')",
                        null
                    );
                });
            }
        } catch (ApiException e) {
            // The ApiException status code indicates the detailed failure reason.
            Log.e(TAG, "Google sign in failed: " + e.getStatusCode() + " - " + e.getMessage(), e);
            
            // Call JavaScript function to handle error
            webView.post(() -> {
                webView.evaluateJavascript(
                    String.format("window.handleGoogleSignInError('Google Sign-In failed with code %d: %s')", 
                        e.getStatusCode(), e.getMessage()),
                    null
                );
            });
        } catch (Exception e) {
            Log.e(TAG, "Unexpected error in handleSignInResult: " + e.getMessage(), e);
            webView.post(() -> {
                webView.evaluateJavascript(
                    String.format("window.handleGoogleSignInError('Unexpected error: %s')", e.getMessage()),
                    null
                );
            });
        }
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
                    "localStorage.setItem('onboarding-completed', 'true');", 
                    null
                );
            }, 500);
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
        
        @JavascriptInterface
        public void googleSignIn() {
            runOnUiThread(() -> {
                Log.d(TAG, "googleSignIn method called from JavaScript");
                signInWithGoogle();
            });
        }
        
        @JavascriptInterface
        public void downloadQuranPages(int startPage, int endPage) {
            if (quranDownloader.isDownloading()) {
                webView.post(() -> {
                    webView.evaluateJavascript(
                        "window.handleQuranDownloadError('Download already in progress')",
                        null
                    );
                });
                return;
            }
            
            quranDownloader.setListener(new QuranPageDownloader.DownloadListener() {
                @Override
                public void onProgressUpdate(int current, int total) {
                    webView.post(() -> {
                        webView.evaluateJavascript(
                            String.format("window.handleQuranDownloadProgress(%d, %d)", current, total),
                            null
                        );
                    });
                }
                
                @Override
                public void onDownloadComplete(int success, int failed) {
                    webView.post(() -> {
                        webView.evaluateJavascript(
                            String.format("window.handleQuranDownloadComplete(%d, %d)", success, failed),
                            null
                        );
                    });
                }
                
                @Override
                public void onError(String error) {
                    webView.post(() -> {
                        webView.evaluateJavascript(
                            String.format("window.handleQuranDownloadError('%s')", error),
                            null
                        );
                    });
                }
            });
            
            quranDownloader.downloadPages(startPage, endPage);
        }
        
        @JavascriptInterface
        public String getQuranPagePath(int pageNumber) {
            String formattedPage = String.format("%03d", pageNumber);
            File pageFile = new File(getFilesDir(), "quran-pages/" + formattedPage + ".png");
            if (pageFile.exists()) {
                return pageFile.getAbsolutePath();
            }
            return "";
        }
        
        @JavascriptInterface
        public void handleVolumeButtonPress() {
            // This method will be called from JavaScript to notify about volume button press
            // It's also called directly from dispatchKeyEvent
            webView.post(() -> {
                webView.evaluateJavascript(
                    "if (window.handleVolumeButtonPress) window.handleVolumeButtonPress();",
                    null
                );
                
                // Also dispatch a custom event for components that listen for it
                webView.evaluateJavascript(
                    "window.dispatchEvent(new Event('volumeButtonPressed'));",
                    null
                );
            });
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        // Record the time when the app was paused
        lastPauseTime = System.currentTimeMillis();
        
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
            ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        
        // Check if we've been paused for more than 5 minutes
        long pauseDuration = System.currentTimeMillis() - lastPauseTime;
        if (lastPauseTime > 0 && pauseDuration > 5 * 60 * 1000) {
            // App was closed for a while, trigger notification logic
            webView.post(() -> {
                webView.evaluateJavascript(
                    "if (window.handleAppReopen) window.handleAppReopen(" + pauseDuration + ");",
                    null
                );
            });
        }
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
