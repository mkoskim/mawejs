//*****************************************************************************
//*****************************************************************************
//
// Edit view selection
//
//*****************************************************************************
//*****************************************************************************

import React, {
  useState, useCallback, useContext,
} from "react"

import {produce} from "immer"

import {
  Icon, MakeToggleGroup,
} from "../common/factory";

import {
  SettingsContext,
} from "./settings"

import { SingleEditView } from "../editor/editor";
import { Organizer } from "../organizer/organizer";
import { Chart } from "../chart/chart"
import { Export } from "../export/export"

//-----------------------------------------------------------------------------

export class ViewSelectButtons extends React.PureComponent {

  render() {
    const {selected, setSelected} = this.props
    return <MakeToggleGroup
      exclusive={true}
      choices={this.choices}
      selected={selected}
      setSelected={setSelected}
      buttons={this.viewbuttons}
    />
  }

  choices = ["editor", "chart", "export"]

  viewbuttons = {
    "editor": { tooltip: "Editor", icon: <Icon.View.Edit /> },
    "organizer": { tooltip: "Organizer", icon: <Icon.View.Organize /> },
    "chart": { tooltip: "Charts", icon: <Icon.View.Chart /> },
    "export": { tooltip: "Export", icon: <Icon.View.Export /> },
  }
}

export function ViewSwitch({doc, updateDoc}) {

  const {view, setView} = useContext(SettingsContext)

  const [focusTo, _setFocusTo] = useState(undefined)

  const setFocusTo = useCallback(value => {
    setView(produce(view => {view.selected = "editor"}))
    _setFocusTo(value)
  }, [])

  if(!doc?.story) return null

  const props = { doc, updateDoc, focusTo, setFocusTo }

  switch (view.selected) {
    case "editor": return <SingleEditView {...props} />
    //case "organizer": return <Organizer {...props} />
    case "export": return <Export {...props} />
    case "chart": return <Chart {...props} />
    default: break;
  }
  return null;
}
