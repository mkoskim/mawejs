//*****************************************************************************
//*****************************************************************************
//
// Views
//
// Views pull the things together. We need these, as it is really hard to
// make active, interoperable components. Instead, we make views with data
// and callbacks, and construct them from components in other directories.
//
//*****************************************************************************
//*****************************************************************************

import {
  VBox, HBox, Loading
} from "../common/factory";

//-----------------------------------------------------------------------------

export default {
  Starting,
}

//-----------------------------------------------------------------------------

function Starting() {
  return <Loading className="ViewPort"/>;
}

//-----------------------------------------------------------------------------
// Pick files to workspace
