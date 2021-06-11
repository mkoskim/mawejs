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
  var dirent = await fs.promises.lstat(fileid);

  var entry = {
    id:      path.resolve(fileid),
    name:    path.basename(fileid),
    type:    undefined,
    access:  undefined,
    hidden:  path.basename(fileid).startsWith("."),
    symlink: dirent.isSymbolicLink(),
  }

  if(entry.symlink) {
    try {
      const realid = await fs.promises.realpath(fileid);
      dirent = await fs.promises.stat(realid);

      entry.type = gettype(dirent);
      entry.access = await hasaccess(realid);

    } catch(error) {
      // Broken link
      entry.type = undefined;
      entry.access = false;
    }
  } else {
    entry.type = gettype(dirent);
    entry.access = await hasaccess(fileid)
  }

  return entry;

  async function hasaccess(fileid) {
    try {
        await fs.promises.access(fileid, fs.constants.R_OK);
    } catch(err) {
        return false;
    }
    return true;
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
    try
    {
        var files = await fs.promises.readdir(dirid);
        files = files.map(file => path.resolve(dirid, file));
        files = await Promise.all(files.map(fsGetFileEntry));
        return files;
    } catch(err)
    {
        return null;
    }
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
