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
  return deflate(buffer, { gzip: true, level: 9, ...options });
}

export function gunzip(buffer, options) {
  return inflate(buffer, { gzip: true, ...options });
}
