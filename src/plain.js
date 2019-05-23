import React from 'react'

import Plain from 'slate-plain-serializer'
import { Editor } from 'slate-react'
import { Toolbar, Statusbar, Button, Icon, Separator } from "./toolbar"

//-----------------------------------------------------------------------------

const initialValue = Plain.deserialize(
  'This is editable plain text, just like a <textarea>!'
)

//-----------------------------------------------------------------------------

//*
function PlainText(props)
{
    return (
        <React.Fragment>
            <Toolbar>
                <Icon name="format_bold"/>
                <Icon name="format_italic"/>
                <Separator/>
                <Button>BTN</Button>
                
                <span style={{marginLeft: "auto"}} />
                <Button>BTN</Button>
                </Toolbar>
            <Editor
                className = "editor"
                placeholder="Enter some plain text..."
                defaultValue={initialValue}
            />
            <Statusbar>
                <span className="word-count">XXX</span>
                </Statusbar>
        </React.Fragment>
    )
}

/*/
class PlainText extends React.Component {
  render() {
    return (
      <Editor
        renderEditor={renderEditor}
        placeholder="Enter some plain text..."
        defaultValue={initialValue}
      />
    )
  }
}
/**/

export default PlainText

//-----------------------------------------------------------------------------

