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
const { promisify } = require('util');
const {app} = require("electron");

function getAbsPath(pathid)
{
    if(!path.isAbsolute(pathid))
    {
        pathid = path.join(app.getAppPath(), pathid);
    }
    var abspath = path.normalize(pathid);
    //console.log(pathid, "->", abspath);
    return abspath;
}

function getDirent(pathid)
{
    try
    {
        dirent = fs.lstatSync(pathid);
        dirent.name = path.basename(pathid);
        return dirent;
    } catch(error)
    {
        return null;
    }
}

function filetype(dirent)
{
    if(dirent.isDirectory()) return "folder";
    return "file";
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

function fsGetLocationSync(event, arg)
{
    var name = arg.name;
    var pathid;

    if(name == "appPath")
    {
        pathid = app.getAppPath();
    }
    else if(name == "root")
    {
        pathid = "/";
    }
    else
    {
        try {
            pathid = app.getPath(name);
        } catch(error)
        {
            pathid = null;
        }
    }
    event.returnValue = pathid;
}

//-----------------------------------------------------------------------------
// Get the content of a directory. Returns a list of elements with name,
// type ("file", "folder", ...) and pathid (absolute path).
//-----------------------------------------------------------------------------

function fsReaddirSync(event, arg)
{
    console.log("PathID", arg.pathid);

    const pathid = getAbsPath(arg.pathid);

    var dirent = getDirent(pathid);
    
    if(dirent == null)
    {
        event.returnValue = null;
        return;
    }

    if(dirent.isDirectory())
    {
        var files = fs.readdirSync(pathid, {withFileTypes: true});
        //var files = await promisify(fs.readdir)(pathid, {withFileTypes: true});

        event.returnValue = files.map(dirent =>
            {
                return {
                    name: dirent.name,
                    type: filetype(dirent),
                    pathid: path.join(pathid, dirent.name)
                };
            });        
    }
    else
    {
        event.returnValue = [{
            name: dirent.name,
            type: filetype(dirent),
            pathid: pathid,
        }];
    }

}

//-----------------------------------------------------------------------------
// This function splits the path to a list of directory entries.
//-----------------------------------------------------------------------------

function fsPathSplitSync(event, arg)
{
    var pathid = arg.pathid;

    var dirent = getDirent(pathid);
    if(filetype(dirent) != "folder")
    {
        pathid = path.dirname(pathid);
    }

    dirs = [{
        name: path.basename(pathid),
        type: "folder",
        pathid: pathid,
    }];

    while(pathid != path.dirname(pathid))
    {
        pathid = path.dirname(pathid);
        dirs.push({
            name: path.basename(pathid),
            type: "folder",
            pathid: pathid,
        });
    } 

    dirs = dirs.reverse();

    //console.log(dirs);
    event.returnValue = dirs;
}