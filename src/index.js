import React from "react";
import ReactDOM from "react-dom";

import App from "./gui/app/app.js"
import store from "./gui/app/store"
import {Provider} from "react-redux"

ReactDOM.render(
  <Provider store={store}><App /></Provider>,
  document.getElementById("root")
);
