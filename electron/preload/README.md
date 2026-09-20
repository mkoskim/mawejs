# Preload bridge

`services.js` exposes `window.ipc.invoke(channel, ...args)` through
`contextBridge`. [Renderer wrappers](../../src/system/README.md) use it to
call backend services.

`window.ipc.onUpdateStatus(callback)` subscribes to `app:update-status` and
returns an unsubscribe function. The callback receives only the status payload,
never the Electron event. No arbitrary event channels are exposed.

Keep this bridge small; see [Electron](../README.md) for the host-service workflow.
