
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

  KeyboardArrowDown,
  KeyboardArrowUp,
  KeyboardArrowLeft,
  KeyboardArrowRight,

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
  DeleteForeverOutlined,
  DeleteOutlined,
  DriveFileRenameOutlineOutlined,
  Biotech,
} from '@mui/icons-material';

import {
  mdiSortAscending,
  mdiSortDescending,
  mdiSortReverseVariant,
  mdiSortVariant,
  mdiTextBoxEditOutline,
  mdiBookAlphabet,
  mdiBookOpenVariantOutline,
} from '@mdi/js';

import { createSvgIcon } from '@mui/material';
import {BiotechOutlined} from '@mui/icons-material';
import {ScienceOutlined} from '@mui/icons-material';
import {NotesOutlined} from '@mui/icons-material';

//-----------------------------------------------------------------------------
// Material Design Icons
//-----------------------------------------------------------------------------

//const MdiSortAscending = createSvgIcon(<path d={mdiSortAscending}/>)
//const MdiSortDescending = createSvgIcon(<path d={mdiSortDescending}/>)
//const MdiSortAscending = createSvgIcon(<path d={mdiSortReverseVariant}/>)
//const MdiSortDescending = createSvgIcon(<path d={mdiSortVariant}/>)
const MdiTextBoxEditOutline = createSvgIcon(<path d={mdiTextBoxEditOutline}/>)
const MdiBookAlphabet = createSvgIcon(<path d={mdiBookAlphabet}/>)
const MdiBookOpenVariantOutline = createSvgIcon(<path d = {mdiBookOpenVariantOutline}/>)

//-----------------------------------------------------------------------------
// Custom made icons
//-----------------------------------------------------------------------------

/*
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <title>sort-ascending</title>
  <path d="M19 17H22L18 21L14 17H17V3H19M2 17H12V19H2M6 5V7H2V5M2 11H9V13H2V11Z" />
  </svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <title>sort-descending</title>
  <path d="M19 7H22L18 3L14 7H17V21H19M2 17H12V19H2M6 5V7H2V5M2 11H9V13H2V11Z" /></svg>
*/

const elements = {
  arrowDown:   ["M19 17", "H22", "L18 21", "L14 17", "H17", "V3",  "H19"].join(""),
  arrowUp:     ["M19 7",  "H22", "L18 3",  "L14 7",  "H17", "V21", "H19"].join(""),
  stackAscend: [
    "M2  5", "V7",  "H6",  "V5",
    "M2 11", "V13", "H9",  "V11",
    "M2 17", "V19", "H12", "V17",
  ].join(""),
  stackDescend: [
    "M2  5", "V7",  "H12",  "V5",
    "M2 11", "V13", "H9",  "V11",
    "M2 17", "V19", "H6", "V17",
  ].join(""),
}

const SortAscending  = createSvgIcon(<path d={elements.arrowDown + elements.stackAscend}/>)
const SortDescending = createSvgIcon(<path d={elements.arrowDown + elements.stackDescend} />)

//-----------------------------------------------------------------------------
// Icons
//-----------------------------------------------------------------------------

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
    DropDown: ArrowDropDown,
    Head: {
      Up: KeyboardArrowUp,
      Down: KeyboardArrowDown,
      Left: KeyboardArrowLeft,
      Right: KeyboardArrowRight,
    }
  },

  Sort: {
    Ascending: SortAscending,
    Descending: SortDescending,
  },

  View: {
    Index: FormatAlignLeft,
    List: FormatListNumberedRtl,
    Edit: MdiTextBoxEditOutline,
    Organize: GridViewOutlined,
    Export: PrintOutlined,
    Arc: DonutLarge,
    Stats: BarChartOutlined,
    Tags: AlternateEmail,
    Draft: DescriptionOutlined,
    Notes: NotesOutlined,
    StoryBook: MdiBookOpenVariantOutline,
    Trashcan: DeleteOutlined,
  },

  //NewFile: NoteAddOutlined,
  //NewFolder: CreateNewFolderOutlined,
  //AddFiles: FolderOpenOutlined,

  Settings: SettingsOutlined,

  Action: {
    Quit: Close,
    Close: Close,
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
      Rename: DriveFileRenameOutlineOutlined,
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
    Folder: FolderOutlined,
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

