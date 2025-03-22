
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

  BarChartOutlined, BookmarksOutlined, ShowChart,
  LooksOne, LooksTwo,
  UnfoldMore, UnfoldMoreDouble,
  UnfoldLess, UnfoldLessDouble,
  AddBoxOutlined,

  ArrowUpward, ArrowDownward,
  ArrowLeft,
  ArrowRight,
  ArrowDropUp,
  ArrowDropDown,

  IndeterminateCheckBoxOutlined,
  Expand, ExpandMore,
  Collapse,

  FormatBold, FormatItalic,

  FormatAlignLeft,
  FormatListNumberedRtl,
  ArticleOutlined,
  GridViewOutlined,
  PrintOutlined,
  DonutLarge,
  FormatAlignJustifyOutlined,
  FormatAlignRightOutlined,

  Label, LabelOutlined, AlternateEmail,

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
  CommentOutlined,
  ReportOutlined,
  AlternateEmailOutlined,
  Sort,

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
    Up: ArrowUpward,
    Down: ArrowDownward,
  },

  Sort: {
    Ascending: ArrowUpward,
    Descending: ArrowDownward,
  },

  View: {
    Index: FormatAlignLeft,
    List: FormatListNumberedRtl,
    Edit: ArticleOutlined,
    Organize: GridViewOutlined,
    Export: PrintOutlined,
    Arc: DonutLarge,
    Stats: BarChartOutlined,
    Tags: AlternateEmail,
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

  MoreHoriz: MoreHoriz,
  PaperClipHoriz: Attachment,
  PaperClipVert: AttachFile,

  RadioButton: {
    Unchecked: RadioButtonUnchecked,
    Checked: RadioButtonChecked,
  },

  BlockType: {
    Scene: FormatAlignJustifyOutlined,
    Bookmark: BookmarksOutlined,
    Comment: CommentOutlined,
    Missing: ReportOutlined,
    Filler: AddBoxOutlined,
    Tags: AlternateEmailOutlined,
  },
  StatType: {
    Off: VisibilityOff,
    Words: Numbers,
    Compact: Compress,
    Percent: Percent,
    Cumulative: SignalCellularAlt,
  },

  Style: {
    Bold: FormatBold,
    Italic: FormatItalic,

    Chapter: LooksOne,
    Scene: LooksTwo,

    Bookmark: BookmarksOutlined,
    Comment: CommentOutlined,
    Missing: ReportOutlined,
    Filler: AddBoxOutlined,
    Tags: AlternateEmailOutlined,

    Folded: VisibilityOff,
    FoldAll: IndeterminateCheckBoxOutlined,
    UnfoldAll: AddBoxOutlined,
  },
}

