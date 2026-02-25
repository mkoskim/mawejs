//*****************************************************************************
//*****************************************************************************
//
// Choosing file from recent list
//
//*****************************************************************************
//*****************************************************************************
// TODO: add file path under file name
import React, { useCallback, useContext } from "react";
import { Button, Dialog, Filler, HBox, Icon, Label, ToolBox, VBox } from "../common/factory";
import { recentRemove, SettingsContext } from "./settings";
import { CmdContext, doLoadFile } from "./context";

import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import fs from "../../system/localfs";

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

  return <HBox className="Entry" style={{color: color()}}>
    <Label text={name} style={{flexGrow: 1}} onClick={e => exists && onClick(id)}/>
    <Button sx={btn_sx} tooltip="Remove" onClick={() => onRemove(id)}><Icon.Close style={{color: color()}} fontSize="12pt"/></Button>
  </HBox>
}
