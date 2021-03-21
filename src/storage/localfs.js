//*****************************************************************************
//*****************************************************************************
//
// Loading and saving local files when ran under Electron
//
//*****************************************************************************
//*****************************************************************************

import Storage from "./storage";

//const path = require('path')
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

    getpathid(location)
    {
        var pathid = ipc.sendSync("fs-getlocation-sync", { name: location });
        console.log(pathid);
        return pathid;
    }

    readdir(pathid)
    {
        return ipc.sendSync("fs-readdir-sync", { pathid: pathid });
    }

    pathsplit(pathid)
    {
        return ipc.sendSync("fs-pathsplit-sync", { pathid: pathid });
    }
}
