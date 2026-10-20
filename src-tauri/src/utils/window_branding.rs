//! Only the native caption's small icon is changed; the large/taskbar icon is untouched.
use std::{collections::BTreeMap, io, ptr, sync::Mutex};
use windows_sys::Win32::{
    Foundation::HWND,
    UI::WindowsAndMessaging::{CreateIcon, DestroyIcon, HICON, ICON_SMALL, SendMessageW, WM_GETICON, WM_SETICON},
};

struct CaptionIcon {
    original: usize,
    transparent: usize,
}

impl Drop for CaptionIcon {
    fn drop(&mut self) {
        // SAFETY: This handle was created by us and is released only after the window is destroyed.
        unsafe { DestroyIcon(self.transparent as HICON) };
    }
}

static ICONS: Mutex<BTreeMap<usize, CaptionIcon>> = Mutex::new(BTreeMap::new());

/// Returns whether a destruction listener is needed.
///
/// # Safety
/// `hwnd` must be a live window owned by the calling UI thread. `forget_window`
/// must be called only after its destruction.
pub unsafe fn set_visible(hwnd: HWND, visible: bool) -> io::Result<bool> {
    let mut icons = ICONS
        .lock()
        .map_err(|_| io::Error::other("caption icon state unavailable"))?;
    let key = hwnd as usize;
    let first = !icons.contains_key(&key);
    if first {
        // A null small icon can fall back to the app/class icon. A transparent monochrome
        // icon suppresses that fallback at every DPI without changing window styles.
        // AND = 1 and XOR = 0 preserves every destination pixel.
        let transparent = unsafe { CreateIcon(ptr::null_mut(), 16, 16, 1, 1, [0xff; 32].as_ptr(), [0; 32].as_ptr()) };
        if transparent.is_null() {
            return Err(io::Error::last_os_error());
        }
        // SAFETY: hwnd belongs to the calling Tauri window, accessed on its UI thread.
        // The original is borrowed from Tauri and must never be destroyed here.
        let original = unsafe { SendMessageW(hwnd, WM_GETICON, ICON_SMALL as usize, 0) } as usize;
        icons.insert(
            key,
            CaptionIcon {
                original,
                transparent: transparent as usize,
            },
        );
    }
    if let Some(icon) = icons.get(&key) {
        let handle = if visible { icon.original } else { icon.transparent };
        // SAFETY: Both handles remain alive while the window exists. ICON_BIG is never set.
        unsafe { SendMessageW(hwnd, WM_SETICON, ICON_SMALL as usize, handle as isize) };
    }
    drop(icons);
    Ok(first)
}

pub fn forget_window(key: usize) {
    if let Ok(mut icons) = ICONS.lock() {
        icons.remove(&key);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use windows_sys::Win32::UI::WindowsAndMessaging::{CreateWindowExW, DestroyWindow, ICON_BIG, WS_OVERLAPPEDWINDOW};

    #[test]
    fn hides_restores_reuses_small_icon_without_changing_large_icon() {
        // The built-in STATIC class creates a hidden test window; no real app window is touched.
        unsafe {
            let class: Vec<u16> = "STATIC\0".encode_utf16().collect();
            let hwnd = CreateWindowExW(
                0,
                class.as_ptr(),
                ptr::null(),
                WS_OVERLAPPEDWINDOW,
                0,
                0,
                100,
                100,
                ptr::null_mut(),
                ptr::null_mut(),
                ptr::null_mut(),
                ptr::null(),
            );
            assert!(!hwnd.is_null());
            let original = CreateIcon(ptr::null_mut(), 16, 16, 1, 1, [0; 32].as_ptr(), [0xff; 32].as_ptr());
            assert!(!original.is_null());
            SendMessageW(hwnd, WM_SETICON, ICON_BIG as usize, original as isize);
            SendMessageW(hwnd, WM_SETICON, ICON_SMALL as usize, original as isize);
            assert!(matches!(set_visible(hwnd, false), Ok(true)));
            let blank = SendMessageW(hwnd, WM_GETICON, ICON_SMALL as usize, 0);
            assert_ne!(blank, 0);
            assert_ne!(blank, original as isize);
            for _ in 0..100 {
                assert!(matches!(set_visible(hwnd, true), Ok(false)));
                assert_eq!(
                    SendMessageW(hwnd, WM_GETICON, ICON_SMALL as usize, 0),
                    original as isize
                );
                assert!(matches!(set_visible(hwnd, false), Ok(false)));
                assert_eq!(SendMessageW(hwnd, WM_GETICON, ICON_SMALL as usize, 0), blank);
                assert_eq!(SendMessageW(hwnd, WM_GETICON, ICON_BIG as usize, 0), original as isize);
            }
            DestroyWindow(hwnd);
            forget_window(hwnd as usize);
            assert!(ICONS.lock().is_ok_and(|icons| !icons.contains_key(&(hwnd as usize))));
            DestroyIcon(original);
        }
    }
}
