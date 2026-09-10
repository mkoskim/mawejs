# Preload bridge

`services.js` exposes `window.ipc.invoke(channel, ...args)` through
`contextBridge`. [Renderer wrappers](../../src/system/README.md) use it to
call backend services.

Keep this bridge small; see [Electron](../README.md) for the host-service workflow.
