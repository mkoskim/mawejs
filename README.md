# mawe

This is my moe (My/Markus Own Editor) implemented as a web application. The project is now renamed as mawe, lets say it is acronym from My/Markus Advanced Web/Writer's Editor. The project is in very early state, I have just started to sketch it.

**Motivation**

Even that moe is still usable story editor - and still in my everyday use - there are certain problems with it that I would like to address in this version.

First, the old editor is written with Python + GTK, and thus it mainly works off the shelf only in Linux machines. At the time it was written, it was still huge improvement compared to software written in C++ or similar, which would need porting and compiling them to all supported platforms.

Implementing the editor as a web application should greatly improve this side. I have also planned that stories are stored to network servers (cloud), so that you could access them wherever you have internet connection.

In this editor version, I try really hard to concentrate on fluent user interface. This was left half-way in the old editor, as it was already huge improvement to editors I used earlier.

This time I try to make the "draft view" - where you see your story close similar as printed draft - to the main editing mode. Old moe has such mode, too, but it is fragile - trying to twist GTK components to understand that the text inside textbuffer is internally divided to movable pieces with meta data was apparently too much for them. This time, I will try to design the internal data structure so that the GUI can handle this.

- - -

**Installing**

1. Clone the repository
2. Install npm
3. Get dependencies: `mawe$ npm install`

Running:

    mawe$ npm start

Updating dependencies:

    mawe$ npm update

- - -

**Design Principles: "Just start writing"**

mawe is meant to be an editor to write stories - not press articles, blog posts, technical documents or anything but stories. That means that it has tools to split the text mass to manageable pieces, and it keeps "meta text" - plans, sketches and such - together with the final result (story itself).

But unlike some of its "competitors", mawe's main design principle is *"Just start writing"* - you should be able to start writing your story right after starting the editor, without any kind of setting up or configuring, just like opening a notepad.

All the tools that later help you to keep track with the text mass are taken into use just when you need it, without need for configuring them beforehand. Thus, you don't first create scene list, but you later split text to scenes. You don't need to write synopses or tag scenes, until you feel that you need them.

