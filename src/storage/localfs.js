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

    getfileid(location)
    {
        var fileid = ipc.sendSync("fs-getlocation-sync", { name: location });
        console.log(location, "->", fileid);
        return fileid;
    }

    readdir(fileid)
    {
        return ipc.sendSync("fs-readdir-sync", { fileid: fileid });
    }

    pathsplit(fileid)
    {
        return ipc.sendSync("fs-pathsplit-sync", { fileid: fileid });
    }
}
