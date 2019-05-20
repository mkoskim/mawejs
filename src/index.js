// ----------------------------------------------------------------------------
// Imports
// ----------------------------------------------------------------------------

import React from 'react';
import ReactDOM from 'react-dom';

// ----------------------------------------------------------------------------

import Plain from 'slate-plain-serializer'
import { Editor } from 'slate-react'

// ----------------------------------------------------------------------------

import './index.css';

// ----------------------------------------------------------------------------

/**
 * Deserialize the initial editor value.
 *
 * @type {Object}
 */

const initialValue = Plain.deserialize(
  "This is editable plain text, just like a <textarea>!" +
  "\n\nYes!"
)

class PlainText extends React.Component {
  render() {
    return (
      <Editor
        placeholder="Enter some plain text..."
        defaultValue={initialValue}
      />
    )
  }
}

// ----------------------------------------------------------------------------

ReactDOM.render(<PlainText />, document.getElementById('root'));

