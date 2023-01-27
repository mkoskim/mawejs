//*****************************************************************************
//*****************************************************************************
//
// Compression utilities
//
//*****************************************************************************
//*****************************************************************************

function fscall(cmd, ...args) {
  return window.ipc.callMain("compress", [cmd, ...args]);
}

export function isGzip(buffer) {
  return fscall("isGzip", buffer);
}

export function gunzip(buffer) {
  return fscall("gunzip", buffer);
}

export function gzip(buffer) {
  return fscall("gzip", buffer);
}

