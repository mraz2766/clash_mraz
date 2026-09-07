fn main() {
    #[cfg(not(feature = "clippy"))]
    tauri_build::build();
}
