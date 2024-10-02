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
//import {text2Regexp} from "./slateFlatEditor"
//import {text2Regexp} from "./slateEditor"

//-----------------------------------------------------------------------------
// Wordtable
//-----------------------------------------------------------------------------

export function TagTable({section}) {

  const tags = createTagTable(section)

  /*
  return <VBox style={{overflow: "auto"}}>
    Testing, testing...
  </VBox>
  /*/
  return <VBox style={{overflow: "auto"}}>
    <div className="VBox TOC">
      {tags.map(key => <TagRow key={key} className={"Entry"} word={key}/>)}
    </div>
  </VBox>
  /**/

/*
  const [filterText, setFilterText] = useState("")

  function doFilter(wt) {
    if(!filterText) return Array.from(wt)

    const table = new Array()
    const re = new RegExp(`^${text2Regexp(filterText)}`, "gi")

    for(const entry of wt) {
      const [key, count] = entry
      re.lastIndex = 0
      if(key.match(re)) table.push(entry)
    }
    return table
  }

  const [sortAscending, setSortAscending] = useState(false)

  const fSortAscending  = (a, b) => (a[1] > b[1]) ? 1 : (a[1] < b[1]) ? -1 : 0
  const fSortDescending = (a, b) => (a[1] < b[1]) ? 1 : (a[1] > b[1]) ? -1 : 0

  //console.log(doc.story.body.words)
  //const table = createWordTable(section)
  //console.log(table)
  const wt = doFilter(createWordTable(section))
    .sort(sortAscending ? fSortAscending : fSortDescending)

  const onSelect = useCallback(word => {
    setSearchText(word)
    if(searchBoxRef.current) searchBoxRef.current.focus()
  }, [setSearchText, searchBoxRef])

*/
}

class TagRow extends React.PureComponent {
  render() {
    const {word, className} = this.props

    return <HBox className={className}>
      <Label text={word}/>
    </HBox>
  }
}
