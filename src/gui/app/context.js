//*****************************************************************************
//
// Application React Contexts to be imported and used
//
//*****************************************************************************

import {
  createContext, useContext,
} from "react"

export { useContext }

//-----------------------------------------------------------------------------
// "Command" Context is meant for subcomponents to trigger top level components
// to perform certain operations (loading & saving files, and so on)
//-----------------------------------------------------------------------------

export const CmdContext = createContext(null)
