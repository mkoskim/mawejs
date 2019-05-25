import React from 'react'

import Plain from 'slate-plain-serializer'
import { Editor } from 'slate-react'
import { Block, Value } from "slate"
import { Toolbar, Statusbar, Button, Icon, Separator } from "./toolbar"

import isHotkey from "is-hotkey"

//-----------------------------------------------------------------------------

import "./sheet.css"

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

const story = lorem;

//-----------------------------------------------------------------------------
// Editor to edit scene lists
//-----------------------------------------------------------------------------

export default class SceneListEditor extends React.Component
{
    //-------------------------------------------------------------------------

    schema = {
//*
        blocks: {
            folded: {
            }
        }
/**/
    }

    //-------------------------------------------------------------------------

    state = { value: story }

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
                <div className="Board">
                    <Editor
                        className = "Sheet"

                        ref    = { this.ref }
                        value  = { this.state.value }
                        schema = { this.schema }

                        onKeyDown   = {this.onKeyDown}
                        onChange    = {this.onChange}
                        renderMark  = {this.renderMark}
                        renderBlock = {this.renderBlock}
                        
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
    // Helpers
    //-------------------------------------------------------------------------
    
    hasMark = type => {
        const { value } = this.state
        return value.activeMarks.some(mark => mark.type === type)
    }

    hasBlock = type => {
        const { value } = this.state
        return value.blocks.some(node => node.type === type)
    }

    //-------------------------------------------------------------------------
    // Marks
    //-------------------------------------------------------------------------
    
    renderMark = (props, editor, next) =>
    {
        const { mark, attributes, children } = props
        
        switch(mark.type)
        {
            case "bold": return <strong {...attributes}>{children}</strong>;
            default: return next();
        }
    }

    //-------------------------------------------------------------------------
    // Blocks
    //-------------------------------------------------------------------------
    
    renderBlock = (props, editor, next) =>
    {
        const { node, attributes, children } = props
        
        switch(node.type)
        {
            case "title":  return <div id="title" {...attributes}>{children}</div>;
            case "author": return <div id="author" {...attributes}>{children}</div>;

            case "folded": return (
                <div id="folded" contentEditable={false} {...attributes}>...
                    <div id="hidden">{children}</div>
                </div>
            );

            case "line":   return <p {...attributes}>{children}</p>;
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
        else if(isHotkey("Alt+L", event))
        {
            editor.insertFragment(lorem.document)
        }
        else if(isHotkey("Alt+F", event))
        {
            const { value: { document, blocks } } = this.state;
            const block  = blocks.first();
            const parent = document.getParent(block.key);
            
            if(parent && parent.type === "folded")
                editor.unwrapBlock("folded");
            else
                editor.wrapBlock("folded");
        }
        else return next();

        event.preventDefault();
    }
}

