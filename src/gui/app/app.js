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
import {CWD} from "./store"
import {workspace} from "./store"
import {onOpen} from "../filebrowser/file"

import {VBox, HBox} from "../common/factory";
import {FileBrowser} from "../filebrowser";
import {Organizer} from "../editor/organizer";
import {Workspace} from "../workspace";

//const fs = require("../../storage/localfs")

//-----------------------------------------------------------------------------

export default function App(props) {

  const dispatch = useDispatch()
  dispatch(CWD.resolve("./local"))
  dispatch(workspace.init())

  //dispatch(CWD.location("home"))
  //dispatch(onOpen({id: "./local/Beltane.A.mawe.gz", name: "Beltane.A.mawe.gz"}))

  /*
  return (
      <VBox style={{height: "100vh", width: "100vw"}}>
        <View />
      </VBox>
  );

  /*/
  return (
    <HBox style={{height: "100vh", width: "100vw"}}>
      <Workspace />
    </HBox>
  );
  /**/

  function View(props) {
    const uuid = useSelector((state) => state.doc.uuid)

    if(uuid) {
      return <Organizer uuid={uuid}/>
      //return <EditFile uuid={uuid}/>
      //return (<pre>{JSON.stringify(state.doc, null, 2)}</pre>)
    } else {
      return <FileBrowser/>
    }
  }

}
