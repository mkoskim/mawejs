//*****************************************************************************
//*****************************************************************************
//
//
//
//*****************************************************************************
//*****************************************************************************

//import Plain from 'slate-plain-serializer'
//import { Editor } from 'slate-react'

//import React from 'react'

//-----------------------------------------------------------------------------
// Check if there is a story in local storage. If there is, open it.
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------

//$("#view").html(load.html(moe.dir + "sketch.html")); 
//Sheet($("#view"), story);
//Layout($("#view"), story);

const initialValue = Plain.deserialize(
  'This is editable plain text, just like a <textarea>!'
)

/**
 * The plain text example.
 *
 * @type {Component}
 */

class PlainText extends React.Component {
  /**
   * Render the editor.
   *
   * @return {Component} component
   */

  render() {
    return (
      <Editor
        placeholder="Enter some plain text..."
        defaultValue={initialValue}
      />
    )
  }
}

//-----------------------------------------------------------------------------

$(document).ready(function()
{
    //-------------------------------------------------------------------------
    // Resize board (client area) height
    //-------------------------------------------------------------------------

    $(window).on("resize", function() {
        $("div#board").height(
            $(window).height()
            - $("div#menubar").outerHeight(true)
            - $("div#topbar").outerHeight(true)
            - $("div#statusbar").outerHeight(true)
            - 1
        ).find(".autoheight").trigger("input");
        ;
    }).trigger("resize");

    //-------------------------------------------------------------------------
    // All done
    //-------------------------------------------------------------------------

    statline("Loaded.");
});
