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

import {EditView} from "../editor/editorSlate";
import {Workspace} from "../workspace";
import View from "../views"

import {VBox, HBox, Loading} from "../common/factory";

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

  if(!status.reduce((a, b) => (a && !!b), true))
  {
    return <View.Starting />
  }

  return <HBox className="ViewPort"><ChooseView /></HBox>
}

//-----------------------------------------------------------------------------

function ChooseView() {

  console.log("Choose view")

  const edit = useSelector(state => state.doc.edit)
  const loading = useSelector(state => state.doc.loading)

  console.log("Edit:", edit, loading)

  if(edit) {
    if(loading) {
      return <Loading />
    }
    return <EditView id={edit.id}/>
  }

  return <Workspace />
}
