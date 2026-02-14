//*****************************************************************************
//*****************************************************************************
//
// Story graphics
//
//*****************************************************************************
//*****************************************************************************

import React, {
  useCallback,
  useMemo,
} from "react"

import {
  ResponsiveContainer,
  PieChart, Pie,
} from "recharts"

import {
  HBox, VBox, HFiller, VFiller,
  ToolBox,
  MakeToggleGroup,
  Separator, Icon,
} from "../common/factory"

import {DragDropContext, Droppable, Draggable} from "@hello-pangea/dnd";
import {DocIndex} from "../common/docIndex";
import {elemName, filterCtrlElems, mawe} from "../../document";
import { IDtoPath, wcElem } from "../../document/util";
import { getCoreEditor } from "../slatejs/slateEditor";
import { isAstChange } from "../slatejs/slateHelpers";
import { dndDrop } from "../slatejs/slateDnD";

//*****************************************************************************
//
// Chart settings
//
//*****************************************************************************

export function loadArcSettings(settings) {
  // TODO: Check that fields have valid values (table keys)
  return {
    elements: "scene",
    template: "beatsheet",
    mode: "topCCW",
    ...(settings?.attributes ?? {})
  }
}

export function saveArcSettings(settings) {
  return {type: "arc",
    attributes: {
      elements: settings.elements,
      template: settings.template,
      mode: settings.mode,
    }
  }
}

//*****************************************************************************
//
// Story Arc view
//
//*****************************************************************************

const indexStyle = {
  maxWidth: "350px",
  minWidth: "350px",
  width: "350px",
  borderRight: "1px solid lightgray"
}

export function StoryArcView({doc, updateDoc}) {

  const setElements = useCallback(value => updateDoc(doc => {doc.ui.arc.elements = value}), [updateDoc])
  const setTemplate = useCallback(value => updateDoc(doc => {doc.ui.arc.template = value}), [updateDoc])
  const setMode     = useCallback((mode) => {updateDoc(doc => {doc.ui.arc.mode = mode})}, [updateDoc])

  /*
  console.log("Beat sheet length=", tmplButtons.beatsheet.data
    .map(data => data.size)
    .reduce((a, b) => a + b, 0)
  )
  */

  //---------------------------------------------------------------------------
  // Slate editor for buffer manipulations
  //---------------------------------------------------------------------------

  const drafteditor = useMemo(() => {
    const editor = getCoreEditor()
    editor.onChange = () => {
      //console.log("Draft update")
      if(isAstChange(editor)) {
        updateDoc(doc => {
          doc.draft.acts = editor.children;
          doc.draft.words = wcElem({type: "sect", children: editor.children})
        })
      }
    }
    editor.children = doc.draft.acts
    return editor
  }, [])

  //---------------------------------------------------------------------------
  // View
  //---------------------------------------------------------------------------

  const settings = {
    elements: {
      buttons: elemButtons,
      choices: ["act", "chapter", "scene"],
      selected: doc.ui.arc.elements,
      setSelected: setElements,
      exclusive: true,
    },
    template: {
      buttons: tmplButtons,
      //choices: ["beatsheet", "plotpoints", "herosjourney", "heroacts", "fiveact", "7", "11"],
      choices: ["beatsheet", "plotpoints", "herosjourney", "heroacts"],
      selected: doc.ui.arc.template,
      setSelected: setTemplate,
      exclusive: true,
    },
    mode: {
      buttons: modeButtons,
      choices: ["topCCW", "topCW", "bottomCCW", "bottomCW"],
      selected: doc.ui.arc.mode,
      setSelected: setMode,
      exclusive: true,
    }
  }

  function indexElements() {
    switch(doc.ui.arc.elements) {
      case "act": return []
      case "chapter": return ["chapter"]
    }
    return ["chapter", "scene"]
  }

  return <DragDropContext onDragEnd={onDragEnd}>
    <HBox style={{overflow: "auto", height: "100%"}}>
      <VBox style={indexStyle}>
        <IndexToolbar settings={settings}/>
        <VBox className="TOC">
          <DocIndex
          sectID="draft"
          section={doc.draft}
          include={indexElements()}
          wcFormat={"numbers"}
          unfold={true}
        />
        </VBox>
      </VBox>
      <ChartView settings={settings} doc={doc} updateDoc={updateDoc}/>
    </HBox>
  </DragDropContext>

  //---------------------------------------------------------------------------
  // Index DnD
  //---------------------------------------------------------------------------

  function onDragEnd(result) {

    console.log("onDragEnd:", result)

    const {type, draggableId, source, destination} = result;

    if(!destination) return;

    if(source.droppableId === destination.droppableId) {
      if(source.index === destination.index) return;
    }

    //console.log(type, source, "-->", destination)

    switch(type) {
      case "act":
      case "chapter":
      case "scene": {
        const {path: srcPath} = IDtoPath(draggableId)
        const {path: dstPath} = IDtoPath(destination.droppableId)
        //const srcEdit = getEditorBySectID(srcSectID)
        //const dstEdit = getEditorBySectID(dstSectID)

        dndDrop(drafteditor, srcPath, drafteditor, dstPath ?? [], destination.index)
        //setActive(nodeID(dstSectID, dropped))
        break;
      }

      default:
        console.log("Unknown draggable type:", type, result)
        break;
    }
  }
}

//-----------------------------------------------------------------------------
// Const styles
//-----------------------------------------------------------------------------

const styles = {
  toolbar: {
    background: "white",
  }
}

//-----------------------------------------------------------------------------
// Index toolbar
//-----------------------------------------------------------------------------

function IndexToolbar({settings}) {
  return <ToolBox style={styles.toolbar}>
    <MakeToggleGroup {...settings.elements}/>
    <Separator />
  </ToolBox>
}

//*****************************************************************************
//
// Story pie chart
//
//*****************************************************************************

function mode2rotate(mode) {
  switch (mode) {
    case "topCCW":    return { start:  90, rotate:  1}
    case "topCW":     return { start:  90, rotate: -1}
    case "bottomCCW": return { start: 270, rotate:  1}
    case "bottomCW":  return { start: 270, rotate: -1}
  }
  return { start: 0, rotate: 1 }
}

function ChartView({settings, doc, updateDoc}) {

  const section = doc.draft

  //---------------------------------------------------------------------------
  // Data selection
  //---------------------------------------------------------------------------

  //const data = flatSection(section).filter(e => e.type === doc.ui.arc.elements)
  const data = createData(section, doc.ui.arc.elements)

  //---------------------------------------------------------------------------
  // Chart directions
  //---------------------------------------------------------------------------

  const {start: selectStart, rotate: selectRotate} = mode2rotate(doc.ui.arc.mode)

  //---------------------------------------------------------------------------
  // Chart
  //---------------------------------------------------------------------------

  return <VFiller style={{overflow: "auto"}}>
    <ChartToolbar settings={settings} />
    <StoryChart
      startAngle={selectStart + selectRotate * 1}
      endAngle={selectStart + selectRotate * (360 - 2)}
      innerData={tmplButtons[doc.ui.arc.template]?.data}
      outerData={data.map(e => e.data).flat()}
      outerLabels={data.map(e => e.label)}
    />
  </VFiller>
}

//-----------------------------------------------------------------------------
// Chart toolbar
//-----------------------------------------------------------------------------

function ChartToolbar({settings}) {
  return <ToolBox style={styles.toolbar}>
    {/*
    <HFiller/>
    <Separator/>
    <SectionWordInfo section={section}/>
    <Separator/>
    */}
    <MakeToggleGroup {...settings.template}/>
    <Separator />
    <MakeToggleGroup {...settings.mode}/>
    <Separator />
    {/*
    <HFiller/>
    */}
  </ToolBox>
}

//-----------------------------------------------------------------------------
// Data generation for pie chart
//-----------------------------------------------------------------------------

const elemButtons = {
  act: {icon: "Acts"},
  chapter: {icon: "Chapters"},
  scene: {icon: "Scenes"},
}

//-----------------------------------------------------------------------------
// Story data
//-----------------------------------------------------------------------------

function createData(section, elements) {

  const flat = section.acts.map(flatAct).flat().filter(s => s.size)
  //console.log("Data:", flat)
  return flat;

  function flatAct(act) {
    if(elements === "act") {
      return {
        size: elemSize(act),
        label: elemLabel(act),
        data: elemData(act)
      }
    }
    return [
      ...filterCtrlElems(act.children).map(flatChapter).flat(),
      pad(act.words.padding)
    ]
  }

  function flatChapter(chapter) {
    if(elements === "chapter") {
      return {
        size: elemSize(chapter),
        label: elemLabel(chapter),
        data: elemData(chapter)
      }
    }

    return [
      ...filterCtrlElems(chapter.children).filter(s => s.content === "scene").map(flatScene),
      pad(chapter.words.padding)
    ]
  }

  function flatScene(scene) {
    return {
      size: elemSize(scene),
      label: elemLabel(scene),
      data: elemData(scene)
    }
  }

  function pad(padding) {
    return {
      size: padding,
      label: { name: null, size: padding },
      data: elemData({
        words: {
          missing: padding,
          padding
        }
      })
    }
  }
}

function elemSize(elem) {
  const {words} = elem
  return words.text + words.missing
}

function elemLabel(elem) {
  const {words} = elem
  const name = elemName(elem)
  return {
    name,
    size: words.text + words.missing,
  }
}

function elemData(elem) {
  const {words} = elem
  return [
    {
      name: null,
      size: words.text,
      fill: "lightblue",
      stroke: "lightblue",
    },
    {
      name: null,
      size: (words.missing ?? 0) - (words.padding ?? 0),
      fill: "violet",
      stroke: "violet",
    },
    {
      name: null,
      size: words.padding,
      fill: "thistle",
      stroke: "thistle",
    },
  ]
}

//-----------------------------------------------------------------------------
// Story templates
//-----------------------------------------------------------------------------

const tmplButtons = {
  plotpoints: {
    tooltip: "K.M. Weiland's Plot Points",
    icon: "Plot Points",
    data: [
      {size: 12.5, fill: "lightgreen", name: "Hook"}, {name: "Inciting Event"},
      {size: 12.5, fill: "lightgreen", name: null}, {name: "1st Plot Point"},
      {size: 12.5, fill: "yellow", name: null}, {name: "1st Pinch Point"},
      {size: 12.5, fill: "yellow", name: null}, {name: "Midpoint"},
      {size: 12.5, fill: "orange", name: null}, {name: "2st Pinch Point"},
      {size: 12.5, fill: "orange", name: null}, {name: "3rd Plot Point"},
      {size: 12.5, fill: "red", name: null}, {name: "Climax"},
      {size: 10.0, fill: "red", name: "Confrontation"},
      {size: 2.5, fill: "orange", name: "Resolution"}
    ]
  },

  beatsheet: {
    tooltip: "Snyder's Beatsheet",
    icon: "Beat Sheet",
    data: [
      {size: 1, name: null, fill: "lightgreen"}, // Opening Image
      {size: 10, name: "Set-up", fill: "lightgreen"},
      {size: 1, name: "Catalyst", fill: "yellow"},
      {size: 13, name: "Debate", fill: "lightgreen"},
      {name: "Choosing Act Two"},
      {size: 5, name: "B Story", fill: "lightyellow"},
      {size: 25, name: "Fun & Games", fill: "yellow"},
      {name: "Midpoint"},
      {size: 20, name: "Bad Guys Close In", fill: "orange"},
      {name: "All is Lost"},
      {size: 10, name: "Dark Night of the Soul", fill: "orange"},
      {name: "Choosing Act Three"},
      {size: 24, name: "Finale", fill: "red"},
      {size: 1, name: null, fill: "orange"}, // Closing Image
    ]
  },

  herosjourney: {
    //tooltip: "Hero's Journey",
    icon: "Hero's Journey",
    data: [
      {size: 20, name: "Ordinary World", fill: "lightgreen"},
      {size: 10, name: "Call to Adventure", fill: "lightyellow"},
      {size:  0, name: "Refusal to Call"},
      {size: 20, name: null, fill: "yellow"},
      {size:  5, name: "Accept the Call", fill: "lightyellow"},
      {size: 10, name: "Crossing the Treshold", fill: "lightyellow"},
      {size: 25, name: "Road of Trials", fill: "yellow"},
      {size: 25, name: "Approach", fill: "orange"},
      {size: 10, name: "Death & Rebirth", fill: "red"},
      {size: 50, name: "Reward", fill: "orange"},
      {size: 10, name: "The Road Back", fill: "yellow"},
      {size: 35, name: "Resurrection", fill: "red"},
      {size:  0, name: "Return", fill: "magenta"},
      {size: 20, name: null, fill: "magenta"},
    ]
  },

  heroacts: {
    icon: "Three Act",
    data: [
      {size: 25, name: "I: Separation", fill: "lightgreen"},
      {size: 25, name: "II/A: Descent", fill: "yellow"},
      {size: 25, name: "II/B: Initiation", fill: "orange"},
      {size: 25, name: "III: Return", fill: "red"},
    ]
  },

  fiveact: {
    icon: <span style={{color: "orchid"}}>Five Act</span>,
    tooltip: "Experimental",
    data: [
      {size: 20, name: "Exposition", fill: "lightgreen"},
      {size: 20, name: "Rising Movement", fill: "yellow"},
      {size: 20, name: "Climax", fill: "red"},
      {size: 20, name: "Falling Action", fill: "orange"},
      {size: 20, name: "Catastrophe/Resolution", fill: "red"},
    ]
  },

  "7": {
    icon: <span style={{color: "orchid"}}>7</span>,
    tooltip: "Experimental",
    data: [
      {size: 2,  name: null, fill: "lightgreen"},
      {size: 18, name: "1", fill: "lightgreen"},
      {size: 10, name: "2 - To Act 2", fill: "orange"},
      {size: 20, name: "3", fill: "yellow"},
      {size: 10, name: "4 - Midpoint", fill: "red"},
      {size: 20, name: "5", fill: "orange"},
      {size: 10, name: "6 - To Act 3", fill: "red"},
      {size: 18, name: "7", fill: "orchid"},
      {size: 2,  name: null, fill: "orchid"},
    ]
  },

  "11": {
    icon: <span style={{color: "orchid"}}>11</span>,
    tooltip: "Experimental",
    data: [
      {size: 2,  name: null, fill: "lightgreen"},
      {size: 8,  name: "1", fill: "lightgreen"},
      {size: 10, name: "2", fill: "yellow"},
      {size: 10, name: "3 - To Act 2", fill: "orange"},
      {size: 10, name: "4", fill: "yellow"},
      {size: 10, name: "5", fill: "orange"},
      {size: 10, name: "6 - Midpoint", fill: "red"},
      {size: 10, name: "7", fill: "orange"},
      {size: 10, name: "8", fill: "orange"},
      {size: 10, name: "9 - To Act 3", fill: "red"},
      {size: 10, name: "10", fill: "plum"},
      {size: 8,  name: "11", fill: "orchid"},
      {size: 2,  name: null, fill: "orchid"},
      //{size: 10, name: "12", fill: "red"},
      //{size: 10, name: "13", fill: "red"},
    ]
  }

  /*
  vogler: {
    icon: "Vogler",
    data: [
      {name: "Prologi"},
      {size: 3.1, name: "Normaalitila", fill: "lightgreen"},
      {size: 1.9, name: "Rikkoutuminen", fill: "yellow"},
      {name: "I näytös"},
      {size: 5.0, name: "Uuden maailman esittely", fill: "lightgreen"},
      {size: 5.0, name: "Haasteiden kohtaaminen", fill: "yellow"},
      {size: 3.0, name: "Ensimmäinen kulminaatio", fill: "orange"},
      {name: "II näytös"},
      {size: 8.0, name: "Uusi mahdollisuus", fill: "yellow"},
      {size: 5.0, name: "Toivo herää", fill: "lightgreen"},
      {size: 5.0, name: "Luolan läheisyys", fill: "orange"},
      {size: 3.0, name: "Synkkä luola", fill: "red"},
      {name: "III näytös"},
      {size: 5.0, name: "Uudelleensyntymä", fill: "yellow"},
      {size: 5.0, name: "Tietoisuus vaarasta", fill: "orange"},
      {size: 3.0, name: "Kriisi", fill: "red"},
      {name: "IV näytös"},
      {size: 5.0, name: "Kliimaksin rakentaminen", fill: "orange"},
      {size: 3.0, name: "Kliimaksi", fill: "red"}
    ]
  },
  */
}

//-----------------------------------------------------------------------------
// Chart direction
//-----------------------------------------------------------------------------

const modeButtons = {
  // Top / Clockwise
  "topCW": {
    tooltip: "Top Clockwise",
    icon: <Icon.Action.Rotate.CW style={{transform: "rotate(180deg)"}} />,
  },
  // Top / Counter-Clockwise
  "topCCW": {
    tooltip: "Top Counter-clockwise",
    icon: <Icon.Action.Rotate.CCW style={{transform: "rotate(180deg)"}} />,
  },
  // Top / Clockwise
  "bottomCW": {
    tooltip: "Bottom Clockwise",
    icon: <Icon.Action.Rotate.CW />,
  },
  // Top / Counter-Clockwise
  "bottomCCW": {
    tooltip: "Bottom Counter-clockwise",
    icon: <Icon.Action.Rotate.CCW />,
  },
}

//-----------------------------------------------------------------------------
// Label positioning
//-----------------------------------------------------------------------------

const RADIAN = Math.PI / 180;

function coord(cx, cy, angle, radius) {
  return [
    cx + radius * Math.cos(angle * RADIAN),
    cy + radius * Math.sin(angle * RADIAN)
  ]
}

function labelWithLine({cx, cy, midAngle, labelRadius, innerRadius, outerRadius, fill, name}) {

  if (!name) return null

  const inside = (labelRadius < innerRadius)
  const startRadius = inside ? innerRadius : outerRadius

  function textAnchor() {
    var mid = midAngle % 360
    if (mid < 0) mid += 360

    if (mid > 270 - 15 && mid < 270 + 15) return {
      textAnchor: "middle",
      dominantBaseline: (inside) ? "auto" : "hanging",
    }
    if (mid > 90 - 15 && mid < 90 + 15) return {
      textAnchor: "middle",
      dominantBaseline: (inside) ? "hanging" : "auto",
    }

    if (textx < cx) return {
      textAnchor: (inside) ? "start" : "end",
      dominantBaseline: "central",
    }
    return {
      textAnchor: (inside) ? "end" : "start",
      dominantBaseline: "central",
    }
  }

  const [sx, sy] = coord(cx, cy, -midAngle, startRadius)
  const [ex, ey] = coord(cx, cy, -midAngle, labelRadius * ((inside) ? 1.035 : 0.975))
  const [textx, texty] = coord(cx, cy, -midAngle, labelRadius)

  return <g>
    <path d={`M${sx},${sy}L${ex},${ey}`} stroke="grey" fill="none" />
    <text x={textx} y={texty} {...textAnchor()}>
      {name}
    </text>
  </g>
}

function outerLabel(props) {
  const {innerRadius, outerRadius} = props
  const labelRadius = outerRadius * 1.1
  return labelWithLine({
    ...props,
    labelRadius,
  })
}

function innerLabel(props) {
  const {innerRadius, outerRadius} = props
  const labelRadius = innerRadius * 0.90

  return labelWithLine({
    ...props,
    labelRadius,
  })
}

//*****************************************************************************
//
// Story pie chart
//
//*****************************************************************************

function StoryChart({startAngle, endAngle, innerData, outerData, outerLabels}) {

  //console.log("Data:", outerData)

  //---------------------------------------------------------------------------
  // Chart ring
  //---------------------------------------------------------------------------

  const common = {
    startAngle,
    endAngle,
    minAngle: 0,
    cx: "50%",
    cy: "50%",
    isAnimationActive: false,
    labelLine: false,
  }

  const outerRing = {
    ...common,
    label: outerLabel,
    labelRadius: "90%",
    outerRadius: "85%",
    innerRadius: "75%",
  }

  const innerRing = {
    ...common,
    label: innerLabel,
    outerRadius: "74%",
    innerRadius: "65%",
    labelRadius: "60%",
  }

  //---------------------------------------------------------------------------
  // Chart
  //---------------------------------------------------------------------------

  //*
  return <ResponsiveContainer aspect={1.6}>
    <PieChart>
      <Pie
        data={innerData}
        dataKey="size"
        {...innerRing}
        isAnimationActive={false}
      />
      <Pie
        data={outerData}
        dataKey="size"
        {...outerRing}
        isAnimationActive={false}
      />
      <Pie
        data={outerLabels}
        dataKey="size"
        {...outerRing}
        fill="none"
        stroke="grey"
        isAnimationActive={false}
      />
    </PieChart>
  </ResponsiveContainer>
  /**/
}
