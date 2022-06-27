//*****************************************************************************
//*****************************************************************************
//
// Application main
//
//*****************************************************************************
//*****************************************************************************

import "./app.css"

/* eslint-disable no-unused-vars */

import React from 'react'
import {useEffect} from "react"

import { useSelector, useDispatch } from "react-redux";
import {action} from "./store"

import {EditView} from "../editor";
import {Workspace} from "../workspace";
import View from "../views"

import {VBox, HBox, Loading} from "../common/factory";

import { createTheme, ThemeProvider } from '@mui/material/styles';

const myTheme = createTheme({
  palette: {
    primary: {
      main: "#222",
    },
  },
  typography: {
    fontSize: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          minWidth: 0,
          fontSize: 14,
        },
      }
    },
    MuiBreadcrumbs: {
      styleOverrides: {
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: "10pt",
        }
      }
    },
  },
});

//-----------------------------------------------------------------------------

export default function App(props) {

  console.log("App")

  const dispatch = useDispatch()

  //---------------------------------------------------------------------------
  // Run initializes & wait them to finish

  useEffect(() => {
    console.log("Initializing...")
    dispatch(action.CWD.resolve("./local"))
    //dispatch(CWD.location("home"))
    //dispatch(onOpen({id: "./local/Beltane.A.mawe.gz", name: "Beltane.A.mawe.gz"}))
    dispatch(action.workspace.init())
    dispatch(action.doc.init())
  }, [])

  const status = [
    useSelector(state => state.workspace.status),
    useSelector(state => state.doc.status),
  ]

  console.log("Status:", status)

  if(!status.every(s => s))
  {
    return <View.Starting />
  }

  return <HBox className="ViewPort">
    <ThemeProvider theme={myTheme}>
      <ChooseView />
    </ThemeProvider>
  </HBox>
}

//-----------------------------------------------------------------------------

function ChooseView() {

  const edit = useSelector(state => state.doc.edit)

  console.log("ChooseView:", edit?.id)

  if(edit) {
    return <EditView />
  }

  return <Workspace />
}
