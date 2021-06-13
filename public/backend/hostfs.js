//*****************************************************************************
//*****************************************************************************
//
// Access to Electron host file system
//
//*****************************************************************************
//*****************************************************************************

exports.fsGetFileEntry = fsGetFileEntry;
exports.fsGetFiles = fsGetFiles;
exports.fsGetLocation = fsGetLocation;
exports.fsGetParentDir = fsGetParentDir;
exports.fsRead = fsRead;

//-----------------------------------------------------------------------------

const fs = require("fs");
const path = require('path');
const {app} = require("electron");

//-----------------------------------------------------------------------------

async function fsRead(fileid, encoding, flags) {
  return fs.promises.readFile(fileid, {encoding: encoding, flags: flags});
}

//-----------------------------------------------------------------------------
// Get file entry with info: name, type, real path as ID
//-----------------------------------------------------------------------------

async function fsGetFileEntry(fileid)
{
  return {
    id:      path.resolve(fileid),
    name:    path.basename(fileid),
    hidden:  path.basename(fileid).startsWith("."),
    ...(await resolvetype(fileid)),
  }

  async function resolvetype(fileid)
  {
    const dirent = await fs.promises.lstat(fileid);

    if(!dirent.isSymbolicLink()) {
      return {
        symlink: false,
        type: gettype(dirent),
        access: await hasaccess(fileid)
      }
    }

    try {
      const realid = await fs.promises.realpath(fileid);
      return {
        symlink: true,
        type: gettype(await fs.promises.stat(realid)),
        access: await hasaccess(realid)
      }
    } catch(error) {
      // Broken link
      return {
        symlink: true,
        type: undefined,
        access: false
      }
    }
  }

  function hasaccess(fileid) {
    return fs.promises.access(fileid, fs.constants.R_OK)
      .then(r => true)
      .catch(e => false)
    ;
  }

  function gettype(dirent) {
    if(dirent.isDirectory()) return "folder";
    if(dirent.isFile()) return "file";
    return undefined;  
  }
}

//-----------------------------------------------------------------------------

async function fsGetParentDir(fileid) {
  const dirid = path.dirname(fileid);
  
  if(dirid == fileid) return undefined;
  return fsGetFileEntry(dirid);
}

//-----------------------------------------------------------------------------
// Get file entries from directory
//-----------------------------------------------------------------------------

async function fsGetFiles(dirid)
{
  var files = await fs.promises.readdir(dirid);
  files = files.map(file => path.resolve(dirid, file));
  files = await Promise.all(files.map(fsGetFileEntry));
  return files;
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

async function fsGetLocation(name)
{
    var fileid;

    if(name == "appPath")
    {
        fileid = app.getAppPath();
    }
    else if(name == "root")
    {
        fileid = "/";
    }
    else
    {
        try {
            fileid = app.getPath(name);
        } catch(error)
        {
            fileid = null;
        }
    }

    return fileid;
}
