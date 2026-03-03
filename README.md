# MaweJS

Looking for an editor for your story? Notepad, Word and Googledocs are too little, and Scrivener, Manuskript and yWriter are too much? You like Word-style text editors to write stories, but with larger stories it becomes difficult to restructure it. You have tried Scrivener-style editors, but you hate how you need to set up so many things before starting to write, and you feel uncomfortable editing your story scene-by-scene, you'd like to add things here and there.

How about trying MaweJS?

## MaweJS, Story Editor for Plantsers

Writers can be coarsely divided to two types: pantsers and planners. **Pantsers** start writing the story and let the flow take them anywhere it goes. **Planners** (or sometimes called plotters) first make plans and outlines before writing the story.

Pantsers are fine with Notepad or Word. Planners are catered with dedicated tools like Scrivener and its alikes like Manuskript and yWriter.

But there is third category: **plantsers**. These writers are something between pantsers and planners, and I happen to be one. I just start writing the story like a pantser, but at some point I start making plans and restructuring the story like a planner.

Sadly, neither Notepad nor Scrivener fully support plantsers. That's why I needed a tool for myself, that's why I wrote Mawe with Python/GTK, and now with ElectronJS, Javascript and React.

## Interested?

Want to give a try? If so, read my Wiki page about the subject:

https://github.com/mkoskim/mawejs/wiki/Thinking-about-trying-MaweJS%3F

## News

**Major change:** Material UI as an UI library was replaced by Base-UI. See the discussion about the change:

https://github.com/mkoskim/mawejs/discussions/440

## Known Issues

**AppImage:** In newer Ubuntus you may encounter errors due to changed permissions. You may need to run AppImage without sandboxing:

    $ mawejs-x.y.z.AppImage --no-sandbox

# Writing with MaweJS

## What MaweJS is?

In short, MaweJS is externally unstructured editor (like Notepad, Word or Googledocs), and internally structured editor (like yWriter, Scrivener and Manuscript). MaweJS is a story editor that feels like Word, but works like Scrivener underneath.

## Just start writing

When you create a new file, you can just start writing your story, just like opening Notepad or Word. There is absolutely no any kind of setups to do, just start writing.

![image](https://github.com/user-attachments/assets/c52dea46-c157-498d-9d0c-1b5ef8c88201)

## Apply tools when you need them

**Cutting text to pieces:** The most powerful feature in MaweJS is, that it is internally a structured editor just like Manuskript, yWriter or Scrivener. When your text mass grows, you can start splitting your text to scenes, and gather scenes together to groups. Splitting text to scenes and groups works just like applying headers in editors like Word or LibreOffice:

![image](https://github.com/user-attachments/assets/3cb93599-c2bf-44b4-8d1d-b8da2eea5173)

**Moving stuff around:** Splitting your text to scenes allows you to move them around with drag-and-drop. Putting them in the same group allows you to move bunch of related scenes at once. There are two "sections": your draft and notes. I am pretty sure that if you don't want to use anything else, you will love drag'n'droppable story index! It can really make your life much easier.

**Folding:** Furthermore, a very powerful tool for writing is **folding**, you can hide parts of your text when working with other parts:

![image](https://github.com/user-attachments/assets/dfba61bf-36d3-44be-be49-05976b48f9dd)

Folding makes the editor to resemble a bit more conventional structured editor, where you have one scene visible for editing at time. In this case, you can choose which scenes are visible when you write your story.

**Commenting:** You can make comments for you, that will not get exported to manuscript. So, you can keep your comments within the story as long as you like.

**Missing text, fillers & target counts:** You can write descriptions of story pieces still missing. So, you don't have to complete a scene at once, but you can leave there a mark, and come back to those issues later. You can also give scenes, chapters and acts target word counts, and see how much you are still missing.

**Story structure:** You can view your a pie diagram of the story, and compare it to selected template:

![image](https://user-images.githubusercontent.com/10298548/224184109-1d1e4dc6-afb7-462f-9798-cff04fa2eade.png)

There is currently K. M. Weiland's story structure templates and Blake Snyder's Beat Sheet, but we may add more later. It wouldn't be bad, that you could have a collection of different templates for various purposes (thrillers, romances, etc).

**Live screenshot** while editing one of my stories (written in Finnish):

![image](https://user-images.githubusercontent.com/10298548/218349525-c385016b-f2f3-4605-9601-5fd095345646.png)

At topmost, there is the selection of view. Below that is a toolbar to change settings in the editor. The main editing view contains three parts: (1) index of the draft, (2) editor display, and (3) index of notes.

If you like to see the result, the story in the screenshot is available online (in Finnish):

https://jumalhamara.wordpress.com/gjerta-avaruudessa/

https://archiveofourown.org/works/76325336/chapters/199756276

I have also made an English translation from the story:

https://archiveofourown.org/works/76329611/chapters/199767531

# Development

## Tools

You need two tools, git and npm. Check you have them:

    $ git -v
    $ npm -v

Install the needed tools, if you don't have them already. On Linux you can do that from command line, on Windows you can get the installation packages from web.

**Windows:** It is probably easier to use Git bash shell as the npm commands are bash commands.

## Cloning

Clone the repository:

    $ git clone https://github.com/mkoskim/mawejs.git
    $ cd mawejs
    mawejs$

**Note:** If you want to contribute, you need to make a fork.

## Dependencies

Get dependencies:

    mawejs$ npm i

## Running

Run application from sources:

    mawejs$ npm run dev

**Ubuntu:** In newer Ubuntus, if you run the sources, you may need to set Chrome SUID bit on. You need to do this every time ElectronJS is updated. There is now npm run target to do that:

    mawejs$ npm run fix

It uses `sudo`, so it will ask your password. If you don't trust my target, you can do it manually, too:

    mawejs$ sudo chown root node_modules/electron/dist/chrome-sandbox
    mawejs$ sudo chmod 4755 node_modules/electron/dist/chrome-sandbox

## Building

Building:

    mawejs$ npm run build

Building produces platform-specific result file (AppImage for Linux). Remember to use `--no-sandbox` to run the AppImage in newer Ubuntus:

    mawejs$ dist/mawejs-x.y.z.AppImage --no-sandbox

**Windows:** At the moment, there are some problems with Windows builds: https://github.com/mkoskim/mawejs/issues/404

## Updating

If you update the project with 'git pull', you may need to update the libraries, too:

    mawejs$ git pull
    mawejs$ npm i

**Ubuntu:** Remember to reapply SUID bit, if Electron package was updated.

## Debugging

VS Code Electron debugging: https://github.com/Microsoft/vscode-recipes/tree/master/Electron

React DevTools are installed by default (by electron-devtools-installer), but you need to reload the window before they are attached to devtools, see:

https://github.com/electron/electron/issues/41613#issuecomment-2644018998

## Example files

You can test MaweJS with example files located in examples/

https://github.com/mkoskim/mawejs/tree/master/examples

## Want to contribute?

There are few articles in the Discussions tab which you might be interested:

- Want to contribute? https://github.com/mkoskim/mawejs/discussions/86

- Most wanted! https://github.com/mkoskim/mawejs/discussions/219

# Read more

Read more about MaweJS from Wiki pages:

https://github.com/mkoskim/mawejs/wiki

Or check out discussion board:

https://github.com/mkoskim/mawejs/discussions

# MIT License

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
