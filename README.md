# mawe

This is my moe (My/Markus Own Editor) implemented as a web application. The project is now renamed as mawe, lets say it is acronym from My/Markus Advanced Web/Writer's Editor. The project is in very early state, I have just started to sketch the user interface.

**Motivation**

Even that moe is still usable story editor - and still in my everyday use - there are certain problems with my previous writer's editor implementation that I would like to address in this version.

First, the old editor is written with Python + GTK, and thus it mainly works off the shelf only in Linux machines. At the time it was written, it was still huge improvement compared to software written in C++ or similar, which would need recompilation to new platforms. Porting the editor to a web application should greatly improve this side, using the editor from whatever computer you have in hands. I have also planned that stories are stored to network servers (cloud), so that you can access them wherever you have internet access.

In this editor version, I try hard to concentrate on fluent user interface. This was left half-way in the old editor, as it was already huge improvement to editors I used earlier. This time I try to make the "draft view" - where you see your story close same as printed draft - to the main editing mode. Old moe has that mode, too, but it is fragile - trying to twist GTK components to understand that the text block inside textbuffer is internally divided to movable pieces with meta data was apparently too much. This time, I will try to design the internal data structure so that the GUI can handle this.

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

**Just start writing**

mawe is meant to be an editor to write stories - not press articles, blog posts, technical documents or anything but stories. As such it has certain design guidelines. The most important is *"Just start writing"* - you should be able to start writing your story right after starting the editor, without any kind of setting up or configuring, just like opening a notepad.

All the tools that later help you to keep track with the text mass are taken into use just when you need it, without need for configuring them beforehand. You start writing your text. At some point you start wondering if you can split it to chapters and such. And at that moment, you start splitting the text to scenes and reorganizing it with drag'n'drop. Later on, you start adding synopses to chapters and scenes, when you need to take a wider perspective what is happening. The important thing here is that you do those things when you need them, not beforehand.
