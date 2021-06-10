import React from "react";

import {FileBrowser} from "./gui/filebrowser/filebrowser";

export default function App(props) {
  // Wrap views in a flex box filling the entire viewport.

  return <FlexFull><View /></FlexFull>;

  function View() {
    return (
    //<FileBrowser />
    //<FileBrowser location="home"/>
    // <FileBrowser directory={undefined} />
    //<FileBrowser directory="./src" />
    //<FileBrowser directory="/dev" />
    <FileBrowser directory="." />
    //<FileBrowser directory="./node_modules" />
    );
  }
}

/*
function FlexFull({children}) { return children; }
/*/
function FlexFull({style, children}) {
  return (
    <div style={{height: "100vh", width: "100vw", display: "flex", ...style}}>
      {children}
    </div>
  );
}
/**/