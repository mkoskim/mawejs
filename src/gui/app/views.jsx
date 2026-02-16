//*****************************************************************************
//*****************************************************************************
//
// View selection
//
//*****************************************************************************
//*****************************************************************************

import React, {
} from "react"

import {
  Icon, MakeToggleGroup,
} from "../common/factory";

import { EditView } from "../editor/editor";
import { StoryArcView } from "../arc/arc"
import { StatsView } from "../stats/stats"
import { ExportView } from "../export/export"

//*****************************************************************************
//
// View settings
//
//*****************************************************************************

export function loadViewSettings(settings) {
  return {
    selected: "editor",
    ...(settings?.attributes ?? {})
  }
}

export function saveViewSettings(settings) {
  return {type: "view",
    attributes: {
      //selected: settings.selected,
    }
  }
}

export function getViewMode(doc) { return doc.ui.view.selected; }
export function setViewMode(updateDoc, value) { updateDoc(doc => {doc.ui.view.selected = value})}

//*****************************************************************************
//
// View selection
//
//*****************************************************************************

export class ViewSelectButtons extends React.PureComponent {

  render() {
    const {selected, setSelected} = this.props
    const {choices, viewbuttons} = this.constructor

    return <MakeToggleGroup
      exclusive={true}
      choices={choices}
      selected={selected}
      setSelected={setSelected}
      buttons={viewbuttons}
    />
  }

  static choices = ["editor", "arc", "stats", "export"]

  static viewbuttons = {
    "editor": { tooltip: "Editor", icon: <Icon.View.Edit /> },
    "organizer": { tooltip: "Organizer", icon: <Icon.View.Organize /> },
    "arc": { tooltip: "Story Arc", icon: <Icon.View.Arc /> },
    "stats": { tooltip: "Statistics", icon: <Icon.View.Stats /> },
    "export": { tooltip: "Export", icon: <Icon.View.Export /> },
  }
}

export function ViewSwitch({doc, updateDoc}) {

  if(!doc) return null

  const props = { doc, updateDoc }

  switch (getViewMode(doc)) {
    case "editor": return <EditView {...props} />
    //case "organizer": return <Organizer {...props} />
    case "stats": return <StatsView {...props} />
    case "arc": return <StoryArcView {...props} />
    case "export": return <ExportView {...props} />
    default: break;
  }
  return null;
}
