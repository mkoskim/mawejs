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

// HACK for https://github.com/sindresorhus/electron-better-ipc/issues/35
require("electron").ipcMain.addListener("fix-event-798e09ad-0ec6-5877-a214-d552934468ff", () => {});

const {ipcMain: ipc} = require("electron-better-ipc");
const {ipcDispatch}  = require("./ipcdispatch");

ipc.answerRenderer("app", (params, browserWindow) => { return ipcDispatch("app", params, browserWindow)})
ipc.answerRenderer("hostfs", (params, browserWindow) => { return ipcDispatch("hostfs", params, browserWindow)})
ipc.answerRenderer("dialog", (params, browserWindow) => { return ipcDispatch("dialog", params, browserWindow)})
//ipc.answerRenderer("compress", (params) => { return ipcDispatch("compress", params)})
//ipc.answerRenderer("xml", (params) => { return ipcDispatch("xml", params)})
