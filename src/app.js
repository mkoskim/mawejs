import React from "react";

import {FileBrowser, XFileBrowser} from "./gui/filebrowser/filebrowser";

export default function App(props) {
  return (
    //<FileBrowser />,
    //<FileBrowser location="home"/>,
    // <FileBrowser directory={undefined} />,
    //<FileBrowser directory="./src" />,
    //<FileBrowser directory="/dev" />,  
    <FileBrowser directory="." />
    //<FileBrowser directory="./node_modules" />,
  );
}