export type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'gray';

export interface Workspace {
  id: string;
  name: string;
}

export interface Notebook {
  id: string;
  workspaceId: string;
  name: string;
  icon?: string;
  color?: string;
  parent?: string;
  cover?: number | string;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface VersionSnapshot {
  timestamp: number;
  content: string;
  title: string;
}

export interface Card {
  id: string;
  notebookId: string;
  title: string;
  body: string; // HTML rich content
  tags: string[]; // Tag names
  colorLabel?: string | null;
  isLocked?: boolean;
  reminderDate?: number | null; // Timestamp
  versions?: VersionSnapshot[]; // Array of snapshots
  linkedIds?: string[]; // IDs of other cards this links to
  createdAt: number;
  updatedAt: number;
  isTrashed: boolean;
  pinned?: boolean;
  nb?: string;
  color?: string;
  cre?: number;
  upd?: number;
  trash?: number | boolean;
  pin?: number | boolean;
  locked?: number | boolean;
  requirePin?: number | boolean;
  hist?: any[];
  blocks?: Block[];
}

export type BlockType =
  | 'text'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'page'
  | 'page-in'
  | 'bullet'
  | 'number'
  | 'todo'
  | 'toggle'
  | 'code'
  | 'quote'
  | 'callout'
  | 'equation'
  | 'synced'
  | 'toggle-h1'
  | 'toggle-h2'
  | 'toggle-h3'
  | 'toggle-h4'
  | 'cols-2'
  | 'cols-3'
  | 'cols-4'
  | 'cols-5';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  formatting?: Record<string, any>;
  children?: Block[];
  checked?: boolean;
  collapsed?: boolean;
  textColor?: string;
  backgroundColor?: string;
  language?: string;
  syncedSourceId?: string;
  icon?: string;
}

export interface BlockCommand {
  id: BlockType;
  title: string;
  subtitle?: string;
  category: 'text' | 'pages' | 'lists' | 'advanced' | 'toggle-headings' | 'columns';
  icon: string;
  shortcut?: string;
}

export type Note = Card;

export interface Reminder {
  id: string;
  cardId?: string;
  note?: string;
  noteTitle?: string;
  text?: string;
  time?: number;
  at?: number;
  done: boolean;
  shown?: number;
}

export interface ToastMessage {
  id: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface ContextMenuPosition {
  x: number;
  y: number;
  card: Card;
}

export interface PiPWindowData {
  id: string;
  title: string;
  body: string;
  isLocked: boolean;
  colorLabel?: string | null;
}

export type ActiveView = string;

export interface AppPreferences {
  accent?: string;
  font?: string;
  size?: number;
  width?: string;
  lh?: number;
  theme?: string;
}

export type SyncTarget = 'none' | 'joplin' | 'telegram' | 'webdav' | 'onedrive' | 'gdrive' | 'dropbox' | 's3' | 'folder' | 'local' | 'mega' | 'jio' | 'icloud';

export interface AppState {
  workspaces?: Workspace[];
  notebooks?: Notebook[];
  cards?: Card[];
  notes?: Card[];
  tags?: Tag[];
  activeWorkspaceId?: string;
  activeView?: ActiveView;
  selectedCardId?: string | null;
  selectedNoteId?: string | null;
  searchFilter?: string;
  tagFilter?: string | null;
  isSyncing?: boolean;
  reminders?: Reminder[];
  preferences?: AppPreferences;
  syncTarget?: SyncTarget;
  pinLock?: string | null;
  [key: string]: any;
}
