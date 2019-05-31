//******************************************************************************
//******************************************************************************
//
// Viewing & editing scene lists. A scene list forms the story. It might be
// schemantically divided to chapters and even parts, but it is the scene
// list that is the story.
//
// The objective is, that scene lists are also used to store larger meta text
// blocks (plans, sketches, background information and such). That way you
// could freely store scenes to groups for later use.
//
//******************************************************************************
//******************************************************************************

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
    
    //-------------------------------------------------------------------------
    // TODO: backspace to dedent at the beginning of the block. Note:
    // most probably, we dont allow nested indentations. They are not part
    // of any books. They are part of only not-so-well structured articles.
    //-------------------------------------------------------------------------

    "indent": (props, editor, next) =>
    {
        return <div id="indent" {...props.attributes}>{props.children}</div>;
    },

    //-------------------------------------------------------------------------
    // TODO: Comment show/hide
    // TODO: Adjancent comment block merging. Probably holds true with
    // many other blocks (like intend)
    //-------------------------------------------------------------------------

    "comment": (props, editor, next) =>
    {
        //console.log("Props.comments: " + props.comments + " Editor.comments: " + editor.comments);
        
        //console.log(props);
        
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

    //-------------------------------------------------------------------------
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
            <div {...attributes} className="scenebreak" style={{position: "relative"}}>
                <span className={"action" + (isFocused ? " focus" : "")}>
                    scene
                    </span>
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

    // TODO: Can we implement indent as some sort of props instead of wrapping
    // blocks? Comments as well.

    "Tab"      : (event, editor, next) => { toggleWrap(editor, "indent"); },

    "Alt+C": (event, editor, next) => { toggleWrap(editor, "comment", ["line", "indent"]); },
    "Alt+F": (event, editor, next) =>
    {
        const { comments } = editor.state;
        editor.setState({comments: !comments});
        //console.log(comments);
    },

    "Alt+L": (event, editor, next) => { editor.insertFragment(lorem.document); },
    "Alt+I": (event, editor, next) =>
    {
//*
        editor.insertBlock({
            type: "scenebreak",
            data: { name: "Scene" }
        });
        // If last block, insert:
        editor.insertBlock("line");
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

    // "Mod+A"      : Select all
    // "Mod+X"      : Cut
    // "Mod+C"      : Copy
    // "Mod+V"      : Paste
    // "Mod+Z"      : Undo
    // "Mod+Y"      : Redo
    // "Mod+F"      : Find
    // "Mod+G"      : Find next
    // "Mod+S"      : Save
    // "Mod+plus"   : Zoom In
    // "Mod+minus"  : Zoom Out
}

//-------------------------------------------------------------------------
// Helpers
//-------------------------------------------------------------------------

function findInnermostBlock(editor, exclude = ["line"])
{
    const { value: { document, blocks } } = editor;
    var   child  = blocks.first();
    var   parent = document.getParent(child.key);
    
    while((parent) && exclude.includes(parent.type))
    {
        console.log("Parent:", parent ? parent.type : undefined, "Child:", child.type);
        child  = parent;
        parent = document.getParent(parent.key);
    }
    console.log("Parent:", parent ? parent.type : undefined, "Child:", child.type);
    return { parent: parent, child: child };
}

//-------------------------------------------------------------------------
// (un)wrapOnce for non-recursive blocks.
//-------------------------------------------------------------------------

function wrapOnce(editor, wrapping, include = [])
{
    const type = 
        (typeof wrapping === "string" || wrapping instanceof String)
        ? wrapping : wrapping.type;
    const { parent, child } = findInnermostBlock(editor, include);
    
    if(!parent || parent.type !== type) editor.wrapNodeByKey(child.key, wrapping);
}

function unwrapOnce(editor, wrapping, include = [])
{
    const type = 
        (typeof wrapping === "string" || wrapping instanceof String)
        ? wrapping : wrapping.type;
    const { parent, child } = findInnermostBlock(editor, include);
    
    if(parent && parent.type === type) editor.unwrapNodeByKey(child.key);
}

//-------------------------------------------------------------------------

function toggleWrap(editor, wrapping, include = [])
{
    const type = 
        (typeof wrapping === "string" || wrapping instanceof String)
        ? wrapping : wrapping.type;
    const { parent, child } = findInnermostBlock(editor, include);

    console.log("Parent:", parent ? parent.type : undefined, "Child:", child.type);

    if(parent && parent.type === type)
        editor.unwrapBlockByKey(parent.key, wrapping);
    else
        editor.wrapBlockByKey(child.key, wrapping);
}

//-------------------------------------------------------------------------

function toggleFold(editor)
{
    const { value: { document, blocks } } = editor;
    let block  = blocks.first();
    
    while(block)
    {
        //console.log(block.type);
        //console.log(block.data);
        
        const isFolded = block.data.get("folded");
        if(isFolded !== undefined)
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

    constructor(props)
    {
        super(props);
        this.state = {
            comments: true,
            value: story,
        }
    }

    //-------------------------------------------------------------------------

    ref = editor => { this.editor = editor }

    plugins = [
    ]

    onContentChange = ({value}) => { this.setState({value}); }

    //-------------------------------------------------------------------------

    toggleComments = (event) =>
    {
        const comments = this.state.comments;
        this.setState(state => ({comments: !comments}));
    }

    //-------------------------------------------------------------------------

    render()
    {
        //console.log("render comments:" + this.state.comments);
        return (
            <div className="Editor">
                <Toolbar>
                    <Icon name="format_bold"/>
                    <Icon name="format_italic"/>
                    <Separator/>
                    <Button>test</Button>
                    <Button>test</Button>
                    
                    <span style={{marginLeft: "auto"}} />
                    <Icon name="short_text" />
                    <Icon name="notes" />
                    <Icon name="comment" onClick={this.toggleComments}/>
                    </Toolbar>
                <div className="Board">
                    <Editor
                        className = "Sheet"

                        ref     = { this.ref }
                        value   = { this.state.value }
                        schema  = { schema }

                        plugins = { this.plugins }

                        onChange     = {this.onContentChange}
                        onKeyDown    = {this.onKeyDown}
                        renderMark   = {this.renderMark}
                        renderBlock  = {this.renderNode}
                        renderInline = {this.renderNode}
                        
                        /* Chrome understand only English :( */
                        spellCheck  = {false}
                        autoCorrect = {false}
                        
                        comments = {this.state.comments}
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
        //props.comments = this.state.comments;
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
}
