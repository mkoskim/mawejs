import Plain from 'slate-plain-serializer'
import { Editor } from 'slate-react'

import React from 'react'

/**
 * Deserialize the initial editor value.
 *
 * @type {Object}
 */

const initialValue = Plain.deserialize(
  'This is editable plain text, just like a <textarea>!'
)

//-----------------------------------------------------------------------------

function renderEditor(props, editor, next) {
  const wordCount = 100; //countWords(editor.value.text)
  const children = next()
  return (
    <React.Fragment>
      <div id="editor">
      <div>Editor:</div>
      {children}
      <span className="word-count">{wordCount}</span>
      </div>
    </React.Fragment>
  )
}

//-----------------------------------------------------------------------------

function PlainText(props)
{
    return (
      <Editor
        renderEditor={renderEditor}
        placeholder="Enter some plain text..."
        defaultValue={initialValue}
      />
    )
}

/*
class PlainText extends React.Component {
  render() {
    return (
      <Editor
        renderEditor={renderEditor}
        placeholder="Enter some plain text..."
        defaultValue={initialValue}
      />
    )
  }
}
*/

export default PlainText

//-----------------------------------------------------------------------------

