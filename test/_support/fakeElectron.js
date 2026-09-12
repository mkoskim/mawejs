export const app = {
  getName() { return "mawe-test";},
  getVersion() { return "0.0.0"; },
  getPath(name) { return `/tmp/${name}`;},
  quit() {},
};

export const session = {
  defaultSession: {},
};

export const ipcMain = {
  handle() {},
};

export const BrowserWindow = {
  getAllWindows() { return []; },
  webContents: {
    getZoomFactor() { return 1; },
    setZoomFactor(value) {},
  },
}

export const shell = {
  openPath() { return;},
};

export const dialog = {
  async showOpenDialog() {
    throw new Error("Open dialog not implemented in tests.");
  },
  async showSaveDialog() {
    throw new Error("Save dialog not implemented in tests.");
  },
  async showMessageBox() {
    throw new Error("Message box not implemented in tests.");
  },
};
