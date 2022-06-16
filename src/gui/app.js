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

import {VBox, HBox} from "./component/factory";
import {FileBrowser} from "./filebrowser/filebrowser";
import {EditFile} from "./editor/editorSlate";

//-----------------------------------------------------------------------------

export default function App(props) {

  return (
    <VBox style={{height: "100vh", width: "100vw"}}>
      <View />
    </VBox>
  );

  /*/
  return <Dialog open={true} maxWidth="lg" fullWidth={true} height="90vh">
    <View style={{width: "100%", height: "90vh"}}/>
    </Dialog>;
  /**/

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
