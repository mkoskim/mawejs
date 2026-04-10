
//*****************************************************************************
//
// Hotkey management
//
//*****************************************************************************

import isHotkey from "../../util/is-hotkey.js"

export const IsKey = {
  Escape: isHotkey("Escape"),
  Enter: isHotkey("Enter"),

  // Alt keys
  AltA: isHotkey("Alt+A"), // Fold All
  AltF: isHotkey("Alt+F"), // Toggle fold
  AltL: isHotkey("Alt+L"), // Add lorem
  AltR: isHotkey("Alt+R"), // Toggle review
  AltS: isHotkey("Alt+S"), // Show all
  AltX: isHotkey("Alt+X"), // ???
  AltUp: isHotkey("Alt+Up"), // Previous scene
  AltDown: isHotkey("Alt+Down"), // Next scene

  // Ctrl keys
  Ctrl0: isHotkey("Mod+0"), // Zoom = 100%

  //CtrlA: isHotkey("Mod+A"), // Select all
  CtrlB: isHotkey("Mod+B"), // Bold
  CtrlF: isHotkey("Mod+F"), // Find
  CtrlG: isHotkey("Mod+G"), // Find next
  CtrlI: isHotkey("Mod+I"), // Italic
  CtrlO: isHotkey("Mod+O"), // Open
  CtrlN: isHotkey("Mod+N"), // New
  CtrlQ: isHotkey("Mod+Q"), // Quit
  CtrlS: isHotkey("Mod+S"), // Save
  CtrlW: isHotkey("Mod+W"), // Close
  //CtrlY: isHotkey("Mod+Y"), // Redo
  //CtrlZ: isHotkey("Mod+Z"), // Undo

  // Ctrl+Shift keys
  CtrlShiftG: isHotkey("Shift+Mod+G"), // Find previous

  // Ctrl+Alt keys
  CtrlAlt0: isHotkey("Mod+Alt+0"), // Apply plain text
  CtrlAlt1: isHotkey("Mod+Alt+1"), // Apply act (heading 1)
  CtrlAlt2: isHotkey("Mod+Alt+2"), // Apply chapter (heading 2)
  CtrlAlt3: isHotkey("Mod+Alt+3"), // Apply scene (heading 3)
  CtrlAlt4: isHotkey("Mod+Alt+4"), // ???
  CtrlAlt5: isHotkey("Mod+Alt+5"), // ???
  CtrlAlt6: isHotkey("Mod+Alt+6"), // ???
  CtrlAlt7: isHotkey("Mod+Alt+7"), // ???
  CtrlAlt8: isHotkey("Mod+Alt+8"), // ???
  CtrlAlt9: isHotkey("Mod+Alt+9"), // ???

  CtrlAltB: isHotkey("Mod+Alt+B"), // Apply bookmark
  CtrlAltC: isHotkey("Mod+Alt+C"), // Apply comment
  CtrlAltF: isHotkey("Mod+Alt+F"),
  CtrlAltM: isHotkey("Mod+Alt+M"), // Apply missing
  CtrlAltN: isHotkey("Mod+Alt+N"), // Apply notes scene
  CtrlAltQ: isHotkey("Mod+Alt+Q"), // Apply quote
  CtrlAltR: isHotkey("Mod+Alt+R"), // ???
  CtrlAltS: isHotkey("Mod+Alt+S"), // Apply synopsis scene
  //CtrlAltT: isHotkey("Mod+Alt+T"), // Opens terminal

  CtrlNumAdd: isHotkey("Mod+NumpadAdd"), // Zoom in
  CtrlNumSub: isHotkey("Mod+NumpadSub"), // Zoom out
}

export {isHotkey}

export function addHotkeys(hotkeys) {

  if(!hotkeys?.length) return

  const handler = event => {
    for(const [key, callback] of hotkeys) {
      //console.log(key)
      if(key(event)) {
        event.preventDefault();
        event.stopPropagation();
        if(callback) callback(event);
        return
      }
    }
  }

  //console.log("Adding hotkeys")
  document.addEventListener("keydown", handler);

  return () => {
    //console.log("Removing hotkeys")
    document.removeEventListener("keydown", handler)
  }
}

export function peekKeys() {
  const handler = event => console.log(event)

  document.addEventListener("keydown", handler);

  return () => {
    document.removeEventListener("keydown", handler)
  }
}
