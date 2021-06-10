//*****************************************************************************
//*****************************************************************************
//
// Access to Electron host file system
//
//*****************************************************************************
//*****************************************************************************

exports.fsGetFileEntry = fsGetFileEntry;
exports.fsGetFiles = fsGetFiles;
exports.fsGetLocation = fsGetLocation;
exports.fsGetParentDir = fsGetParentDir;

//-----------------------------------------------------------------------------

const fs = require("fs");
const path = require('path');
const {app} = require("electron");

//-----------------------------------------------------------------------------
// Get file entry with info: name, type, real path as ID
//-----------------------------------------------------------------------------

async function fsGetFileEntry(fileid)
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
        id:      path.resolve(fileid),
        type:    null,
        symlink: false,
        access:  false,
        hidden:  path.basename(fileid).startsWith("."),
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

async function fsGetParentDir(fileid) {
    const dirid = path.dirname(fileid);
    
    if(dirid == fileid) return undefined;
    return fsGetFileEntry(dirid);
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
        files = await Promise.all(files.map(fsGetFileEntry));
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
