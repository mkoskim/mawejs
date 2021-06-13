//*****************************************************************************
//*****************************************************************************
//
// File editor
//
//*****************************************************************************
//*****************************************************************************

import React, {useState, useEffect} from 'react';
import { useSnackbar } from 'notistack';
import { writeFile } from 'fs';

const et = require("elementtree");
const fs = require("../../storage/localfs");
const util = require("util");
const isGzip = require("is-gzip");
const zlib = require("zlib");
const gunzip = util.promisify(zlib.gunzip);
const gzip = util.promisify(zlib.gzip);

export function FileEditor({fileid}) {
  const [content, setContent] = useState(undefined);
  const {enqueueSnackbar} = useSnackbar();

  useEffect(() => {
    readfile(fileid)
      .then((content) => {
        //writefile(content.file, content.compressed, content.buffer);
        setContent(content);    
        enqueueSnackbar(`Loaded ${content.file.name}`, {variant: "success"});
      })
      .catch(err => enqueueSnackbar(String(err), {variant: "error"}));
  }, [fileid, enqueueSnackbar]);

  if(!content) return <p>Loading: {fileid}</p>;

  console.log(content);
  return <p>{content.file.name}</p>;
}

async function readfile(fileid)
{
  const file = await fs.fstat(fileid);
  const [buffer, compressed] = await read(fileid);
  
  return {
    file: file,
    compressed: compressed,
    buffer: buffer,
    story: parse(String.fromCharCode.apply(null, buffer))
  };

  async function read(fileid) {
    const buffer = await fs.read(fileid, null);
    //console.log("Buffer:", buffer)

    if(isGzip(buffer)) {
      return [await gunzip(buffer), true];
    } else {
      return [buffer, false];
    }
  }

  function parse(buffer) {
    console.log("To parser:", buffer.slice(0, 200))
    const story = et.parse(buffer);
    console.log("Parsed:", story);
    
    const root = story.getroot();
    if(root.tag !== "story") throw Error(`${file.name}: Not a mawe file.`)
    
    return root;
  }
}

async function writefile(file, compress, content) {
  const buffer = compress ? await gzip(content, {level: 9}) : content;

  fs.write("local/test" + (compress ? ".mawe.gz" : ".mawe"), buffer);
}
