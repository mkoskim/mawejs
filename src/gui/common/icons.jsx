//*****************************************************************************
//
// Icons are mainly from two sources:
//
// - Material UI: https://fonts.google.com/icons
// - MDI (Material Design Icons): https://pictogrammers.com/library/mdi/
//
// There are few self-made ones, e.g. sort ascending/descending.
//
//*****************************************************************************

//-----------------------------------------------------------------------------
// Create SVG icons from JSX elements
//-----------------------------------------------------------------------------

function createSvgIcon({viewBox = "0 0 24 24", children}) {
  return ({style}) => <svg xmlns="http://www.w3.org/2000/svg" className="Icon" style={style} viewBox={viewBox}>
    {/*<rect fill="none" height="24" width="24"/>*/}
    {children}
  </svg>
}

//-----------------------------------------------------------------------------
// Icons
//-----------------------------------------------------------------------------

const Placeholder = createSvgIcon({
  children: <>
    <path fill="currentColor" d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
  </>
})

const Empty = createSvgIcon({})

const Checked = createSvgIcon({
  children: <>
    <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
  </>
})

const Search = createSvgIcon({
  children: <>
    <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </>
})

const Close = createSvgIcon({
  children: <>
    <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
  </>
})

const HelpOutline = createSvgIcon({
  children: <>
    <path fill="currentColor" d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
  </>
})

const Star = createSvgIcon({
  children: <>
    <path fill="currentColor" d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"/>
  </>
})

const StarOutlined = createSvgIcon({
  children: <>
    <path fill="currentColor" d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/>
  </>
})

const Menu = createSvgIcon({
  children: <>
    <path fill="currentColor" d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" />
  </>
})


//-----------------------------------------------------------------------------
// Arrows
//-----------------------------------------------------------------------------

const KeyboardArrowDown = createSvgIcon({
  children: <>
    <path fill="currentColor" d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
  </>
})

const KeyboardArrowUp = createSvgIcon({
  children: <>
    <path fill="currentColor" d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z"/>
  </>
})

const KeyboardArrowLeft = createSvgIcon({
  children: <>
    <path fill="currentColor" d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
  </>
})

const KeyboardArrowRight = createSvgIcon({
  children: <>
    <path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
  </>
})

const ArrowDropDown = createSvgIcon({
  children: <>
    <path fill="currentColor" d="M7 10l5 5 5-5H7z"/>
  </>
})

//-----------------------------------------------------------------------------
// Styles
//-----------------------------------------------------------------------------

const FormatBold = createSvgIcon({
  children: <>
    <path fill="currentColor" d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
  </>
})

const FormatItalic = createSvgIcon({
  children: <>
    <path fill="currentColor" d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z"/>
  </>
})

//-----------------------------------------------------------------------------
// Icons
//-----------------------------------------------------------------------------

const FolderOutlined = createSvgIcon({
  children: <>
    <path fill="currentColor" d="M9.17 6l2 2H20v10H4V6h5.17M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
  </>
})

const MdiTextBoxEditOutline = createSvgIcon({
  children: <>
    <path fill="currentColor" d="M10 21H5C3.89 21 3 20.11 3 19V5C3 3.89 3.89 3 5 3H19C20.11 3 21 3.89 21 5V10.33C20.7 10.21 20.37 10.14 20.04 10.14C19.67 10.14 19.32 10.22 19 10.37V5H5V19H10.11L10 19.11V21M7 9H17V7H7V9M7 17H12.11L14 15.12V15H7V17M7 13H16.12L17 12.12V11H7V13M21.7 13.58L20.42 12.3C20.21 12.09 19.86 12.09 19.65 12.3L18.65 13.3L20.7 15.35L21.7 14.35C21.91 14.14 21.91 13.79 21.7 13.58M12 22H14.06L20.11 15.93L18.06 13.88L12 19.94V22Z" />
  </>
})

const DonutLarge = createSvgIcon({
  children: <>
    <path fill="currentColor" d="M13 5.08c3.06.44 5.48 2.86 5.92 5.92h3.03c-.47-4.72-4.23-8.48-8.95-8.95v3.03zM18.92 13c-.44 3.06-2.86 5.48-5.92 5.92v3.03c4.72-.47 8.48-4.23 8.95-8.95h-3.03zM11 18.92c-3.39-.49-6-3.4-6-6.92s2.61-6.43 6-6.92V2.05c-5.05.5-9 4.76-9 9.95 0 5.19 3.95 9.45 9 9.95v-3.03z"/>
  </>
})

const BarChartOutlined = createSvgIcon({
  children: <>
    <rect fill="currentColor" height="11" width="4" x="4" y="9"/>
    <rect fill="currentColor" height="7" width="4" x="16" y="13"/>
    <rect fill="currentColor" height="16" width="4" x="10" y="4"/>
  </>
})

const LightbulbOutlined = createSvgIcon({
  children: <>
    <path fill="currentColor" d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
  </>
})

const PrintOutlined = createSvgIcon({
  children: <>
  <path fill="currentColor" d="M19 8h-1V3H6v5H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zM8 5h8v3H8V5zm8 12v2H8v-4h8v2zm2-2v-2H6v2H4v-4c0-.55.45-1 1-1h14c.55 0 1 .45 1 1v4h-2z"/><circle cx="18" cy="11.5" r="1"/>
  </>
})

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

const SortAscending  = createSvgIcon({children: <path fill="currentColor" d={svgElements.arrowDown + svgElements.stackAscend}/>})
const SortDescending = createSvgIcon({children: <path fill="currentColor" d={svgElements.arrowDown + svgElements.stackDescend}/>})

//-----------------------------------------------------------------------------
// Icons
//-----------------------------------------------------------------------------

export const Icon = {
  Placeholder,
  Empty,
  Checked,
  Close,
  Search,
  Menu,
  Quit: Close,

  Star: StarOutlined,
  Starred: Star,
  Circle: Placeholder, //Circle,
  Help: HelpOutline,

  ExpandMore: Placeholder, //ExpandMore,

  Arrow: {
    Left: Placeholder, //ArrowLeft,
    Right: Placeholder, //ArrowRight,
    Up: Placeholder, //ArrowUpward,
    Down: Placeholder, //ArrowDownward,
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
    Edit: MdiTextBoxEditOutline,
    Arc: DonutLarge,
    Stats: BarChartOutlined,
    Export: PrintOutlined,

    Index: Placeholder, //FormatAlignLeft,
    List: Placeholder, //FormatListNumberedRtl,
    Organize: Placeholder, //GridViewOutlined,
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
    Quit: Close,
    Close: Close,
    Search: Search,
    Edit: Placeholder, //ArticleOutlined,
    Cards: Placeholder, //GridViewOutlined,
    Transfer: Placeholder, //SwapHorizontalCircleOutlined,
    Print: Placeholder, //PrintOutlined,
    Folder: FolderOutlined,
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
    Folder: FolderOutlined,
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
    Bold: FormatBold,
    Italic: FormatItalic,

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

