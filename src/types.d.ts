// Type definitions for editor-playground

import { Descendant } from 'slate'

export interface EditorPlaygroundMessage {
  type: string
  payload?: any
  editor?: string
  timestamp?: number
}

export interface EditorPlaygroundContent {
  format: 'slate' | 'lexical' | 'html' | 'markdown' | 'text'
  data: any
}

export interface MentionData {
  id: string
  label: string
  value: string
  position?: {
    start: number
    end: number
  }
}

export interface SlateUtilities {
  toPlainText: (nodes: Descendant[]) => string
  extractMentions: (nodes: Descendant[]) => MentionData[]
  createMention: (id: string, label: string, value?: string) => any
  createParagraph: (text?: string) => any
}

export interface WebViewBridge {
  setEditorType: (type: string) => void
  on: (type: string, handler: (payload: any) => void) => void
  postMessage: (type: string, payload?: any) => void
  notifyReady: () => void
  notifyChange: (content: EditorPlaygroundContent) => void
  notifyError: (error: string) => void
  sendContent: (content: EditorPlaygroundContent) => void
  sendHTML: (html: string) => void
}

// Re-export from common types
export type { 
  EditorType,
  EditorContent,
  EditorMessage,
  EditorCommand,
  EditorConfig,
  BaseEditor
} from './editors/common/types'

// Re-export Slate types
export type { CustomElement, CustomText } from './editors/slate/types'

declare module 'editor-playground' {
  export const slateUtils: SlateUtilities
  export const webViewBridge: WebViewBridge
  export const MESSAGE_TYPES: Record<string, string>
  
  export function serialize(nodes: Descendant[]): string
  export function deserialize(html: string): Descendant[]
  
  export class SlateEditorWrapper {
    initialize(): void
    getContent(): EditorPlaygroundContent
    setContent(content: EditorPlaygroundContent): void
    executeCommand(command: any): void
    exportHTML(): string
    importHTML(html: string): void
    destroy(): void
  }
}