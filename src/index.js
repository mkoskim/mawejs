import React from "react";
import ReactDOM from "react-dom";

import App from "./gui/app.js"
import store from "./gui/store/store"
import {Provider} from "react-redux"

ReactDOM.render(
  <Provider store={store}>
      <App />
  </Provider>,
  document.getElementById("root")
);
