mawejs
======

This is my mawe (My/Markus Advanced Writer's Editor) implemented with ElectronJS.

## React Dev Tools

Download special React DevTools from this link, and save it to mawejs/local/ folder.

https://github.com/facebook/react/issues/25843#issuecomment-1406766561

Extract the zip. If everything went fine, DevTools are loaded when you start the editor next time.

## Status

**2023-Mar-11:** Many basic features are working, and several quite advanced features, too. From being fully useful first version, it basically lacks only one thing - story header editing. What I do at the moment, is that I edit header from the XML file directly.

Of course, there are still many features missing. One that I miss most is support for workspaces, the current editor has one file at time. But it still does the basic job pretty well, and has already replaced my previous Python/GTK version in my daily use. It has drag-and-droppable index, searching, outliner, diagrams, file loading and saving, and so on.

## How does it look like?

Live screenshot while editing one of my stories (written in Finnish):

![image](https://user-images.githubusercontent.com/10298548/218349525-c385016b-f2f3-4605-9601-5fd095345646.png)

At topmost, there is the selection of view. Below that is a toolbar to change settings in
the editor. The main editing view contains three parts: (1) index of the draft, (2)
editor display, and (3) index of notes.

A new feature is showing a pie diagram of the story, and compare it to selected template:

![image](https://user-images.githubusercontent.com/10298548/224184109-1d1e4dc6-afb7-462f-9798-cff04fa2eade.png)

There is currently K. M. Weiland's story structure templates and Blake Snyder's Beat Sheet, but we may add more later. It wouldn't be bad, that you could have a collection
of different templates for various purposes (thrillers, romances, etc).

## What is Mawe?

Mawe is meant for writing stories - not press articles, blog posts, technical documents or anything else but stories. That means it has tools to split the text mass to somewhat manageable pieces, and keep "meta text" - plans, sketches and such - together with the final result (story itself).

It is the third version of my homebrew editors to write stories. History:

1. **moe** (Markus' / My Own Editor): Once I started writing stories, I wrote them in one
   text file. I started to split them to multiple pieces, and I wanted an editor to
   collect them together to form a draft.

2. **mawe** (Markus' / My Advances Writer's Editor): Written with Python/GTK. The main
   feature between moe and mawe is that mawe not only joins story pieces, but it allows you to edit them as one big bunch.

3. **maweJS**: mawe written with ElectronJS, NodeJS and React. I realized that Python/GTK
   is not going anywhere, it is used to write firmware software to Linux, nothing else.
   The improvements in GUI are made in the JavaScript front.

All these editors are backward compatible, that is, files made with older versions can
be loaded to newer ones. Also, I have something like 200-300 stories on my disk, written
with various editors, and I really want my new versions to load the older ones.

## Design Principles

Mawe's main design principle is *"Just start writing"* - you should be able to start writing your story right after starting the editor just like opening a notepad. Some structured editors need considerable work before you can start writing. Basically you need to structure your story beforehand, before starting to write it.

All the tools that later help you to keep track with the text mass are taken into use just when you need it, without need for configuring them beforehand. Thus, you don't first create scene list, but you later split text to scenes. You don't need to write synopses or tag scenes, until you feel that you need them.

## How Mawe differs from Word or Google Docs?

Editors made for writers to write stories differ from regular word processing software by

1) They keep metadata - comments and such - together with the story,

2) They are meant to produce a manuscript.

That is, they are not exactly meant to edit some files, but they are meant to edit file or files which are used to produce a manuscript. They are generally not exactly word processing software - they are more like text management software.

## How Mawe differs from yWriter, Manuskript or similar software?

Most software meant for writers keep document as a tree, and let you edit the nodes (text blocks). Once you are fine with the result, you click a button to export a manuscript.

My first story editor, Moe, worked exactly like that. The problem I felt is that you loose the track of big picture, when you are editing your story one scene or chapter at a time. I wanted an editor, which is somewhere in-between the two worlds:

- Structured editors (yWriter, Scrivener)
- Mawe
- Unstructured editors (Notepad, Word, etc)

What Mawe does is that it keeps the story internally as tree-like structure, but it "opens" it for editing, as a some sort of a draft. It keeps track of changes so that it can parse it back to tree-like structure anytime needed (e.g. for organizing parts, analyses and so on).

I have borrowed ideas from code editors, for example, how they do code folding, syntax highlighting and such things.

## Why Mawe with ElectronJS?

There are certain things I would like to address in this version.

First, the old Mawe is written with Python/GTK, and thus it mainly works off the shelf only in Linux machines. At the time it was written, it was still huge improvement compared to software written in C++ or similar, which would need porting and compiling them to all supported platforms.

Even thought Python mawe was a huge improvement to older versions, the truth is that GTK is not going to improve anymore. That means that Python/GTK GUI will probably not get any big face-lifts anymore, instead it will probably only be used to develop Linux accessory software.

Implementing the editor with ElectronJS should greatly improve this side. I have also planned integrating the editor to cloud storages (Dropbox, gDrive), so that you could access them wherever you have internet connection.

In this editor version, I try really hard to concentrate on fluent user interface.

## Installing

Install the needed tools, if you don't have them already. On Linux you can do that from command line, on Windows you can get the installation packages from web:

    $ sudo apt install git
    $ sudo apt install npm

Clone the repository:

    $ mkdir mawejs
    $ cd mawejs
    $ git clone https://github.com/mkoskim/mawejs.git

Get dependencies:

    mawejs$ npm install

Running (development version):

    mawejs$ npm run dev

If you update the project with 'git pull', you may need to update the libraries, too:

    mawejs$ git pull
    mawejs$ npm install

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
