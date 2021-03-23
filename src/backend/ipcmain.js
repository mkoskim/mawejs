//*****************************************************************************
//*****************************************************************************
//
// IPC interface: This is mainly meant to give renderer (application)
// access to local drive. My aim is to create an interface to local disk
// which resembles a bit network based disks like Google Drive. This could
// help later integrating such drives to the application.
//
//*****************************************************************************
//*****************************************************************************

const os = require("os");
console.log(os.userInfo());

// HACK for https://github.com/sindresorhus/electron-better-ipc/issues/35
require("electron").ipcMain.addListener("fix-event-798e09ad-0ec6-5877-a214-d552934468ff", () => {});

const {ipcMain: ipc} = require("electron-better-ipc");

const hostfs = require("./hostfs");

ipc.answerRenderer("fs-readdir", async(dir) => {
    return hostfs.fsGetFiles(dir);
});

ipc.answerRenderer("fs-splitpath", async(path) => {
    return hostfs.fsSplitPath(path);
});

ipc.answerRenderer("fs-getlocation", async(location) => {
    return hostfs.fsGetLocation(location);
});
