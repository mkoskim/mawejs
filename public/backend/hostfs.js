//*****************************************************************************
//*****************************************************************************
//
// Access to Electron host file system
//
//*****************************************************************************
//*****************************************************************************

exports.getFileEntry = getFileEntry;
exports.fsGetFiles = fsGetFiles;
exports.fsGetLocation = fsGetLocation;
exports.fsSplitPath = fsSplitPath;

//-----------------------------------------------------------------------------

const fs = require("fs");
const path = require('path');
const {app} = require("electron");

//-----------------------------------------------------------------------------
// Get file entry with info: name, type, real path as ID
//-----------------------------------------------------------------------------

async function getFileEntry(fileid)
{
    async function hasaccess(fileid)
    {
        try
        {
            await fs.promises.access(fileid, fs.constants.R_OK);
        } catch(err)
        {
            return false;
        }
        return true;
    }

    var entry = {
        name:    path.basename(fileid),
        fileid:  fileid,
        type:    null,
        symlink: false,
        access:  false,
    }

    var dirent = await fs.promises.lstat(fileid).catch(err => null);

    if(!dirent) return entry;

    if(dirent.isSymbolicLink())
    {
        entry.symlink = true;

        const realid = await fs.promises.realpath(fileid).catch(err => null);

        if(!realid) return entry;

        dirent = await fs.promises.stat(realid).catch(err => null);

        if(!dirent) return entry;

        entry.access = await hasaccess(realid);
    }
    else
    {
        entry.access = await hasaccess(fileid);
    }

    entry.type = ((file) =>
    {
        if(file.isDirectory()) return "folder";
        if(file.isFile()) return "file";
        return null;
    })(dirent);

    // Return entry
    return entry;
}

//-----------------------------------------------------------------------------
// Get file entries from directory
//-----------------------------------------------------------------------------

async function fsGetFiles(dirid)
{
    try
    {
        var files = await fs.promises.readdir(dirid);
        files = files.map(file => path.resolve(dirid, file));
        files = await Promise.all(files.map(getFileEntry));
        return files;
    } catch(err)
    {
        return null;
    }
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

async function fsGetLocation(name)
{
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

    return fileid;
}

//-----------------------------------------------------------------------------
// This function splits the path to a list of directory entries.
//-----------------------------------------------------------------------------

async function fsSplitPath(fileid)
{
    var dirent = await getFileEntry(fileid);
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

    return dirs.reverse();
}
