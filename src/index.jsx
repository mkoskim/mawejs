import { createRoot } from 'react-dom/client';
import { ThemeProvider } from "@mui/material";
import { theme } from "./gui/common/theme.js";
import { SnackbarProvider } from "notistack";

import {App} from "./gui/app/app.jsx"

//import {store} from "./gui/app/store"
//import {Provider} from "react-redux"

/*
if (import.meta.hot) {
  import.meta.hot.on(
    "vite:beforeUpdate",
    () => console.clear()
  );
}
*/

//-----------------------------------------------------------------------------
// NOTE: ThemeProvider likes to create new theme every time it is rendered.
// Keep it here, so it will be rendered only once.
//-----------------------------------------------------------------------------

createRoot(document.getElementById('root')).render(
  <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <App />
    </SnackbarProvider>
  </ThemeProvider>
);
