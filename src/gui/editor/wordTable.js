//*****************************************************************************
//*****************************************************************************
//
// Word Table component
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

import {createWordTable} from "../../document/util";
//import {text2Regexp} from "./slateFlatEditor"
import {text2Regexp} from "./slateEditor"

//-----------------------------------------------------------------------------
// Wordtable
//-----------------------------------------------------------------------------

export function WordTable({section, setSearchText, searchBoxRef}) {

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

  //console.log(doc.body.words)
  //const table = createWordTable(section)
  //console.log(table)
  const wt = doFilter(createWordTable(section))
    .sort(sortAscending ? fSortAscending : fSortDescending)

  const onSelect = useCallback(word => {
    setSearchText(word)
    if(searchBoxRef.current) searchBoxRef.current.focus()
  }, [setSearchText, searchBoxRef])

  // Use this to test performance of table generation
  /*
  return <VBox style={style}>
    Testing, testing...
  </VBox>
  /**/
  return <VBox style={{overflow: "auto"}}>
    <ToolBox style={{background: "white"}}>
      <Input
        value={filterText}
        onChange={ev => setFilterText(ev.target.value)}
      />
      <Button tooltip="Sort order" onClick={ev => setSortAscending(!sortAscending)}>
        {sortAscending ? <Icon.Arrow.Up/>: <Icon.Arrow.Down/>}
      </Button>
    </ToolBox>
    <div className="VBox TOC">
      {wt.slice(0, 100).map(([word, count]) => <WordCountRow key={word} className={"Entry"} word={word} count={count} onSelect={onSelect}/>)}
    </div>
  </VBox>
}

class WordCountRow extends React.PureComponent {
  render() {
    const {word, count, onSelect, className} = this.props

    return <HBox className={className} onClick={e => onSelect(word)}>
      <Label text={word}/>
      <Filler/>
      <Label text={count}/>
    </HBox>
  }
}

