//*****************************************************************************
//*****************************************************************************
//
// Loading and saving local files when ran under Electron
//
//*****************************************************************************
//*****************************************************************************

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

function dirname(fileid) {
  return path.dirname(fileid);
}

function relpath(directory, fileid) {
  return path.relative(directory, fileid);
}

function basename(filename, ext) {
  return path.basename(filename, ext);
}

function extname(filename) {
  return path.extname(filename);
}

//-----------------------------------------------------------------------------

function fstat(fileid) {
  return fscall("fstat", fileid);
}

function parent(fileid) {
  return fscall("parent", fileid);
}

function readdir(fileid) {
  return fscall("readdir", fileid);
}

function read(fileid, encoding="utf8") {
  return fscall("read", fileid, encoding);
}

function write(fileid, content, encoding="utf8") {
  return fscall("write", fileid, content, encoding);
}

function rename(fileid, name) {
  return fscall("rename", fileid, name);
}

function move(fileid, dirid) {
  throw "Not implemented.";
}

function remove(fileid) {
  throw "Not implemented.";
}

//-----------------------------------------------------------------------------

function getlocation(location) {
  return fscall("getlocation", location);
}

function getuser() {
  return os.userInfo().username;
}

function openexternal(fileid) {
  return fscall("openexternal", fileid);
}

//-----------------------------------------------------------------------------

async function splitpath(fileid) {
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
