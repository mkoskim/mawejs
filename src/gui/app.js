import React from "react";

import {FileBrowser} from "./filebrowser/filebrowser";
import {FlexBox} from "./components/helpers";

import {
  Dialog,
} from "@material-ui/core";

export default function App(props) {
  // Wrap views in a flex box filling the entire viewport.

  //*
  return (
    <FlexBox style={{height: "100vh", width: "100vw"}}>
      <View />
    </FlexBox>
  );
  /*/
  return <Dialog open={true} maxWidth="lg" fullWidth={true} height="90vh">
    <View style={{width: "100%", height: "90vh"}}/>
    </Dialog>;
  /**/

  function View({style}) {
    return (
    //<FileBrowser />
    //<FileBrowser location="home"/>
    // <FileBrowser directory={undefined} />
    //<FileBrowser directory="./src" />
    //<FileBrowser directory="/dev" />
    <FileBrowser directory="." style={style}/>
    //<FileBrowser directory="./node_modules" />
    );
  }
}
