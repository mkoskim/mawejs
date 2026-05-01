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
  MenuItem, Separator, Icon,
} from "../common/factory"
import { updateWordsHistory } from "../../document/history"

//*****************************************************************************
//
// Bar chart from word count info
//
//*****************************************************************************

export function StatsView({doc, updateDoc}) {

  const history = updateWordsHistory(doc.history, undefined, doc.draft.words)

  //console.log("History:", doc.history);
  //console.log("History:", history);

  return <HistoryChart history={history}/>
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
