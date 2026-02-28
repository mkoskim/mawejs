//-----------------------------------------------------------------------------
// Icons
//-----------------------------------------------------------------------------

function createSvgIcon({viewBox = "0 0 24 24", children}) {
  return () => <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox}>
    {children}
    </svg>
}

const Placeholder = createSvgIcon({
  children: <>
    <path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
    </>
})

const Search = createSvgIcon({
  children: <>
    <path d="M0 0h24v24H0V0z" fill="none"/>
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5"/>
  </>
})

/*
const LightbulbOutlined = createSvgIcon(
  children: <>
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
  </>
})

/*
const Close = createSvgIcon({
    viewBox: "0, -8, -8, -8",
    children: <path d="M-8 -8h-8v-8H-8V-8z"/>
})

const StarOutlineOutlined = <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#ffffff"><path d="M9,8.7l3,3l3,-3l-3,3l-3,-3 M9,8.7l3,3l3,-3l-3,3l-3,-3 M9,8.7l3,3l3,-3l-3,3l-3,-3 M9,8.7l3,3l3,-3l-3,3l-3,-3 M9,8.7l3,3l3,-3l-3,3l-3,-3"/></svg>
const Star = <svg xmlns="http://www.wfulfill.com/standalone/Star.svg#StarIcon" height="inherit" viewBox="-6 -6 -6 -6 -6 -6 -6 -6 -6 -6 -6 -6 -6 -6 -6 -6 -6 -6 -6 -6 " width="inherit"></svg>
const Circle = <svg xmlns="http://www.wfulfill.com/standalone/Circle.svg#CircleIcon" height="inherit" viewBox="-8 -8 " width="inherit"></svg>
const HelpOutline = <svg xmlns="http://www.wfulfill.com/standalone/HelpOutline.svg#HelpOutlineIcon" height="inherit" viewBox="-8 -8 " width="inherit"></svg>

Menu,

  BarChartOutlined, BookmarksOutlined,
  LooksOne, LooksTwo,
  AddBoxOutlined,

  ArrowUpward, ArrowDownward,
  ArrowLeft,
  ArrowRight,
  ArrowDropDown,

  KeyboardArrowDown,
  KeyboardArrowUp,
  KeyboardArrowLeft,
  KeyboardArrowRight,

  IndeterminateCheckBoxOutlined,
  ExpandMore,

  FormatBold, FormatItalic,

  FormatAlignLeft,
  FormatListNumberedRtl,
  ArticleOutlined,
  GridViewOutlined,
  PrintOutlined,
  DonutLarge,
  FormatAlignJustifyOutlined,

  AlternateEmail,

  SettingsOutlined,

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

  InsertDriveFileOutlined,
  BrokenImageOutlined,
  CheckBox,

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
  DeleteOutlined,
  DriveFileRenameOutlineOutlined,

  NotesOutlined,

//-----------------------------------------------------------------------------
// Material Design Icons
//-----------------------------------------------------------------------------

  mdiTextBoxEditOutline,
  mdiBookOpenVariantOutline,

//const MdiSortAscending = createSvgIcon(<path d={mdiSortAscending}/>)
//const MdiSortDescending = createSvgIcon(<path d={mdiSortDescending}/>)
//const MdiSortAscending = createSvgIcon(<path d={mdiSortReverseVariant}/>)
//const MdiSortDescending = createSvgIcon(<path d={mdiSortVariant}/>)
const MdiTextBoxEditOutline = createSvgIcon(<path d={mdiTextBoxEditOutline}/>)
const MdiBookOpenVariantOutline = createSvgIcon(<path d = {mdiBookOpenVariantOutline}/>)
*/

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

const svgElements = {
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

const SortAscending  = <svg viewBox="0 0 24 24"><path d={svgElements.arrowDown + svgElements.stackAscend}/></svg>
const SortDescending = <svg viewBox="0 0 24 24"><path d={svgElements.arrowDown + svgElements.stackDescend}/></svg>

//-----------------------------------------------------------------------------
// Icons
//-----------------------------------------------------------------------------

export const Icon = {
  Placeholder,

  Close: Placeholder, //Close,
  Star: Placeholder, //StarOutlineOutlined,
  Starred: Placeholder, //Star,
  Circle: Placeholder, //Circle,
  Help: Placeholder, //HelpOutline,
  Menu: Placeholder, //Menu,

  ExpandMore: Placeholder, //ExpandMore,

  Arrow: {
    Left: Placeholder, //ArrowLeft,
    Right: Placeholder, //ArrowRight,
    Up: Placeholder, //ArrowUpward,
    Down: Placeholder, //ArrowDownward,
    DropDown: Placeholder, //ArrowDropDown,
    Head: {
      Up: Placeholder, //KeyboardArrowUp,
      Down: Placeholder, //KeyboardArrowDown,
      Left: Placeholder, //KeyboardArrowLeft,
      Right: Placeholder, //KeyboardArrowRight,
    }
  },

  Sort: {
    Ascending: SortAscending,
    Descending: SortDescending,
  },

  View: {
    Index: Placeholder, //FormatAlignLeft,
    List: Placeholder, //FormatListNumberedRtl,
    Edit: Placeholder, //MdiTextBoxEditOutline,
    Organize: Placeholder, //GridViewOutlined,
    Export: Placeholder, //PrintOutlined,
    Arc: Placeholder, //DonutLarge,
    Stats: Placeholder, //BarChartOutlined,
    Tags: Placeholder, //AlternateEmailOutlined,
    Draft: Placeholder, //DescriptionOutlined,
    Notes: Placeholder, //NotesOutlined,
    StoryBook: Placeholder, //MdiBookOpenVariantOutline,
    Trashcan: Placeholder, //DeleteOutlined,
  },

  //NewFile: NoteAddOutlined,
  //NewFolder: CreateNewFolderOutlined,
  //AddFiles: FolderOpenOutlined,

  Settings: Placeholder, //SettingsOutlined,

  Action: {
    Quit: Placeholder, //Close,
    Close: Placeholder, //Close,
    Search: Search,
    Edit: Placeholder, //ArticleOutlined,
    Cards: Placeholder, //GridViewOutlined,
    Transfer: Placeholder, //SwapHorizontalCircleOutlined,
    Print: Placeholder, //PrintOutlined,
    Folder: Placeholder, //FolderOutlined,
    File: {
      New: Placeholder, //NoteAddOutlined,
      Open: Placeholder, //FileOpenOutlined,
      Save: Placeholder, //SaveOutlined,
      SaveAs: Placeholder, //SaveAsOutlined,
      Rename: Placeholder, //DriveFileRenameOutlineOutlined,
    },
    Replay: Placeholder, //Replay,
    Cached: Placeholder, //Cached,
    Loop: Placeholder, //Loop,
    Rotate: {
      CW: Placeholder, //RotateRight,
      CCW: Placeholder, //RotateLeft,
    },
    VerticalAlign: {
      Top: Placeholder, //VerticalAlignTop,
      Bottom: Placeholder, //VerticalAlignBottom,
    },
    HeadInfo: Placeholder, //DescriptionOutlined,
  },

  Location: {
    Home: Placeholder, //Home,
    Favorites: Placeholder, //Favorite,
  },

  FileType: {
    Folder: Placeholder, //FolderOutlined,
    File: Placeholder, //InsertDriveFileOutlined,
    Unknown: Placeholder, //BrokenImageOutlined,
    Selected: Placeholder, //CheckBox,
  },

  MoreHoriz: Placeholder, //MoreHoriz,
  PaperClipHoriz: Placeholder, //Attachment,
  PaperClipVert: Placeholder, //AttachFile,

  RadioButton: {
    Unchecked: Placeholder, //RadioButtonUnchecked,
    Checked: Placeholder, //RadioButtonChecked,
  },

  BlockType: {
    Scene: Placeholder, //FormatAlignJustifyOutlined,
    Bookmark: Placeholder, //BookmarksOutlined,
    Comment: Placeholder, //CommentOutlined,
    Missing: Placeholder, //ReportOutlined,
    Filler: Placeholder, //AddBoxOutlined,
    Tags: Placeholder, //AlternateEmailOutlined,
  },
  StatType: {
    Off: Placeholder, //VisibilityOff,
    Words: Placeholder, //Numbers,
    Compact: Placeholder, //Compress,
    Percent: Placeholder, //Percent,
    Cumulative: Placeholder, //SignalCellularAlt,
  },

  Style: {
    Bold: Placeholder, //FormatBold,
    Italic: Placeholder, //FormatItalic,

    Chapter: Placeholder, //LooksOne,
    Scene: Placeholder, //LooksTwo,

    Bookmark: Placeholder, //BookmarksOutlined,
    Comment: Placeholder, //CommentOutlined,
    Missing: Placeholder, //ReportOutlined,
    Filler: Placeholder, //AddBoxOutlined,
    Tags: Placeholder, //AlternateEmailOutlined,

    Folded: Placeholder, //VisibilityOff,
    FoldAll: Placeholder, //IndeterminateCheckBoxOutlined,
    UnfoldAll: Placeholder, //AddBoxOutlined,
  },
}

