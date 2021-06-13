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

ipc.answerRenderer("hostfs", (params) => {
  const [cmd, args] = [params[0], params.slice(1)];

  switch(cmd) {
    case "fstat": return hostfs.fsGetFileEntry(...args);
    case "parent": return hostfs.fsGetParentDir(...args);
    case "read": return hostfs.fsRead(...args);
    case "write": return hostfs.fsWrite(...args);
    case "readdir": return hostfs.fsGetFiles(...args);
    case "getlocation": return hostfs.fsGetLocation(...args);
    default: throw Error(`IPC: hostfs/${cmd}: Not implemented.`);
  }
})
