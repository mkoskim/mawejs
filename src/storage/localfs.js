//*****************************************************************************
//*****************************************************************************
//
// Loading and saving local files when ran under Electron
//
//*****************************************************************************
//*****************************************************************************

export {
  fstat, dirname, relpath,
  read,
  write,
  move,
  remove,
  readdir,
  getlocation,
  getuser,
  splitpath,
}

//-----------------------------------------------------------------------------
// Basic file system functions
//-----------------------------------------------------------------------------

const path = require("path");

function callfs(cmd, ...args) {
  return window.ipc.callMain("localfs", [cmd, ...args]);
}

function fstat(fileid) {
  return callfs("fstat", fileid);
}

function dirname(fileid) {
  return path.dirname(fileid);
}

function relpath(directory, fileid) {
  return path.relative(directory, fileid);
}

function readdir(fileid) {
  return callfs("readdir", fileid);
}

function read(fileid) {
  throw "Not implemented.";
}

function write(fileid, content) {
  throw "Not implemented.";
}

function move(fileid, dirid) {
  throw "Not implemented.";
}

function remove(fileid) {
  throw "Not implemented.";
}

//-----------------------------------------------------------------------------

function getlocation(location) {
  return callfs("getlocation", location);
}

function getuser() {
  throw "Not implemented."
}

//-----------------------------------------------------------------------------

function splitpath(fileid) {
  // TODO: Implement this here in browser instance, so that it can be
  // reused with other filesystems, too.

  return callfs("splitpath", fileid);
}
