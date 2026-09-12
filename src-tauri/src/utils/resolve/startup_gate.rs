use std::time::Duration;

/// Bounded wait; callers must still validate readiness after it returns.
pub(super) async fn wait_until_settled(mut settled: impl FnMut() -> bool, timeout: Duration) -> bool {
    tokio::time::timeout(timeout, async {
        while !settled() {
            tokio::time::sleep(Duration::from_millis(100)).await;
        }
    })
    .await
    .is_ok()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test(start_paused = true)]
    async fn initial_startup_waits_for_completion() {
        let start = tokio::time::Instant::now();
        assert!(wait_until_settled(|| start.elapsed() >= Duration::from_secs(4), Duration::from_secs(30)).await);
        assert_eq!(start.elapsed(), Duration::from_secs(4));
    }

    #[tokio::test(start_paused = true)]
    async fn completed_startup_does_not_delay_requests() {
        let start = tokio::time::Instant::now();
        assert!(wait_until_settled(|| true, Duration::from_secs(30)).await);
        assert_eq!(start.elapsed(), Duration::ZERO);
    }

    #[tokio::test(start_paused = true)]
    async fn stalled_startup_has_a_deadline() {
        let start = tokio::time::Instant::now();
        assert!(!wait_until_settled(|| false, Duration::from_secs(30)).await);
        assert_eq!(start.elapsed(), Duration::from_secs(30));
    }
}
