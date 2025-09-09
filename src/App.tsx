import { MentionProvider } from '@/components/MentionContext';
import React, { useRef } from 'react';
import { useWebViewBridge } from './hooks';
import { TipTapEditor } from '@/components';
import { TipTapEditorHandle } from './components/TipTapEditor/types';

const App: React.FC = () => {
  const editorRef = useRef<TipTapEditorHandle>(null);
  const { handleContentChange, handleReady } = useWebViewBridge(editorRef);

  return (
    <MentionProvider>
      <div style={{ height: '100vh' }}>
        <div style={{ flex: 1, height: '100%' }}>
          <TipTapEditor
            ref={editorRef}
            placeholder='enter your message here'
            onContentChange={handleContentChange}
            onReady={handleReady}
          />
        </div>
      </div>
    </MentionProvider>
  );
};

export default App;
