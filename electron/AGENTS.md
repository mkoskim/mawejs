# AGENTS.md

Guidance for AI coding assistants working in this directory.

This directory contains Electron main-process, preload, and backend host
integration code.

Keep the architectural boundary clear:

- `electron/` owns desktop host integration.
- `electron/backend/` implements main-process services such as local files,
  dialogs, app information, and IPC dispatch.
- `electron/preload/` exposes a small bridge to the renderer.
- `src/system/` contains renderer-side wrappers for host services.
- `src/` owns the editor, GUI, and document logic.

Do not move core editor behavior or document model logic into Electron backend
code. The project intentionally keeps editor logic on the client side so that a
future web application version remains possible.

When adding host functionality, prefer this path:

1. Add or extend a backend service under `electron/backend/`.
2. Route it through IPC.
3. Add or extend a wrapper under `src/system/`.
4. Use that wrapper from GUI or document code.
