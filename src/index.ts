// Main exports for editor-playground package

// Types
export type {
  EditorContent,
  MentionUser,
  MentionsConfig,
  WebViewMessage,
  EditorCallbacks,
} from './tiptap/webview-bridge';

// WebView Bridge
export { webViewBridge } from './tiptap/webview-bridge';

// TipTap Editor Components
export { default as TipTapEditor } from './tiptap/TipTapEditor';
export type { TipTapEditorHandle } from './tiptap/TipTapEditor';
export { tiptapEditorWrapper } from './tiptap/TipTapEditorWrapper';