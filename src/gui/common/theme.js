//-----------------------------------------------------------------------------
// Theme
//-----------------------------------------------------------------------------

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
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
          fontSize: "12pt",
          minWidth: "32px",
          minHeight: "32px",
          padding: "4px 4px",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          lineHeight: 1.0,
          fontSize: "12pt",
          minWidth: "32px",
          //minHeight: "32px",
          //padding: "4px 4px",
        },
      },
    },
    MuiToggleButton: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          lineHeight: 1.0,
          fontSize: "12pt",
          minWidth: "32px",
          //minHeight: "32px",
          //padding: "4px 4px",
        },
      },
    },
    MuiIconButton: {
      defaultProps: {
        size: 'small',
      },
      /*
      styleOverrides: {
        root: {
          textTransform: 'none',
          //fontSize: "12pt",
          padding: "4px 4px",
          //margin: 0,
        },
      },
      */
    },
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
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: "11pt",
        }
      }
    },
  },
});
