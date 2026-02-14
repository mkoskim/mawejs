
//*****************************************************************************
//
// Hotkey management
//
//*****************************************************************************

import isHotkey from 'is-hotkey';

export const IsKey = {
  Escape: isHotkey("Escape"),
  Enter: isHotkey("Enter"),

  // Alt keys
  AltA: isHotkey("Alt+A"),
  AltF: isHotkey("Alt+F"),
  AltL: isHotkey("Alt+L"),
  AltS: isHotkey("Alt+S"),
  AltUp: isHotkey("Alt+Up"),
  AltDown: isHotkey("Alt+Down"),

  // Ctrl keys
  CtrlB: isHotkey("Mod+B"),
  CtrlF: isHotkey("Mod+F"),
  CtrlG: isHotkey("Mod+G"),
  CtrlI: isHotkey("Ctrl+I"),
  CtrlO: isHotkey("Mod+O"),
  CtrlN: isHotkey("Mod+N"),
  CtrlQ: isHotkey("Mod+Q"),
  CtrlS: isHotkey("Mod+S"),

  // Ctrl+Shift keys
  CtrlShiftG: isHotkey("Shift+Mod+G"),

  // Ctrl+Alt keys
  CtrlAlt0: isHotkey("Mod+Alt+0"),
  CtrlAlt1: isHotkey("Mod+Alt+1"),
  CtrlAlt2: isHotkey("Mod+Alt+2"),
  CtrlAlt3: isHotkey("Mod+Alt+3"),
  CtrlAlt4: isHotkey("Mod+Alt+4"),
  CtrlAlt5: isHotkey("Mod+Alt+5"),
  CtrlAlt6: isHotkey("Mod+Alt+6"),
  CtrlAlt7: isHotkey("Mod+Alt+7"),
  CtrlAlt8: isHotkey("Mod+Alt+8"),
  CtrlAlt9: isHotkey("Mod+Alt+9"),

  CtrlAltB: isHotkey("Mod+Alt+B"),
  CtrlAltC: isHotkey("Mod+Alt+C"),
  CtrlAltF: isHotkey("Mod+Alt+F"),
  CtrlAltM: isHotkey("Mod+Alt+M"),
  CtrlAltN: isHotkey("Mod+Alt+N"),
  CtrlAltQ: isHotkey("Mod+Alt+Q"),
  CtrlAltS: isHotkey("Mod+Alt+S"),
  //CtrlAltT: isHotkey("Mod+Alt+T"), // Opens terminal

}

export {isHotkey}

export function addHotkeys(hotkeys) {
  const handler = event => {
    for(const [key, callback] of hotkeys) {
      //console.log(key)
      if(key(event)) {
        //event.preventDefault();
        event.stopPropagation();
        if(callback) callback(event);
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
