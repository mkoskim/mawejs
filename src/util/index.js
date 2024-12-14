//*****************************************************************************
//*****************************************************************************
//
// Utilities
//
//*****************************************************************************
//*****************************************************************************

//-----------------------------------------------------------------------------

import {v4 as uuid} from "uuid"
import {nanoid} from "nanoid"

import {
  splitByLeadingElem, splitByTrailingElem,
  sleep,
} from "./generic"

export {uuid, nanoid}
export {splitByLeadingElem, splitByTrailingElem}
export {sleep}

//-----------------------------------------------------------------------------
// Number formatting
//-----------------------------------------------------------------------------

export const numfmt = {
  group: Intl.NumberFormat(undefined, {useGrouping: true}),
  sign:  Intl.NumberFormat(undefined, {signDisplay: "always"}),
  gsign: Intl.NumberFormat(undefined, {signDisplay: "always", useGrouping: true}),
}

