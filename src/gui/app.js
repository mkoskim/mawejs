import React from "react";

import {FileBrowser} from "./filebrowser/filebrowser";
import {FileEditor} from "./editor/editor";
import {FlexBox} from "./components/helpers";
import {SnackbarProvider} from "notistack";
import {Grow, Slide, Fade} from '@material-ui/core';

import {
  Dialog,
} from "@material-ui/core";

export default function App(props) {
  // Wrap views in a flex box filling the entire viewport.

  //*
  return (
    <SnackbarProvider maxSnack={3} autoHideDuration={2500} TransitionComponent={Slide}>
    <FlexBox style={{height: "100vh", width: "100vw"}}>
      <OpenFile />
    </FlexBox>
    </SnackbarProvider>
  );
  /*/
  return <Dialog open={true} maxWidth="lg" fullWidth={true} height="90vh">
    <View style={{width: "100%", height: "90vh"}}/>
    </Dialog>;
  /**/

  function OpenFile() {
    return (
    //<FileBrowser />
    <FileBrowser location="home"/>
    //<FileBrowser directory="./src" />
    //<FileBrowser directory="/dev" />
    //<FileBrowser directory="." style={style}/>
    //<FileBrowser directory="./node_modules" />
    );
  }

  function EditFile() {
    return (
      //<FileEditor fileid="local/Dinosauruspuisto.mawe" />
      //<FileEditor fileid="local/test.mawe.gz" />
      //<FileEditor fileid="local/test2.mawe" />
      <FileEditor fileid="local/Beltane.mawe" />
      //<FileEditor fileid="local/Beltane.mawe.gz" />
      //<FileEditor fileid="local/donotexist" />
      //<FileEditor fileid="local/cantread.txt" />
      //<FileEditor fileid="local/README.md" />
      //<FileEditor fileid="local/invalid.mawe" />
    )
  }
}
