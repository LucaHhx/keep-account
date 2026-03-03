#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .setup(|_app| {
            #[cfg(target_os = "ios")]
            setup_ios_fullscreen(_app);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

/// On iOS, the WKWebView's scrollView defaults to contentInsetAdjustmentBehavior = .automatic,
/// which shrinks the CSS viewport to the safe area (e.g., 778px instead of 874px on iPhone 16 Pro).
/// This leaves a blank gap at the bottom of the screen below the tab bar.
///
/// Setting it to .never makes the CSS viewport extend to the full screen.
/// The app's CSS then uses env(safe-area-inset-top/bottom) to properly pad content
/// away from the Dynamic Island and Home indicator, adapting to all device models.
#[cfg(target_os = "ios")]
fn setup_ios_fullscreen(app: &tauri::App) {
    use tauri::Manager;

    let Some(window) = app.get_webview_window("main") else {
        return;
    };

    let _ = window.with_webview(move |wv| {
        // PlatformWebview::inner() returns *mut c_void pointing to WKWebView
        let webview_ptr = wv.inner();
        unsafe {
            use objc2::msg_send;
            use objc2::runtime::AnyObject;

            let wk: &AnyObject = &*(webview_ptr as *const AnyObject);

            // [wkwebview scrollView] -> UIScrollView*
            let scroll_view: *mut AnyObject = msg_send![wk, scrollView];

            // [scrollView setContentInsetAdjustmentBehavior:UIScrollViewContentInsetAdjustmentNever]
            // UIScrollViewContentInsetAdjustmentNever = 2
            let _: () = msg_send![&*scroll_view, setContentInsetAdjustmentBehavior: 2_isize];
        }
    });
}
