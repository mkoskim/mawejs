import { BrowserWindow } from "./fakeElectron.js";
import { ipcDispatch } from "../../electron/backend/ipcdispatch.js";

export function installFakeIpc() {
  globalThis.window = {
    navigator: {
      platform: "Linux x86_64",
    },
    ipc: {
      invoke: async (channel, cmd, ...args) => {
        return ipcDispatch(BrowserWindow, channel, cmd, ...args);
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
