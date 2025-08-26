import { Descendant } from 'slate';
import { serialize, deserialize } from './utils/serialization';
import { webViewBridge } from '../common/webview-bridge';
import { BaseEditor, EditorContent, EditorCommand } from '../common/types';

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'Welcome to the Slate.js editor! Try using the toolbar or keyboard shortcuts to format your text.',
      },
    ],
  },
];

export class SlateEditorWrapper implements BaseEditor {
  private editorContent: Descendant[] = initialValue;
  private changeCallback?: (content: Descendant[]) => void;

  initialize(): void {
    webViewBridge.setEditorType('slate');
    webViewBridge.notifyReady();
  }

  getContent(): EditorContent {
    const html = serialize(this.editorContent);
    return {
      format: 'slate',
      data: {
        slate: this.editorContent,
        html: html,
      },
    };
  }

  setContent(content: EditorContent): void {
    if (content.format === 'slate') {
      // Handle both old format (direct array) and new format (object with slate property)
      this.editorContent = content.data.slate || content.data;
      this.changeCallback?.(this.editorContent);
    } else if (content.format === 'html') {
      const htmlString =
        typeof content.data === 'string' ? content.data : content.data.html;
      this.editorContent = deserialize(htmlString);
      this.changeCallback?.(this.editorContent);
    }
  }

  executeCommand(command: EditorCommand): void {
    // Commands will be handled by the React component
    console.log('Execute command:', command);
  }

  exportHTML(): string {
    return serialize(this.editorContent);
  }

  importHTML(html: string): void {
    this.editorContent = deserialize(html);
    this.changeCallback?.(this.editorContent);
  }

  destroy(): void {
    // Cleanup if needed
  }

  setChangeCallback(callback: (content: Descendant[]) => void) {
    this.changeCallback = callback;
  }
}
