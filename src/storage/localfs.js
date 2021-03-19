//*****************************************************************************
//*****************************************************************************
//
// Loading and saving local files when ran under Electron
//
//*****************************************************************************
//*****************************************************************************

import Storage from "./storage";

const path = require('path')  
const fs = window.fs;
//const {app} = require("electron").remote;

//console.log("Home:", window.homedir);

//const fs = require("fs")

export default class LocalFS extends Storage
{
    constructor()
    {
        super();

        //const ipc = window.require("electron").ipcRenderer;
        //console.log(fs.readdirSync("/"));
        //console.log("app:", window.app);
        var dir = path.join(".", "");
        console.log(dir);
        var files = fs.readdirSync(dir);
        console.log(files);
    }
}
