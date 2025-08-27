import { BaseEditor, EditorContent, EditorCommand } from '../common/types'
import { webViewBridge } from '../common/webview-bridge'
import type { TipTapEditorHandle } from './TipTapEditor'

export class TipTapEditorWrapper implements BaseEditor {
  private editorRef: TipTapEditorHandle | null = null
  private isInitialized = false

  constructor(_container?: HTMLElement) {
    // Container parameter kept for compatibility but not used
  }

  initialize(): void {
    if (this.isInitialized) return
    
    // Initialize the bridge with callbacks
    webViewBridge.initialize('tiptap', {
      onSetContent: (content: EditorContent) => {
        this.setContent(content)
      },
      onGetContent: () => {
        return this.getContent()
      },
      onExecuteCommand: (command: EditorCommand) => {
        this.executeCommand(command)
      },
      onExportHTML: () => {
        return this.exportHTML()
      },
      onImportHTML: (html: string) => {
        this.importHTML(html)
      },
    })

    this.isInitialized = true
  }

  setEditorRef(ref: TipTapEditorHandle): void {
    this.editorRef = ref
  }

  getContent(): EditorContent {
    if (!this.editorRef) {
      return { format: 'html', data: '' }
    }
    return this.editorRef.getContent()
  }

  setContent(content: EditorContent): void {
    if (!this.editorRef) return
    this.editorRef.setContent(content)
  }

  executeCommand(command: EditorCommand): void {
    if (!this.editorRef) return
    this.editorRef.executeCommand(command)
  }

  exportHTML(): string {
    if (!this.editorRef) return ''
    return this.editorRef.exportHTML()
  }

  importHTML(html: string): void {
    if (!this.editorRef) return
    this.editorRef.importHTML(html)
  }

  destroy(): void {
    webViewBridge.destroy()
    this.isInitialized = false
    this.editorRef = null
  }

  // Notify React Native about content changes
  notifyContentChange(content: EditorContent): void {
    webViewBridge.postMessage('CHANGE', content)
  }

  // Notify React Native that editor is ready
  notifyReady(): void {
    webViewBridge.postMessage('READY', { 
      editorType: 'tiptap',
      features: {
        bold: true,
        italic: true,
        underline: true,
        strikethrough: true,
        headings: true,
        lists: true,
        links: true,
        mentions: true,
        rtl: true,
      }
    })
  }
}

// Create a singleton instance for use across the app
export const tiptapEditorWrapper = new TipTapEditorWrapper()