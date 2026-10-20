use super::CmdResult;

/// Presentation only: keep the native caption in sync with the frontend Logo preference.
#[tauri::command]
pub async fn set_window_logo_visible(window: tauri::WebviewWindow, visible: bool) -> CmdResult {
    #[cfg(target_os = "windows")]
    {
        use crate::{cmd::StringifyErr as _, utils::window_branding};
        let (send, receive) = tokio::sync::oneshot::channel();
        let target = window.clone();
        window
            .run_on_main_thread(move || {
                let result = (|| -> CmdResult {
                    let hwnd = target.hwnd().stringify_err()?.0;
                    // SAFETY: hwnd belongs to target and this closure runs on its UI thread.
                    if unsafe { window_branding::set_visible(hwnd, visible) }.stringify_err()? {
                        let key = hwnd as usize;
                        target.on_window_event(move |event| {
                            if matches!(event, tauri::WindowEvent::Destroyed) {
                                window_branding::forget_window(key);
                            }
                        });
                    }
                    Ok(())
                })();
                let _ = send.send(result);
            })
            .stringify_err()?;
        receive.await.stringify_err()?
    }
    #[cfg(not(target_os = "windows"))]
    {
        let _ = (window, visible);
        Ok(())
    }
}
