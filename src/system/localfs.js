//*****************************************************************************
//*****************************************************************************
//
// Loading and saving local files when ran under Electron
//
//*****************************************************************************
//*****************************************************************************

//-----------------------------------------------------------------------------
// Bridge
//-----------------------------------------------------------------------------

function fscall(cmd, ...args) {
  return window.ipc.callMain("hostfs", [cmd, ...args]);
}

//-----------------------------------------------------------------------------
// Basic file system functions
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------

export function dirname(fileid) {
  return fscall("dirname", fileid);
}

export function relpath(directory, fileid) {
  return fscall("relpath", directory, fileid);
}

export function basename(filename, ext) {
  return fscall("basename", filename, ext);
}

export function extname(filename) {
  return fscall("extname", filename);
}

export function makepath(...parts) {
  return fscall("makepath", ...parts)
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

export function settingsread(fileid, encoding="utf8") {
  return fscall("settingsread", fileid, encoding);
}

export function settingswrite(fileid, content, encoding="utf8") {
  return fscall("settingswrite", fileid, content, encoding);
}

export function rename(fileid, to) {
  return fscall("rename", fileid, to);
}

export function remove(fileid) {
  throw new Error("Not implemented.");
}

//-----------------------------------------------------------------------------

export function getlocation(location) {
  return fscall("getlocation", location);
}

export function getuser() {
  throw new Error("Not implemented.");
  //return os.userInfo().username;
}

export function openexternal(fileid) {
  return fscall("openexternal", fileid);
}

export function readResource(fileid) {
  return fscall("readresource", fileid)
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
