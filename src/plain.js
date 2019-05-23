import React from 'react'

import Plain from 'slate-plain-serializer'
import { Editor } from 'slate-react'
import { Toolbar, Statusbar, Button, Icon, Separator } from "./toolbar"

import isHotkey from "is-hotkey"

//-----------------------------------------------------------------------------

const lorem =
    "Lorem ipsum dolor sit amet, consectetur adipisicing elit, " +
    "sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. " +
    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris " +
    "nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in " +
    "reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla " +
    "pariatur. Excepteur sint occaecat cupidatat non proident, sunt in " +
    "culpa qui officia deserunt mollit anim id est laborum.\n\n"
;

//-----------------------------------------------------------------------------

function AddLorem(hotkey) {
    return {
        onKeyDown(event, editor, next) {
            if (isHotkey(hotkey, event)) {
                editor.insertText(lorem)
                console.log("insert")
            } else {
                return next()
            }
        },
    }
}

//-----------------------------------------------------------------------------

const plugins = [
    AddLorem("alt+l"),
];

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
                <Button>button</Button>
                
                <span style={{marginLeft: "auto"}} />
                <Button>button</Button>
                </Toolbar>
            <div className="board">
                <Editor
                    className = "editor"
                    placeholder="Enter some plain text..."
                    defaultValue={Plain.deserialize(lorem)}
                    plugins = {plugins}
                />
            </div>
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

