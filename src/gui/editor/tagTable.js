//*****************************************************************************
//*****************************************************************************
//
// Tag Table component
//
//*****************************************************************************
//*****************************************************************************

import React, {
  useCallback,
} from 'react';

import {
  VBox, HBox,
  Label,
} from "../common/factory";

import {createTagTable} from "../../document/util";
import {foldByTags} from '../slatejs/slateFolding';

//-----------------------------------------------------------------------------
// Wordtable
//-----------------------------------------------------------------------------

export function TagTable({editor, section}) {

  const tags = createTagTable(section)

  const onSelect = useCallback(tag => {
    //console.log("Tag:", tag)
    foldByTags(editor, [tag]);
  }, [editor])

  return <VBox style={{overflow: "auto"}}>
    <div className="VBox TOC">
      {tags.map(tag => <TagRow key={tag} className={"Entry"} tag={tag} onSelect={onSelect}/>)}
    </div>
  </VBox>
}

class TagRow extends React.PureComponent {
  render() {
    const {tag, onSelect, className} = this.props

    return <HBox className={className} onClick={e => onSelect(tag)}>
      <Label text={tag}/>
    </HBox>
  }
}
