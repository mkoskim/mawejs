# Host-service wrappers

Client access to desktop services through the [preload bridge](../../electron/preload/README.md).
GUI and document code should use these wrappers instead of calling `window.ipc` directly.

- `ipc.js`: low-level IPC helper.
- `host.js`: application services, including logging, quit, and zoom.
- `dialog.js`: native dialogs.
- `localfs.js`: local files.
- `scanner.js`: file scanning.

See [Electron](../../electron/README.md) when adding a host capability.
