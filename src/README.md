# Renderer / client

Editor and document logic live here. Access desktop capabilities through
[system](system/README.md) wrappers to keep the client independent of Electron.

- [gui](gui/README.md): React application, views, and styling.
- [slatejs](slatejs/README.md): main text editor and editing behavior.
- [document](document/README.md): document model, loading, saving, migration, and export.
- [system](system/README.md): host-service wrappers.
- `util/`: shared utilities.
