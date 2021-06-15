//*****************************************************************************
//*****************************************************************************
//
// IPC dispatcher
//
//*****************************************************************************
//*****************************************************************************

module.exports = { ipcDispatch }

const hostfs = require("./hostfs");

function ipcDispatch(channel, params) {
  const [cmd, args] = [params[0], params.slice(1)];

  //console.log("IPC:", channel, cmd, args)

  switch(channel) {
    default: throw Error(`Invalid IPC channel: ${channel}`);
    case "hostfs": {
      switch(cmd) {
        case "fstat": return hostfs.fsGetFileEntry(...args);
        case "parent": return hostfs.fsGetParentDir(...args);
        case "getlocation": return hostfs.fsGetLocation(...args);
        case "read": return hostfs.fsRead(...args);
        case "write": return hostfs.fsWrite(...args);
        case "readdir": return hostfs.fsGetFiles(...args);
        case "rename": return hostfs.fsRename(...args);
      }
      throw Error(`IPC: hostfs/${cmd}: Not implemented.`);
    }
  }
}
