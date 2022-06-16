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
import {CWD} from "./store/cwdSlice"
import {onOpen} from "./filebrowser/file"

import {VBox, HBox} from "./common/factory";
import {FileBrowser} from "./filebrowser/filebrowser";
import {EditFile} from "./editor/editorSlate";
import {Organizer} from "./editor/organizer";
import {Workspace} from "./workspace/workspace";
import {Stash} from "./common/stash";

//-----------------------------------------------------------------------------

export default function App(props) {

  const dispatch = useDispatch()
  dispatch(CWD.resolve("./local"))
  //dispatch(CWD.location("home"))
  //dispatch(onOpen({id: "./local/Beltane.A.mawe.gz", name: "Beltane.A.mawe.gz"}))

  //*
  return (
    <VBox style={{height: "100vh", width: "100vw"}}>
      <View />
    </VBox>
  );

  /*/
  return (
    <HBox style={{height: "100vh", width: "100vw"}}>
      <Workspace />
      <VBox className="ViewBox"><View /></VBox>
      <Stash/>
    </HBox>
  );
  /**/

  function View(props) {
    const uuid = useSelector((state) => state.doc.uuid)

    if(uuid) {
      //return <Organizer uuid={uuid}/>
      return <EditFile uuid={uuid}/>
      //return (<pre>{JSON.stringify(state.doc, null, 2)}</pre>)
    } else {
      return <FileBrowser/>
    }
  }

}
