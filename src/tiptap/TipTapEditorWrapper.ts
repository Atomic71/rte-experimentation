import { EditorContent, webViewBridge } from './webview-bridge';
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
      onClearContent: () => {
        this.clearContent();
      },
      onGetContent: () => {
        return this.getContent();
      },
      onExportHTML: () => {
        return this.exportHTML();
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

  exportHTML(): string {
    if (!this.editorRef) return '';
    return this.editorRef.exportHTML();
  }

  clearContent(): void {
    if (!this.editorRef) return;
    this.editorRef.clearContent();
  }

  destroy(): void {
    webViewBridge.destroy();
    this.isInitialized = false;
    this.editorRef = null;
  }

  notifyContentChange(_content: EditorContent): void {
    // webViewBridge.postMessage('CHANGE', content);
  }

  notifyReady(): void {
    webViewBridge.notifyReady();
  }
}

export const tiptapEditorWrapper = new TipTapEditorWrapper();
