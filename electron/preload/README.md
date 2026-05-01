Electron preload bridge
=======================

This directory contains the Electron preload code exposed to the renderer.

The preload layer is the bridge between the browser-like renderer and the
Electron main process. It should stay small and focused on exposing safe host
capabilities through `contextBridge`.

Current behavior:

- `services.js` exposes `window.ipc.invoke(channel, ...args)` for renderer code.
- Renderer-side wrappers under `src/system/` use this bridge to call Electron
  backend services.
- Backend handlers live under `electron/backend/`.

When adding new host functionality:

1. Add or extend a backend service under `electron/backend/`.
2. Route it through the IPC dispatch layer.
3. Add a renderer wrapper under `src/system/`.
4. Call the wrapper from GUI or document code.

Avoid putting editor or document logic in preload. The preload layer should only
mediate access to host services.
