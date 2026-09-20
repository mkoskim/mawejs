import { createRoot } from 'react-dom/client';
import { SnackbarProvider } from "notistack";
import {Tooltip} from "@base-ui/react/tooltip"

import {App} from "./gui/app/app.jsx"
import {UpdateNotifier, UpdatesProvider} from "./gui/common/autoupdate.jsx"
import {AppInfoProvider} from './gui/app/appinfo.jsx';
import {CmdProvider} from './gui/app/context';

//import {store} from "./gui/app/store"
//import {Provider} from "react-redux"

//-----------------------------------------------------------------------------
// NOTE: ThemeProvider likes to create new theme every time it is rendered.
// Keep it here, so it will be rendered only once.
//-----------------------------------------------------------------------------

createRoot(document.getElementById('root')).render(
  <UpdatesProvider>
  <AppInfoProvider>
  <Tooltip.Provider>
  <SnackbarProvider>
  <CmdProvider>
    <UpdateNotifier/>
    <App />
  </CmdProvider>
  </SnackbarProvider>
  </Tooltip.Provider>
  </AppInfoProvider>
  </UpdatesProvider>
);
