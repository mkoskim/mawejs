import React, {useState, useEffect} from 'react'

import {FileBrowser} from "./filebrowser/filebrowser";
import {EditFile} from "./editor/editor";
import {FlexBox} from "./components/factory";
import {SnackbarProvider} from "notistack";
import {Grow, Slide, Fade} from '@material-ui/core';

import {
  Dialog,
} from "@material-ui/core";
import { render } from 'react-dom';

export default class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      //file: undefined,
      //file: "./local/Beltane.mawe",
      file: "./local/Dinosauruspuisto.mawe",
    }
  }

  render() {
    console.log("File:", this.state.file);
    //*
    return (
      <SnackbarProvider maxSnack={3} autoHideDuration={2500} TransitionComponent={Slide}>
      <FlexBox style={{height: "100vh", width: "100vw"}}>
        {this.View()}
      </FlexBox>
      </SnackbarProvider>
    );
    /*/
    return <Dialog open={true} maxWidth="lg" fullWidth={true} height="90vh">
      <View style={{width: "100%", height: "90vh"}}/>
      </Dialog>;
    /**/
  }

  View() {
    if(this.state.file) {
      return <EditFile fileid={this.state.file} />
    } else {
      return <FileBrowser location="home"/>
    }
  }

    // TODO: Use these to make test cases:
      //<FileEditor fileid="local/donotexist" />
      //<FileEditor fileid="local/cantread.txt" />
      //<FileEditor fileid="local/README.md" />
      //<FileEditor fileid="local/invalid.mawe" />
}
