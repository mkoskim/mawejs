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
  return ({style}) => <svg
    xmlns="http://www.w3.org/2000/svg"
    className="Icon"
    viewBox={viewBox}
    fill="currentColor"
    style={style}
  >
    {children}
  </svg>
}

//-----------------------------------------------------------------------------
// Icons
//-----------------------------------------------------------------------------

const Empty = createSvgIcon({})

const Placeholder = createSvgIcon({
  children: <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
})

const LightbulbOutlined = createSvgIcon({
  children: <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
})

const Checked = createSvgIcon({
  children: <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
})

const Search = createSvgIcon({
  children: <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
})

const Close = createSvgIcon({
  children: <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
})

const HelpOutline = createSvgIcon({
  children: <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
})

const Star = createSvgIcon({
  children: <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"/>
})

const StarOutlined = createSvgIcon({
  children: <path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/>
})

const Menu = createSvgIcon({
  children: <path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"/>
})

const Debug = createSvgIcon({
  viewBox: "0 -960 960 960",
  children: <path d="M200-520v-40q0-72 32.5-131.5T320-789l-75-75 35-36 85 85q26-12 55.5-18.5T480-840q30 0 59.5 6.5T595-815l85-85 35 36-75 75q55 38 87.5 97.5T760-560v40H200Zm428.5-91.5Q640-623 640-640t-11.5-28.5Q617-680 600-680t-28.5 11.5Q560-657 560-640t11.5 28.5Q583-600 600-600t28.5-11.5Zm-240 0Q400-623 400-640t-11.5-28.5Q377-680 360-680t-28.5 11.5Q320-657 320-640t11.5 28.5Q343-600 360-600t28.5-11.5Zm-107 490Q200-203 200-320v-160h560v160q0 117-81.5 198.5T480-40q-117 0-198.5-81.5Z"/>
})

//-----------------------------------------------------------------------------
// Arrows
//-----------------------------------------------------------------------------

const ArrowLeft = createSvgIcon({
  viewBox: "0 -960 960 960",
  children: <path d="M400-240 160-480l240-240 56 58-142 142h486v80H314l142 142-56 58Z"/>
})

const ArrowRight = createSvgIcon({
  viewBox: "0 -960 960 960",
  children: <path d="m560-240-56-58 142-142H160v-80h486L504-662l56-58 240 240-240 240Z"/>
})

const ArrowUp = createSvgIcon({
  viewBox: "0 -960 960 960",
  children: <path d="M440-160v-487L216-423l-56-57 320-320 320 320-56 57-224-224v487h-80Z"/>
})

const ArrowDown = createSvgIcon({
  viewBox: "0 -960 960 960",
  children: <path d="M440-800v487L216-537l-56 57 320 320 320-320-56-57-224 224v-487h-80Z"/>
})

// Solid Arrow heads

const ArrowHeadLeft = createSvgIcon({
  viewBox: "0 -960 960 960",
  children: <path d="M560-280 360-480l200-200v400Z"/>
})

const ArrowHeadRight = createSvgIcon({
  viewBox: "0 -960 960 960",
  children: <path d="M400-280v-400l200 200-200 200Z"/>
})

const ArrowHeadUp = createSvgIcon({
  viewBox: "0 -960 960 960",
  children: <path d="m280-400 200-200 200 200H280Z"/>
})

const ArrowHeadDown = createSvgIcon({
  viewBox: "0 -960 960 960",
  children: <path d="M480-360 280-560h400L480-360Z"/>
})

// Chevrons

const ChevronDown = createSvgIcon({
  children: <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
})

const ChevronUp = createSvgIcon({
  children: <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z"/>
})

const ChevronLeft = createSvgIcon({
  children: <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
})

const ChevronRight = createSvgIcon({
  children: <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
})

//-----------------------------------------------------------------------------
// Styles
//-----------------------------------------------------------------------------

const FormatBold = createSvgIcon({
  children: <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
})

const FormatItalic = createSvgIcon({
  children: <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z"/>
})

const LooksOne = createSvgIcon({
  viewBox: "0 -960 960 960",
  children: <path d="M480-280h80v-400H400v80h80v320ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"/>
})

const LooksTwo = createSvgIcon({
  viewBox: "0 -960 960 960",
  children: <path d="M360-280h240v-80H440v-80h80q33 0 56.5-23.5T600-520v-80q0-33-23.5-56.5T520-680H360v80h160v80h-80q-33 0-56.5 23.5T360-440v160ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"/>
})

const FormatAlignJustifyOutlined = createSvgIcon({
  viewBox: "0 -960 960 960",
  children: <path d="M120-120v-80h720v80H120Zm0-160v-80h720v80H120Zm0-160v-80h720v80H120Zm0-160v-80h720v80H120Zm0-160v-80h720v80H120Z"/>
})

const BookmarksOutlined = createSvgIcon({
  viewBox: "0 -960 960 960",
  children: <path d="M160-80v-560q0-33 23.5-56.5T240-720h320q33 0 56.5 23.5T640-640v560L400-200 160-80Zm80-121 160-86 160 86v-439H240v439Zm480-39v-560H280v-80h440q33 0 56.5 23.5T800-800v560h-80ZM240-640h320-320Z"/>
})

const CommentOutlined = createSvgIcon({
  viewBox: "0 -960 960 960",
  children: <path d="M240-400h480v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM880-80 720-240H160q-33 0-56.5-23.5T80-320v-480q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v720ZM160-320h594l46 45v-525H160v480Zm0 0v-480 480Z"/>
})

const ReportOutlined = createSvgIcon({
  viewBox: "0 -960 960 960",
  children: <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240ZM330-120 120-330v-300l210-210h300l210 210v300L630-120H330Zm34-80h232l164-164v-232L596-760H364L200-596v232l164 164Zm116-280Z"/>
})

const AlternateEmailOutlined = createSvgIcon({
  viewBox: "0 -960 960 960",
  children: <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480v58q0 59-40.5 100.5T740-280q-35 0-66-15t-52-43q-29 29-65.5 43.5T480-280q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480v58q0 26 17 44t43 18q26 0 43-18t17-44v-58q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93h200v80H480Zm85-315q35-35 35-85t-35-85q-35-35-85-35t-85 35q-35 35-35 85t35 85q35 35 85 35t85-35Z"/>
})

//-----------------------------------------------------------------------------
// Views
//-----------------------------------------------------------------------------

const FolderOutlined = createSvgIcon({
  children: <path d="M9.17 6l2 2H20v10H4V6h5.17M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
})

const MdiTextBoxEditOutline = createSvgIcon({
  children: <path d="M10 21H5C3.89 21 3 20.11 3 19V5C3 3.89 3.89 3 5 3H19C20.11 3 21 3.89 21 5V10.33C20.7 10.21 20.37 10.14 20.04 10.14C19.67 10.14 19.32 10.22 19 10.37V5H5V19H10.11L10 19.11V21M7 9H17V7H7V9M7 17H12.11L14 15.12V15H7V17M7 13H16.12L17 12.12V11H7V13M21.7 13.58L20.42 12.3C20.21 12.09 19.86 12.09 19.65 12.3L18.65 13.3L20.7 15.35L21.7 14.35C21.91 14.14 21.91 13.79 21.7 13.58M12 22H14.06L20.11 15.93L18.06 13.88L12 19.94V22Z" />
})

const DonutLarge = createSvgIcon({
  children: <path d="M13 5.08c3.06.44 5.48 2.86 5.92 5.92h3.03c-.47-4.72-4.23-8.48-8.95-8.95v3.03zM18.92 13c-.44 3.06-2.86 5.48-5.92 5.92v3.03c4.72-.47 8.48-4.23 8.95-8.95h-3.03zM11 18.92c-3.39-.49-6-3.4-6-6.92s2.61-6.43 6-6.92V2.05c-5.05.5-9 4.76-9 9.95 0 5.19 3.95 9.45 9 9.95v-3.03z"/>
})

const BarChartOutlined = createSvgIcon({
  children: <>
    <rect height="11" width="4" x="4" y="9"/>
    <rect height="7" width="4" x="16" y="13"/>
    <rect height="16" width="4" x="10" y="4"/>
  </>
})

const PrintOutlined = createSvgIcon({
  children: <>
    <path d="M19 8h-1V3H6v5H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zM8 5h8v3H8V5zm8 12v2H8v-4h8v2zm2-2v-2H6v2H4v-4c0-.55.45-1 1-1h14c.55 0 1 .45 1 1v4h-2z"/>
    <circle cx="18" cy="11.5" r="1"/>
  </>
})

const FormatAlignLeft = createSvgIcon({
  viewBox: "0 -960 960 960",
  children: <path d="M120-120v-80h720v80H120Zm0-160v-80h480v80H120Zm0-160v-80h720v80H120Zm0-160v-80h480v80H120Zm0-160v-80h720v80H120Z"/>
})

const FormatListNumberedRtl = createSvgIcon({
  viewBox: "0 -960 960 960",
  children: <path d="M680-80v-60h100v-30h-60v-60h60v-30H680v-60h120q17 0 28.5 11.5T840-280v40q0 17-11.5 28.5T800-200q17 0 28.5 11.5T840-160v40q0 17-11.5 28.5T800-80H680Zm0-280v-110q0-17 11.5-28.5T720-510h60v-30H680v-60h120q17 0 28.5 11.5T840-560v70q0 17-11.5 28.5T800-450h-60v30h100v60H680Zm60-280v-180h-60v-60h120v240h-60ZM120-200v-80h480v80H120Zm0-240v-80h480v80H120Zm0-240v-80h480v80H120Z"/>
})

const DescriptionOutlined = createSvgIcon({
  viewBox: "0 -960 960 960",
  children: <path d="M320-240h320v-80H320v80Zm0-160h320v-80H320v80ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z"/>
})

const NotesOutlined = createSvgIcon({
  viewBox: "0 -960 960 960",
  children: <path d="M120-240v-80h480v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/>
})

//-----------------------------------------------------------------------------
// Actions
//-----------------------------------------------------------------------------


const RotateRight = createSvgIcon({
  viewBox: "0 -960 960 960",
  children: <path d="M522-80v-82q34-5 66.5-18t61.5-34l56 58q-42 32-88 51.5T522-80Zm-80 0Q304-98 213-199.5T122-438q0-75 28.5-140.5t77-114q48.5-48.5 114-77T482-798h6l-62-62 56-58 160 160-160 160-56-56 64-64h-8q-117 0-198.5 81.5T202-438q0 104 68 182.5T442-162v82Zm322-134-58-56q21-29 34-61.5t18-66.5h82q-5 50-24.5 96T764-214Zm76-264h-82q-5-34-18-66.5T706-606l58-56q32 39 51 86t25 98Z"/>
})

const RotateLeft = createSvgIcon({
  viewBox: "0 -960 960 960",
  children: <path d="M440-80q-50-5-96-24.5T256-156l56-58q29 21 61.5 34t66.5 18v82Zm80 0v-82q104-15 172-93.5T760-438q0-117-81.5-198.5T480-718h-8l64 64-56 56-160-160 160-160 56 58-62 62h6q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-438q0 137-91 238.5T520-80ZM198-214q-32-42-51.5-88T122-398h82q5 34 18 66.5t34 61.5l-58 56Zm-76-264q6-51 25-98t51-86l58 56q-21 29-34 61.5T204-478h-82Z"/>
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

const SortAscending  = createSvgIcon({children: <path d={svgElements.arrowDown + svgElements.stackAscend}/>})
const SortDescending = createSvgIcon({children: <path d={svgElements.arrowDown + svgElements.stackDescend}/>})

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
  Debug,

  Star: StarOutlined,
  Starred: Star,
  //Circle: Placeholder, //Circle,
  Help: HelpOutline,

  //ExpandMore: Placeholder, //ExpandMore,

  Arrow: {
    Up: ArrowUp,
    Down: ArrowDown,
    Left: ArrowLeft,
    Right: ArrowRight,
    Head: {
      Left: ArrowHeadLeft,
      Right: ArrowHeadRight,
      Up: ArrowHeadUp,
      Down: ArrowHeadDown,
    },
  },

  Chevron: {
    Up: ChevronUp,
    Down: ChevronDown,
    Left: ChevronLeft,
    Right: ChevronRight,
  },

  DropDown: ArrowHeadDown,

  Sort: {
    Ascending: SortAscending,
    Descending: SortDescending,
  },

  View: {
    Edit: MdiTextBoxEditOutline,
    Arc: DonutLarge,
    Stats: BarChartOutlined,
    Export: PrintOutlined,

    Index: FormatAlignLeft,
    List: FormatListNumberedRtl,
    Tags: AlternateEmailOutlined,
    Draft: DescriptionOutlined,
    Notes: NotesOutlined,
  },

  Paragraph: {
    Scene: FormatAlignJustifyOutlined,
    Bookmark: BookmarksOutlined,
    Comment: CommentOutlined,
    Missing: ReportOutlined,
    Tags: AlternateEmailOutlined,
  },

  Style: {
    Bold: FormatBold,
    Italic: FormatItalic,
  },

  //NewFile: NoteAddOutlined,
  //NewFolder: CreateNewFolderOutlined,
  //AddFiles: FolderOpenOutlined,

  Settings: Placeholder, //SettingsOutlined,

  Action: {
    Quit: Close,
    Close: Close,
    Search: Search,
    //Edit: Placeholder, //ArticleOutlined,
    //Cards: Placeholder, //GridViewOutlined,
    //Transfer: Placeholder, //SwapHorizontalCircleOutlined,
    //Print: Placeholder, //PrintOutlined,
    Folder: FolderOutlined,
    /*
    File: {
      New: Placeholder, //NoteAddOutlined,
      Open: Placeholder, //FileOpenOutlined,
      Save: Placeholder, //SaveOutlined,
      SaveAs: Placeholder, //SaveAsOutlined,
      Rename: Placeholder, //DriveFileRenameOutlineOutlined,
    },
    */
    //Replay: Placeholder, //Replay,
    //Cached: Placeholder, //Cached,
    //Loop: Placeholder, //Loop,
    Rotate: {
      CW: RotateRight,
      CCW: RotateLeft,
    },
    /*
    VerticalAlign: {
      Top: Placeholder, //VerticalAlignTop,
      Bottom: Placeholder, //VerticalAlignBottom,
    },
    */
    //HeadInfo: Placeholder, //DescriptionOutlined,
  },

  /*
  Location: {
    Home: Placeholder, //Home,
    Favorites: Placeholder, //Favorite,
  },
  */

  /*
  FileType: {
    Folder: FolderOutlined,
    File: Placeholder, //InsertDriveFileOutlined,
    Unknown: Placeholder, //BrokenImageOutlined,
    Selected: Placeholder, //CheckBox,
  },
  */

  //MoreHoriz: Placeholder, //MoreHoriz,
  //PaperClipHoriz: Placeholder, //Attachment,
  //PaperClipVert: Placeholder, //AttachFile,
}
