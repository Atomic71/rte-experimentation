// Common types for all editors

export interface EditorContent {
  format: 'slate' | 'lexical' | 'draft' | 'quill' | 'html' | 'markdown'
  data: any
}

export interface EditorMessage {
  type: 'READY' | 'CHANGE' | 'SET_CONTENT' | 'COMMAND' | 'ERROR' | 'GET_CONTENT' | 'EXPORT_HTML' | 'IMPORT_HTML'
  payload?: any
  editor?: string
  timestamp?: number
}

export interface EditorCommand {
  action: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'heading' | 'list' | 'link' | 'undo' | 'redo'
  value?: any
}

export interface EditorConfig {
  editorType: 'slate' | 'lexical' | 'draft' | 'quill'
  features?: {
    bold?: boolean
    italic?: boolean
    underline?: boolean
    strikethrough?: boolean
    headings?: boolean
    lists?: boolean
    links?: boolean
    code?: boolean
    tables?: boolean
    images?: boolean
    mentions?: boolean
  }
  theme?: 'light' | 'dark'
  placeholder?: string
  readOnly?: boolean
}

export interface BaseEditor {
  initialize(): void
  getContent(): EditorContent
  setContent(content: EditorContent): void
  executeCommand(command: EditorCommand): void
  exportHTML(): string
  importHTML(html: string): void
  destroy(): void
}