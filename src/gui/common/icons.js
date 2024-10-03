
//-----------------------------------------------------------------------------
// Icons
//-----------------------------------------------------------------------------

import {
  LightbulbOutlined,
  Close,
  StarOutlineOutlined,
  Star,
  Circle,
  HelpOutline,
  Menu,

  ExpandMore,

  ArrowLeft,
  ArrowRight,
  ArrowDropUp,
  ArrowDropDown,

  FormatAlignLeft,
  FormatListNumberedRtl,
  ArticleOutlined,
  GridViewOutlined,
  PrintOutlined,
  DonutLarge,
  Label,

  SettingsOutlined,

  Search,
  SwapHorizontalCircleOutlined,
  FolderOutlined,
  NoteAddOutlined,
  FileOpenOutlined,
  SaveOutlined,
  SaveAsOutlined,

  Replay,
  Cached,
  Loop,
  RotateRight,
  RotateLeft,

  VerticalAlignTop,
  VerticalAlignBottom,
  DescriptionOutlined,

  Home,
  Favorite,

  Folder,
  InsertDriveFileOutlined,
  BrokenImageOutlined,
  CheckBox,

  FormatAlignJustifyOutlined,
  FormatAlignRightOutlined,
  Comment,
  Report,
  AddBox,

  VisibilityOff,
  Numbers,
  Compress,
  Percent,
  SignalCellularAlt,

  MoreHoriz,
  Attachment,
  AttachFile,

  RadioButtonUnchecked,
  RadioButtonChecked,

} from '@mui/icons-material';

// Material icons
export const Icon = {
  Placeholder: LightbulbOutlined,

  Close: Close,
  Star: StarOutlineOutlined,
  Starred: Star,
  Circle: Circle,
  Help: HelpOutline,
  Menu: Menu,

  ExpandMore: ExpandMore,

  Arrow: {
    Left: ArrowLeft,
    Right: ArrowRight,
    Up: ArrowDropUp,
    Down: ArrowDropDown,
  },

  View: {
    Index: FormatAlignLeft,
    List: FormatListNumberedRtl,
    Edit: ArticleOutlined,
    Organize: GridViewOutlined,
    Export: PrintOutlined,
    Chart: DonutLarge,
    Tags: Label,
  },

  //NewFile: NoteAddOutlined,
  //NewFolder: CreateNewFolderOutlined,
  //AddFiles: FolderOpenOutlined,

  Settings: SettingsOutlined,

  Action: {
    Search: Search,
    Edit: ArticleOutlined,
    Cards: GridViewOutlined,
    Transfer: SwapHorizontalCircleOutlined,
    Print: PrintOutlined,
    Folder: FolderOutlined,
    File: {
      New: NoteAddOutlined,
      Open: FileOpenOutlined,
      Save: SaveOutlined,
      SaveAs: SaveAsOutlined,
    },
    Replay: Replay,
    Cached: Cached,
    Loop: Loop,
    Rotate: {
      CW: RotateRight,
      CCW: RotateLeft,
    },
    VerticalAlign: {
      Top: VerticalAlignTop,
      Bottom: VerticalAlignBottom,
    },
    HeadInfo: DescriptionOutlined,
  },

  Location: {
    Home: Home,
    Favorites: Favorite,
  },

  FileType: {
    Folder: Folder,
    File: InsertDriveFileOutlined,
    Unknown: BrokenImageOutlined,
    Selected: CheckBox,
  },

  BlockType: {
    Scene: FormatAlignJustifyOutlined,
    Synopsis: FormatAlignRightOutlined,
    Comment: Comment,
    Missing: Report,
    Filler: AddBox,
    Tags: Label,
  },
  StatType: {
    Off: VisibilityOff,
    Words: Numbers,
    Compact: Compress,
    Percent: Percent,
    Cumulative: SignalCellularAlt,
  },

  MoreHoriz: MoreHoriz,
  PaperClipHoriz: Attachment,
  PaperClipVert: AttachFile,

  RadioButton: {
    Unchecked: RadioButtonUnchecked,
    Checked: RadioButtonChecked,
  }
}

