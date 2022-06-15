import React from "react";
import ReactDOM from "react-dom/client";

import App from "./gui/app.js"
import store from "./features/store"
import {Provider} from "react-redux"

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
