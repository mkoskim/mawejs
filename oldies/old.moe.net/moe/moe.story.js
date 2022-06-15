//*****************************************************************************
//
// We need story object, and ways to import and export it in various formats:
//
// - Import & export XML file format (moe's netive format)
// - Export RTF
//
// Would be nice:
//
// - Export PDF
// - Export EPUB
//
// It would also be nice to be able to manage collections here. Collections
// are formed from several independent stories, tied together with common
// title and possible prologue and epilogue, as well as publishing info.
//
//*****************************************************************************

var lorem = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

/*
var story = {};
/*/
var story = {
    title: "Lorem",
    author: "Anonymous",
    language: "",

    scenes: [
        {
            style: "normal",
            synopsis: lorem,
            sketch: lorem,
            content: lorem + "\n\n" + lorem,
        },
        { content: lorem, },
        { content: lorem, },
        { content: lorem, },
        { content: lorem, },
    ]
};
/**/
