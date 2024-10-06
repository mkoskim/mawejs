# MaweJS

Looking for an editor for your story? Notepad, Word and Googledocs are too little,
and Scrivener, Manuskript and yWriter are too much? You like Word-style text editors
to write stories, but with larger stories it becomes difficult to restructure it.
You have tried Scrivener-style editors, but you hate how you need to set up so
many things before starting to write, and you feel uncomfortable editing your
story scene-by-scene, you'd like to add things here and there.

How about trying MaweJS?

## MaweJS, Story Editor for Plantsers

Writers can be coarsely divided to two types: pantsers and planners. **Pantsers**
start writing the story and let the flow take them anywhere it goes. **Planners**
(or sometimes called plotters) first make plans and outlines before writing the story.

Pantsers are fine with Notepad or Word. Planners are catered with dedicated
tools like Scrivener and its alikes like Manuskript and yWriter.

But there is third category: **plantsers**. These writers are something between
pantsers and planners, and I happen to be one. I just start writing the story like
a pantser, but at some point I start making plans and restructuring the story like
a planner.

Sadly, neither Notepad nor Scrivener fully support plantsers. That's why I needed
a tool for myself, that's why I wrote Mawe with Python/GTK, and now with
ElectronJS, Javascript and React.

## Status

Check out discussions page for status and other info:

https://github.com/mkoskim/mawejs/discussions

**Oct 2, 2024:** There are now two fancy features implemented.
First are **filler elements**. You can create a filler by typing "++" at the
beginning of the line, and entering a number makes it to report as many missing words.
This helps you to fill gaps, so that you can design the story structure before you
have written the story.

The other new thing are **tags**. Type "@" at the beginning of the line, and you can
enter a comma-separated list of tags. There is also a tag view in the right panel.
Clicking a tag will make scenes containing that tag visible, and fold all the others.

## What MaweJS is?

In short, MaweJS is externally unstructured editor (like Notepad, Word or Googledocs), and internally structured editor (like yWriter, Scrivener and Manuscript).

# Writing with MaweJS

How MaweJS really operates?

## Just start writing

When you create a new file, you can just start writing your story, just like opening Notepad or Word. There is absolutely no any kind of setups to do, just start writing.

![image](https://github.com/user-attachments/assets/ac6a0420-1665-4328-82c8-682f669f2d1a)

## Apply tools when you need them

Live screenshot while editing one of my stories (written in Finnish):

![image](https://user-images.githubusercontent.com/10298548/218349525-c385016b-f2f3-4605-9601-5fd095345646.png)

If you like to see the result, the story in the editor is available online:

https://jumalhamara.wordpress.com/gjerta-avaruudessa/

At topmost, there is the selection of view. Below that is a toolbar to change settings in
the editor. The main editing view contains three parts: (1) index of the draft, (2)
editor display, and (3) index of notes.

**Scene splitting:** The most powerful feature in MaweJS is, that it is internally a structured editor just like Manuskript, yWriter or Scrivener. When your text mass grows, you can start splitting your text to scenes, and gather scenes together to groups. Splitting text to scenes and groups works just like applying headers in editors like Word or LibreOffice:

![image](https://github.com/user-attachments/assets/ff634076-0e99-4b0b-ae95-a6892e591805)

**Moving around:** Splitting your text to scenes allows you to move them around with drag-and-drop. Putting them in the same group allows you to move bunch of related scenes at once. There are two "sections": your draft and notes.

**Folding:** Furthermore, a very powerful tool for writing is **folding**, you can hide parts of your text when working with other parts (the story in the screenshot is Frankenstein):

![image](https://github.com/user-attachments/assets/01398352-c686-4a94-b937-616eda253154)

**Story structure:** You can view your a pie diagram of the story, and compare it to selected template:

![image](https://user-images.githubusercontent.com/10298548/224184109-1d1e4dc6-afb7-462f-9798-cff04fa2eade.png)

There is currently K. M. Weiland's story structure templates and Blake Snyder's Beat Sheet, but we may add more later. It wouldn't be bad, that you could have a collection
of different templates for various purposes (thrillers, romances, etc).

**Other tools:** There are number of different block types - comment, synopsis, missing text - for various purposes. With missing text and fillers you can mark incomplete places, and see those in the index. You can leave yourself comments, if you feel that you need to remember something, if you ever touch that piece again.

# Development

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

## React Dev Tools

Instructions to get React DevTools working: https://github.com/mkoskim/mawejs/discussions/131

## Example files

You can test MaweJS with example files located in examples/

https://github.com/mkoskim/mawejs/tree/master/examples

# What is Mawe?

Mawe is meant for writing stories - not press articles, blog posts, technical documents or anything else but stories. That means it has tools to split the text mass to somewhat manageable pieces, and keep "meta text" - plans, sketches and such - together with the final result (story itself).

## History

See also: https://github.com/mkoskim/mawejs/wiki/Short-history-of-MaweJS

MaweJS is the third generation of my homebrew story editors:

1. **moe** (Markus' / My Own Editor): Once I started writing stories, I wrote them in one
   text file. I started to split them to multiple pieces, and I wanted an editor to
   collect them together to form a draft. Repository: https://github.com/mkoskim/moe

2. **mawe** (Markus' / My Advances Writer's Editor): Written with Python/GTK. The main
   feature between moe and mawe is that mawe not only joins story pieces, but it allows you to edit them as one big bunch. Repository: https://github.com/mkoskim/mawe

3. **maweJS**: mawe written with ElectronJS, NodeJS and React. I realized that Python/GTK
   is not going anywhere, it is used to write firmware software to Linux, nothing else.
   The improvements in GUI are made in the JavaScript front.

All these editors are backward compatible, that is, files made with older versions can
be loaded to newer ones. Also, I have something like 200-300 stories on my disk, written
with various editors, and I really want my new versions to load the older ones.

## Design Principles

Plantsers are something between pantsers and planners. So MaweJS - aimed for plantsers - is something
between Word and Scrivener.

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
