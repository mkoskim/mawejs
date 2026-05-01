Renderer-side host services
---------------------------

This directory contains renderer/client abstractions for services provided by
the host environment.

In the current Electron application these services call through the preload/IPC
bridge to the Electron backend. Keeping these wrappers here helps keep the GUI
and document logic independent from Electron-specific APIs, which leaves room
for a possible web application implementation later.

Main files:

- `ipc.js` - low-level IPC call helper.
- `host.js` - app-level host services such as logging, app info, quit, and zoom.
- `dialog.js` - system dialog wrappers.
- `localfs.js` - local file system wrappers.
- `scanner.js` - file scanning helpers.

When adding host functionality, prefer extending this abstraction layer rather
than calling `window.ipc` directly from GUI or document code.
