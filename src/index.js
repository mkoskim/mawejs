import React from "react";

import { createRoot } from 'react-dom/client';
import {ThemeProvider} from "@mui/material";
import {theme} from "./gui/common/theme.js";

import App from "./gui/app/app.js"

//import {store} from "./gui/app/store"
//import {Provider} from "react-redux"

const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>
);
