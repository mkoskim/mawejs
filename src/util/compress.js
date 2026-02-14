//*****************************************************************************
//*****************************************************************************
//
// Compression utilities
//
//*****************************************************************************
//*****************************************************************************

import isGzip from "is-gzip"
import pako from "pako"

export {isGzip}

export function gzip(buffer, options) {
  return pako.gzip(buffer, options);
}

export function gunzip(buffer, options) {
  return pako.ungzip(buffer, options);
}
