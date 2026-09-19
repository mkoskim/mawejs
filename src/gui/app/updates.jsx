import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getUpdateStatus, onUpdateStatus, downloadUpdate, quitAndInstall } from "../../system/host";

const UpdatesContext = createContext(null);

export function UpdatesProvider({ children }) {
  const [status, setStatus] = useState({ status: "idle" });

  useEffect(() => {
    let active = true;
    let notified = false;
    // Subscribe first so startup checks cannot fall between snapshot and listener.
    const unsubscribe = onUpdateStatus(nextStatus => {
      notified = true;
      if (active) setStatus(nextStatus);
    });
    getUpdateStatus().then(initialStatus => {
      // A late snapshot must not overwrite a newer notification.
      if (active && !notified) setStatus(initialStatus);
    }).catch(error => {
      if (active && !notified) setStatus({ status: "error", message: error.message });
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({ status, downloadUpdate, quitAndInstall }), [status]);
  return <UpdatesContext.Provider value={value}>{children}</UpdatesContext.Provider>;
}

export function useUpdates() {
  const updates = useContext(UpdatesContext);
  if (!updates) throw new Error("useUpdates must be used within UpdatesProvider");
  return updates;
}
