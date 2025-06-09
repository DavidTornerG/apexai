use serde::{Deserialize, Serialize};
use std::collections::VecDeque;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ActionRecord {
    pub id: String,
    pub prompt: String,
    pub actions: Vec<String>,
    pub success: bool,
    pub duration_ms: f64,
    pub timestamp: String,
    pub screenshots: Vec<String>, // Base64 encoded screenshots
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AutomationStats {
    pub total_actions: usize,
    pub success_rate: f64,
    pub avg_latency_ms: f64,
    pub actions_today: usize,
    pub fastest_action_ms: f64,
    pub slowest_action_ms: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AutomationState {
    pub is_running: bool,
    pub current_action: Option<ActionRecord>,
    pub history: VecDeque<ActionRecord>,
    pub stats: AutomationStats,
    pub max_history_size: usize,
}

impl AutomationState {
    pub fn new() -> Self {
        Self {
            is_running: false,
            current_action: None,
            history: VecDeque::new(),
            stats: AutomationStats {
                total_actions: 0,
                success_rate: 100.0,
                avg_latency_ms: 0.0,
                actions_today: 0,
                fastest_action_ms: 0.0,
                slowest_action_ms: 0.0,
            },
            max_history_size: 100,
        }
    }

    pub fn add_action(&mut self, action: ActionRecord) {
        // Update stats
        self.stats.total_actions += 1;
        self.stats.actions_today += 1;

        let successful_actions = self.history.iter()
            .chain(std::iter::once(&action))
            .filter(|a| a.success)
            .count();

        self.stats.success_rate = (successful_actions as f64 / self.stats.total_actions as f64) * 100.0;

        // Update latency stats
        let all_durations: Vec<f64> = self.history.iter()
            .chain(std::iter::once(&action))
            .map(|a| a.duration_ms)
            .collect();

        if !all_durations.is_empty() {
            self.stats.avg_latency_ms = all_durations.iter().sum::<f64>() / all_durations.len() as f64;
            self.stats.fastest_action_ms = all_durations.iter().fold(f64::INFINITY, |a, &b| a.min(b));
            self.stats.slowest_action_ms = all_durations.iter().fold(0.0, |a, &b| a.max(b));
        }

        // Add to history
        self.history.push_back(action);

        // Maintain max history size
        if self.history.len() > self.max_history_size {
            self.history.pop_front();
        }
    }

    pub fn clear_history(&mut self) {
        self.history.clear();
        self.stats = AutomationStats {
            total_actions: 0,
            success_rate: 100.0,
            avg_latency_ms: 0.0,
            actions_today: 0,
            fastest_action_ms: 0.0,
            slowest_action_ms: 0.0,
        };
    }

    pub fn get_recent_actions(&self, limit: usize) -> Vec<ActionRecord> {
        self.history.iter()
            .rev()
            .take(limit)
            .cloned()
            .collect()
    }
}
