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
} from "recharts"

import {
  HFiller, ToolBox, VFiller,
  Button, Label,
  MakeToggleGroup,
  Select, MenuItem, InputLabel, FormControl, Separator,
} from "../common/factory"

//-----------------------------------------------------------------------------

export function Chart({doc}) {
  const section = doc.story.body

  return <DrawPieChart section={section}/>
    //return <DrawBarChart section={section}/>
}

//*****************************************************************************
//
// Story pie chart
//
//*****************************************************************************

function DrawPieChart({section}) {

  //---------------------------------------------------------------------------
  // Data
  //---------------------------------------------------------------------------

  const elemButtons = {
    scenes: {
      icon: "Scenes",
      data: () => section.parts.map(part => {
        return part.children.map(scene => ({
          name: scene.name,
          size: scene.words.text,
        }))
      }).flat()
    },
    parts: {
      icon: "Parts",
      data: () => section.parts.map(p => ({
        name: p.name,
        size: p.words.text,
      }))
    },
  }

  const [selectElement, setSelectElement] = useState("scenes")

  //---------------------------------------------------------------------------
  // Templates
  //---------------------------------------------------------------------------

  const tmplButtons = {
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
        {size:  2.5, fill: "orange", name: "Resolution"}
      ]
    },
    acts: {
      icon: "Acts",
      data: [
        {name: "Act I", size: 25, fill: "lightgreen"},
        {name: "Act II/1", size: 25, fill: "yellow"},
        {name: "Midpoint"},
        {name: "Act II/2", size: 25, fill: "orange"},
        {name: "Act III", size: 25, fill: "red"},
      ]
    },
    beatsheet: {
      icon: "Beat Sheet",
      data: [
        {name: null, size: 1, fill: "lightgreen"}, // Opening Image
        {name: "Set-up", size: 10, fill: "lightgreen"},
        {name: "Catalyst", size: 1, fill: "yellow"},
        {name: "Debate", size: 13, fill: "lightgreen"},
        {name: "Choosing Act Two"},
        {name: "B Story", size: 5, fill: "lightyellow"},
        {name: "Fun & Games", size: 25, fill: "yellow"},
        {name: "Midpoint"},
        {name: "Bad Guys Close In", size: 20, fill: "orange"},
        {name: "All is Lost"},
        {name: "Dark Night of the Soul", size: 10, fill: "orange"},
        {name: "Choosing Act Three"},
        {name: "Finale", size: 24, fill: "red"},
        {name: null, size: 1, fill: "orange"}, // Closing Image
      ]
    }
  }

  /*
  console.log("Beat sheet lenght=", tmplButtons.beatsheet.data
    .map(data => data.size)
    .reduce((a, b) => a + b, 0)
  )
  */

  const [selectTemplate, setSelectTemplate] = useState("plotpoints")

  //---------------------------------------------------------------------------

  const RADIAN = Math.PI / 180;

  function coord(cx, cy, angle, radius) {
    return [
      cx + radius * Math.cos(angle * RADIAN),
      cy + radius * Math.sin(angle * RADIAN)
    ]
  }

  function labelWithLine({cx, cy, midAngle, labelRadius, innerRadius, outerRadius, fill, name}) {

    if(!name) return null

    const inside = (labelRadius < innerRadius)
    const startRadius = inside ? innerRadius : outerRadius

    function textAnchor() {
      if((midAngle % 360) > 270-10 && (midAngle % 360) < 270+10) return {
        textAnchor: "middle",
        dominantBaseline: (inside) ? "auto" : "hanging",
      }
      if((midAngle % 360) > 90-10 && (midAngle % 360) < 90+10) return {
        textAnchor: "middle",
        dominantBaseline: (inside) ? "hanging" : "auto",
      }

      if(textx < cx) return {
        textAnchor: (inside) ? "start" : "end",
        dominantBaseline: "central",
      }
      return {
        textAnchor: (inside) ? "end" : "start",
        dominantBaseline: "central",
      }
    }

    const [sx, sy] = coord(cx, cy, -midAngle, startRadius)
    const [ex, ey] = coord(cx, cy, -midAngle, labelRadius * ((inside) ? 1.025 : 0.975))
    const [textx, texty] = coord(cx, cy, -midAngle, labelRadius)

    return <g>
      <path d={`M${sx},${sy}L${ex},${ey}`} stroke={fill} fill="none" />
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

  const innerLabel = (props) => {
    const {innerRadius, outerRadius} = props
    const labelRadius = innerRadius * 0.85

    return labelWithLine({
      ...props,
      labelRadius,
    })
  }

  //---------------------------------------------------------------------------

  const common = {
    startAngle: 91,
    endAngle: 360+89,
    minAngle: 0,
    cx: "50%",
    cy: "50%",
    isAnimationActive: false,
    labelLine: false,
  }

  const outerRing = {
    label: outerLabel,
    labelRadius: "90%",
    outerRadius: "85%",
    innerRadius: "75%",
    fill: "lightblue",
    ...common,
  }

  const innerRing = {
    label: innerLabel,
    outerRadius: "74%",
    innerRadius: "65%",
    labelRadius: "60%",
    ...common,
  }

  /*
  const innerRing = {
    label: innerLabel,
    innerRadius: "65%",
    outerRadius: "70%",
  }
  */

  //---------------------------------------------------------------------------
  // View
  //---------------------------------------------------------------------------

  return <VFiller>
    <ToolBox>
      <Label text="Element:"/>
      <MakeToggleGroup
        buttons={elemButtons}
        choices={["scenes", "parts"]}
        selected={selectElement}
        setSelected={setSelectElement}
        exclusive={true}
      />
      <Separator/>
      <Label text="Template:"/>
      <MakeToggleGroup
        buttons={tmplButtons}
        choices={["plotpoints", "acts", "beatsheet"]}
        selected={selectTemplate}
        setSelected={setSelectTemplate}
        exclusive={true}
      />
      <Separator/>
    </ToolBox>
    <VFiller>
      <ResponsiveContainer width="95%" height="95%">
      <PieChart>
        <Pie
          //data={parts}
          data={elemButtons[selectElement].data()}
          dataKey="size"
          {...outerRing}
        />
        <Pie
          data={tmplButtons[selectTemplate].data}
          dataKey="size"
          {...innerRing}
        />
      </PieChart>
      </ResponsiveContainer>
    </VFiller>
  </VFiller>
}

//*****************************************************************************
//
// Story bar chart
//
//*****************************************************************************

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