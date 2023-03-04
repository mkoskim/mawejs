//*****************************************************************************
//*****************************************************************************
//
// Collections of common components for editor
//
//*****************************************************************************
//*****************************************************************************

import React, {
  useState, useEffect, useReducer,
  useMemo, useCallback,
  useDeferredValue,
  StrictMode,
} from 'react';

import {
  FlexBox, VBox, HBox, Filler, VFiller, HFiller,
  ToolBox, Button, Icon, Tooltip,
  ToggleButton, ToggleButtonGroup, MakeToggleGroup,
  Input,
  SearchBox, addHotkeys,
  Label,
  List, ListItem, ListItemText,
  Grid,
  Separator, Loading, addClass,
  Menu, MenuItem,
} from "../common/factory";


//-----------------------------------------------------------------------------
// Document word info
//-----------------------------------------------------------------------------

export function SectionWordInfo({sectWithWords}) {
  if(!sectWithWords) return null;
  return <>
    <Label>Words: {sectWithWords.words?.text}</Label>
    <Separator/>
    <Label>Chars: {sectWithWords.words?.chars}</Label>
    </>
}

//-----------------------------------------------------------------------------
// Button group to choose which elements are shown
//-----------------------------------------------------------------------------

export function ChooseVisibleElements({elements}) {
  const buttons = {
    "scene": {
      tooltip: "Show scenes",
      icon: <Icon.BlockType.Scene/>
    },
    "synopsis": {
      tooltip: "Show synopses",
      icon: <Icon.BlockType.Synopsis />
    },
    "missing": {
      tooltip: "Show missing",
      icon: <Icon.BlockType.Missing />
    },
    "comment": {
      tooltip: "Show comments",
      icon: <Icon.BlockType.Comment />
    },
  }

  return MakeToggleGroup(buttons, elements)
}

//-----------------------------------------------------------------------------
// Button group to choose how words are shown
//-----------------------------------------------------------------------------

export function ChooseWordFormat({format}) {
  const buttons = {
    "off": {
      tooltip: "Don't show words",
      icon: <Icon.StatType.Off />
    },
    "numbers": {
      tooltip: "Words as numbers",
      icon: <Icon.StatType.Words />,
    },
    "percent": {
      tooltip: "Words as percent",
      icon: <Icon.StatType.Percent />
    },
    "cumulative": {
      tooltip: "Words as cumulative percent",
      icon: <Icon.StatType.Cumulative />
    },
  }

  return MakeToggleGroup(buttons, format, true)
}

export function FormatWords({format, words, cumulative, total}) {
  if(words) switch(format) {
    case "numbers": return <span>{words}</span>
    case "percent": return <span>{Number(100.0 * words / total).toFixed(1)}</span>
    case "cumulative": return <span>{cumulative !== undefined && Number(100.0 * cumulative / total).toFixed(1)}</span>
    default: break;
  }
  return null;
}
