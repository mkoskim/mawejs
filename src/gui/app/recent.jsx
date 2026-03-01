//*****************************************************************************
//*****************************************************************************
//
// Choosing file from recent list
//
//*****************************************************************************
//*****************************************************************************
import React, { useCallback, useContext } from "react";
import {
  Dialog, DialogActions, DialogContent, DialogTitle,
  Button, IconButton,
  Filler, HBox, VBox, HFiller, VFiller,
  Icon, Label, ToolBox,
} from "../common/factory";
import { recentRemove, SettingsContext } from "./settings";
import { CmdContext, doLoadFile } from "./context";

//import IconButton from '@mui/material/IconButton';
//import CloseIcon from '@mui/icons-material/Close';
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
  const onOpenFiles = useCallback(() => {
    reqOpenFile({ setCommand });
    cancel();
  }, [setCommand, cancel])

  //console.log("Recent files:", recent)

  return <Dialog open={true} onOpenChange={cancel}>
    <DialogTitle>
      <Label style={{fontWeight: "bold"}}>Open recent</Label>
      <Filler/>
      <IconButton color="error" onClick={cancel}><Icon.Close/></IconButton>
    </DialogTitle>

    <VBox className="TOC" style={{paddingLeft: "16px"}}>
    {recent.map(entry => (
      <FileEntry key={entry.id} name={entry.name} id={entry.id} onClick={onClick} onRemove={onRemove}/>
    ))}
    </VBox>

    <DialogActions>
      <Filler/>
      <Button onClick={onOpenFiles}>Open files...</Button>
    </DialogActions>
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
    <VFiller text={name} onClick={e => exists && onClick(id)}>
      <Label text={name} style={{ fontWeight: 500 }} />
      <Label
          text={squeezeDirPath(id, name, 8)}
          style={{
            fontSize: "9pt",
            opacity: 0.4,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        />
      </VFiller>
    <IconButton size="small" sx={btn_sx} onClick={() => onRemove(id)}>
      <Icon.Close style={{color: color()}} fontSize="12pt"/>
      </IconButton>
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