
//*****************************************************************************
//
// Hotkey management
//
//*****************************************************************************

import isHotkey from 'is-hotkey';

export const IsKey = {
  Escape: isHotkey("Escape"),
  Enter: isHotkey("Enter"),

  AltA: isHotkey("Alt+A"),
  AltF: isHotkey("Alt+F"),
  AltL: isHotkey("Alt+L"),
  AltS: isHotkey("Alt+S"),
  AltUp: isHotkey("Alt+Up"),
  AltDown: isHotkey("Alt+Down"),

  CtrlF: isHotkey("Mod+F"),
  CtrlG: isHotkey("Mod+G"),
  CtrlShiftG: isHotkey("Shift+Mod+G"),
  CtrlO: isHotkey("Mod+O"),
  CtrlN: isHotkey("Mod+N"),
  CtrlQ: isHotkey("Mod+Q"),
  CtrlS: isHotkey("Mod+S"),

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
