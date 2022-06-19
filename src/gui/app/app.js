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

import {VBox, HBox} from "../common/factory";
import {FileBrowser} from "../filebrowser";
import {Organizer} from "../editor/organizer";
import {Workspace} from "../workspace";

import View from "../views"

//const fs = require("../../storage/localfs")

//-----------------------------------------------------------------------------

export default function App(props) {

  const dispatch = useDispatch()

  //---------------------------------------------------------------------------
  // Run initializes & wait them to finish

  useEffect(() => dispatch(action.workspace.init()))
  useEffect(() => dispatch(action.CWD.resolve("./local")))
    //dispatch(CWD.location("home"))
    //dispatch(onOpen({id: "./local/Beltane.A.mawe.gz", name: "Beltane.A.mawe.gz"}))

  const status = useSelector(state => state.workspace.status)

  if(!status)
  {
    return <View.Starting />
  }

  // Some sort of view chooser... But it is not always possible, we can't
  // edit a file if we don't have one...

  //---------------------------------------------------------------------------
  // Choose view

  /*
  return (
      <VBox style={{height: "100vh", width: "100vw"}}>
        <View />
      </VBox>
  );

  /*/
  return (
    <HBox className="ViewPort">
      <Workspace />
    </HBox>
  );
  /**/

}
