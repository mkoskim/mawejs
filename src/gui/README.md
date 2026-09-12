# GUI

React application and views. Core text editing lives in [slatejs](../slatejs/README.md).

Typing updates application document state, so surrounding UI can affect typing
response. Before changing the editor view or its surrounding components, read
the [performance constraints and component map](perf_critical_components.md).

- `app/`: application shell, views, context, settings, and recent files.
- `common/`: shared components, icons, hotkeys, document index helpers, and themes.
- [editor](editor/README.md): editor views and tools around Slate.
- `import/`, `export/`: import previews and export UI.
- `arc/`, `stats/`: story structure and statistics views.

[sketches](sketches/README.md) and [app/store](app/store/README.md) are inactive
experiments; their documentation is historical.
