//*****************************************************************************
//*****************************************************************************
//
// Utilities
//
//*****************************************************************************
//*****************************************************************************

//-----------------------------------------------------------------------------
// UUID generator
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
