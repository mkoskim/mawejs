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
import { Outliner } from "../outliner/outliner"

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

  choices = ["editor", "outliner", "organizer", "chart", "export"]

  viewbuttons = {
    "editor": { tooltip: "Editor", icon: <Icon.View.Edit /> },
    "organizer": { tooltip: "Organizer", icon: <Icon.View.Organize /> },
    "chart": { tooltip: "Charts", icon: <Icon.View.Chart /> },
    "export": { tooltip: "Export", icon: <Icon.View.Export /> },
    "outliner": { tooltip: "Outline", icon: <Icon.View.Outline style={{color: "MediumOrchid"}} /> },
  }
}

export function ViewSwitch({doc, setDoc}) {

  const {view, setView} = useContext(SettingsContext)

  const [focusTo, _setFocusTo] = useState(undefined)

  const setFocusTo = useCallback(value => {
    setView(produce(view => {view.selected = "editor"}))
    _setFocusTo(value)
  }, [])

  if(!doc?.story) return null

  const props = { doc, setDoc, focusTo, setFocusTo }

  switch (view.selected) {
    case "editor": return <SingleEditView {...props} />
    case "organizer": return <Organizer {...props} />
    case "export": return <Export {...props} />
    case "chart": return <Chart {...props} />
    case "outliner": return <Outliner {...props} />
    default: break;
  }
  return null;
}
