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

import {FileBrowser} from "./filebrowser/filebrowser";
import {EditFile} from "./editor/editor";
import {VBox} from "./components/factory";
import {SnackbarProvider} from "notistack";
import {Slide, Grow, Fade, Zoom} from '@material-ui/core';

import {
  Dialog,
} from "@material-ui/core";

export default class App extends React.Component {

  constructor(props) {
    super(props);

    console.log("constructor: App")

    this.state = {
      doc: undefined,
      //file: "./local/Beltane.mawe",
      //file: "./local/Dinosauruspuisto.mawe",
    }

    this.hooks = {
      closeFile: () => { this.setState({...this.state, doc: undefined}); },
      openFile: (doc) => { this.setState({...this.state, doc: doc}); },
    }
  }

  render() {
    function SlideUp(props) { return <Slide {...props} direction="up" /> }
    function SlideDown(props) { return <Slide {...props} direction="down" /> }

    console.log("File:", this.state.file);

    const {style, view} = this.chooseView();

    //*
    return (
      <SnackbarProvider maxSnack={3} autoHideDuration={2500} TransitionComponent={Fade}>
      <VBox style={{...style, height: "100vh", width: "100vw"}}>
        {view}
      </VBox>
      </SnackbarProvider>
    );
    /*/
    return <Dialog open={true} maxWidth="lg" fullWidth={true} height="90vh">
      <View style={{width: "100%", height: "90vh"}}/>
      </Dialog>;
    /**/
  }

  chooseView() {
    if(this.state.doc) {
      return {
        style: {backgroundColor: "#EEE"},
        view: <EditFile doc={this.state.doc} hooks={this.hooks}/>,
      }
    } else {
      return {
        style: undefined,
        view: <FileBrowser directory="./local" hooks={this.hooks}/>,
      }
    }
  }

    // TODO: Use these to make test cases:
      //<FileEditor fileid="local/donotexist" />
      //<FileEditor fileid="local/cantread.txt" />
      //<FileEditor fileid="local/README.md" />
      //<FileEditor fileid="local/invalid.mawe" />
}
