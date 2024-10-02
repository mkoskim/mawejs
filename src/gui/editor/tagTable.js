//*****************************************************************************
//*****************************************************************************
//
// Tag Table component
//
//*****************************************************************************
//*****************************************************************************

import React, {
  useState, useEffect, useReducer,
  useMemo, useCallback,
  useDeferredValue,
  StrictMode,
  useRef,
} from 'react';

import {
  FlexBox, VBox, HBox, Filler, VFiller, HFiller,
  ToolBox, Button, Icon, Tooltip,
  ToggleButton, ToggleButtonGroup, MakeToggleGroup,
  Input,
  SearchBox,
  Label,
  List, ListItem, ListItemText,
  Grid,
  Separator, Loading, addClass,
  Menu, MenuItem,
  isHotkey,
} from "../common/factory";

import {createTagTable} from "../../document/util";
import {foldByTags} from './slateHelpers';

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
