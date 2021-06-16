# mawe.web

This is my mawe (My/Markus Advanced Writer's Editor) implemented as a web application. The project is in very early state, I have just started to sketch it.

**Motivation**

There are certain things I would like to address in this version.

First, the old editor is written with Python + GTK, and thus it mainly works off the shelf only in Linux machines. At the time it was written, it was still huge improvement compared to software written in C++ or similar, which would need porting and compiling them to all supported platforms.

Implementing the editor as a web application should greatly improve this side. I have also planned that stories are stored to network servers (cloud), so that you could access them wherever you have internet connection.

In this editor version, I try really hard to concentrate on fluent user interface. This was left half-way in the old editor, as it was already huge improvement to editors I used earlier.

This time I try to make the "draft view" - where you see your story close similar as printed draft - to the main editing mode. Old moe has such mode, too, but it is fragile - trying to twist GTK components to understand that the text inside textbuffer is internally divided to movable pieces with meta data was apparently too much for them. This time, I will try to design the internal data structure so that the GUI can handle this.

- - -

**Installing**

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
    mawe.web$ npm update

- - -

**Design Principles: "Just start writing"**

mawe is meant to be an editor to write stories - not press articles, blog posts, technical documents or anything else but stories. That means that it has tools to split the text mass to manageable pieces, and it keeps "meta text" - plans, sketches and such - together with the final result (story itself).

But unlike some of its "competitors", mawe's main design principle is *"Just start writing"* - you should be able to start writing your story right after starting the editor, without any kind of setting up or configuring, just like opening a notepad.

All the tools that later help you to keep track with the text mass are taken into use just when you need it, without need for configuring them beforehand. Thus, you don't first create scene list, but you later split text to scenes. You don't need to write synopses or tag scenes, until you feel that you need them.

- - -

**MIT License**

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
