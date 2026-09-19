import { EventEmitter } from "node:events";

export const autoUpdater = new EventEmitter();
autoUpdater.checkForUpdates = async () => ({
  isUpdateAvailable: true,
  updateInfo: { version: "99.0.0" },
});
autoUpdater.downloadUpdate = async () => {
  autoUpdater.emit("download-progress", { percent: 50, transferred: 5, total: 10, bytesPerSecond: 1 });
  autoUpdater.emit("update-downloaded", { version: "99.0.0" });
};
autoUpdater.quitAndInstall = () => {};

export default { autoUpdater };
