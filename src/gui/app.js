//*****************************************************************************
//*****************************************************************************
//
// Application main
//
//*****************************************************************************
//*****************************************************************************

import "./app.css"

/* eslint-disable no-unused-vars */

import React from 'react'
import { useSelector, useDispatch } from "react-redux";
import {CWD} from "../features/cwdSlice"
import {onOpen} from "./filebrowser/file"

import {VBox, HBox} from "./component/factory";
import {FileBrowser} from "./filebrowser/filebrowser";
import {EditFile} from "./editor/editorSlate";
import {Workspace} from "./workspace/workspace";

//-----------------------------------------------------------------------------

export default function App(props) {

  const dispatch = useDispatch()
  //dispatch(CWD.resolve("."))
  dispatch(CWD.location("home"))
  dispatch(onOpen({id: "./local/Beltane.A.mawe.gz", name: "Beltane.A.mawe.gz"}))

  return (
    <HBox style={{height: "100vh", width: "100vw"}}>
      <Workspace />
      <VBox style={{flexGrow: 1.0}}><View /></VBox>
    </HBox>
  );

  function View(props) {
    const uuid = useSelector((state) => state.doc.uuid)

    if(uuid) {
      return <Editor uuid={uuid}/>
      //return (<pre>{JSON.stringify(state.doc, null, 2)}</pre>)
    } else {
      return <BrowseFiles/>
    }
  }

  function Editor({uuid}) {
    return <EditFile uuid={uuid}/>
  }

  function BrowseFiles() {
    return <FileBrowser/>
  }
}
