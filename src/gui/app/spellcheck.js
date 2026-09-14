import {createContext, useEffect, useState} from "react";
import {setSpellcheck} from "../../system/host";

export const SpellcheckContext = createContext(undefined);

export function useSpellcheck(lang, enabled) {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setSpellcheck(lang, enabled).then(result => {
      if (!cancelled) setStatus({lang, enabled, result});
    }).catch(error => {
      console.error("Spellcheck:", error);
      if (!cancelled) setStatus({lang, enabled, result: undefined});
    });
    return () => { cancelled = true; };
  }, [lang, enabled]);

  return status?.lang === lang && status?.enabled === enabled
    ? status?.result : undefined;
}
