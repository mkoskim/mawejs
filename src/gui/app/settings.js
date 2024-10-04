//*****************************************************************************
//
// Application React Contexts to be imported and used
//
//*****************************************************************************

import {
  createContext,
  useEffect, useState,
} from "react"

import { useImmer } from "use-immer";

export const SettingsContext = createContext(null)

//*****************************************************************************
//
// Local Storage item
//
//*****************************************************************************

export function useSetting(key, defaultValue) {
  const [value, setValue] = useState(() => {
    if(!key) return defaultValue
    const value = window.localStorage.getItem(key);

    return value ? JSON.parse(value) : defaultValue;
  });

  useEffect(() => {
    if(key) {
      if(value) {
        window.localStorage.setItem(key, JSON.stringify(value));
      } else {
        window.localStorage.removeItem(key)
      }
    }
  }, [key, value]);

  //console.log("Setting:", key, "=", value)
  return [value, setValue];
}

//-----------------------------------------------------------------------------

export function recentAdd(file, recent, setRecent) {
  setRecent([
    { name: file.name, id: file.id },
    ...recent.filter(entry => entry.id !== file.id)
  ])
}

export function recentRemove(file, recent, setRecent) {
  if(file) setRecent([
    ...recent.filter(entry => entry.id !== file.id)
  ])
}

/*
export function getStartupCommand(loaded) {

  if(loaded) return { action: "load", filename: loaded }

  return { action: "set", buffer: '<story format="mawe" />' }
}
*/
