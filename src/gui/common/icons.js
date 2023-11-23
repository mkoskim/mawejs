
//-----------------------------------------------------------------------------
// Icons
//-----------------------------------------------------------------------------

const muiIcons = require("@mui/icons-material/")
//console.log("Icons", require("@material-ui/icons/"))

// Material icons
export const Icon = {
  Placeholder: muiIcons.LightbulbOutlined,

  Close: muiIcons.Close,
  Star: muiIcons.StarOutlineOutlined,
  Starred: muiIcons.Star,
  Circle: muiIcons.Circle,
  Help: muiIcons.HelpOutline,
  Menu: muiIcons.Menu,

  ExpandMore: muiIcons.ExpandMore,

  Arrow: {
    Left: muiIcons.ArrowLeft,
    Right: muiIcons.ArrowRight,
    Up: muiIcons.ArrowDropUp,
    Down: muiIcons.ArrowDropDown,
  },

  View: {
    Index: muiIcons.FormatAlignLeft,
    List: muiIcons.FormatListNumberedRtl,
    Edit: muiIcons.ArticleOutlined,
    Organize: muiIcons.GridViewOutlined,
    Export: muiIcons.PrintOutlined,
    Chart: muiIcons.DonutLarge,
    Outline: muiIcons.SummarizeOutlined,
  },

  //NewFile: muiIcons.NoteAddOutlined,
  //NewFolder: muiIcons.CreateNewFolderOutlined,
  //AddFiles: muiIcons.FolderOpenOutlined,

  Settings: muiIcons.SettingsOutlined,

  Action: {
    Search: muiIcons.Search,
    Edit: muiIcons.ArticleOutlined,
    Cards: muiIcons.GridViewOutlined,
    Transfer: muiIcons.SwapHorizontalCircleOutlined,
    Print: muiIcons.PrintOutlined,
    Folder: muiIcons.FolderOutlined,
    File: {
      New: muiIcons.NoteAddOutlined,
      Open: muiIcons.FileOpenOutlined,
      Save: muiIcons.SaveOutlined,
      SaveAs: muiIcons.SaveAsOutlined,
    },
    Replay: muiIcons.Replay,
    Cached: muiIcons.Cached,
    Loop: muiIcons.Loop,
    Rotate: {
      CW: muiIcons.RotateRight,
      CCW: muiIcons.RotateLeft,
    },
    VerticalAlign: {
      Top: muiIcons.VerticalAlignTop,
      Bottom: muiIcons.VerticalAlignBottom,
    },
    HeadInfo: muiIcons.DescriptionOutlined,
  },

  Location: {
    Home: muiIcons.Home,
    Favorites: muiIcons.Favorite,
  },

  FileType: {
    Folder: muiIcons.Folder,
    File: muiIcons.InsertDriveFileOutlined,
    Unknown: muiIcons.BrokenImageOutlined,
    Selected: muiIcons.CheckBox,
  },

  BlockType: {
    Scene: muiIcons.FormatAlignJustifyOutlined,
    Synopsis: muiIcons.FormatAlignRightOutlined,
    Comment: muiIcons.Comment,
    Missing: muiIcons.Report,
  },
  StatType: {
    Off: muiIcons.VisibilityOff,
    Words: muiIcons.Numbers,
    Compact: muiIcons.Compress,
    Percent: muiIcons.Percent,
    Cumulative: muiIcons.SignalCellularAlt,
  },

  MoreHoriz: muiIcons.MoreHoriz,
  PaperClipHoriz: muiIcons.Attachment,
  PaperClipVert: muiIcons.AttachFile,

  RadioButton: {
    Unchecked: muiIcons.RadioButtonUnchecked,
    Checked: muiIcons.RadioButtonChecked,
  }
}

