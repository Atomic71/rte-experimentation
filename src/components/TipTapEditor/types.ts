import { Editor } from '@tiptap/react';
import { EditorContent as EditorContentType } from '@/utils/WebviewBridge/types';

export interface TipTapEditorHandle {
  getContent: () => EditorContentType;
  setContent: (content: EditorContentType) => void;
  clearContent: () => void;
  focusEditor: () => void;
  getEditor: () => Editor | null;
}

export interface TipTapEditorProps {
  initialContent?: string;
  placeholder?: string;
  onContentChange?: (content: EditorContentType) => void;
  onReady?: (editor: Editor) => void;
  readOnly?: boolean;
  onUpdate?: (content: EditorContentType) => void;
}
