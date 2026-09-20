import { test } from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { BrowserWindow } from "../_support/fakeElectron.js";
import { installFakeIpc } from "../_support/fakeIpc.js";
import { notifyUpdateStatus } from "../../electron/backend/hostupdate.js";
import { getUpdateStatus, downloadUpdate, quitAndInstall, onUpdateStatus } from "../../src/system/host.js";

test("update commands use the app IPC group and return host status", async () => {
  installFakeIpc();
  const invoke = window.ipc.invoke;
  const calls = [];
  window.ipc.invoke = (...args) => {
    calls.push(args);
    return invoke(...args);
  };
  try {
    const status = { status: "idle" };
    notifyUpdateStatus(status);
    // Leave the updater uninitialized: exercise dispatch without an update lifecycle.
    assert.deepEqual(await getUpdateStatus(), status);
    assert.deepEqual(await downloadUpdate(), status);
    assert.deepEqual(await quitAndInstall(), status);
    assert.deepEqual(calls, [
      ["app", "getUpdateStatus"],
      ["app", "downloadUpdate"],
      ["app", "quitAndInstall"],
    ]);
  } finally {
    window.ipc.invoke = invoke;
  }
});

test("preload subscriptions hide Electron events and clean up independently", () => {
  const ipcRenderer = new EventEmitter();
  let bridge;
  runInNewContext(readFileSync("electron/preload/services.js", "utf8"), {
    require: () => ({
      ipcRenderer,
      contextBridge: { exposeInMainWorld: (_name, value) => { bridge = value; } },
    }),
  });
  const previous = window.ipc;
  const originalWindows = BrowserWindow.getAllWindows;
  window.ipc = bridge;
  BrowserWindow.getAllWindows = () => [{
    isDestroyed: () => false,
    webContents: {
      isDestroyed: () => false,
      send: (channel, status) => ipcRenderer.emit(channel, { sender: "must not cross bridge" }, status),
    },
  }, { isDestroyed: () => true }];
  try {
    const received = [];
    const unsubscribe = onUpdateStatus((...args) => received.push(args));
    const unsubscribeOther = onUpdateStatus(() => {});
    const status = { status: "downloaded" };
    notifyUpdateStatus(status);
    assert.deepEqual(received, [[status]]);
    unsubscribe();
    assert.equal(ipcRenderer.listenerCount("app:update-status"), 1);
    notifyUpdateStatus(status);
    assert.equal(received.length, 1);
    unsubscribeOther();
    assert.equal(ipcRenderer.listenerCount("app:update-status"), 0);
  } finally {
    BrowserWindow.getAllWindows = originalWindows;
    window.ipc = previous;
  }
});
