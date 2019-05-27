import React from 'react'

import Plain from 'slate-plain-serializer'
import { Editor } from 'slate-react'
import { Block, Value } from "slate"
import { Toolbar, Statusbar, Button, Icon, Separator } from "./toolbar"

import isHotkey from "is-hotkey"

//-----------------------------------------------------------------------------

import "./sheet.css"

import xmlfile from "./story.xml";

//-----------------------------------------------------------------------------

const lorem = Plain.deserialize(
    "Lorem ipsum dolor sit amet, consectetur adipisicing elit, " +
    "sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. " +
    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris " +
    "nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in " +
    "reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla " +
    "pariatur. Excepteur sint occaecat cupidatat non proident, sunt in " +
    "culpa qui officia deserunt mollit anim id est laborum.\n"
);

//-----------------------------------------------------------------------------
// TODO: We need some material for further development. Lets make XML
// import.
//-----------------------------------------------------------------------------

const parsed = new DOMParser().parseFromString(xmlfile, "text/xml");

const story = lorem;

//-----------------------------------------------------------------------------
// Element schema
//-----------------------------------------------------------------------------

const schema = {
    document:
    {
    },
    
    blocks:
    {
        scenebreak: { isVoid: true },
        folded: { isVoid: true },
    },

    inlines:
    {
        action: { isVoid: true },
    },
}

//-----------------------------------------------------------------------------
// Element rendering
//-----------------------------------------------------------------------------

const render = 
{
    "bold": (props, editor, next) =>
    {
        return <b {...props.attributes}>{props.children}</b>;
    },
    "italic": (props, editor, next) =>
    {
        return <i {...props.attributes}>{props.children}</i>;
    },

    //-------------------------------------------------------------------------

    "line": (props, editor, next) =>
    {
        return <p {...props.attributes}>{props.children}</p>;
    },
    "comment": (props, editor, next) =>
    {
        return <div id="comment" {...props.attributes}>{props.children}</div>;
    },

    //-------------------------------------------------------------------------

    "title": (props, editor, next) =>
    {
        return <div id="title" {...props.attributes}>{props.children}</div>;
    },
    "author": (props, editor, next) =>
    {
        return <div id="author" {...props.attributes}>{props.children}</div>;
    },

    //-------------------------------------------------------------------------

    "action": (props, editor, next) =>
    {
        const { attributes, node, isFocused } = props;
        const name = node.data.get("name");
        return (
            <span {...attributes}
                className={"action" + (isFocused ? " focus" : "")}
            >
            {name}
            </span>
        );
    },
    
    "scenebreak": (props, editor, next) =>
    {
        const { attributes, node, isFocused } = props;
        return (
            <p {...attributes}
                className={"action" + (isFocused ? " focus" : "")}
            >
            &lt;unfold&gt;
            </p>
        );
    },
    //-------------------------------------------------------------------------

    "folded": (props, editor, next) =>
    {
        const { attributes, node, isFocused, children } = props;
        return (
            <div {...attributes}
                className={"action" + (isFocused ? " focus" : "")}
                >
                ...
                <div className="hidden" contentEditable={false}>{children}</div>
            </div>
        )
    },
}

//-----------------------------------------------------------------------------
// It would be great to have a list of available hotkeys here. Would make
// it easier to design them.
//-----------------------------------------------------------------------------

const hotkeys =
{
    "Mod+B": (event, editor, next) => { editor.toggleMark("bold"); },
    "Mod+I": (event, editor, next) => { editor.toggleMark("italic"); },

    "Alt+C": (event, editor, next) => { toggleWrap(editor, "comment"); },
    "Alt+F": (event, editor, next) => { toggleWrap(editor, "folded"); },

    "Alt+L": (event, editor, next) => { editor.insertFragment(lorem.document); },
    "Alt+I": (event, editor, next) =>
    {
        editor.insertBlock({
            type: "scenebreak",
            data: { name: "scene" }
        });
/*
        editor.insertInline({
            type: "action",
            data: { name: "scene" }
        });
*/
    },
}

//-------------------------------------------------------------------------
// Helpers
//-------------------------------------------------------------------------

function toggleWrap(editor, type)
{
    const { value: { document, blocks } } = editor;
    const block  = blocks.first();
    const parent = document.getParent(block.key);
    
    if(parent && parent.type === type)
        editor.unwrapBlock(type);
    else
        editor.wrapBlock(type);
}

/*
hasMark(type) {
    const { value } = this.state
    return value.activeMarks.some(mark => mark.type === type)
}

hasBlock = type => {
    const { value } = this.state
    return value.blocks.some(node => node.type === type)
}
*/

//-------------------------------------------------------------------------
//-------------------------------------------------------------------------

/*
setBlock = (editor, type) =>
{
    const { value: { document, blocks } } = this.state;
    const block  = blocks.first();
    
    if(block.type === type)
        editor.setBlocks("line");
    else
        editor.setBlocks(type);
}
*/

//-----------------------------------------------------------------------------
// Editor to edit scene lists
//-----------------------------------------------------------------------------

export default class SceneListEditor extends React.Component
{
    //-------------------------------------------------------------------------

    plugins = [
    ]

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

                        ref     = { this.ref }
                        value   = { this.state.value }
                        schema  = { schema }

                        plugins = { this.plugins }

                        onChange    = {this.onChange}
                        onKeyDown   = {this.onKeyDown}
                        renderMark  = {this.renderMark}
                        renderBlock = {this.renderNode}
                        renderInline= {this.renderNode}
                        
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
    // Element rendering
    //-------------------------------------------------------------------------
    
    renderMark(props, editor, next)
    {
        return render[props.mark.type](props, editor, next);
    }

    renderNode(props, editor, next)
    {
        return render[props.node.type](props, editor, next);
    }

    //-------------------------------------------------------------------------
    // Hotkeys
    //-------------------------------------------------------------------------

    onKeyDown = (event, editor, next) =>
    {
        for(var hotkey in hotkeys)
        {
            if(isHotkey(hotkey, event))
            {
                event.preventDefault();
                hotkeys[hotkey](event, editor, next);
                break;
            }
        }
        return next();
    }
}

