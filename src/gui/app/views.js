//*****************************************************************************
//*****************************************************************************
//
// View selection
//
//*****************************************************************************
//*****************************************************************************

import React, {
  useCallback,
} from "react"

import {
  Icon, MakeToggleGroup,
} from "../common/factory";

import { SingleEditView } from "../editor/editor";
import { StoryArc } from "../arc/arc"
import { Stats } from "../stats/stats"
import { Export } from "../export/export"
import {ImportView} from "../import/import";

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
    return <MakeToggleGroup
      exclusive={true}
      choices={this.choices}
      selected={selected}
      setSelected={setSelected}
      buttons={this.viewbuttons}
    />
  }

  choices = ["editor", "chart", "stats", "export"]

  viewbuttons = {
    "editor": { tooltip: "Editor", icon: <Icon.View.Edit /> },
    "organizer": { tooltip: "Organizer", icon: <Icon.View.Organize /> },
    "chart": { tooltip: "Story Arc", icon: <Icon.View.Chart /> },
    "stats": { tooltip: "Statistics", icon: <Icon.View.Stats /> },
    "export": { tooltip: "Export", icon: <Icon.View.Export /> },
  }
}

export function ViewSwitch({doc, updateDoc}) {

  if(!doc) return null

  const props = { doc, updateDoc }

  switch (getViewMode(doc)) {
    case "editor": return <SingleEditView {...props} />
    //case "organizer": return <Organizer {...props} />
    case "stats": return <Stats {...props} />
    case "chart": return <StoryArc {...props} />
    case "export": return <Export {...props} />
    default: break;
  }
  return null;
}
