import type { LexicalEditor as LexicalEditorType } from 'lexical';
import {
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $getSelection,
  $isRangeSelection,
} from 'lexical';
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
} from '@lexical/list';
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode } from '@lexical/rich-text';
import { $toggleLink } from '@lexical/link';
import { BaseEditor, EditorContent, EditorCommand } from '../common/types';
import { webViewBridge, EditorCallbacks } from '../common/webview-bridge';
import {
  serializeToHtml,
  deserializeFromHtml,
  serializeToJSON,
  deserializeFromJSON,
} from './utils/serialization';

export class LexicalEditorWrapper implements BaseEditor {
  private editor: LexicalEditorType | null = null;

  setEditor(editor: LexicalEditorType) {
    this.editor = editor;
    this.setupWebViewBridge();
  }

  private setupWebViewBridge() {
    const callbacks: EditorCallbacks = {
      onSetContent: (content) => {
        this.setContent(content);
      },
      onGetContent: () => this.getContent(),
      onExecuteCommand: (command) => {
        this.executeCommand(command);
      },
      onExportHTML: () => this.exportHTML(),
      onImportHTML: (html) => {
        this.importHTML(html);
      },
      onError: (error) => {
        console.error('Lexical WebView Bridge Error:', error);
      }
    };

    webViewBridge.initialize('lexical', callbacks);
  }

  initialize(): void {
    // Initialization is handled in setupWebViewBridge
  }

  getContent(): EditorContent {
    if (!this.editor) {
      return {
        format: 'lexical',
        data: { text: '' },
      };
    }

    return {
      format: 'lexical',
      data: {
        html: serializeToHtml(this.editor),
        json: serializeToJSON(this.editor),
      },
    };
  }

  setContent(content: EditorContent): void {
    if (!this.editor) return;

    if (content.format === 'html' && content.data?.html) {
      deserializeFromHtml(this.editor, content.data.html);
    } else if (content.format === 'lexical' && content.data?.json) {
      deserializeFromJSON(this.editor, content.data.json);
    }
  }

  executeCommand(command: EditorCommand): void {
    if (!this.editor) return;

    const editor = this.editor;

    if (
      ['bold', 'italic', 'underline', 'strikethrough'].includes(command.action)
    ) {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, command.action as any);
      return;
    }

    if (['undo', 'redo'].includes(command.action)) {
      const cmd = command.action === 'undo' ? UNDO_COMMAND : REDO_COMMAND;
      editor.dispatchCommand(cmd, undefined);
      return;
    }

    if (command.action === 'list') {
      if (command.value === 'bullet') {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      } else if (command.value === 'numbered') {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
      }
      return;
    }

    editor.update(() => {
      const selection = $getSelection();

      if (!$isRangeSelection(selection)) return;

      switch (command.action) {
        case 'heading':
          if (command.value) {
            $setBlocksType(selection, () => $createHeadingNode(command.value));
          }
          break;
        case 'link':
          if (command.value) {
            $toggleLink(command.value);
          }
          break;
        default:
          console.log('Unknown command:', command);
      }
    });
  }

  exportHTML(): string {
    if (!this.editor) return '<p></p>';
    return serializeToHtml(this.editor);
  }

  importHTML(html: string): void {
    if (!this.editor) return;
    deserializeFromHtml(this.editor, html);
  }

  destroy(): void {
    webViewBridge.destroy();
    this.editor = null;
  }
}