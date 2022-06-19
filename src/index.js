import React from "react";
import ReactDOM from "react-dom";

import App from "./gui/app/app.js"
import {store} from "./gui/app/store"
import {Provider} from "react-redux"

//import { DndProvider } from 'react-dnd'
//import { HTML5Backend } from 'react-dnd-html5-backend'

ReactDOM.render(
  <Provider store={store}>
      <App />
  </Provider>,
  document.getElementById("root")
);
