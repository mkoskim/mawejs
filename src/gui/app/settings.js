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

export function getStartupCommand(loaded) {

  if(loaded) return { action: "load", filename: loaded }

  return { action: "set", buffer: '<story format="mawe" />' }
}

//*****************************************************************************
//
// File specific settings
//
//*****************************************************************************

export function getViewDefaults(file) {
  // Settings based on file.id

  return {
    // View selections
    selected: "editor",

    // Base editor settings
    editor: {
      active: "body",     // body / notes
      body: {
        indexed: ["part", "scene", "synopsis"],
        words: "numbers",
      },
      notes: {
        indexed: ["part", "scene", "synopsis"],
      },
    },
  }
}

//-----------------------------------------------------------------------------
//
// Settings: This is sketching, the framework needs all sorts of considerations
//
//-----------------------------------------------------------------------------

const defaults = {
  // Settings version
  version: 1,

  // Document head defaults
  head: {
    author: "",
    pseudonym: "",
    export: {
      type: "rtf",
      chapterelem: "part",
      chaptertype: "separated"
    },
  },
}
