import { ipcDispatch } from "../../electron/backend/ipcdispatch.js";

export function installFakeIpc() {
  globalThis.window = {
    navigator: {
      platform: "Linux x86_64",
    },
    ipc: {
      invoke: async (channel, cmd, ...args) => {
        return ipcDispatch(createFakeBrowserWindow(), channel, cmd, ...args);
      },
    },
  };

  globalThis.document = {
    title: "",
    addEventListener() {},
    removeEventListener() {},
    getElementById() {
      return null;
    },
  };
}

function createFakeBrowserWindow() {
  let zoomFactor = 1;

  return {
    webContents: {
      getZoomFactor() {
        return zoomFactor;
      },
      setZoomFactor(value) {
        zoomFactor = value;
      },
    },
  };
}
