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
          minWidth: "32px",
          minHeight: "32px",
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
          minWidth: "32px",
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
