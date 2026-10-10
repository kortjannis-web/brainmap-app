# Brainmap: Anleitung

Brainmap ist eine Mindmap für ein Buchprojekt: Ideen, Figuren, Orte und Kapitel als Blöcke auf einer unendlichen Fläche, verbunden durch Linien, mit Text dahinter.

## Web-App (Laptop und Handy, empfohlen)

1. **https://kortjannis-web.github.io/brainmap-app/** öffnen.
2. **Laptop (Edge/Chrome):** In der Adresszeile auf das Installieren-Symbol klicken (oder Menü ⋯ → Apps → „Brainmap installieren“). Danach startet Brainmap wie ein Programm aus Startmenü oder Taskleiste.
3. **Android (Chrome):** Menü ⋮ → „Zum Startbildschirm hinzufügen“ / „App installieren“. **iPhone (Safari):** Teilen → „Zum Home-Bildschirm“.
4. **Updates kommen von selbst:** Jeder geprüfte Push auf `master` wird veröffentlicht. Beim nächsten Start (mit Internet) läuft sofort die neue Version. Ist das Fenster schon offen, lädt es neu, sobald es im Hintergrund ist, oder zeigt oben „Neue Version verfügbar“. Ohne Internet startet die zuletzt geladene Version.
5. Welche Version läuft, steht im Hilfe-Fenster (**?**) unter der Überschrift.
6. Die Daten liegen pro Gerät im Browser-Speicher. Zwischen Geräten: Datei mit Strg+S speichern und auf dem anderen Gerät öffnen.

## Installieren und aktualisieren (Windows-Programm)

1. Auf der Seite **Releases** die Datei `Brainmap_..._x64-setup.exe` herunterladen und starten.
2. Beim ersten Start erscheint ein Kurz-Tutorial. Es lässt sich jederzeit über das **?** oben wieder öffnen.
3. **Updates** kommen automatisch: Beim Start prüft Brainmap, ob es eine neuere Version gibt, installiert sie und startet neu. Ohne Internet startet das Programm normal weiter.
4. Eigene Mindmaps (`.brainmap`) und der Autosave bleiben bei Updates erhalten.

## Grundlagen

| Aktion | So geht es |
|---|---|
| Neuer Block | Doppelklick auf die freie Fläche, oder Block-Symbol links und dann auf die Fläche klicken |
| Block bearbeiten | Block anklicken und lostippen. Enter springt in die Unterüberschrift. Strg+Enter beginnt eine neue Zeile |
| Verbinden | Über den Block fahren, auf ein ＋ am Rand klicken, dann den Zielblock anklicken. Klick ins Leere legt einen neuen Block an |
| Unterblock | Tab |
| Ansicht verschieben | Mittlere Maustaste halten, oder linke Maustaste auf freier Fläche, oder Leertaste + Ziehen |
| Zoomen | Mausrad |
| Mehrere auswählen | Umschalt+Klick, Umschalt+Ziehen auf freier Fläche, Strg+A |
| Löschen / Duplizieren | Entf / Strg+D |
| Rückgängig / Wiederholen | Strg+Z / Strg+Y |
| Suchen | Strg+F |

## Text, Links und Notizen

- Das kleine **T** unten rechts im Block öffnet das Textblatt. Ein ▾ zeigt, dass Text vorhanden ist.
- **Wort verlinken:** Im Text Rechtsklick auf ein Wort, dann eine Überschrift wählen. Ein Klick auf den Link springt dorthin. Gleiche Begriffe sind in allen Texten automatisch klickbar.
- **Link-Farben:** Grün = andere Box, Gelb = Unterstrang, Lila = Mini-Block.
- **Mini-Punkt:** Im Text Rechtsklick auf ein Wort, dann Unterpunkt erstellen.
- **Notizen im Text:** Knopf Notiz im Textblatt. Rechtsklick auf die Griffleiste: Farbe, Position, löschen.
- **Fokus-Modus:** Im Textblatt Knopf ⤢ oder Strg+Umschalt+F. Esc beendet.
- **Textmarken:** Kapitel-Überschrift, `* * *` als Szenenwechsel, Seitenumbruch. Alles erscheint im Export.

## Aussehen und Ordnung

- **Seitenleiste:** Hintergrund, Rahmen, Schriftfarbe und Größe. Standard sind weiße Blöcke mit dunklem Text. Bei dunklem Hintergrund wird der Text automatisch hell, solange keine eigene Textfarbe gesetzt ist.
- **Schriftgröße:** Block ausgewählt: Strg+↑ / Strg+↓.
- **Blockgröße:** Griff unten rechts ziehen, Doppelklick darauf stellt wieder automatisch.
- **Bilder:** Rechtsklick auf die Fläche, Bild einfügen. Bild auf einen Block ziehen setzt es als Hintergrund.
- **Rahmen:** Rechtsklick auf die Fläche: Rahmen hier oder um die Auswahl. Am Titel ziehen verschiebt den Rahmen samt Inhalt.
- **Linien beschriften:** Doppelklick auf die Linie.
- **Aufräumen:** Knopf links ordnet Äste als Baum. Raster-Knopf rastet beim Ziehen ein. Bei Mehrfachauswahl: Ausrichten und Verteilen.
- **Äste einklappen:** Das − bzw. +Zahl unten links im Block.

## Buchfunktionen

- **Typ im Buch:** Idee, Akt, Kapitel, Szene, Figur, Ort, Notiz (Seitenleiste). Der Trichter links filtert nach Typ.
- **Kapitel-Streifen:** Block auswählen, „Kapitel-Streifen hinzufügen“. Klick öffnet den Text, Rechtsklick: umbenennen, sortieren, Status, lösen, löschen.
- **Wortziele:** Feld „Ziel“ in Seitenleiste oder Textblatt. Balken am Block, Buchziel in der Gliederung.
- **Gliederung:** Liste links. Klick springt, Doppelklick öffnet den Text, Ziehen sortiert um.
- **Zeitleiste:** Zeitpunkt (Jahr, Datum, Zahl) in der Seitenleiste. Der Knopf Zeitleiste zeigt alles sortiert.
- **Manuskript und Export:** Alle Kapitel in Reihenfolge lesen und bearbeiten. Export als Word, Markdown, HTML oder PDF, für die ganze Mindmap, einen Ast oder die Auswahl.

## Speichern und Sicherheit

- **Strg+S** speichert, **Strg+Umschalt+S** speichert unter. Format: `.brainmap`.
- **Autosave** läuft im Hintergrund. Beim nächsten Start ist die letzte Datei wieder da.
- **Sicherungskopien:** Beim Speichern bleiben die letzten 10 Stände jeder Datei erhalten. Rechtsklick auf die Fläche, Sicherungskopien: wiederherstellen oder herunterladen.
- **Öffnen:** Strg+O, Doppelklick auf eine `.brainmap`-Datei oder die Datei ins Fenster ziehen.

## Für Entwickler: Update veröffentlichen

```
git tag v1.0.1
git push origin v1.0.1
```

GitHub Actions baut daraufhin die Windows-exe, signiert sie und veröffentlicht ein Release. Alle installierten Programme laden sie beim nächsten Start. Die Versionsnummer kommt aus dem Tag. Der private Signierschlüssel liegt als Secret `TAURI_SIGNING_PRIVATE_KEY` im Repository und zusätzlich als Sicherung lokal in `~/.brainmap-keys/`. Geht er verloren, können bestehende Installationen nicht mehr aktualisiert werden.
