import {
  createContext, useContext,
} from "react"

export { useContext }

export const SettingsContext = createContext(null)

export const DocContext = createContext(null)

export const CmdContext = createContext(null)
