# Brainmap (Mindmap-Programm für ein Fantasy-Buch)

## Was es ist
- Kern: `Brainmap.html`. Vanilla HTML/CSS/JS, keine Abhängigkeiten, läuft auch allein im Browser.
- Start als Programm: Desktop-Verknüpfung `Brainmap.lnk` → Edge `--app=file:///…/Brainmap.html` mit `Brainmap-Flamme.ico` (Quelle: `app-icon.svg`, erzeugt per `npx tauri icon`).
  Autosave, letzte Datei und Sicherungskopien (10 je Datei) liegen in IndexedDB.
- Smart App Control ist auf dem PC AN: selbst gebaute .exe werden blockiert. Tauri (`src-tauri/`) ist
  vorbereitet, baut aber erst, wenn SAC aus ist. Wird die HTML verschoben, Verknüpfung neu anlegen.
- Speicherformat: `.brainmap` (JSON mit `app:"Brainmap"`). Bilder liegen als WebP-Data-URL darin.
- Ziel: schlicht und funktionstüchtig. Funktion vor Optik.

- Web-App (Hauptweg für Laptop und Handy): https://kortjannis-web.github.io/brainmap-app/ . Push auf `master` →
  Action `Web-App` baut (`tools/build-web.mjs`), testet (`tools/smoke.mjs`) und veröffentlicht nur bei Grün auf GitHub Pages.
  Service Worker `web/sw.js` lädt online immer die neueste Datei, `version.json` + Update-Leiste für lange laufende Fenster.

- Installer (NSIS, Tauri-Vorlage): Zielordner wählbar, Startmenü-Eintrag (Ordner „Brainmap“), Häkchen „Desktop-Verknüpfung“ am Ende. `brainmap.exe` läuft auch einzeln aus jedem Ordner (HTML ist eingebettet, Daten in `%APPDATA%`). Ungetestet, solange SAC das Bauen blockiert.

## Gilt hier NICHT (globale CLAUDE.md ist für Kundenwebsites)
- Kein Next.js, Tailwind, Framer Motion, shadcn, Coolify, Docker.
- Keine Website-Skills laden: design, layout-positioning, responsive, seo, legal, structure, stack, geo.
- Kein Mobile-First: Desktop-Werkzeug mit Maus (mittlere Taste = Pan).

## Regeln
- Alle Oberfläche und Logik bleibt in `Brainmap.html`. Rust nur für Datei- und Systemzugriff.
- Neue Funktion in den passenden Script-Abschnitt (siehe Karte), nicht ans Ende kleben.
- Jede Datenänderung über `commit()` abschließen (Undo + Autosave). Live-Vorschau ohne Undo-Schritt: `touch()`.
- HTML aus Dateien immer durch `cleanHTML()`. Neue Felder in `loadData()` validieren.
- Felder mit `_` am Anfang sind Laufzeitwerte und werden nicht gespeichert.
- Icons: nur Linien-Icons (Lucide ISC, Tabler MIT), keine farbigen Emojis. Neue Icons: Skript siehe architektur.md.
- Große Änderungen per Python-Patchskript im Scratchpad (`rep(alt, neu)` mit Eindeutigkeits-Prüfung).

## Bauen und testen
- Syntax: Script aus der HTML ziehen und `node --check` (siehe architektur.md).
- Browser: `python -m http.server 8765`, dann `http://localhost:8765/Brainmap.html`. Server per Task-ID beenden.
  Ist das Chrome-Fenster minimiert, laufen keine Animationen und Screenshots: dann Logik per JS testen.
- Web-App lokal: `npm run dist`, dann `node tools/smoke.mjs` (braucht `playwright`).
- Programm: `npx tauri build` (Rust unter `%USERPROFILE%\.cargo\bin`). Ergebnis:
  `src-tauri/target/release/brainmap.exe` und Installer unter `src-tauri/target/release/bundle/nsis/`.

## Code-Karte
→ `.claude/architektur.md` (nur lesen, wenn am Script gearbeitet wird)
