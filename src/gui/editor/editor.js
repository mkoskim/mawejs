//*****************************************************************************
//*****************************************************************************
//
// File editor
//
//*****************************************************************************
//*****************************************************************************

import React, {useState, useEffect} from 'react';
import { useSnackbar } from 'notistack';

const document = require("../../document");

export function FileEditor({fileid}) {
  const [content, setContent] = useState(undefined);
  const {enqueueSnackbar} = useSnackbar();

  useEffect(() => {
    document.load(fileid)
      .then(content => {
        setContent(content);
        //document.save.mawe("./local/test.mawe", content.story);
        //document.print.rtf();
        enqueueSnackbar(`Loaded ${content.file.name}`, {variant: "success"});
      })
      .catch(err => enqueueSnackbar(String(err), {variant: "error"}));
  }, [fileid]);

  if(!content) return <p>Loading: {fileid}</p>;

  console.log(content);
  return <pre>{content.file.name}</pre>;
}
