import React, { useEffect, useRef } from 'react';
import { BaseEditor, EditorContent, EditorCommand } from '../common/types';
import { webViewBridge } from '../common/webview-bridge';
import QuillEditor from './components/QuillEditor';
import { QuillInstance } from './types';
import { QuillSerialization } from './utils/serialization';

class QuillEditorAdapter implements BaseEditor {
  private quill: QuillInstance | null = null;
  private serialization: QuillSerialization | null = null;

  initialize(): void {
    webViewBridge.setEditorType('quill');
    webViewBridge.notifyReady();
  }

  setQuillInstance(quill: QuillInstance): void {
    this.quill = quill;
    this.serialization = new QuillSerialization(quill);

    // Set up change listener
    quill.on('text-change', (_delta, _oldDelta, source) => {
      if (source === 'user') {
        const content = this.getContent();
        webViewBridge.notifyChange(content);
      }
    });
  }

  getContent(): EditorContent {
    if (!this.serialization) {
      return { format: 'quill', data: null };
    }
    return this.serialization.getContent();
  }

  setContent(content: EditorContent): void {
    if (this.serialization) {
      this.serialization.setContent(content);
    }
  }

  executeCommand(command: EditorCommand): void {
    if (!this.quill) return;

    const { action, value } = command;

    switch (action) {
      case 'bold':
        this.quill.format('bold', !this.quill.getFormat().bold);
        break;
      case 'italic':
        this.quill.format('italic', !this.quill.getFormat().italic);
        break;
      case 'underline':
        this.quill.format('underline', !this.quill.getFormat().underline);
        break;
      case 'strikethrough':
        this.quill.format('strike', !this.quill.getFormat().strike);
        break;
      case 'heading':
        const level = typeof value === 'number' ? value : parseInt(value as string) || 1;
        this.quill.format('header', level);
        break;
      case 'list':
        const listType = value === 'ordered' ? 'ordered' : 'bullet';
        const currentFormat = this.quill.getFormat();
        this.quill.format('list', currentFormat.list === listType ? false : listType);
        break;
      case 'link':
        if (value) {
          this.quill.format('link', value);
        } else {
          this.quill.format('link', false);
        }
        break;
      case 'undo':
        this.quill.history.undo();
        break;
      case 'redo':
        this.quill.history.redo();
        break;
      default:
        console.warn(`Unknown command: ${action}`);
    }
  }

  exportHTML(): string {
    if (!this.serialization) return '';
    return this.serialization.exportHTML();
  }

  importHTML(html: string): void {
    if (this.serialization) {
      this.serialization.importHTML(html);
    }
  }

  destroy(): void {
    if (this.quill) {
      // Quill doesn't have a direct destroy method, but we can clear listeners
      this.quill.off('text-change');
    }
    this.quill = null;
    this.serialization = null;
  }
}

export const QuillEditorWrapper: React.FC = () => {
  const adapterRef = useRef<QuillEditorAdapter>(new QuillEditorAdapter());

  useEffect(() => {
    const adapter = adapterRef.current;
    adapter.initialize();

    // Set up WebView message handlers
    webViewBridge.on('SET_CONTENT', (payload: EditorContent) => {
      adapter.setContent(payload);
    });

    webViewBridge.on('COMMAND', (payload: EditorCommand) => {
      adapter.executeCommand(payload);
    });

    webViewBridge.on('GET_CONTENT', () => {
      const content = adapter.getContent();
      webViewBridge.sendContent(content);
    });

    webViewBridge.on('EXPORT_HTML', () => {
      const html = adapter.exportHTML();
      webViewBridge.sendHTML(html);
    });

    webViewBridge.on('IMPORT_HTML', (payload: { html: string }) => {
      adapter.importHTML(payload.html);
    });

    return () => {
      adapter.destroy();
    };
  }, []);

  const handleQuillReady = (quill: QuillInstance) => {
    adapterRef.current.setQuillInstance(quill);
  };

  const handleChange = (_content: string, _delta: any, _source: string) => {
    // Changes are handled automatically by the adapter's text-change listener
  };

  return (
    <div style={{ height: '100vh', backgroundColor: '#1a1a1a' }}>
      <QuillEditor
        onReady={handleQuillReady}
        onChange={handleChange}
        placeholder="Start writing with Quill.js..."
      />
    </div>
  );
};

export default QuillEditorWrapper;