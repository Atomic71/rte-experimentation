import { useEffect } from 'react';

import { TipTapEditorHandle } from '../tiptap/types';
import { webViewBridge } from '@/utils/WebviewBridge';
import { EditorContent } from '@/utils/WebviewBridge/types';

const useWebViewBridge = (editorRef: React.RefObject<TipTapEditorHandle>) => {
  useEffect(() => {
    return () => {
      webViewBridge.destroy();
    };
  }, []);

  const handleContentChange = (content: EditorContent) => {
    // Notify React Native about content changes
    webViewBridge.notifyContentChange(content);
  };

  const handleReady = () => {
    if (editorRef.current) {
      // Initialize the WebView bridge AFTER editor is ready
      webViewBridge.initialize({
        onSetContent: (content: EditorContent) => {
          editorRef.current?.setContent(content);
        },
        onClearContent: () => {
          editorRef.current?.clearContent();
        },
        onGetContent: () => {
          return (
            editorRef.current?.getContent() || { format: 'html', data: '' }
          );
        },
      });

      // Notify React Native that editor is ready
      setTimeout(() => {
        webViewBridge.notifyReady();
      }, 100);
    }
  };

  return { handleContentChange, handleReady };
};

export default useWebViewBridge;
