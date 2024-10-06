
//-----------------------------------------------------------------------------
// Icons
//-----------------------------------------------------------------------------

import {FormatItalic, ShowChart} from '@mui/icons-material';
import {LooksOne, LooksTwo} from '@mui/icons-material';
import {UnfoldMore} from '@mui/icons-material';
import {UnfoldLessDouble} from '@mui/icons-material';
import {AddBoxOutlined} from '@mui/icons-material';
import {ArrowUpward} from '@mui/icons-material';
import {ArrowDownward} from '@mui/icons-material';
import {IndeterminateCheckBoxOutlined} from '@mui/icons-material';
import {UnfoldMoreDouble} from '@mui/icons-material';
import {UnfoldLess} from '@mui/icons-material';
import {Expand} from '@mui/icons-material';
import {FormatBold} from '@mui/icons-material';
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
import {Collapse} from '@mui/material';

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

  View: {
    Index: FormatAlignLeft,
    List: FormatListNumberedRtl,
    Edit: ArticleOutlined,
    Organize: GridViewOutlined,
    Export: PrintOutlined,
    Chart: DonutLarge,
    Stats: ShowChart,
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

  BlockType: {
    Scene: FormatAlignJustifyOutlined,
    Synopsis: FormatAlignRightOutlined,
    Comment: Comment,
    Missing: Report,
    Filler: AddBox,
    Tags: AlternateEmail,
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
  },

  Style: {
    Bold: FormatBold,
    Italic: FormatItalic,

    Part: LooksOne,
    Scene: LooksTwo,

    Synopsis: FormatAlignRightOutlined,
    Comment: Comment,
    Missing: Report,
    Filler: AddBox,
    Tags: AlternateEmail,

    Folded: VisibilityOff,
    FoldAll: IndeterminateCheckBoxOutlined,
    UnfoldAll: AddBoxOutlined,
  },
}

