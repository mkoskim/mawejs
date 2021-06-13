//*****************************************************************************
//*****************************************************************************
//
// File editor
//
//*****************************************************************************
//*****************************************************************************

import React, {useState, useEffect} from 'react';
import { useSnackbar } from 'notistack';

const et = require("elementtree");
const fs = require("../../storage/localfs");

export function FileEditor({fileid}) {
  const [content, setContent] = useState(undefined);
  const {enqueueSnackbar} = useSnackbar();

  useEffect(async () => {
    readfile(fileid)
      .catch(err => enqueueSnackbar(String(err), {variant: "error"}))
      .then(({file, etree}) => {
        enqueueSnackbar(`${file.name} loaded.`, {variant: "success"});
      })
    ;
  }, [content]);

  if(!content) return <p>Loading: {fileid}</p>;

}

async function readfile(fileid)
{
  const file = await fs.fstat(fileid);
  const data = await fs.read(fileid);

  const etree = et.parse(data);
  console.log(etree);
  
  const root = etree.root;
  //if(root.tag != "story")
  //setContent(parser.parseFromString(result, "text/xml"));
  return {file: file, etree: etree};
}