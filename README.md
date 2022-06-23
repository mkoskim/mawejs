mawejs
======

This is my mawe (My/Markus Advanced Writer's Editor) implemented with ElectronJS.

## Status

**2022-Jun-23:** I have been working hard to (1) combine workspaces to file browser, (2) to use workspace to choose file to edit, and (3) with editor itself. Currently it is possible to load files in. I have not yet enabled saving for safety reasons.

My goal is to get somewhat usable editor for me during the summer, the sooner the better.

## What is Mawe?

Mawe is meant for writing stories - not press articles, blog posts, technical documents or anything else but stories. That means it has tools to split the text mass to somewhat manageable pieces, and keep "meta text" - plans, sketches and such - together with the final result (story itself).

## How Mawe differs from Word or Google Docs?

Editors made for writers to write stories differ from regular word processing software by

1) They keep metadata - comments and such - together with the story,

2) They are targeting to produce a manuscript.

That is, they are not exactly meant to edit some file, but they are meant to edit file or files which are used to produce manuscript.

They are not exactly word processing software - they are more like text management software.

## How Mawe differs from yWriter, Manuskript or similar software?

Most software meant for writers keep document as a tree, and let you edit the nodes (text blocks). Once you are fine with the result, you click a button to export a manuscript.

My first story editor, Moe, worked exactly like that. The problem I felt is that you loose the track of big picture, when you are editing your story one scene or chapter at a time. I wanted an editor, which is somewhere in-between the two worlds:

- Structured editors (yWriter, Scrivener)
- Mawe
- Unstructured editors (Notepad, Word, etc)

What Mawe does is that it keeps the story internally as tree-like structure, but it "opens" it for editing, as a some sort of a draft. It keeps track of changes so that it can parse it back to tree-like structure anytime needed (e.g. for organizing parts, analyses and so on).

I have borrowed ideas from code editors, for example, how they do code folding, syntax highlighting and such things.

## Design Principles

Mawe's main design principle is *"Just start writing"* - you should be able to start writing your story right after starting the editor just like opening a notepad. Some structured editors need considerable work before you can start writing. Basically you need to structure your story beforehand, before starting to write it.

All the tools that later help you to keep track with the text mass are taken into use just when you need it, without need for configuring them beforehand. Thus, you don't first create scene list, but you later split text to scenes. You don't need to write synopses or tag scenes, until you feel that you need them.

## Why MaweJS?

There are certain things I would like to address in this version.

First, the old Mawe is written with Python/GTK, and thus it mainly works off the shelf only in Linux machines. At the time it was written, it was still huge improvement compared to software written in C++ or similar, which would need porting and compiling them to all supported platforms.

Implementing the editor with ElectronJS should greatly improve this side. I have also planned integrating the editor to cloud storages (Dropbox, gDrive), so that you could access them wherever you have internet connection.

In this editor version, I try really hard to concentrate on fluent user interface. Even thought Python mawe was a huge improvement to older versions, the truth is that GTK is not going to improve anymore. That means that Python/GTK GUI will probably not get any big face-lifts anymore, instead it will probably only be used to develop Linux accessory software.

## Installing

Install the needed tools, if you don't have them already. On Linux you can do that from command line, on Windows you can get the installation packages from web:

    $ sudo apt install git
    $ sudo apt install npm

Clone the repository:

    $ git clone https://github.com/mkoskim/mawe.web.git

Get dependencies:

    mawe.web$ npm install

Running (development version):

    mawe.web$ npm run dev

If you update the project with 'git pull', you may need to update the libraries, too:

    mawe.web$ git pull
    mawe.web$ npm install

## MIT License

Copyright (c) 2021 Markus Koskimies

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
