//*****************************************************************************
//*****************************************************************************
//
// Compression utilities
//
//*****************************************************************************
//*****************************************************************************

function fscall(cmd, ...args) {
  return window.ipc.callMain("xml", [cmd, ...args]);
}

export function xml2js(buffer) {
  return fscall("xml2js", buffer);
}

export function js2xml(tree) {
  return fscall("js2xml", tree);
}
