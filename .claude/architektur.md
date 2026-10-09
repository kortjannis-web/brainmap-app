# Architektur von Brainmap.html

Script-Abschnitte (Kommentare `/* ---------- Name ---------- */`, Reihenfolge wie in der Datei):

| Abschnitt | Inhalt |
|---|---|
| Kopf | Defaults `DEF_NODE/DEF_EDGE`, `STATUS`, `ICONS` + `ICON_CATS` (eingebettete SVG-Pfade), Tauri-Erkennung `invoke` |
| Ansicht | `view {x,y,s}`, `applyView`, `zoomAt`, `animateView`, `fitAll`, `toWorld` |
| Blöcke | `nodeEl`, `renderNode` (Icon, Status, Bild, Mini), `createNode`, `spawnChild`, `addChild`, `deleteNode` |
| Verbindungen | `applyVisibility` (Einklappen, versteckte Mini-Punkte, `peekId`), `renderEdges` mit Beschriftung, Link-Modus |
| Auswahl und Bearbeiten | `select`, `selectMulti`, `selectedIds`, `startEdit/endEdit`, `setMini`, `deleteSel` |
| Seitenleiste | Panels `#sb-node/#sb-multi/#sb-frame/#sb-edge`, Inputs mit `data-k` schreiben in `obj.style`, Icon-Raster |
| Maus auf der Fläche | mousedown-Weiche: Link, Platzieren, Pan, Griff, Block, Rahmen, Linie, Umschalt = Auswahlrahmen |
| Rahmen und Mehrfachauswahl | `renderFrames`, `createFrame`, `frameAround`, `startFrameDrag` (nimmt Blöcke mit), `startBand` |
| Popups | `showMenu`, `ask()` (Promise), `toast` |
| Bilder | `imageToData` (WebP, max 1600 px), Block-Hintergrund, `insertPicture`, `picMenu`, Ziehen im Text |
| Textblatt | `openSheet/closeSheet` (FLIP), `syncSheet`, Formatierung per `execCommand`, `renderBacklinks`, Lesebreite `setNarrow`. Blatt füllt das Fenster: `.sheet-top` (Leisten), `#sheet-nav` (Gliederung), `#paper` (scrollt) |
| Kästen im Text | `section.blk[data-kind=teil|kapitel|szene]` mit `.blk-head` (contenteditable=false: Kennung, Titel, Untertitel, Griff) und `.blk-body`. `normalizeBlocks`, `refreshBlocks` (Kennung `data-auto`, Wortzahl), `blockKeys` (Kopf nie löschen), `applyRank`/`liftBlock`/`unwrapBlock` (Rechtsklick-Rang), `startBlockDrag`, `renderSheetNav`, `lineFormatKeys` (Strg+1/2/3, # und Listen-Kürzel), `flattenBlocks` (Export) |
| Gestaltung im Text | Popup `openFx`. `.tbox[data-v]` (Kasten um Absätze, Farbe `--tb`), `.mk.mk-*` (Marker-Stile, Farbe `--mk`), `ul.l-*` (Listenzeichen), `hr.deco-*` (Trenner), `.shape` (freie Formen: `data-shape/pts/stroke/fill/sw/dash`, `renderShape`). Frei schwebend (`.pic.free`, `.shape`): `makeFree`, `startFreeMove` |
| Verlinkung | `<a class="nlink" data-node>`, `makeSub` (Unterpunkt/Mini aus Wort), `followLink`, `focusNode` |
| Kapitel-Streifen | `isHosted`, `chaptersOf`, `renderChaps`, `addChapter/moveChapter/removeChapter/detachChapter`, `chapMenu` (vor `renderNode`) |
| Icons und Emojis | `makePicker` (Seitenleiste und Popup), `PICK_CATS`, `EMOJI_CATS`, `insertAtCaret` |
| Gliederung | `renderOutline`, Sortierung über `ord` (`sortedKids`, `outlineRoots`) |
| Zeitleiste | `whenKey`, `renderTimeline` |
| Manuskript und Export | `manuscriptIds`, `buildBookHTML`, `htmlToMarkdown`, `saveExport` (Tauri: `export_dialog`, `write_export`) |
| Suche | `openSearch`, `runSearch` über Titel und Klartext, `chooseSearch` |
| Rückgängig und Autosave | `commit`, `undo/redo` (JSON-Snapshots), `scheduleAutosave` (Tauri: Datei, sonst localStorage) |
| Dateien | `fileData/loadData` (validiert alles), `cleanHTML`, `cleanStyle`, Tauri-Befehle oder Browser-Fallback |
| Tastatur | eine keydown-Weiche: ask, Strg+S/O/F, Hilfe, Menü, Blatt, Bearbeiten, Fläche |

## Datenmodell
```
doc.nodes[id]  = { id, x, y, title, sub, text(HTML), style, collapsed, mini, miniHidden, status, icon ('key' oder 'e:Emoji'), img, imgAR,
                   type (idee|akt|kapitel|szene|figur|ort|notiz), goal (Wörter), when (Zeitpunkt), ord (Reihenfolge unter Geschwistern),
                   chapters:[ids] am Block, host:blockId am Kapitel (Kapitel-Knoten liegen nicht auf der Fläche) }
doc.bookGoal = Wortziel fürs Buch
doc.speech   = { rede:'de|buch|fr|en|farbe|blase', innen:'kursiv|klammer|leise|blase' } (Stil für <span class="rede|innen">, als data-rede/data-innen am body; Export: speechToText)
doc.edges[id]  = { id, from, to, label, style:{color,width,dash} }
doc.frames[id] = { id, x, y, w, h, title, color }
```
Kinder = Linien mit `from` = Elternblock. `style` speichert nur Abweichungen von den Defaults.

## Rust (src-tauri/src/main.rs)
`open_dialog`, `save_dialog`, `write_file` (vorher Sicherung), `startup_file`, `autosave_write/read`, `open_backups`.
Daten: `%APPDATA%\de.brainmap.app\` (autosave.json, Sicherungen\<Dateiname>\).

## Werkzeuge
- Syntaxcheck: Python zieht das letzte `<script>` nach `%TEMP%\bm.js`, dann `node --check`.
- Icons neu erzeugen: `npm pack lucide-static` und `npm pack @tabler/icons` im Scratchpad, Pfade aus den
  SVGs lesen und die Zeilen `const ICONS = …;` und `const ICON_CATS = …;` ersetzen. Tabler-Schlüssel mit `t:`.

Laufzeitwerte im Blatt-HTML (`data-auto`, `data-w`, `.sh-pt`, `.sel`, `.flash`) entfernt `syncSheet` vor dem Speichern.

## Ab Ä17 (Seiten, Projekt, Gestaltung)
- `doc.page = { w, mode:'flow'|'book', fmt:'tb'|'roman'|'a5', nums:'off'|'mid'|'out', bd:{art:design} }` (`cleanPage`). Breite: `applyTextWidth`, Ränder `#mg-l/#mg-r`. Buchseiten: `applyBook` (Editor als Mehrspalten-Box, jede Spalte eine Seite, Seitenblätter malt der Hintergrund von `#paper`), `renderPageNums`, `pageCSS` (Druck/PDF).
- `doc.tree = { items:{id:{id,kind:'folder'|'map'|'text',name,parent,ord,view}}, map, active, dir }` (`cleanTree`, `fixTreeRefs`). Knoten und Rahmen tragen `m` (Karte, fehlt = 'main'), eigenständige Texte sind Knoten mit `solo:true` und gleicher id wie ihr Reiter. `switchMap`, `openTab`, `renderTabs`, `newTabItem`, `deleteTab`, `moveTab`. Sichtbarkeit über `hiddenSet` (`applyVisibility`).
- Gestaltung im Text: `.cols/.grid>.gcol` (Spalten, `applyCols`), Notiz-Kasten `section.blk[data-kind=notiz]`, Kasten-Designs `section.blk[data-d]` (`BLK_DESIGNS`, `designAll`), Kasten-Zeichen `.tbox[data-osym][data-opos]` mit `--orn`, Zettel am Wort `.anchor[data-sn]` + `.sticky[data-sn][data-mode]` (`makeSticky`, `renderStickyLines` in `#stlines`).
