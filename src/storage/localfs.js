//*****************************************************************************
//*****************************************************************************
//
// Loading and saving local files when ran under Electron
//
//*****************************************************************************
//*****************************************************************************

/*
module.exports = {
  fstat, parent, relpath,
  dirname, basename, extname,
  read, write,
  rename, move, remove,
  readdir,
  getlocation,
  getuser,
  openexternal,
  splitpath,
}
/**/

//-----------------------------------------------------------------------------
// Bridge
//-----------------------------------------------------------------------------

function fscall(cmd, ...args) {
  return window.ipc.callMain("hostfs", [cmd, ...args]);
}

//-----------------------------------------------------------------------------
// Basic file system functions
//-----------------------------------------------------------------------------

const os = require("os");
const path = require("path");

//-----------------------------------------------------------------------------

export function dirname(fileid) {
  return path.dirname(fileid);
}

export function relpath(directory, fileid) {
  return path.relative(directory, fileid);
}

export function basename(filename, ext) {
  return path.basename(filename, ext);
}

export function extname(filename) {
  return path.extname(filename);
}

//-----------------------------------------------------------------------------

export function fstat(fileid) {
  return fscall("fstat", fileid);
}

export function parent(fileid) {
  return fscall("parent", fileid);
}

export function readdir(fileid) {
  return fscall("readdir", fileid);
}

export function read(fileid, encoding="utf8") {
  return fscall("read", fileid, encoding);
}

export function write(fileid, content, encoding="utf8") {
  return fscall("write", fileid, content, encoding);
}

export function rename(fileid, name) {
  return fscall("rename", fileid, name);
}

export function move(fileid, dirid) {
  throw new Error("Not implemented.");
}

export function remove(fileid) {
  throw new Error("Not implemented.");
}

//-----------------------------------------------------------------------------

export function getlocation(location) {
  return fscall("getlocation", location);
}

export function getuser() {
  return os.userInfo().username;
}

export function openexternal(fileid) {
  return fscall("openexternal", fileid);
}

//-----------------------------------------------------------------------------

export async function splitpath(fileid) {
  var dirs = [];

  var dirent = await fstat(fileid);

  while(dirent)
  {
      if(dirent.type === "folder")
      {
          dirs.push(dirent);
      }

      dirent = await parent(dirent.id);
  }

  return dirs.reverse();
}
