//*****************************************************************************
//*****************************************************************************
//
// Loading and saving local files when ran under Electron
//
//*****************************************************************************
//*****************************************************************************

import Storage from "./storage";

const path = require('path')
const ipc = window.ipc;

//const {app} = require("electron").remote;

//console.log("Home:", window.homedir);

//const fs = require("fs")

export default class LocalFS extends Storage
{
    constructor()
    {
        super();
    }

    readdir()
    {
        var folder = path.join(".", "");
        var files = ipc.sendSync("fs-readdir-sync", { path: folder });
        console.log(files);
/*
        //const ipc = window.require("electron").ipcRenderer;
        //console.log(fs.readdirSync("/"));
        //console.log("app:", window.app);
        //console.log(dir);
        var files = fs.readdirSync(folder, {withFileTypes: true});
        files = files.filter(file => file["isDirectory"]());
        console.log(files);
        //files = files.filter(file => file.type.isDirectory());
        */
        return files;
    }
}
