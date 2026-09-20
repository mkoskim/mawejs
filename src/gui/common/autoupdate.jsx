//*****************************************************************************
// Components for auto-updater
//*****************************************************************************

import { createContext, useContext, useEffect, useState } from "react";
import { getUpdateStatus, onUpdateStatus } from "../../system/host";
import { CmdContext, reqUpdateDownload, reqRelaunch } from "../app/context";
import { useAppInfo } from "../app/appinfo";
import { Button, MenuItem } from "./factory";
import "./theme/autoupdate.css";

//-----------------------------------------------------------------------------
// Auto-updater context
//-----------------------------------------------------------------------------

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

  return <UpdatesContext.Provider value={status}>{children}</UpdatesContext.Provider>;
}

//-----------------------------------------------------------------------------

export function useUpdates() {
  const updates = useContext(UpdatesContext);
  if (!updates) throw new Error("useUpdates must be used within UpdatesProvider");
  return updates;
}

//-----------------------------------------------------------------------------
// Autoupdater menu item
//-----------------------------------------------------------------------------

export function UpdateMenuItem({setCommand}) {
  const status = useUpdates()
  const app = useAppInfo() ?? {version: "---"}

  console.log("[Update menu]", status)
  switch(status.status) {
    //case "idle":
    //case "up-to-date":
    //case "skipped":
    default: break;

    case "checking": return <MenuItem disabled={true} title={`Checking...`}/>

    case "available": {
      if(status.updateMethod === "automatic") {
        return <MenuItem title={`Download: ${status.version}`} onClick={e => reqUpdateDownload({setCommand})}/>
      }
      return <MenuItem disabled={true} title={`Available: ${status.version}`}/>
    }

    case "downloading": return <MenuItem disabled={true} title={`Downloading: ${Math.round(status.percent)}%`}/>
    case "downloaded": return <MenuItem title={`Relaunch to update`} onClick={e => reqRelaunch({setCommand})}/>
    case "installing": return <MenuItem disabled={true} title={`Installing...`}/>

    case "error": return <MenuItem disabled={true} title={`Error`}/>
  }

  return <MenuItem disabled={true} title={`Version v${app.version}`}/>
}

//-----------------------------------------------------------------------------
// Autoupdater user notifier
//-----------------------------------------------------------------------------

export function UpdateNotifier() {
  const {status, version, updateMethod, percent } = useUpdates();

  switch (status) {
    case "checking":   return <UpdateNote status={status} text={"Checking..."}/>
    case "skipped":    return <UpdateNote status={status} text={"Skipped"} timeout={3000}/>
    case "up-to-date": return <UpdateNote status={status} text={"Up to date"} timeout={3000}/>
    case "available":  return <UpdateAvailable status={status} version={version} updateMethod={updateMethod}/>
    case "error":      return <UpdateNote status={status} text={"Error"}/>

    case "downloading": return <UpdateNote status={status} text={`Downloading: ${Math.round(percent)}%`}/>
    case "downloaded":  return <UpdateInstall status={status} version={version}/>
    case "installing":  return <UpdateNote status={status} text={"Installing"}/>

    case "idle":
    default: return null;
  }
}

//-----------------------------------------------------------------------------
// Notifications with actions
//-----------------------------------------------------------------------------

function UpdateAvailable({status, version, updateMethod}) {
  if(updateMethod === "automatic") {
    return <UpdateNote
    status={status}
      text={`Download: v${version}`}
      action={reqUpdateDownload}
      dismissable={true}
    />
  }
  return <UpdateNote
    status={status}
    text={`Available: v${version}`}
    dismissable={true}
  />
}

function UpdateInstall({status, version}) {
  const setCommand = useContext(CmdContext)
  return <UpdateNote
    status={status}
    text={`Relaunch to update`}
    action={() => reqRelaunch({setCommand})}
    dismissable={true}
  />
}

//-----------------------------------------------------------------------------
// A single card changes in place. It is mounted beside App so document edits
// do not render it. Only transient results need a timer; idle does no work.
//-----------------------------------------------------------------------------

function UpdateNote({status, text, timeout, dismissable = false, action}) {

  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(false);
    if(timeout) {
      const timer = setTimeout(() => setDismissed(true), timeout);
      return () => clearTimeout(timer);
    }
  }, [status, timeout]);

  function onDismiss(e) {
    e.preventDefault()
    e.stopPropagation()
    setDismissed(true)
  }

  if (dismissed) {
    console.log("[Update note]", "Closed")
    return null;
  }

  console.log("[Update note]", status)

  return <aside
      className="update-notification"
      data-status={status}
      aria-label="Application updates"
      onClick={action}
    >
    <div className="update-notification-message" role="status" aria-live="polite" aria-atomic="true">
      {text}
    </div>
    {dismissable &&
      <Button className="update-notification-close" onClick={onDismiss}>
        X
      </Button>
    }
  </aside>;
}
