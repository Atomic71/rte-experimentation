import { useRef, useEffect } from 'react';
import TipTapEditor from './TipTapEditor';
import type { TipTapEditorHandle } from './TipTapEditor';
import { tiptapEditorWrapper } from './TipTapEditorWrapper';
import type { EditorContent } from '../common/types';
import './styles/editor.css';

export default function TipTapRoute() {
  const editorRef = useRef<TipTapEditorHandle>(null);

  useEffect(() => {
    // Initialize the WebView bridge
    tiptapEditorWrapper.initialize();

    // Set editor reference when ready
    if (editorRef.current) {
      tiptapEditorWrapper.setEditorRef(editorRef.current);

      // Notify React Native that editor is ready
      setTimeout(() => {
        tiptapEditorWrapper.notifyReady();
      }, 100);
    }

    return () => {
      tiptapEditorWrapper.destroy();
    };
  }, []);

  const handleContentChange = (content: EditorContent) => {
    // Notify React Native about content changes
    tiptapEditorWrapper.notifyContentChange(content);
  };

  const handleReady = () => {
    if (editorRef.current) {
      tiptapEditorWrapper.setEditorRef(editorRef.current);
      tiptapEditorWrapper.notifyReady();
    }
  };

  return (
    <div style={{ height: '100vh' }}>
      <div style={{ flex: 1, height: '100%' }}>
        <TipTapEditor
          ref={editorRef}
          placeholder='Start typing... Use @ to mention users'
          onContentChange={handleContentChange}
          onReady={handleReady}
          initialContent='<p>Welcome to the <strong>TipTap</strong> editor! Try out the formatting options, mentions with @, and RTL/LTR text direction.</p>'
        />
      </div>
    </div>
  );
}
