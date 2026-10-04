// Brainmap: Programmfenster um Brainmap.html, mit echten Dateien, Sicherungskopien und Autosave.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::{Path, PathBuf};
use tauri::{AppHandle, Manager};
use tauri_plugin_updater::UpdaterExt;

const MAX_BACKUPS: usize = 10;

#[derive(serde::Serialize)]
struct Opened {
    path: String,
    content: String,
}

/// Projektordner: Dokumente\Brainmap (wird angelegt), dort starten Öffnen und Speichern.
fn dialog() -> rfd::FileDialog {
    let d = rfd::FileDialog::new().add_filter("Brainmap-Mindmap", &["brainmap"]);
    match std::env::var_os("USERPROFILE").map(|p| PathBuf::from(p).join("Documents").join("Brainmap")) {
        Some(dir) if fs::create_dir_all(&dir).is_ok() => d.set_directory(dir),
        _ => d,
    }
}

fn data_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir)
}

fn read(path: &Path) -> Result<Opened, String> {
    let content = fs::read_to_string(path).map_err(|e| format!("{}: {}", path.display(), e))?;
    Ok(Opened { path: path.to_string_lossy().into_owned(), content })
}

/// Legt vor dem Überschreiben eine Kopie an und behält je Datei die letzten MAX_BACKUPS Stände.
fn backup(app: &AppHandle, path: &Path) -> Result<(), String> {
    if !path.exists() {
        return Ok(());
    }
    let stem = path.file_stem().map(|s| s.to_string_lossy().into_owned()).unwrap_or_else(|| "Unbenannt".into());
    let dir = data_dir(app)?.join("Sicherungen").join(stem);
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let stamp = chrono::Local::now().format("%Y-%m-%d_%H-%M-%S");
    fs::copy(path, dir.join(format!("{stamp}.brainmap"))).map_err(|e| e.to_string())?;
    let mut list: Vec<PathBuf> = fs::read_dir(&dir)
        .map_err(|e| e.to_string())?
        .filter_map(|e| e.ok().map(|e| e.path()))
        .filter(|p| p.extension().is_some_and(|e| e == "brainmap"))
        .collect();
    list.sort();
    while list.len() > MAX_BACKUPS {
        let _ = fs::remove_file(list.remove(0));
    }
    Ok(())
}

#[tauri::command]
async fn open_dialog() -> Result<Option<Opened>, String> {
    match dialog().pick_file() {
        Some(p) => read(&p).map(Some),
        None => Ok(None),
    }
}

#[tauri::command]
async fn save_dialog(suggested: String) -> Option<String> {
    dialog().set_file_name(&suggested).save_file().map(|mut p| {
        if p.extension().map_or(true, |e| e != "brainmap") {
            p.set_extension("brainmap");
        }
        p.to_string_lossy().into_owned()
    })
}

#[tauri::command]
async fn export_dialog(suggested: String) -> Option<String> {
    rfd::FileDialog::new().set_file_name(&suggested).save_file().map(|p| p.to_string_lossy().into_owned())
}

#[tauri::command]
async fn write_export(path: String, content: String) -> Result<(), String> {
    fs::write(PathBuf::from(path), content).map_err(|e| e.to_string())
}

#[tauri::command]
async fn write_file(app: AppHandle, path: String, content: String) -> Result<(), String> {
    let path = PathBuf::from(path);
    backup(&app, &path)?;
    let tmp = path.with_extension("brainmap.tmp");
    fs::write(&tmp, content).map_err(|e| e.to_string())?;
    fs::rename(&tmp, &path).map_err(|e| e.to_string())
}

/// Datei, mit der das Programm gestartet wurde (Doppelklick auf .brainmap).
#[tauri::command]
fn startup_file() -> Result<Option<Opened>, String> {
    match std::env::args().skip(1).find(|a| a.to_lowercase().ends_with(".brainmap")) {
        Some(a) => read(Path::new(&a)).map(Some),
        None => Ok(None),
    }
}

#[tauri::command]
async fn autosave_write(app: AppHandle, content: String) -> Result<(), String> {
    let dir = data_dir(&app)?;
    let tmp = dir.join("autosave.tmp");
    fs::write(&tmp, content).map_err(|e| e.to_string())?;
    fs::rename(&tmp, dir.join("autosave.json")).map_err(|e| e.to_string())
}

#[tauri::command]
fn autosave_read(app: AppHandle) -> Option<String> {
    fs::read_to_string(data_dir(&app).ok()?.join("autosave.json")).ok()
}

#[tauri::command]
fn open_backups(app: AppHandle) -> Result<(), String> {
    let dir = data_dir(&app)?.join("Sicherungen");
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    std::process::Command::new("explorer").arg(&dir).spawn().map_err(|e| e.to_string())?;
    Ok(())
}

/// Öffnet nur die Anleitung im Browser (feste Adresse, nichts anderes).
#[tauri::command]
fn open_url(url: String) -> Result<(), String> {
    if !url.starts_with("https://github.com/kortjannis-web/brainmap-app/") || url.contains(['"', ' ', '&', '^', '|', '<', '>']) {
        return Err("Adresse nicht erlaubt".into());
    }
    std::process::Command::new("rundll32").args(["url.dll,FileProtocolHandler", &url]).spawn().map_err(|e| e.to_string())?;
    Ok(())
}

/// Prüft beim Start auf eine neuere Version (GitHub-Release), lädt sie und startet neu. Ohne Netz: still ignorieren.
async fn update_beim_start(app: AppHandle) -> tauri_plugin_updater::Result<()> {
    if let Some(update) = app.updater()?.check().await? {
        update.download_and_install(|_, _| {}, || {}).await?;
        app.restart();
    }
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                let _ = update_beim_start(handle).await;
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            open_dialog, save_dialog, write_file, export_dialog, write_export, startup_file, autosave_write, autosave_read, open_backups, open_url
        ])
        .run(tauri::generate_context!())
        .expect("Brainmap konnte nicht starten");
}
