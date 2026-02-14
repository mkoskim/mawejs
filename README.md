# MaweJS

Looking for an editor for your story? Notepad, Word and Googledocs are too little, and Scrivener, Manuskript and yWriter are too much? You like Word-style text editors to write stories, but with larger stories it becomes difficult to restructure it. You have tried Scrivener-style editors, but you hate how you need to set up so many things before starting to write, and you feel uncomfortable editing your story scene-by-scene, you'd like to add things here and there.

How about trying MaweJS?

## MaweJS, Story Editor for Plantsers

Writers can be coarsely divided to two types: pantsers and planners. **Pantsers** start writing the story and let the flow take them anywhere it goes. **Planners** (or sometimes called plotters) first make plans and outlines before writing the story.

Pantsers are fine with Notepad or Word. Planners are catered with dedicated tools like Scrivener and its alikes like Manuskript and yWriter.

But there is third category: **plantsers**. These writers are something between pantsers and planners, and I happen to be one. I just start writing the story like a pantser, but at some point I start making plans and restructuring the story like a planner.

Sadly, neither Notepad nor Scrivener fully support plantsers. That's why I needed a tool for myself, that's why I wrote Mawe with Python/GTK, and now with ElectronJS, Javascript and React.

## What MaweJS is?

In short, MaweJS is externally unstructured editor (like Notepad, Word or Googledocs), and internally structured editor (like yWriter, Scrivener and Manuscript).

## Known Issues

In newer Ubuntus you may encounter errors due to changed permissions. First, you may need to run AppImage without sandboxing:

```
$ mawejs-A.B.C.Linux.amd.AppImage --no-sandbox
```

In newer Ubuntus, if you run the sources, you may need to set SUID bit on. You need to do this every time ElectronJS is updated. There is now npm run target to do that:

```
mawejs$ npm run fix
```

It uses `sudo`, so it will ask your password. If you don't trust my target, you can do it manually, too:

```
mawejs$ sudo chown root node_modules/electron/dist/chrome-sandbox
mawejs$ sudo chmod 4755 node_modules/electron/dist/chrome-sandbox
```

## Status

Check out discussions page for status: https://github.com/mkoskim/mawejs/discussions/88

**Dec 5, 2024:** There are now three types of scenes: regular scenes, synopsis and notes. It is now possible to export synopsis (just synopsis blocks). It is now possible to give target word counts for acts, chapters and scenes.

**Oct 13, 2024:** Added "acts", "chapter containers" as top-most elements.

**Oct 10, 2024:** I added mechanism to create **unnumbered chapters**: creating, loading, saving and exporting those. You can use these for various purposes, when you want a chapter element, but don't want it to mess with chapter numbering.

**Oct 9, 2024:** I worked a bit with file imports. When importing, MaweJS now has dialog to **import preview**, where you can see what's going to be imported. You can set some options, like newlines (single or double), and patterns to separate parts and scenes. I added "mammoth" library to read **.docx** files and convert them to text for importing. Furthermore, there is now new **Import From Clipboard**. You can copy text from various sources, and choosing this option opens the clipboard content in import preview.

**Oct 7, 2024:** MaweJS now stores **daily word counts** when saving the document. It can now show you how many words (actual words) you have written today, and later you can see the progression from "Statistics" view.

The other improvement is **text paste performance**. Earlier, it took _minutes_ to paste 500 kB text to editor. Now it takes few seconds. This is important improvement because before we have file imports, the only way to move your story project to MaweJS is to copy-paste it to editor.

There are now **filler elements**. You can create a filler by typing "++" at the beginning of the line, and entering a number makes it to report as many missing words. This helps you to fill gaps, so that you can design the story structure before you have written the story.

You can now **tag** text pieces. Type "@" at the beginning of the line, and you can enter a comma-separated list of tags. There is also a tag view in the right panel. Clicking a tag will make scenes containing that tag visible, and fold all the others.

# Writing with MaweJS

## Just start writing

When you create a new file, you can just start writing your story, just like opening Notepad or Word. There is absolutely no any kind of setups to do, just start writing.

![image](https://github.com/user-attachments/assets/c52dea46-c157-498d-9d0c-1b5ef8c88201)

## Apply tools when you need them

**Cutting text to pieces:** The most powerful feature in MaweJS is, that it is internally a structured editor just like Manuskript, yWriter or Scrivener. When your text mass grows, you can start splitting your text to scenes, and gather scenes together to groups. Splitting text to scenes and groups works just like applying headers in editors like Word or LibreOffice:

![image](https://github.com/user-attachments/assets/3cb93599-c2bf-44b4-8d1d-b8da2eea5173)

**Moving stuff around:** Splitting your text to scenes allows you to move them around with drag-and-drop. Putting them in the same group allows you to move bunch of related scenes at once. There are two "sections": your draft and notes.

I am pretty sure that if you don't want to use anything else, you will love drag'n'droppable story index! It can really make your life much easier.

**Folding:** Furthermore, a very powerful tool for writing is **folding**, you can hide parts of your text when working with other parts:

![image](https://github.com/user-attachments/assets/dfba61bf-36d3-44be-be49-05976b48f9dd)

Folding makes the editor to resemble a bit more conventional structured editor, where you have one scene visible for editing at time. In this case, you can choose which scenes are visible when you write your story.

**Commenting:** You can make comments for you, that will not get exported to manuscript. So, you can keep your comments within the story as long as you like.

**Missing text:** You can write descriptions of story pieces still missing. So, you don't have to complete a scene at once, but you can leave there a mark, and come back to those issues later.

**Story structure:** You can view your a pie diagram of the story, and compare it to selected template:

![image](https://user-images.githubusercontent.com/10298548/224184109-1d1e4dc6-afb7-462f-9798-cff04fa2eade.png)

There is currently K. M. Weiland's story structure templates and Blake Snyder's Beat Sheet, but we may add more later. It wouldn't be bad, that you could have a collection of different templates for various purposes (thrillers, romances, etc).

**Fillers:** When you start working with story structure, you may find filler elements handy. With fillers, you enter a number telling how many missing words it reports. This way you can pad your story before it is complete.

**Live screenshot** while editing one of my stories (written in Finnish):

![image](https://user-images.githubusercontent.com/10298548/218349525-c385016b-f2f3-4605-9601-5fd095345646.png)

At topmost, there is the selection of view. Below that is a toolbar to change settings in the editor. The main editing view contains three parts: (1) index of the draft, (2) editor display, and (3) index of notes.

If you like to see the result, the story in the screenshot is available online:

https://jumalhamara.wordpress.com/gjerta-avaruudessa/


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

## Running from Sources

**Linux:**

    mawejs$ npm run dev

**Windows:** If you use command prompt, it can't understand shell commands in `dev` target written for Bash shell. Open up two terminals (one for the dev server and one for the ElectronJS application). Run the latter command, when React dev server is up:

    shell 1: mawejs$ npm run dev:react
    shell 2: mawejs$ npm run dev:electron

`dev:react` React starts development server, and `dev:electron` starts Electron browser. The Electron browser is standard Chromium, but it has ElectronJS backend to allow local access.

## Updating

If you update the project with 'git pull', you may need to update the libraries, too:

    mawejs$ git pull
    mawejs$ npm install

## React Dev Tools

Instructions to get React DevTools working: https://github.com/mkoskim/mawejs/discussions/131

VS Code Electron debugging: https://github.com/Microsoft/vscode-recipes/tree/master/Electron

## Example files

You can test MaweJS with example files located in examples/

https://github.com/mkoskim/mawejs/tree/master/examples

# What is Mawe?

Mawe is meant for writing stories - not press articles, blog posts, technical documents or anything else but stories. That means it has tools to split the text mass to somewhat manageable pieces, and keep "meta text" - plans, sketches and such - together with the final result (story itself).

## History

See also: https://github.com/mkoskim/mawejs/wiki/Short-history-of-MaweJS

MaweJS is the third generation of my homebrew story editors:

1. **moe** (Markus' / My Own Editor): Once I started writing stories, I wrote them in one text file. I started to split them to multiple pieces, and I wanted an editor to collect them together to form a draft. Repository: https://github.com/mkoskim/moe

2. **mawe** (Markus' / My Advances Writer's Editor): Written with Python/GTK. The main feature between moe and mawe is that mawe not only joins story pieces, but it allows you to edit them as one big bunch. Repository: https://github.com/mkoskim/mawe

3. **maweJS**: mawe written with ElectronJS, NodeJS and React. I realized that Python/GTK is not going anywhere, it is used to write firmware software to Linux, nothing else. The improvements in GUI are made in the JavaScript front.

All these editors are backward compatible, that is, files made with older versions can be loaded to newer ones. Also, I have something like 200-300 stories on my disk, written with various editors, and I really want my new versions to load the older ones.

## Design Principles

Plantsers are something between pantsers and planners. So MaweJS - aimed for plantsers - is something between Word and Scrivener.

Mawe's main design principle is *"Just start writing"* - you should be able to start writing your story right after starting the editor just like opening a notepad. Some structured editors need considerable work before you can start writing. Basically you need to structure your story beforehand, before starting to write it.

All the tools that later help you to keep track with the text mass are taken into use just when you need it, without need for configuring them beforehand. Thus, you don't first create scene list, but you later split text to scenes. You don't need to write synopses or tag scenes, until you feel that you need them.

## How Mawe differs from Word or Google Docs?

Editors made for writers to write stories differ from regular word processing software by

1) They keep metadata - comments and such - together with the story,

2) They are meant to produce a manuscript.

That is, they are not exactly meant to edit some files, but they are meant to edit file or files which are used to produce a manuscript. They are generally not exactly word processing software - they are more like text management software.

## How Mawe differs from yWriter, Manuskript or similar software?

One of the biggest paradigmatic difference between MaweJS and other structured editors is that with MaweJS, you **annotate text, not tree**. That is, you don't write comments or synopses to scenes or chapters, but you describe the following piece of **text** by writing synopses and comments. This way the tree can be fluid - you can restructure your story without any hassles, because all the metadata is related to text itself, not its structure.

Most software meant for writers keep document as a tree, and let you edit the leafs (text blocks). Once you are fine with the result, you click a button to export a manuscript.

My first story editor, Moe, worked exactly like that. The problem I felt is that you loose the track of big picture, when you are editing your story one scene or chapter at a time. I wanted an editor, which is somewhere in-between the two worlds:

- Structured editors (yWriter, Scrivener)
- Mawe
- Unstructured editors (Notepad, Word, etc)

What Mawe does is that it keeps the story internally as tree-like structure, but it "unfolds" the tree for editing. It keeps track of changes so that it can parse the text back to tree-like structure anytime needed (e.g. for organizing parts, analyses and so on).

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
