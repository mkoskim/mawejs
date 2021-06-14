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
      .then(doc => {
        //doc.story.version.push(document.copybody(doc.story.body));
        setContent(doc);
        document.save.mawe("./local/test2.mawe", doc.story)
        //.catch(e => { console.log(e); })
        ;
        //document.print.rtf();
        enqueueSnackbar(`Loaded ${doc.file.name}`, {variant: "success"});
      })
      .catch(err => enqueueSnackbar(String(err), {variant: "error"}));
  }, [fileid]);

  if(!content) return <p>Loading: {fileid}</p>;

  return <pre>{JSON.stringify(content, null, 2)}</pre>;
}
