# Electron host

Electron provides desktop services. Editor, GUI, and document logic belong in
[src](../src/README.md) so they can remain independent of the desktop host.

- `electron.js`: application entry point.
- [backend](backend/README.md): main-process services and IPC dispatch.
- [preload](preload/README.md): bridge exposed to the renderer.

To add a host capability, implement a backend service, expose it through IPC and
preload as needed, then add a [renderer wrapper](../src/system/README.md).
GUI and document code should use that wrapper.
