import { TipTapEditor } from '@/components';
import { MentionProvider } from '@/components/MentionContext';
import React from 'react';
import { useWebViewBridge } from './hooks';

const App: React.FC = () => {
  const { handleContentChange, handleReady, editorRef } = useWebViewBridge();

  return (
    <MentionProvider>
      <div className='app-container'>
        <div className='app-content'>
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
