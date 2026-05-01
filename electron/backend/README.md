Electron backend for MaweJS
---------------------------

These files implement Electron main-process services used by the renderer
through the preload/IPC bridge.

The backend mainly provides desktop host capabilities:

- local file system access
- system dialogs
- app-level actions and information
- user and system locations such as home, app data, and resource directories
- IPC dispatch from renderer calls to backend service handlers

Core editor behavior and document model logic should stay on the renderer/client
side under `src/`. Keep this backend focused on host integration unless a task
explicitly requires otherwise.

Main files:

- `ipcmain.js` - initializes IPC handling.
- `ipcdispatch.js` - dispatches IPC requests to backend services.
- `hostfs.js` - local file system and path/location services.
- `hostdialog.js` - native dialog services.
- `hostapp.js` - app-level host services.
