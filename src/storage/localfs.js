//*****************************************************************************
//*****************************************************************************
//
// Loading and saving local files when ran under Electron
//
//*****************************************************************************
//*****************************************************************************

export function getfileid(location)
{
    return window.ipc.callMain("fs-getlocation", location);
}

export function readdir(fileid)
{
    return window.ipc.callMain("fs-readdir", fileid);
}

export function splitpath(fileid)
{
    return window.ipc.callMain("fs-splitpath", fileid);
}
