#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem};
use std::sync::Arc;
use tokio::sync::Mutex;

mod commands;
mod state;

use commands::*;
use state::AutomationState;

fn main() {
    // Initialize tracing
    tracing_subscriber::fmt::init();

    // Create system tray
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let hide = CustomMenuItem::new("hide".to_string(), "Hide");
    let show = CustomMenuItem::new("show".to_string(), "Show");
    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_item(hide)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    let system_tray = SystemTray::new().with_menu(tray_menu);

    // Initialize application state
    let automation_state = Arc::new(Mutex::new(AutomationState::new()));

    tauri::Builder::default()
        .manage(automation_state)
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick {
                position: _,
                size: _,
                ..
            } => {
                if let Some(window) = app.get_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                "hide" => {
                    if let Some(window) = app.get_window("main") {
                        let _ = window.hide();
                    }
                }
                "show" => {
                    if let Some(window) = app.get_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
                _ => {}
            },
            _ => {}
        })
        .setup(|app| {
            // Setup global shortcuts
            let app_handle = app.handle();

            // Command+Shift+Space (or Ctrl+Shift+Space on Windows/Linux)
            let shortcut = if cfg!(target_os = "macos") {
                "cmd+shift+space"
            } else {
                "ctrl+shift+space"
            };

            app.global_shortcut_manager().register(shortcut, move || {
                if let Some(window) = app_handle.get_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                    let _ = window.emit("global-shortcut", "command-palette");
                }
            })?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            execute_automation,
            get_automation_stats,
            get_automation_history,
            clear_automation_history,
            minimize_window,
            maximize_window,
            close_window,
            toggle_always_on_top,
            capture_screenshot
        ])
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|_app_handle, event| match event {
            tauri::RunEvent::ExitRequested { api, .. } => {
                api.prevent_exit();
            }
            _ => {}
        });
}
