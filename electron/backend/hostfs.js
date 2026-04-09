//*****************************************************************************
//*****************************************************************************
//
// Access to Electron host file system
//
//*****************************************************************************
//*****************************************************************************

//-----------------------------------------------------------------------------

import {is} from '@electron-toolkit/utils'
import { constants } from "node:fs";
import { access, lstat, readFile, readdir, realpath, rename, stat, writeFile } from "node:fs/promises";
import path from "path";
import { app, shell } from "electron";

export default {
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
    const dirent = await lstat(fileid);

    if(!dirent.isSymbolicLink()) {
      return {
        symlink: false,
        access: await hasaccess(fileid),
        ...getfields(dirent),
      }
    } else try {
      const realid = await realpath(fileid);
      return {
        symlink: true,
        access: await hasaccess(realid),
        ...getfields(await stat(realid)),
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
    return access(fileid, constants.R_OK)
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
  switch(name) {
    case "root": return "/";
    case "cwd": return process.cwd();
    case "resources": if(is.dev) {
      return process.cwd();
    } else {
      return process.resourcesPath;
    }
    //case "home":
    //case "exe":
    //case "userData":
    //case "appPath":
    default: break;
  }
  return app.getPath(name);
}

//-----------------------------------------------------------------------------

async function fsRead(fileid, encoding) {
  console.log("fsRead:", fileid)
  return readFile(fileid, {encoding: encoding});
}

async function fsWrite(fileid, content, encoding) {
  console.log("fsWrite:", fileid)
  await writeFile(fileid, content, {encoding: encoding});
  return fsGetFileEntry(fileid);
}

async function fsReadDir(dirid)
{
  return Promise.all(
    (await readdir(dirid))
    .map(file => path.resolve(dirid, file))
    .map(file => fsGetFileEntry(file))
  )
}

//-----------------------------------------------------------------------------

async function fsSettingsRead(fileid, encoding) {
  const settingsDir = fsGetLocation("userData")
  return fsRead(path.join(settingsDir, fileid), encoding)
}

async function fsSettingsWrite(fileid, content, encoding) {
  const settingsDir = fsGetLocation("userData")
  return fsWrite(path.join(settingsDir, fileid), content, encoding)
}

//-----------------------------------------------------------------------------

async function fsRename(fileid, name) {
  console.log("Rename:", fileid, "=>", name)

  if(await pathExists(name)) {
    throw new Error(`Rename failed: ${name} already exists.`)
  }

  await rename(fileid, name)
  return fsGetFileEntry(name);
}

//-----------------------------------------------------------------------------

function fsOpenExternal(fileid) {
  console.log("open:", fileid);
  return shell.openPath(fileid)
}

function fsReadResource(fileid) {
  return fsRead(path.join(fsGetLocation("resources"), fileid))
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

function pathExists(fileid) {
  return access(fileid).then(() => true).catch(() => false);
}
