import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { appInfo } from "../../system/host"
import { getSpellcheckLanguages } from "../../system/host.js";

//-----------------------------------------------------------------------------
// Get application info (name & version)
//-----------------------------------------------------------------------------

const AppInfoContext = createContext(null);

export function AppInfoProvider({ children }) {
  const [info, setInfo] = useState();

  useEffect(() => {
    console.clear()
    appInfo().then(info => {
      console.log("Application:", info)
      console.log("React:", React.version)
      setInfo(info)
    })
    getSpellcheckLanguages().then(langs => {
      console.log("Spellcheck:", langs.join(", "))
    })
  }, [])

  return <AppInfoContext.Provider value={info}>{children}</AppInfoContext.Provider>;
}

export function useAppInfo() {
  return useContext(AppInfoContext);
}
