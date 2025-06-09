use tauri::{command, State, Window};
use serde_json;
use std::sync::Arc;
use tokio::sync::Mutex;
use uuid::Uuid;
use chrono::Utc;

use crate::state::{AutomationState, ActionRecord};

#[command]
pub async fn execute_automation(
    window: Window,
    state: State<'_, Arc<Mutex<AutomationState>>>,
    prompt: String,
) -> Result<String, String> {
    tracing::info!("Executing automation: {}", prompt);

    // Update state to running
    {
        let mut state_lock = state.lock().await;
        state_lock.is_running = true;
    }

    // Emit start event
    window.emit("automation-event", serde_json::json!({
        "type": "action_started",
        "data": {
            "prompt": prompt.clone(),
            "timestamp": Utc::now().to_rfc3339()
        }
    })).map_err(|e| e.to_string())?;

    // Simulate automation execution (replace with actual automation core integration)
    let result = tokio::task::spawn(async move {
        // Simulate processing time
        tokio::time::sleep(tokio::time::Duration::from_millis(500 + (rand::random::<u64>() % 1000))).await;

        // Simulate different action types
        let actions = match prompt.to_lowercase() {
            p if p.contains("click") => vec!["Located element".to_string(), "Clicked successfully".to_string()],
            p if p.contains("type") || p.contains("write") => vec!["Found input field".to_string(), "Typed text".to_string()],
            p if p.contains("open") => vec!["Launched application".to_string(), "Window opened".to_string()],
            p if p.contains("search") => vec!["Opened search".to_string(), "Entered query".to_string(), "Results displayed".to_string()],
            _ => vec!["Analyzed screen".to_string(), "Executed action".to_string()],
        };

        // Simulate success rate (95% success)
        let success = rand::random::<f32>() > 0.05;
        let duration = 150.0 + (rand::random::<f64>() * 300.0); // 150-450ms

        Ok::<ActionRecord, String>(ActionRecord {
            id: Uuid::new_v4().to_string(),
            prompt: prompt.clone(),
            actions,
            success,
            duration_ms: duration,
            timestamp: Utc::now().to_rfc3339(),
            screenshots: vec![], // Would contain actual screenshots
        })
    }).await.map_err(|e| e.to_string())??;

    // Update state
    {
        let mut state_lock = state.lock().await;
        state_lock.add_action(result.clone());
        state_lock.is_running = false;
        state_lock.current_action = None;
    }

    // Emit completion event
    window.emit("automation-event", serde_json::json!({
        "type": "action_completed",
        "data": result
    })).map_err(|e| e.to_string())?;

    Ok("Success".to_string())
}

#[command]
pub async fn get_automation_stats(
    state: State<'_, Arc<Mutex<AutomationState>>>,
) -> Result<serde_json::Value, String> {
    let state_lock = state.lock().await;
    Ok(serde_json::to_value(&state_lock.stats).map_err(|e| e.to_string())?)
}

#[command]
pub async fn get_automation_history(
    state: State<'_, Arc<Mutex<AutomationState>>>,
    limit: Option<usize>,
) -> Result<Vec<ActionRecord>, String> {
    let state_lock = state.lock().await;
    let limit = limit.unwrap_or(50);
    Ok(state_lock.get_recent_actions(limit))
}

#[command]
pub async fn clear_automation_history(
    state: State<'_, Arc<Mutex<AutomationState>>>,
) -> Result<(), String> {
    let mut state_lock = state.lock().await;
    state_lock.clear_history();
    Ok(())
}

#[command]
pub async fn capture_screenshot() -> Result<String, String> {
    // This would integrate with the screen capture functionality
    // For now, return a placeholder
    Ok("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==".to_string())
}

// Window management commands
#[command]
pub async fn minimize_window(window: Window) -> Result<(), String> {
    window.minimize().map_err(|e| e.to_string())
}

#[command]
pub async fn maximize_window(window: Window) -> Result<(), String> {
    if window.is_maximized().map_err(|e| e.to_string())? {
        window.unmaximize().map_err(|e| e.to_string())
    } else {
        window.maximize().map_err(|e| e.to_string())
    }
}

#[command]
pub async fn close_window(window: Window) -> Result<(), String> {
    window.close().map_err(|e| e.to_string())
}

#[command]
pub async fn toggle_always_on_top(window: Window) -> Result<bool, String> {
    let is_always_on_top = window.is_always_on_top().map_err(|e| e.to_string())?;
    window.set_always_on_top(!is_always_on_top).map_err(|e| e.to_string())?;
    Ok(!is_always_on_top)
}

// Add a simple random number generator for simulation
mod rand {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    use std::time::{SystemTime, UNIX_EPOCH};

    pub fn random<T: From<u64>>() -> T {
        let mut hasher = DefaultHasher::new();
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos()
            .hash(&mut hasher);
        T::from(hasher.finish())
    }
}
