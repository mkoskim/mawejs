//*****************************************************************************
//*****************************************************************************
//
// Loading and saving local files when ran under Electron
//
//*****************************************************************************
//*****************************************************************************

import Storage from "./storage";
const fs = window.fs;

//const fs = require("fs")

export default class LocalFS extends Storage
{
    constructor()
    {
        super();

        //const ipc = window.require("electron").ipcRenderer;
        //console.log(fs.readdirSync("/"));
        console.log(fs.readdirSync("/"));
    }


}
