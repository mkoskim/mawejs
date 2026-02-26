//*****************************************************************************
//*****************************************************************************
//
// MUI themes
//
//*****************************************************************************
//*****************************************************************************

import { createTheme } from '@mui/material/styles';

//*****************************************************************************
//
// Common application theme
//
//*****************************************************************************

const common  = createTheme({
  palette: {
    //primary: { main: "#222", },
  },
  typography: {
    //fontSize: 14,
  },
  components: {

    //-------------------------------------------------------------------------

    MuiDialogTitle: {
      defaultProps: {
      },
      styleOverrides: {
        root: {
          padding: "8px 16px",
          borderBottom: "1px solid lightgray",
        },
      }
    },

    MuiDialogContent: {
      defaultProps: {
      },
      styleOverrides: {
        root: {
          padding: "8px 16px"
        },
      }
    },

    MuiDialogActions: {
      defaultProps: {
      },
      styleOverrides: {
        root: {
          padding: "8px 16px",
          borderTop: "1px solid lightgray",
        },
      }
    },

    //-------------------------------------------------------------------------

    MuiTextField: {
      defaultProps: {
        size: "small",
        margin: 'dense',
      },
    },
    MuiInputBase: {
      defaultProps: {
        spellCheck: false,
        size: "small",
        margin: 'dense',
      },
      styleOverrides: {
        root: {
          //paddingLeft: "5px",
        },
        input: {
          //height: "24px",
          //padding: "4px",
        }
      },
    },

    /*
    MuiOutlinedInput: {
      defaultProps: {
        size: "small",
        margin: 'dense',
      },
      styleOverrides: {
        root: {
          paddingLeft: "5px",
        },
        input: {
          height: "24px",
          padding: "4px",
        }
      },
    },
    */
    /*
    MuiFilledInput: {
      defaultProps: {
        margin: 'dense',
      },
    },
    MuiFormControl: {
      defaultProps: {
        margin: 'dense',
      },
    },
    MuiFormHelperText: {
      defaultProps: {
        margin: 'dense',
      },
    },
    MuiInputLabel: {
      defaultProps: {
        margin: 'dense',
      },
    },
    MuiListItem: {
      defaultProps: {
        dense: true,
      },
    },
    */

    //-------------------------------------------------------------------------
    // Tooltip
    //-------------------------------------------------------------------------

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: "11pt",
        }
      }
    },

    //-------------------------------------------------------------------------
    // Transitions
    //-------------------------------------------------------------------------

    MuiMenu: {
      defaultProps: {
        transitionDuration: 0,
      }
    },
    MuiPopover: {
      defaultProps: {
        transitionDuration: 0,
      }
    },
    MuiAccordion: {
      defaultProps: {
        slotProps: {transition: {timeout: {enter: 75, exit: 75}}},
      }
    },
    MuiDialog: {
      defaultProps: {
        transitionDuration: 200,
      }
    },

    //-------------------------------------------------------------------------
    // Misc
    //-------------------------------------------------------------------------

    MuiFab: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiTable: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiToolbar: {
      defaultProps: {
        variant: 'dense',
      },
    },

  },
})

//*****************************************************************************
//
// Toolbar theme
//
//*****************************************************************************

const toolbar = createTheme({
  palette: {
    primary: { main: "#222", },
  },
  typography: {
    //fontSize: 14,
  },
  components: {
    MuiButtonBase: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          lineHeight: 1.0,
          //minWidth: "28px",
          //minHeight: "28px",
          padding: "4px",
          "&:hover": {
            background: "lightgrey",
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        //size: 'small',
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          lineHeight: 1.0,
          fontSize: "12pt",
          padding: "4px",
          minWidth: "24px",
          minHeight: "24px",
          //minWidth: "32px",
          borderRadius: 0,
          //minHeight: "32px",
          //padding: "4px 4px",
        },
      },
    },
    MuiToggleButton: {
      defaultProps: {
        //size: 'small',
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          lineHeight: 1.0,
          //minWidth: "32px",
          padding: "4px",
          borderRadius: 0,
          border: 0,
          //minHeight: "32px",
          //padding: "4px 4px",
          "&:hover": {
            background: "lightgrey",
          },
          '&.Mui-selected': {
            background: "lightblue",
          },
          '&.Mui-disabled': {
            border: "0",
          }
        },
      },
    },
    MuiIconButton: {
      defaultProps: {
        //size: 'small',
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          padding: "4px",
          borderRadius: 0,
          "&:hover": {
            background: "lightgrey",
          },
        },
      },
    },
  },
});

//*****************************************************************************
//
// Sidebar theme
//
//*****************************************************************************

const sidebar  = createTheme({
  palette: {
    //primary: { main: "#222", },
  },
  typography: {
    //fontSize: 14,
  },
  components: {
  },
})

//*****************************************************************************
//
// Exporting
//
//*****************************************************************************

export const theme = {
  common,
  toolbar,
  sidebar,
}
