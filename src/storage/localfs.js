//*****************************************************************************
//*****************************************************************************
//
// Loading and saving local files when ran under Electron
//
//*****************************************************************************
//*****************************************************************************

export {
    getfileid,
    readdir,
    splitpath
}

function getfileid(location)
{
    return window.ipc.callMain("fs-getlocation", location);
}

function readdir(fileid)
{
    return window.ipc.callMain("fs-readdir", fileid);
}

function splitpath(fileid)
{
    return window.ipc.callMain("fs-splitpath", fileid);
}
