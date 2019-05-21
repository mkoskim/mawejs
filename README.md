# moe.net
moe - writer's text editor as web application

This is my moe - My/Markus Own Editor - implemented as a web application. The project is in very early state, I have just started to sketch the user interface. The problem with old moe is that as it is written with Python and GTK, it is bit hard to make it work on other platforms than Linux. Furthermore, my dream is that as a web application, the editor could eventually support concurrent writing like Google Docs, as well as storing your texts to clouds so that they would be available anywhere.

- - -

Installing:

1. Clone the repository
2. Install node.js (with npm)
3. Install components: `moe.net$ npm install`

Running:

    moe.net$ npm start

- - -

**Just start writing**

moe as an editor was written to me to write stories. As such it has certain design guidelines. The most important is *"Just start writing"* - many editors meant for writers need first to do some basic configurations. Moe's principle is that when you open it, it is ready for writing your story, just like notepad or similar applications. All the tools that help you to keep track with the text mass are taken into use just when you need it - without any need for configuring them beforehand.

You start writing your text. When you have enough written text, you start wondering if you can split it to chapters and such. At that moment, you can start dividing your text to scenes using Alt-X. When you have splitted your text, you can reorganize it with drag'n'drop. Later on, you start adding synopses to chapters and scenes, when you need to take a wider perspective what is happening. In moet.net, the aim is that with similar way you start creating tags to your chapters, telling you to what "plot line" they belong.

The aim is to have editor which concentrates to write the text, and all the tools it has are taken into use when the time is right.

- - -

If you want to take a look how the editor will be working, you might look
the old moe's user manual (in Finnish):

https://github.com/mkoskim/moe/blob/master/docs/pymoe/moe.pdf
