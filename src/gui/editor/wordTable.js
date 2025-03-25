//*****************************************************************************
//*****************************************************************************
//
// Word Table component
//
//*****************************************************************************
//*****************************************************************************

import React, {
  useState, useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';

import {
  VBox, HBox, Filler,
  ToolBox, Button, Icon,
  Input,
  Label,
  SearchBox,
  InfiniteScroll,
  Separator,
} from "../common/factory";

import {createWordTable} from "../../document/util";
import {text2Regexp} from "../slatejs/slateSearch"

//-----------------------------------------------------------------------------
// Wordtable
//-----------------------------------------------------------------------------

function filterWordTable(wt, filterText) {
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

export function WordTable({section, setSearchText, searchBoxRef}) {

  //---------------------------------------------------------------------------
  // Create word table
  const wt = useMemo(() => createWordTable(section), [section])

  //---------------------------------------------------------------------------
  // Filter table
  const [filterText, setFilterText] = useState("")

  const filtered = useMemo(() => filterWordTable(wt, filterText), [wt, filterText])

  const total = useMemo(() => filtered.map(([wt, c]) => c).reduce((total, c) => total + c, 0))

  //---------------------------------------------------------------------------
  // Sort table
  const [sortAscending, setSortAscending] = useState(false)

  const fSortAscending  = useCallback((a, b) => (a[1] > b[1]) ? 1 : (a[1] < b[1]) ? -1 : 0)
  const fSortDescending = useCallback((a, b) => (a[1] < b[1]) ? 1 : (a[1] > b[1]) ? -1 : 0)

  const sorted = useMemo(() => filtered.toSorted(sortAscending ? fSortAscending : fSortDescending), [filtered, sortAscending])

  //---------------------------------------------------------------------------
  // Make batch for infinite scroll
  const [items, setItems] = useState(100)

  const visible = useMemo(() => sorted.slice(0, items), [sorted, items])
  //const visible = sorted.slice(0, items)

  const infScrollRef = useRef()

  // Reset item count when content is changed
  useEffect(() => {
    const {el} = infScrollRef.current
    //console.log("Resetting items:", el)
    el.scrollTo(0, 0)
    setItems(100);
  }, [sorted])

  //console.log("Items:", items, "Total:", sorted.length)

  //---------------------------------------------------------------------------

  const onSelect = useCallback(word => {
    setSearchText(word)
    if(searchBoxRef.current) searchBoxRef.current.focus()
  }, [setSearchText, searchBoxRef])

  //---------------------------------------------------------------------------

  return <VBox style={{overflow: "auto"}}>
    <ToolBox style={{background: "white"}}>
      <SearchBox
        value={filterText}
        onChange={ev => setFilterText(ev.target.value)}
      />
      <Separator />
      <Button tooltip="Sort order" onClick={ev => setSortAscending(!sortAscending)}>
        {sortAscending ? <Icon.Sort.Ascending/>: <Icon.Sort.Descending/>}
      </Button>
    </ToolBox>
    <Label style={{padding: "4px", borderBottom: "1px solid lightgray"}} text={`Total: ${total}`}/>
    <VBox id="wordlist" className="TOC">
      <InfiniteScroll
        scrollableTarget="wordlist"
        dataLength={items}
        next={() => setItems(Math.floor(items * 1.3))}
        hasMore={items < sorted.length}
        scrollThreshold={0.95}
        ref={infScrollRef}
      >
        {visible.map(([word, count]) => <WordCountRow key={word} className={"Entry"} word={word} count={count} onSelect={onSelect}/>)}
      </InfiniteScroll>
    </VBox>
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
