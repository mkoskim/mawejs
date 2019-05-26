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
// Editor to edit scene lists
//-----------------------------------------------------------------------------

export default class SceneListEditor extends React.Component
{
    //-------------------------------------------------------------------------

    schema = {
        blocks: {
            folded: {
            }
        }
    }

    //-------------------------------------------------------------------------
    // It would be great to have a list of available hotkeys here. Would make
    // it easier to design them.
    //-------------------------------------------------------------------------
    
    plugins = [
        this.pluginMark  ("Mod+B", "bold",   this.renderBold),
        this.pluginMark  ("Mod+I", "italic", this.renderItalic),

        this.pluginAction("Alt+L", this.insertLorem),

        //this.pluginWrap  ("Alt+C", this.wrapBlock),
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
                        schema  = { this.schema }

                        plugins = { this.plugins }

                        onChange    = {this.onChange}
                        onKeyDown   = {this.onKeyDown}
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
    // Element rendering
    //-------------------------------------------------------------------------

    renderBold(props, editor, next)
    {
        return <b {...props.attributes}>{props.children}</b>;
    }

    renderItalic(props, editor, next)
    {
        return <i {...props.attributes}>{props.children}</i>;
    }

    renderParagraph(props, editor, next)
    {
        return <p {...props.attributes}>{props.children}</p>;
    }
    
    renderComment(props, editor, next)
    {
        return <div id="comment" {...props.attributes}>{props.children}</div>;
    }
    
    //-------------------------------------------------------------------------

    insertLorem(event, editor, next)
    {
        editor.insertFragment(lorem.document);
    }

    //-------------------------------------------------------------------------
    // Simple marks & blocks
    //-------------------------------------------------------------------------
    
    pluginMark(hotkey, markname, render) {
        return {
            onKeyDown(event, editor, next)
            {
                if(!isHotkey(hotkey, event)) return next();

                event.preventDefault();
                editor.toggleMark(markname);
            },

            renderMark(props, editor, next)
            {
                if(props.mark.type !== markname) return next();
                return render(props, editor, next);
            },
        }
    }

    pluginAction(hotkey, action) {
        return {
            onKeyDown(event, editor, next)
            {
                if(!isHotkey(hotkey, event)) return next();

                event.preventDefault();
                return action(event, editor, next);
            },
        }
    }

    pluginWrap(hotkey, blockname, render) {
        return {
            onKeyDown(event, editor, next)
            {
                if(!isHotkey(hotkey, event)) return next();
                console.log(event);
                event.preventDefault();
                this.wrapBlock(editor, blockname);
            },

            renderBlock(props, editor, next)
            {
                if(props.node.type !== blockname) return next();
                return render(props, editor, next);
            },
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
            case "title":   return <div id="title" {...attributes}>{children}</div>;
            case "author":  return <div id="author" {...attributes}>{children}</div>;

            case "line":    return this.renderParagraph(props, editor, next);
            
            case "folded": return (
                <div id="folded" contentEditable={false} {...attributes}>...
                    <div id="hidden">{children}</div>
                </div>
            );

            default: return next();
        }
    }

    //-------------------------------------------------------------------------
    // Hotkeys
    //-------------------------------------------------------------------------

    onKeyDown = (event, editor, next) =>
    {
        return next();
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
    //-------------------------------------------------------------------------

    wrapBlock = (editor, type) =>
    {
        const { value: { document, blocks } } = this.state;
        const block  = blocks.first();
        const parent = document.getParent(block.key);
        
        if(parent && parent.type === type)
            editor.unwrapBlock(type);
        else
            editor.wrapBlock(type);
    }

    setBlock = (editor, type) =>
    {
        const { value: { document, blocks } } = this.state;
        const block  = blocks.first();
        
        if(block.type === type)
            editor.setBlocks("line");
        else
            editor.setBlocks(type);
    }
}

