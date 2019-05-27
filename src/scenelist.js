import React from 'react'

import Plain from 'slate-plain-serializer'
import { Editor } from 'slate-react'
import { Block, Value } from "slate"
import { Toolbar, Statusbar, Button, Icon, Separator } from "./toolbar"

import isHotkey from "is-hotkey"

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
// TODO: XML import. We need a way to create material for test & development.
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
        //folded: { isVoid: true },
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
    //-------------------------------------------------------------------------
    // Generic text styles (marks)
    //-------------------------------------------------------------------------
    
    "bold": (props, editor, next) =>
    {
        return <b {...props.attributes}>{props.children}</b>;
    },
    "italic": (props, editor, next) =>
    {
        return <i {...props.attributes}>{props.children}</i>;
    },

    //-------------------------------------------------------------------------
    // Generic text blocks
    //-------------------------------------------------------------------------

    "line": (props, editor, next) =>
    {
        return <p {...props.attributes}>{props.children}</p>;
    },
    "indent": (props, editor, next) =>
    {
        return <div id="indent" {...props.attributes}>{props.children}</div>;
    },

    //-------------------------------------------------------------------------
    // 
    //-------------------------------------------------------------------------

    "comment": (props, editor, next) =>
    {
        //const { comments } = editor.state;
        const comments = true;

        if(comments)
        {
            return <div id="comment" {...props.attributes}>{props.children}</div>;
        }
        else
        {
            return <div id="comment" className="hidden" {...props.attributes}>{props.children}</div>;
        }
    },

    "title": (props, editor, next) =>
    {
        return <div id="title" {...props.attributes}>{props.children}</div>;
    },

    "author": (props, editor, next) =>
    {
        return <div id="author" {...props.attributes}>{props.children}</div>;
    },

    //-------------------------------------------------------------------------
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
    
    //-------------------------------------------------------------------------

    "scene": (props, editor, next) =>
    {
        const { attributes, node, isFocused, children } = props;
        return <div id="scene">{children}</div>;
    },

    "scenebreak": (props, editor, next) =>
    {
        const { attributes, node, isFocused } = props;
        return (
            <div {...attributes} style={{position: "relative"}}>
                <hr style={{width: "100%", border: "0", borderTop: "1px dashed rgb(160, 160, 160)"}}/>
                <div className={"action" + (isFocused ? " focus" : "")}>
                    scene
                    </div>
            </div>
        );
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

    "Alt+C": (event, editor, next) => { toggleWrap(editor, "comment" ); },
    "Alt+F": (event, editor, next) =>
    {
        const { comments } = editor.state;
        editor.setState({comments: !comments});
        console.log(comments);
    },

    "Tab"      : (event, editor, next) => { editor.wrapBlock("indent"); },
    "Shift+Tab": (event, editor, next) => { editor.unwrapBlock("indent"); },

    "Alt+L": (event, editor, next) => { editor.insertFragment(lorem.document); },
    "Alt+I": (event, editor, next) =>
    {
//*
        editor.insertBlock({
            type: "scenebreak",
            data: { name: "Scene" }
        });
/*/
        editor.insertInline({
            type: "action",
            data: { name: "scene" }
        });
/**/
    },

    //-------------------------------------------------------------------------
    // Reserved hotkeys
    //-------------------------------------------------------------------------

    // "Mod+A": Select all
    // "Mod+X": Cut
    // "Mod+C": Copy
    // "Mod+V": Paste
    // "Mod+Z": Undo
    // "Mod+Y": Redo
    // "Mod+F": Find
    // "Mod+G": Find next
    // "Mod+plus": Zoom In
    // "Mod+minu": Zoom Out
}

//-------------------------------------------------------------------------
// Helpers
//-------------------------------------------------------------------------

function toggleWrap(editor, wrapping)
{
    const type = 
        (typeof wrapping === "string" || wrapping instanceof String)
        ? wrapping : wrapping.type;

    const { value: { document, blocks } } = editor;
    const block  = blocks.first();
    const parent = document.getParent(block.key);
    
    if(parent && parent.type === type)
        editor.unwrapBlock(wrapping);
    else
        editor.wrapBlock(wrapping);
}

function toggleFold(editor)
{
    const { value: { document, blocks } } = editor;
    let block  = blocks.first();
    
    while(block)
    {
        console.log(block.type);
        console.log(block.data);
        
        const isFolded = block.data.get("folded");
        if(isFolded != undefined)
        {
            editor.setNodeByKey(block.key, {data: { folded: !isFolded }});
            break;
        }
        block = document.getParent(block.key);
    }
/*
    const { value: { document, blocks } } = editor;
    const block  = blocks.first();
    const type = "scene";
    
    const parent = document.getParent(block.key);
    
    if(parent && parent.type === type)
    {
        //editor.unwrapBlock(type);
    }
    else
    {
        editor
            .wrapBlock({
                type: "scene",
            })
            .moveToStartOfBlock()
            .insertBlock({
                type: "scenebreak",
                data: { name: "scene" }
            })
        ;
        //editor.wrapBlock(type);
    }
*/
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

    state = {
        comments: true,
        value: story,
    }

    ref = editor => { this.editor = editor }
    
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

                        onChange     = {this.onChange}
                        onKeyDown    = {this.onKeyDown}
                        renderMark   = {this.renderMark}
                        renderBlock  = {this.renderNode}
                        renderInline = {this.renderNode}
                        
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

    renderMark = (props, editor, next) =>
    {
        return render[props.mark.type](props, editor, next);
    }

    renderNode = (props, editor, next) =>
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
        next();
    }

    //-------------------------------------------------------------------------
    //-------------------------------------------------------------------------

    onChange = ({value}) => { this.setState({value}); }
}

