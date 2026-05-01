GUI
---

React renderer UI for MaweJS.

The main text editor is implemented with SlateJS. Slate-specific editor logic
lives in `../slatejs/`; higher-level editing views and tool components live in
the GUI directories.

Main directories and files:

- `app/` - application shell, views, context, settings, and recent files.
- `common/` - shared UI components, icons, hotkeys, document index helpers,
  and shared CSS themes.
- `editor/` - editor view components and editing-related UI around the Slate
  editor.
- `import/` - importing text and previewing imported content.
- `export/` - export UI.
- `arc/` - story arc view.
- `stats/` - story statistics view.
- `sketches/` - old and experimental UI code. Do not treat this as production
  code unless a task explicitly asks for it.
