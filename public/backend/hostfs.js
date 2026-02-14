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
  fsSettingsRead, fsSettingsWrite,
  fsRename,
  fsOpenExternal,
  fsDirname, fsBasename, fsExtname,
  fsRelpath,
  fsMakepath,
  fsReadResource,
  }

//-----------------------------------------------------------------------------

const isDev = require("electron-is-dev");

const fs = require("fs-extra");
const path = require('path');

//-----------------------------------------------------------------------------

const {shell} = require('electron')

// Shell module has some nice commands, like "trashItem", see:
// https://github.com/electron/electron/blob/main/docs/api/shell.md

// See also system dialog interface:
// https://www.electronjs.org/docs/api/dialog

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
        access: await hasaccess(fileid),
        ...getfields(dirent),
      }
    } else try {
      const realid = await fs.promises.realpath(fileid);
      return {
        symlink: true,
        access: await hasaccess(realid),
        ...getfields(await fs.promises.stat(realid)),
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

  function getfields(dirent) {
    return {
      type: gettype(dirent),
      size: dirent.size,
      modified: dirent.mtimeMs,
    }
  }

  function gettype(dirent) {
    if(dirent.isDirectory()) return "folder";
    if(dirent.isFile()) return "file";
    return undefined;
  }

  function hasaccess(fileid) {
    return fs.promises.access(fileid, fs.constants.R_OK)
      .then(r => true)
      .catch(e => false)
    ;
  }
}

//-----------------------------------------------------------------------------

function fsGetParentDir(fileid) {
  const dirid = path.dirname(fileid);

  if(dirid == fileid) return undefined;
  return fsGetFileEntry(dirid);
}

function fsGetLocation(name)
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

async function fsRead(fileid, encoding) {
  console.log("fsRead:", fileid)
  return fs.promises.readFile(fileid, {encoding: encoding});
}

async function fsWrite(fileid, content, encoding) {
  console.log("fsWrite:", fileid)
  await fs.promises.writeFile(fileid, content, {encoding: encoding});
  return fsGetFileEntry(fileid);
}

async function fsReadDir(dirid)
{
  return Promise.all(
    (await fs.promises.readdir(dirid))
    .map(file => path.resolve(dirid, file))
    .map(file => fsGetFileEntry(file))
  )
}

//-----------------------------------------------------------------------------

async function fsSettingsRead(fileid, encoding) {
  const settingsDir = await fsGetLocation("userData")
  return fsRead(path.join(settingsDir, "/" + fileid), encoding)
}

async function fsSettingsWrite(fileid, content, encoding) {
  const settingsDir = await fsGetLocation("userData")
  return fsWrite(path.join(settingsDir, "/" + fileid), content, encoding)
}

//-----------------------------------------------------------------------------

async function fsRename(fileid, name) {
  console.log("Rename:", fileid, "=>", name)

  if(await fs.pathExists(name)) {
    throw new Error(`Rename failed: ${name} already exists.`)
  }

  await fs.promises.rename(fileid, name)
  return fsGetFileEntry(name);
}

//-----------------------------------------------------------------------------

function fsOpenExternal(fileid) {
  console.log("open:", fileid);
  return shell.openPath(fileid)

  //shell.showItemInFolder('filepath') // Show the given file in a file manager. If possible, select the file.
}

function fsReadResource(fileid) {
  if(isDev) {
    return fsRead(path.join(fsGetLocation("appPath"), fileid))
  }
  else {
    return fsRead(path.join(process.resourcesPath, fileid))
  }
}

//-----------------------------------------------------------------------------

function fsDirname(fileid) {
  return path.dirname(fileid);
}

function fsRelpath(directory, fileid) {
  return path.relative(directory, fileid);
}

function fsBasename(filename, ext) {
  return path.basename(filename, ext);
}

function fsExtname(filename) {
  return path.extname(filename);
}

function fsMakepath(...parts) {
  return path.join(...parts)
}
