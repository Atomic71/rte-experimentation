// Common types for all editors

export type EditorType = 'slate' | 'lexical' | 'tiptap';

export interface EditorContent {
  format: 'slate' | 'lexical' | 'tiptap' | 'html' | 'markdown' | 'text';
  data: any;
}

// Re-export WebViewMessage from bridge for backward compatibility
export type { WebViewMessage as EditorMessage, EditorCallbacks } from './webview-bridge'

export interface EditorCommand {
  action:
    | 'bold'
    | 'italic'
    | 'underline'
    | 'strikethrough'
    | 'heading'
    | 'list'
    | 'link'
    | 'undo'
    | 'redo'
    | 'direction';
  value?: any;
}

export interface EditorConfig {
  editorType: 'slate' | 'lexical' | 'tiptap';
  features?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    headings?: boolean;
    lists?: boolean;
    links?: boolean;
    code?: boolean;
    tables?: boolean;
    images?: boolean;
    mentions?: boolean;
  };
  theme?: 'light' | 'dark';
  placeholder?: string;
  readOnly?: boolean;
}

export interface BaseEditor {
  initialize(): void;
  getContent(): EditorContent;
  setContent(content: EditorContent): void;
  executeCommand(command: EditorCommand): void;
  exportHTML(): string;
  importHTML(html: string): void;
  destroy(): void;
}

// Mentions types
export interface MentionUser {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

export interface MentionsConfig {
  enabled: boolean;
  allowedTriggers?: string[];  // ['@', '#'] for mentions and hashtags
  maxResults?: number;
  debounceMs?: number;
  allowSpaces?: boolean;  // Whether to allow spaces in queries
  minQueryLength?: number;  // Minimum chars before querying
}

export interface MentionQueryPayload {
  query: string;
  editorType: string;
  trigger?: string;  // '@' or '#' etc
}

export interface MentionResultsPayload {
  users: MentionUser[];
  query: string;
}

export interface MentionsConfigPayload {
  config: MentionsConfig;
}
