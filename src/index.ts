// Main exports for editor-playground package

// Types
export type {
  EditorMessage,
  EditorContent,
  EditorCommand,
  BaseEditor,
  EditorType,
} from './editors/common/types';

// WebView Bridge
export { webViewBridge } from './editors/common/webview-bridge';

// Slate utilities
export { serialize, deserialize } from './editors/slate/utils/serialization';
// Slate types
export type { CustomElement, CustomText } from './editors/slate/types';

// Mention utilities for Slate
export const slateUtils = {
  /**
   * Convert Slate nodes to plain text
   */
  toPlainText: (nodes: any[]): string => {
    let result = '';

    const extractText = (node: any): string => {
      if (node.text !== undefined) {
        return node.text;
      }

      if (node.type === 'mention') {
        return node.label || node.value || '';
      }

      if (node.children) {
        return node.children.map(extractText).join('');
      }

      return '';
    };

    nodes.forEach((node, index) => {
      result += extractText(node);
      if (node.type && node.type !== 'mention' && index < nodes.length - 1) {
        result += '\n';
      }
    });

    return result.trim();
  },

  /**
   * Extract mentions from Slate document
   */
  extractMentions: (
    nodes: any[]
  ): Array<{
    id: string;
    label: string;
    value: string;
    position: { start: number; end: number };
  }> => {
    const mentions: Array<{
      id: string;
      label: string;
      value: string;
      position: { start: number; end: number };
    }> = [];

    const findMentions = (node: any, offset: number = 0): number => {
      let currentOffset = offset;

      if (node.type === 'mention') {
        mentions.push({
          id: node.id,
          label: node.label,
          value: node.value || node.label,
          position: {
            start: currentOffset,
            end: currentOffset + node.label.length,
          },
        });
        return currentOffset + node.label.length;
      }

      if (node.children) {
        node.children.forEach((child: any) => {
          currentOffset = findMentions(child, currentOffset);
        });
      } else if (node.text) {
        currentOffset += node.text.length;
      }

      return currentOffset;
    };

    nodes.forEach((node) => {
      findMentions(node, 0);
    });

    return mentions;
  },

  /**
   * Create a mention element for Slate
   */
  createMention: (id: string, label: string, value?: string): any => {
    return {
      type: 'mention',
      id,
      label,
      value: value || label,
      children: [{ text: '' }],
    };
  },

  /**
   * Create a paragraph element
   */
  createParagraph: (text: string = ''): any => {
    return {
      type: 'paragraph',
      children: [{ text }],
    };
  },
};

// Constants for message types
export const MESSAGE_TYPES = {
  // From React Native to WebView
  SET_CONTENT: 'SET_CONTENT',
  GET_CONTENT: 'GET_CONTENT',
  IMPORT_HTML: 'IMPORT_HTML',
  EXPORT_HTML: 'EXPORT_HTML',
  COMMAND: 'COMMAND',
  UPDATE_MENTIONS: 'UPDATE_MENTIONS',

  // From WebView to React Native
  READY: 'READY',
  CHANGE: 'CHANGE',
  ERROR: 'ERROR',
  MENTION_ADD: 'MENTION_ADD',
  MENTION_REMOVE: 'MENTION_REMOVE',
} as const;

// Re-export React components for web usage
export { SlateEditor } from './editors/slate/SlateEditor';
export { LexicalEditor } from './editors/lexical';
export { default as EditorRouter } from './App';
