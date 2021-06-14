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
      .then(story => {
        //story.version.push(JSON.parse(JSON.stringify(story.body)));
        setContent(story);
        document.save.mawe("./local/test2.mawe", story.story);
        //document.print.rtf();
        enqueueSnackbar(`Loaded ${story.file.name}`, {variant: "success"});
      })
      .catch(err => enqueueSnackbar(String(err), {variant: "error"}));
  }, [fileid]);

  if(!content) return <p>Loading: {fileid}</p>;

  return <pre>{JSON.stringify(content, null, 2)}</pre>;
}
