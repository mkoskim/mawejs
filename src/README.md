Electron renderer sources
-------------------------

This directory contains the renderer/client side of MaweJS.

The project aims to keep the editor and document logic on the client side, so
that the application could possibly be adapted into a web application later.
Electron-specific host access should go through the abstractions in `system/`
instead of being used directly from UI or document code.

Main directories:

- `gui/` - React UI, editor views, SlateJS integration, styling, and other
  user interface code.
- `document/` - document model utilities, loading, saving, migration, analysis,
  and export support.
- `system/` - renderer-side wrappers for host services such as local files,
  dialogs, and app-level Electron services.
- `util/` - general utility code shared by renderer modules.
