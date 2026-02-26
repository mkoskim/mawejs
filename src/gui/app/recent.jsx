//*****************************************************************************
//*****************************************************************************
//
// Choosing file from recent list
//
//*****************************************************************************
//*****************************************************************************
import React, { useCallback, useContext } from "react";
import { Button, Dialog, Filler, HBox, Icon, Label, ToolBox, VBox } from "../common/factory";
import { recentRemove, SettingsContext } from "./settings";
import { CmdContext, doLoadFile } from "./context";

import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import fs from "../../system/localfs";
import { reqOpenFile } from "./context"

export function RecentDialog({ setDialogs, setRecent }) {
  const { recent } = useContext(SettingsContext)
  const setCommand = useContext(CmdContext)

  const cancel = useCallback(() => setDialogs(d => { delete d.recent; }), [])
  const onClick = useCallback((filename) => {
    doLoadFile({ setCommand, filename })
    cancel()
  }, [setCommand, cancel])
  const onRemove = useCallback((filename) => {
    console.log("Remove:", filename)
    setRecent(recentRemove(recent, { id: filename }))
  }, [recent, setRecent])

  //console.log("Recent files:", recent)

  return <Dialog open={true} onClose={cancel}>
    <VBox className="TOC" style={{ overflow: "auto", padding: "4pt", background: "#F5F7F9" }}>
      <ToolBox>
        <Label>Open file...</Label>
        <Filler />
        <IconButton color="error" onClick={cancel}>
          <CloseIcon />
        </IconButton>
      </ToolBox>

      {recent.map(entry => (
        <FileEntry key={entry.id} name={entry.name} id={entry.id} onClick={onClick} onRemove={onRemove}/>
      ))}

      {/* fallback */}
        <HBox style={{ justifyContent: "flex-end", marginTop: "12px" }}>
          <button
            style={{ borderRadius: "12px", padding: "6px 12px" }}
            onClick={() => reqOpenFile({ setCommand })}
          >
            Open File…
          </button>
        </HBox>
    </VBox>
  </Dialog>
}

function FileEntry({name, id, onClick, onRemove}) {
  const[exists, setExists] = React.useState()
  const btn_sx = {borderRadius: "12px"}

  React.useEffect(() => {
    fs.fstat(id)
    .then(file => {
      //console.log("File stat:", file)
      setExists(true)
    })
    .catch(err => {
      //console.log("File stat error:", err)
      setExists(false)
    })
  }, [id])

  const color = () => {
    if(exists === undefined) return "gray"
    return exists ? "black" : "red"
  }

  return (
   <HBox className="Entry" style={{color: color(), alignItems: "center"}}>
    <VBox text={name} style={{flexGrow: 1, minWidth: 0}} onClick={e => exists && onClick(id)}>
      <Label text={name} style={{ fontWeight: 500 }} />
      <Label
          text={squeezeDirPath(id, name, 4)}
          style={{
            fontSize: "9pt",
            opacity: 0.4,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        />
      </VBox>

    <Button sx={btn_sx} tooltip="Remove" onClick={() => onRemove(id)}><Icon.Close style={{color: color()}} fontSize="12pt"/></Button>
  </HBox>
  )
}
// Convert Windows backslashes "\" to "/" so path handling is consistent
function normalizeSep(p) {
  return (p || "").replace(/\\/g, "/"); // Windows -> POSIX
}
// If the path is long, prefix with ".../"
function squeezeDirPath(id, name, keepSegments = 3) {
  if (!id) return "";
  const raw = String(id);
  const p = normalizeSep(raw);

  // cloud id / non-path
  if (!p.includes("/")) return raw;

  // Remove file name
  let dir = p;
  if (name && p.endsWith("/" + name)) {
    dir = p.slice(0, -name.length);
  } else {
    dir = p.replace(/[^/]+$/, ""); // drop last segment
  }

  if (dir && !dir.endsWith("/")) dir += "/";

  // Keep only last few folders
  const parts = dir.split("/").filter(Boolean);
  if (parts.length <= keepSegments) return "/" + parts.join("/") + "/";

  const tail = parts.slice(-keepSegments).join("/");
  return `.../${tail}/`;
}