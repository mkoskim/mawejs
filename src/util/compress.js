//*****************************************************************************
//*****************************************************************************
//
// Compression utilities
//
//*****************************************************************************
//*****************************************************************************

import isGzip from "is-gzip"
import { deflate, inflate } from 'pako';

export {isGzip}

export function gzip(buffer, options) {
  return deflate(buffer, options);
}

export function gunzip(buffer, options) {
  return inflate(buffer, options);
}
