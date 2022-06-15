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

import {VBox} from "./component/factory";
import {FileBrowser} from "./filebrowser/filebrowser";
import {EditFile} from "./editor/editorSlate";
import {SnackbarProvider} from "notistack";
import {Slide, Grow, Fade, Zoom} from '@mui/material';

//-----------------------------------------------------------------------------

export default function App(props) {

  /*
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
  */

  function SlideUp(props) { return <Slide {...props} direction="up" /> }
  function SlideDown(props) { return <Slide {...props} direction="down" /> }

  const uuid = useSelector((state) => state.doc.uuid)
  var {docs} = require("../features/store")

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
    if(uuid) {
      return <EditFile doc={docs[uuid]}/>
      //return (<pre>{JSON.stringify(state.doc, null, 2)}</pre>)
    } else {
      return <FileBrowser/>
    }
  }

  // TODO: Use these to make test cases:
    //<FileEditor fileid="local/donotexist" />
    //<FileEditor fileid="local/cantread.txt" />
    //<FileEditor fileid="local/README.md" />
    //<FileEditor fileid="local/invalid.mawe" />
}
