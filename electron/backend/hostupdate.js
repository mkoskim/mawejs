//*****************************************************************************
//
// Checks, downloads and installs application updates
//
//*****************************************************************************

import electronUpdater from "electron-updater";
import { BrowserWindow } from "electron";

//-----------------------------------------------------------------------------
//
// - Checks GitHub releases once at startup, leaving platform
//   selection and development-mode checks to electron-updater.
// - Only newer stable releases are considered.
// - Windows portable builds can also check for a new version.
// - Windows portable replacement is not supported by this NSIS installation
//   flow, even though portable builds can check for updates.
// - Available updates include updateMethod: "manual" for Windows portable,
//   "automatic" otherwise. Manual updates cannot be downloaded or installed here.
//
// - The `app` IPC group exposes `getUpdateStatus`, `downloadUpdate`, and
//   `quitAndInstall`.
// - `downloadUpdate()` starts a user-approved background download and permits
//    installation on normal application quit.
// - After downloading, `quitAndInstall()` installs silently and restarts
//   immediately; its caller must finish saving documents first.
// - Results are logged to the main-process console and sent to
//   renderer windows on `app:update-status` through
//   `notifyUpdateStatus(status)`.
//
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// Updater status
//-----------------------------------------------------------------------------

let updateStatus = { status: "idle" };

// electron-builder's portable launcher sets this to the outer executable path.
const updateMethod = process.platform === "win32" && process.env.PORTABLE_EXECUTABLE_FILE
  ? "manual"
  : "automatic";

export function getUpdateStatus() {
  return { ...updateStatus };
}

export function notifyUpdateStatus(status) {
  updateStatus = { ...status };
  console.log("[Updates]", getUpdateStatus());
  for (const window of BrowserWindow.getAllWindows()) {
    if (!window.isDestroyed() && !window.webContents.isDestroyed()) {
      window.webContents.send("app:update-status", getUpdateStatus());
    }
  }
}

//-----------------------------------------------------------------------------

function notifyChecking() {
  notifyUpdateStatus({ status: "checking" });
}

function notifySkipped() {
  notifyUpdateStatus({ status: "skipped" });
}

function notifyUpToDate({version}) {
  notifyUpdateStatus({status: "up-to-date", version})
}

function notifyUpdateAvailable({version}) {
  notifyUpdateStatus({status: "available", version, updateMethod})
}

function notifyDownloading(version, {percent, transferred, total, bytesPerSecond}) {
  notifyUpdateStatus({
    status: "downloading",
    version,
    percent,
    transferred,
    total,
    bytesPerSecond,
  });
}

function notifyDownloaded({version}) {
  notifyUpdateStatus({ status: "downloaded", version });
}

function notifyInstalling(version) {
  notifyUpdateStatus({ status: "installing", version});
}

function notifyError(error) {
  notifyUpdateStatus({
    status: "error",
    message: error instanceof Error ? error.message : String(error),
  });
}

//-----------------------------------------------------------------------------

let availableVersion = null;
let downloaded = false;
let initialized = false;

// Check once at startup. Downloads require the user's consent to install on quit.
export async function initUpdates() {
  if (initialized) return getUpdateStatus();

  notifyChecking()

  try {
    const { autoUpdater } = electronUpdater;

    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = updateMethod === "automatic";
    autoUpdater.allowPrerelease = false;
    autoUpdater.allowDowngrade = false;
    autoUpdater.logger = console;

    autoUpdater.on("download-progress", progress => {
      notifyDownloading(availableVersion, progress);
    });
    autoUpdater.on("update-downloaded", info => {
      downloaded = true;
      notifyDownloaded(info)
    });
    // Also receive installation errors, which are emitted outside download promises.
    autoUpdater.on("error", notifyError);
    initialized = true;

    // The updater handles platform selection and skips development runs itself.
    // The GitHub provider is read from the packaged app-update.yml.
    const result = await autoUpdater.checkForUpdates();
    availableVersion = result?.isUpdateAvailable ? result.updateInfo.version : null;
    if(result === null) {
      notifySkipped()
    } else if(result.isUpdateAvailable) {
      notifyUpdateAvailable(result.updateInfo)
    } else {
      notifyUpToDate(result.updateInfo)
    }
  } catch (error) {
    // An unavailable update server must not interrupt the editor's startup.
    notifyError(error);
  }

  return getUpdateStatus();
}

// Consent covers both downloading now and installation on normal application quit.
// A failed download can be retried; repeated clicks cannot start another download.
export async function downloadUpdate() {
  if (updateMethod === "manual") return getUpdateStatus();
  if (!availableVersion || downloaded || updateStatus.status === "downloading") {
    return getUpdateStatus();
  }

  notifyDownloading(availableVersion, {percent: 0})
  try {
    await electronUpdater.autoUpdater.downloadUpdate();
  } catch (error) {
    notifyError(error);
  }
  return getUpdateStatus();
}

// The caller must finish saving documents before requesting installation.
// Otherwise the downloaded update waits for normal application quit.
export function quitAndInstall() {
  if (updateMethod === "manual") return getUpdateStatus();
  if (!downloaded || updateStatus.status === "installing") return getUpdateStatus();

  notifyInstalling(availableVersion)
  try {
    electronUpdater.autoUpdater.quitAndInstall(true, true);
  } catch (error) {
    notifyError(error);
  }
  return getUpdateStatus();
}
