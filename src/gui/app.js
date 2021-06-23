//*****************************************************************************
//*****************************************************************************
//
// Application main
//
//*****************************************************************************
//*****************************************************************************

import "./app.css"

/* eslint-disable no-unused-vars */

import React, {useState} from 'react'

import {VBox} from "./component/factory";

import {FileBrowser} from "./filebrowser/filebrowser";
import {EditFile} from "./editor/editorSlate";
import {SnackbarProvider} from "notistack";
import {Slide, Grow, Fade, Zoom} from '@material-ui/core';

//-----------------------------------------------------------------------------

export default function App(props) {

  const [state, setState] = useState({
    doc: undefined,
    //file: "./local/Beltane.mawe",
    //file: "./local/Dinosauruspuisto.mawe",
  })

  console.log("render: App", state);

  const hooks = {
    closeFile: () => {
      console.log("closeFile");
      setState(state => ({...state, doc: undefined}))
    },
    openFile: doc => {
      console.log("openFile")
      setState(state => ({...state, doc: doc}))
    },
  }

  function SlideUp(props) { return <Slide {...props} direction="up" /> }
  function SlideDown(props) { return <Slide {...props} direction="down" /> }

  //*
  return (
    <SnackbarProvider maxSnack={3} autoHideDuration={2500} TransitionComponent={Fade}>
    <VBox style={{height: "100vh", width: "100vw"}}>
      <View />
    </VBox>
    </SnackbarProvider>
  );
  /*/
  return <Dialog open={true} maxWidth="lg" fullWidth={true} height="90vh">
    <View style={{width: "100%", height: "90vh"}}/>
    </Dialog>;
  /**/

  function View(props) {
    if(state.doc) {
      return <EditFile doc={state.doc} hooks={hooks}/>
    } else {
      return <FileBrowser directory="./local" hooks={hooks}/>
    }
  }

  // TODO: Use these to make test cases:
    //<FileEditor fileid="local/donotexist" />
    //<FileEditor fileid="local/cantread.txt" />
    //<FileEditor fileid="local/README.md" />
    //<FileEditor fileid="local/invalid.mawe" />
}
