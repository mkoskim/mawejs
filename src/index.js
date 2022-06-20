import React from "react";

import App from "./gui/app/app.js"
import {store} from "./gui/app/store"
import {Provider} from "react-redux"

/*
// React -18
import ReactDOM from "react-dom";
ReactDOM.render(
  <Provider store={store}>
      <App />
  </Provider>,
  document.getElementById("root")
);
/*/
// React 18+
import { createRoot } from 'react-dom/client';
const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(
  <Provider store={store}>
      <App />
  </Provider>
);
/**/
