//*****************************************************************************
//*****************************************************************************
//
// Loading and saving local files when ran under Electron
//
//*****************************************************************************
//*****************************************************************************

export {
  fstat,
  parent, relpath, dirname,
  basename, extname,
  read, write,
  move, remove,
  readdir,
  getlocation,
  getuser,
  splitpath,
}

//-----------------------------------------------------------------------------
// Basic file system functions
//-----------------------------------------------------------------------------

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

function callfs(cmd, ...args) {
  return window.ipc.callMain("hostfs", [cmd, ...args]);
}

function fstat(fileid) {
  return callfs("fstat", fileid);
}

function parent(fileid) {
  return callfs("parent", fileid);
}

function readdir(fileid) {
  return callfs("readdir", fileid);
}

function read(fileid, encoding="utf8") {
  return callfs("read", fileid, encoding);
}

function write(fileid, content, encoding="utf8") {
  return callfs("write", fileid, content, encoding);
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
