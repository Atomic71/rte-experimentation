import { EditorContent, EditorCommand, webViewBridge } from './webview-bridge';
import type { TipTapEditorHandle } from './TipTapEditor';

export class TipTapEditorWrapper {
  private editorRef: TipTapEditorHandle | null = null;
  private isInitialized = false;

  constructor() {}

  initialize(): void {
    if (this.isInitialized) return;

    const existingCallbacks = { ...webViewBridge.callbacks };

    webViewBridge.initialize({
      ...existingCallbacks,
      onSetContent: (content: EditorContent) => {
        this.setContent(content);
      },
      onGetContent: () => {
        return this.getContent();
      },
      onExecuteCommand: (command: EditorCommand) => {
        this.executeCommand(command);
      },
      onExportHTML: () => {
        return this.exportHTML();
      },
      onImportHTML: (html: string) => {
        this.importHTML(html);
      },
    });

    this.isInitialized = true;
  }

  setEditorRef(ref: TipTapEditorHandle): void {
    this.editorRef = ref;
  }

  getContent(): EditorContent {
    if (!this.editorRef) {
      return { format: 'html', data: '' };
    }
    return this.editorRef.getContent();
  }

  setContent(content: EditorContent): void {
    if (!this.editorRef) return;
    this.editorRef.setContent(content);
  }

  executeCommand(command: EditorCommand): void {
    if (!this.editorRef) return;
    this.editorRef.executeCommand(command);
  }

  exportHTML(): string {
    if (!this.editorRef) return '';
    return this.editorRef.exportHTML();
  }

  importHTML(html: string): void {
    if (!this.editorRef) return;
    this.editorRef.importHTML(html);
  }

  destroy(): void {
    webViewBridge.destroy();
    this.isInitialized = false;
    this.editorRef = null;
  }

  notifyContentChange(content: EditorContent): void {
    // webViewBridge.postMessage('CHANGE', content);
  }

  notifyReady(): void {
    webViewBridge.notifyReady();
  }
}

export const tiptapEditorWrapper = new TipTapEditorWrapper();
