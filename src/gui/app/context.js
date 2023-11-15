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
// Settings Context hold persistent settings, and manages their loading,
// saving and distribution to correct components.
//-----------------------------------------------------------------------------

export const SettingsContext = createContext(null)

//-----------------------------------------------------------------------------
// "Command" Context is meant for subcomponents to trigger top level components
// to perform certain operations (loading & saving files, and so on)
//-----------------------------------------------------------------------------

export const CmdContext = createContext(null)

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

  // Start-up command (what to load)
  command: {
    //action: "set", buffer: '<story format="mawe" />'
    //action: "resource", filename: "examples/UserGuide.mawe",

    //load: "./examples/Empty.mawe",
    //load: "./examples/TestDoc1.mawe"
    //load: "./examples/TestDoc2.mawe"
    //load: "./examples/UserGuide.mawe",
    //load: "./examples/Lorem30k.mawe"
    //load: "./examples/Compressed.mawe.gz"

    action: "load", filename: "./local/mawe2/GjertaAvaruudessa.3.mawe"
    //action: "load", filename: "./local/mawe2/GjertaViidakossa.mawe"
    //load: "./local/mawe2/NeljaBarnaa.mawe",
    //action: "load", filename: "./local/cantread.mawe",
  },

  // View selections
  view: {
    selected: "editor",
    choices: ["editor", "organizer", "chart", "export"],
  },

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

export function settingsLoad() {
  return defaults
}
