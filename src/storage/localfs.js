//*****************************************************************************
//*****************************************************************************
//
// Loading and saving local files when ran under Electron
//
//*****************************************************************************
//*****************************************************************************

import Storage from "./storage";

export default class LocalFS extends Storage
{
    constructor()
    {
        super();
    }

    getfileid(location)
    {
        return window.ipc.callMain("fs-getlocation", location);
    }

    readdir(fileid)
    {
        return window.ipc.callMain("fs-readdir", fileid);
    }

    splitpath(fileid)
    {
        return window.ipc.callMain("fs-splitpath", fileid);
    }
}
