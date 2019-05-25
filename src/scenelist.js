import React from 'react'

import Plain from 'slate-plain-serializer'
import { Editor } from 'slate-react'
import { Toolbar, Statusbar, Button, Icon, Separator } from "./toolbar"

import isHotkey from "is-hotkey"

//-----------------------------------------------------------------------------

const lorem = Plain.deserialize(
    "Lorem ipsum dolor sit amet, consectetur adipisicing elit, " +
    "sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. " +
    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris " +
    "nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in " +
    "reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla " +
    "pariatur. Excepteur sint occaecat cupidatat non proident, sunt in " +
    "culpa qui officia deserunt mollit anim id est laborum.\n\n"
);

//-----------------------------------------------------------------------------
// Editor to edit scene lists
//-----------------------------------------------------------------------------

export default class SceneListEditor extends React.Component
{
    //-------------------------------------------------------------------------

    state = { value: lorem }

    ref = editor => { this.editor = editor }
    
    onChange = ({value}) => { this.setState({value}); }

    //-------------------------------------------------------------------------

    render()
    {
        return (
            <div className="Editor">
                <Toolbar>
                    <Icon name="format_bold"/>
                    <Icon name="format_italic"/>
                    <Separator/>
                    <Button>button</Button>
                    
                    <span style={{marginLeft: "auto"}} />
                    <Button>button</Button>
                    </Toolbar>
                <div className="Board" lang="fi">
                    <Editor
                        className = "Sheet"

                        ref   = { this.ref }
                        value = { this.state.value }
                        
                        onKeyDown  = {this.onKeyDown}
                        onChange   = {this.onChange}
                        renderMark = {this.renderMark}
                        
                        /* Chrome understand only English :( */
                        spellCheck  = {false}
                        autoCorrect = {false}
                    />
                </div>
                <Statusbar>
                    <span className="word-count">XXX</span>
                    </Statusbar>
            </div>
        )
    }

    //-------------------------------------------------------------------------
    // Marks
    //-------------------------------------------------------------------------
    
    renderMark = (props, editor, next) =>
    {
        const { children, mark, attributes } = props
        
        switch(mark.type)
        {
            case "bold": return <strong {...attributes}>{children}</strong>;
            default: return next();
        }
    }

    //-------------------------------------------------------------------------
    // Hotkeys
    //-------------------------------------------------------------------------

    onKeyDown = (event, editor, next) =>
    {
        if(isHotkey("Mod+B", event))
        {
            editor.toggleMark("bold");
        }
        if(isHotkey("Alt+L", event))
        {
            editor.insertFragment(lorem.document)
        }
        else return next();

        event.preventDefault();
    }
}

