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
console.log("Platform:", os.platform());
console.log("UserInfo:", os.userInfo());

// HACK for https://github.com/sindresorhus/electron-better-ipc/issues/35
require("electron").ipcMain.addListener("fix-event-798e09ad-0ec6-5877-a214-d552934468ff", () => {});

const {ipcMain: ipc} = require("electron-better-ipc");

const hostfs = require("./hostfs");

ipc.answerRenderer("fs-readdir", hostfs.fsGetFiles);
ipc.answerRenderer("fs-splitpath", hostfs.fsSplitPath);
ipc.answerRenderer("fs-getlocation", hostfs.fsGetLocation);
ipc.answerRenderer("fs-getentry", hostfs.fsGetFileEntry);
