import React from "react";
import ReactDOM from "react-dom";

import App from "./gui/app.js"
import store from "./gui/store/store"
import {Provider} from "react-redux"

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

ReactDOM.render(
  <Provider store={store}>
    <DndProvider backend={HTML5Backend}>
      <App />
    </DndProvider>
  </Provider>,
  document.getElementById("root")
);

/*
const root = ReactDOM.createRoot(document.getElementById("root"));
*/