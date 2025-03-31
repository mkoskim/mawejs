//*****************************************************************************
//*****************************************************************************
//
// Show diagram from history data
//
//*****************************************************************************
//*****************************************************************************

/* eslint-disable no-unused-vars */

//import "./organizer.css"

import React, {
  useCallback,
} from "react"

import {
  ResponsiveContainer,
  CartesianGrid, Tooltip,
  XAxis, YAxis,
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie,
  Cell, Legend,
} from "recharts"

import {
  HBox, VBox, HFiller, VFiller,
  ToolBox,
  Button, Label,
  MakeToggleGroup,
  Select, MenuItem, InputLabel, FormControl, Separator, Icon,
} from "../common/factory"
import { createDateStamp } from "../../document/util"

//*****************************************************************************
//
// Bar chart from word count info
//
//*****************************************************************************

export function StatsView({doc, updateDoc}) {

  const today = createDateStamp()

  // Filter word count entries, and use current count for today
  const history = doc.history
    .filter(e => e.type === "words")
    .filter(e => e.date !== today)
    .sort((a, b) => a.date - b.date)
    .concat([{date: today, ...doc.draft.words}])

  return <HistoryChart history={history}/>
  /*
  return <HBox style={{overflow: "auto"}}>
    <HistoryChart history={history}/>
  </HBox>
  */
}

//-----------------------------------------------------------------------------

function HistoryChart({history}) {

  //console.log("History:", history);

  return <ResponsiveContainer width="90%" height="80%">
    <BarChart data={history}>
      {/* <CartesianGrid strokeDasharray="3 3" /> */}
      <XAxis dataKey="date"/>
      <YAxis />
      <Tooltip />
      <Bar dataKey="text" stackId="total" fill="green" isAnimationActive={false}/>
      <Bar dataKey="missing" stackId="total" fill="red" isAnimationActive={false}/>
    </BarChart>
  </ResponsiveContainer>

}
