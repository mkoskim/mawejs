//*****************************************************************************
//*****************************************************************************
//
// IPC dispatcher
//
//*****************************************************************************
//*****************************************************************************

module.exports = { ipcDispatch }

const hostapp = require("./hostapp")
const hostfs = require("./hostfs");
const dialog = require("./hostdialog");

function ipcDispatch(channel, params, browserWindow) {
  const [cmd, ...args] = params

  //console.log("IPC:", channel, cmd, args)

  switch(channel) {
    case "app": {
      switch(cmd) {
        case "info": return hostapp.info(...args)
        case "quit": return hostapp.quit(...args)
        case "log": return hostapp.log(...args)
        case "beep": return hostapp.beep(...args)
        default: break;
      }
      throw Error(`IPC: ${channel}/${cmd}: Not implemented.`);
    }
    case "hostfs": {
      switch(cmd) {
        case "fstat": return hostfs.fsGetFileEntry(...args);
        case "parent": return hostfs.fsGetParentDir(...args);
        case "getlocation": return hostfs.fsGetLocation(...args);
        case "read": return hostfs.fsRead(...args);
        case "write": return hostfs.fsWrite(...args);
        case "settingsread": return hostfs.fsSettingsRead(...args);
        case "settingswrite": return hostfs.fsSettingsWrite(...args);
        case "readdir": return hostfs.fsReadDir(...args);
        case "rename": return hostfs.fsRename(...args);
        case "openexternal": return hostfs.fsOpenExternal(...args);
        case "readresource": return hostfs.fsReadResource(...args);
        case "dirname": return hostfs.fsDirname(...args);
        case "relpath": return hostfs.fsRelpath(...args);
        case "basename": return hostfs.fsBasename(...args);
        case "extname": return hostfs.fsExtname(...args);
        case "makepath": return hostfs.fsMakepath(...args);
        default: break;
      }
      throw Error(`IPC: ${channel}/${cmd}: Not implemented.`);
    }
    case "dialog": {
      console.log(cmd, ...args)
      switch(cmd) {
        case "openfile": return dialog.openFile(browserWindow, ...args);
        case "savefile": return dialog.saveFile(browserWindow, ...args);
        default: break;
      }
      throw Error(`IPC: ${channel}/${cmd}: Not implemented.`);
    }
    default: throw Error(`Invalid IPC channel: ${channel}`);
  }
}
