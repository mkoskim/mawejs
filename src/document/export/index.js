//*****************************************************************************
//
// Document exporting
//
//*****************************************************************************

import {
  storyToFlatted, flattedFormat, flattedToText
} from "./formatDoc"

import { formatRTF } from "./formatRTF"
import { formatHTML } from "./formatHTML"
import { formatTEX1, formatTEX2 } from "./formatTEX"
import { formatTXT, formatMD } from "./formatTXT"

export {
  storyToFlatted, flattedFormat, flattedToText,
}

export const exportAs = {
  RTF: formatRTF,
  HTML: formatHTML,
  TEX1: formatTEX1,
  TEX2: formatTEX2,
  TXT: formatTXT,
  MD: formatMD,
}
