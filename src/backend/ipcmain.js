//*****************************************************************************
//*****************************************************************************
//
// IPC interface: This is mainly meant to give renderer (application)
// access to local drive. My aim is to create an interface to local disk
// which resembles a bit network based disks like Google Drive. This could
// help later integrating such drives to the application.
//
//*****************************************************************************
//*****************************************************************************

const {ipcMain} = require("electron");

ipcMain.on("fs-getlocation-sync", fsGetLocationSync);
ipcMain.on("fs-readdir-sync", fsReaddirSync);
ipcMain.on("fs-pathsplit-sync", fsPathSplitSync);

//-----------------------------------------------------------------------------

const fs = require("fs");
const path = require("path");
const {app} = require("electron");
const hostfs = require("./hostfs");
const { promisify } = require("util");

//-----------------------------------------------------------------------------
// Get the content of a directory. Returns a list of elements with name,
// type ("file", "folder", ...) and fileid (absolute path).
//-----------------------------------------------------------------------------

async function fsReaddirSync(event, arg)
{
    console.log("FileID", arg.fileid);

    const entries = await hostfs.getFiles(arg.fileid);

    event.returnValue = entries;
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

function fsGetLocationSync(event, arg)
{
    var name = arg.name;
    var fileid;

    if(name == "appPath")
    {
        fileid = app.getAppPath();
    }
    else if(name == "root")
    {
        fileid = "/";
    }
    else
    {
        try {
            fileid = app.getPath(name);
        } catch(error)
        {
            fileid = null;
        }
    }
    event.returnValue = fileid;
}

//-----------------------------------------------------------------------------
// This function splits the path to a list of directory entries.
//-----------------------------------------------------------------------------

async function fsPathSplitSync(event, arg)
{
    var fileid = arg.fileid;

    var dirent = await hostfs.getFileEntry(fileid);
    if(dirent.type != "folder")
    {
        fileid = path.dirname(fileid);
    }

    dirs = [{
        name: path.basename(fileid),
        type: "folder",
        fileid: fileid,
    }];

    while(fileid != path.dirname(fileid))
    {
        fileid = path.dirname(fileid);
        dirs.push({
            name: path.basename(fileid),
            type: "folder",
            fileid: fileid,
        });
    } 

    dirs = dirs.reverse();

    //console.log(dirs);
    event.returnValue = dirs;
}