//*****************************************************************************
//*****************************************************************************
//
// Loading and saving local files when ran under Electron
//
//*****************************************************************************
//*****************************************************************************

export {
  fstat,
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

function fstat(fileid) {
  return window.ipc.callMain("fs-getentry", fileid);
}

function readdir(fileid) {
  return window.ipc.callMain("fs-readdir", fileid);
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
  return window.ipc.callMain("fs-getlocation", location);
}

function getuser() {
  throw "Not implemented."
}

//-----------------------------------------------------------------------------

function splitpath(fileid) {
  // TODO: Implement this here in browser instance, so that it can be
  // reused with other filesystems, too.

  return window.ipc.callMain("fs-splitpath", fileid);
}
