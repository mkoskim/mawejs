//*****************************************************************************
//*****************************************************************************
//
// Story graphics
//
//*****************************************************************************
//*****************************************************************************

import React, {
  useState,
} from "react"

import {
  ResponsiveContainer,
  CartesianGrid, Tooltip,
  XAxis, YAxis,
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie,
  Cell,
} from "recharts"
import {SectionWordInfo} from "../common/components"

import {
  HBox, VBox, HFiller, VFiller,
  ToolBox,
  Button, Label,
  MakeToggleGroup,
  Select, MenuItem, InputLabel, FormControl, Separator, Icon,
} from "../common/factory"

import {DragDropContext, Droppable, Draggable} from "react-beautiful-dnd";
import {onDragEndUpdateDoc} from "../common/dndDocUpdate";
import {DocIndex} from "../common/docIndex";
import {mawe} from "../../document";

//-----------------------------------------------------------------------------

export function Chart({doc, setDoc}) {
  //const section = doc.story.body

  return <DragDropContext onDragEnd={onDragEnd}>
    <HBox style={{overflow: "auto"}}>
      <VBox style={{maxWidth: "300px", borderRight: "1px solid lightgray"}}>
        <IndexToolbar />
        <DocIndex
          name={mawe.info(doc.story.body.head).title}
          section={doc.story.body}
          activeID="body"
          include={["part", "scene"]}
          wcFormat={"compact"}
          unfold={true}
        />
      </VBox>
      <ChartView doc={doc} />
    </HBox>
  </DragDropContext>

  function onDragEnd(result) {
    onDragEndUpdateDoc(doc, setDoc, result)
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

function IndexToolbar({ }) {
  return <ToolBox style={styles.toolbar}>
    <Button>Test</Button>
  </ToolBox>
}

//*****************************************************************************
//
// Story pie chart
//
//*****************************************************************************

function ChartView({doc}) {

  const section = doc.story.body

  //---------------------------------------------------------------------------
  // Data selection
  //---------------------------------------------------------------------------

  const [selectElement, setSelectElement] = useState("scenes")

  const [selectTemplate, setSelectTemplate] = useState("plotpoints")

  /*
  console.log("Beat sheet length=", tmplButtons.beatsheet.data
    .map(data => data.size)
    .reduce((a, b) => a + b, 0)
  )
  */

  //---------------------------------------------------------------------------
  // Chart directions
  //---------------------------------------------------------------------------

  const [mode, _setMode] = useState("topCCW")
  const [selectStart, setSelectStart] = useState(90)
  const [selectRotate, setSelectRotate] = useState(1)

  function setMode(mode) {
    _setMode(mode)
    switch (mode) {
      case "topCCW": return setStartRotate(90, 1)
      case "topCW": return setStartRotate(90, -1)
      case "bottomCCW": return setStartRotate(270, 1)
      case "bottomCW": return setStartRotate(270, -1)
    }

    function setStartRotate(start, rotate) {
      setSelectStart(start)
      setSelectRotate(rotate)
    }
  }

  //---------------------------------------------------------------------------
  // View
  //---------------------------------------------------------------------------

  const settings = {
    elements: {
      buttons: elemButtons,
      choices: ["scenes", "parts"],
      selected: selectElement,
      setSelected: setSelectElement,
      exclusive: true,
    },
    template: {
      buttons: tmplButtons,
      choices: ["acts", "plotpoints", "beatsheet"],
      selected: selectTemplate,
      setSelected: setSelectTemplate,
      exclusive: true,
    },
    mode: {
      buttons: modeButtons,
      choices: ["topCCW", "topCW", "bottomCCW", "bottomCW"],
      selected: mode,
      setSelected: setMode,
      exclusive: true,
    }
  }

  return <VFiller style={{overflow: "auto"}}>
    <ChartToolbar settings={settings} />
    <StoryChart
      startAngle={selectStart + selectRotate * 1}
      endAngle={selectStart + selectRotate * (360 - 2)}
      innerData={tmplButtons[selectTemplate].data}
      outerData={elemButtons[selectElement].data(section)}
      outerLabels={elemButtons[selectElement].labels(section)}
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
    <MakeToggleGroup {...settings.elements}/>
    <Separator />
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

function elemLabel(elem) {
  const {name, words} = elem
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
      size: words.missing,
      fill: "plum",
      stroke: "plum",
    }
  ]
}

function partLabels(section) {
  return section.parts.map(part => elemLabel(part))
}

function partData(section) {
  return section.parts.map(part => elemData(part)).flat()
}


function sceneLabels(section) {
  return section.parts.map(part => (
    part.children.map(scene => elemLabel(scene))
  )).flat()
}

function sceneData(section) {
  return section.parts.map(part => (
    part.children.map(scene => elemData(scene)).flat()
  )).flat()
}

//-----------------------------------------------------------------------------
// Story data
//-----------------------------------------------------------------------------

const elemButtons = {
  scenes: {
    icon: "Scenes",
    labels: (section) => sceneLabels(section),
    data: (section) => sceneData(section),
  },
  parts: {
    icon: "Parts",
    labels: (section) => partLabels(section),
    data: (section) => partData(section),
  },
}

//-----------------------------------------------------------------------------
// Story templates
//-----------------------------------------------------------------------------

const tmplButtons = {
  acts: {
    icon: "Acts",
    data: [
      {size: 25, name: "Act I", fill: "lightgreen"},
      {size: 25, name: "Act II/1", fill: "yellow"},
      {name: "Midpoint"},
      {size: 25, name: "Act II/2", fill: "orange"},
      {size: 25, name: "Act III", fill: "red"},
    ]
  },
  plotpoints: {
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
      />
      <Pie
        data={outerData}
        dataKey="size"
        {...outerRing}
      />
      <Pie
        data={outerLabels}
        dataKey="size"
        {...outerRing}
        fill="none"
        stroke="grey"
      />
    </PieChart>
  </ResponsiveContainer>
  /**/
}

//*****************************************************************************
//
// Story bar chart
//
//*****************************************************************************

/*
function DrawBarChart({section}) {
  const parts = section.parts.map((part, index) => ({
    name: part.name,
    size: part.words.text,
  }))

  const scenes = section.parts.map((part, index) => {
    return part.children.map(scene => ({
      name: scene.name,
      size: scene.words.text,
    }))
  }).flat()

  return <ResponsiveContainer width="90%" height="80%">
    <BarChart data={scenes}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="size" />
    </BarChart>
  </ResponsiveContainer>
}
*/