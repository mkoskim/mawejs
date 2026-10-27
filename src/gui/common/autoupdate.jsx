//*****************************************************************************
// Components for auto-updater
//*****************************************************************************

import { createContext, useContext, useEffect, useState } from "react";
import { getUpdateStatus, onUpdateStatus } from "../../system/host";
import { CmdContext, reqUpdateDownload, reqRelaunch } from "../app/context";
import { useAppInfo } from "../app/appinfo";
import { Button, IconButton, Icon, MenuItem, Notification } from "./factory";
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

  //console.log("[Update menu]", status)
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
  const timeout = 3000

  switch (status) {
    case "checking":   return <UpdateNote status={status} message={"Checking..."}/>
    case "skipped":    return <UpdateNote status={status} message={"Skipped"} timeout={timeout}/>
    case "up-to-date": return <UpdateNote status={status} variant="success" message={"Up to date"} timeout={timeout}/>
    case "available":  return <UpdateAvailable status={status} version={version} updateMethod={updateMethod}/>

    case "downloading": return <UpdateNote status={status} message={`Downloading: ${Math.round(percent)}%`}/>
    case "downloaded":  return <UpdateInstall status={status} version={version}/>
    case "installing":  return <UpdateNote status={status} message={"Installing"}/>

    case "error":      return <UpdateNote status={status} variant="error" message={"Error"} dismissable={true}/>

    case "idle":
    default: return null;
  }
}

//-----------------------------------------------------------------------------
// Notifications with actions
//-----------------------------------------------------------------------------

function UpdateAvailable({status, version, updateMethod}) {
  const action = (updateMethod === "automatic")
    ? <Button onClick={() => reqUpdateDownload({})}>Download</Button>
    : undefined

  return <UpdateNote
    status={status}
    message={`Available: v${version}`}
    variant="warning"
    action={action}
    dismissable={true}
  />
}

function UpdateInstall({status, version}) {
  const setCommand = useContext(CmdContext)
  return <UpdateNote
    status={status}
    variant="warning"
    message={`Relaunch to update`}
    action={<Button onClick={() => reqRelaunch({setCommand})}>Relaunch</Button>}
    dismissable={true}
  />
}

//-----------------------------------------------------------------------------
// A single card changes in place. It is mounted beside App so document edits
// do not render it. Only transient results need a timer; idle does no work.
//-----------------------------------------------------------------------------

function UpdateNote({status, message, variant, timeout, dismissable = false, action}) {

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
    //console.log("[Update note]", "Closed")
    return null;
  }

  console.log("[Update note]", status)

  return <Notification
      className="update-notification"
      //onClick={action}
      variant={variant}
      message={message}
      action={
        <div className="HBox Toolbar">
          {action}
          {dismissable && <IconButton onClick={onDismiss}><Icon.Close/></IconButton>}
        </div>
      }

    >
  </Notification>;
}
