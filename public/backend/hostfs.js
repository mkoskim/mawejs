//*****************************************************************************
//*****************************************************************************
//
// Access to Electron host file system
//
//*****************************************************************************
//*****************************************************************************

module.exports = {
  fsGetFileEntry, fsGetParentDir,
  fsGetLocation,
  fsRead, fsWrite, fsReadDir,
  fsRename,
}

//-----------------------------------------------------------------------------

const fs = require("fs");
const path = require('path');

//-----------------------------------------------------------------------------
// Get file entry with info: name, type, real path as ID
//-----------------------------------------------------------------------------

function exists(fileid) {
  return fs.promises.access(fileid, fs.constants.F_OK)
    .then(r => true)
    .catch(e => false)
  ;
}

function hasaccess(fileid) {
  return fs.promises.access(fileid, fs.constants.R_OK)
    .then(r => true)
    .catch(e => false)
  ;
}

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
    } else try {
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

  function gettype(dirent) {
    if(dirent.isDirectory()) return "folder";
    if(dirent.isFile()) return "file";
    return undefined;  
  }
}

//-----------------------------------------------------------------------------

function fsGetParentDir(fileid) {
  const dirid = path.dirname(fileid);
  
  if(dirid == fileid) return undefined;
  return fsGetFileEntry(dirid);
}

async function fsGetLocation(name)
{
  const os = require("os");
  const {app} = require("electron");

  switch(name) {
    case "root": return "/";
    case "home": return os.userInfo().homedir;
    case "appPath": return app.getAppPath();
  }
  return app.getPath(name);
}

//-----------------------------------------------------------------------------

function fsRead(fileid, encoding) {
  return fs.promises.readFile(fileid, {encoding: encoding});
}

function fsWrite(fileid, content, encoding) {
  console.log("Write:", fileid)
  return fs.promises.writeFile(fileid, content, {encoding: encoding});
}

async function fsReadDir(dirid)
{
  return await Promise.all(
    (await fs.promises.readdir(dirid))
    .map(file => path.resolve(dirid, file))
    .map(file => fsGetFileEntry(file))
  )
}

//-----------------------------------------------------------------------------

async function fsRename(fileid, name) {
  name = path.join(path.dirname(fileid), name)
  console.log("Rename:", fileid, "=>", name)

  if(await exists(name)) {
    throw new Error(`Rename failed: ${name} already exists.`)
  }

  await fs.promises.rename(fileid, name)
  return fsGetFileEntry(name);
}
