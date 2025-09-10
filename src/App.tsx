import { TipTapEditor } from '@/components';
import { MentionProvider } from '@/components/MentionContext';
import React from 'react';
import { useWebViewBridge } from './hooks';
import './index.css';
import '@fontsource/inter/400';
import '@fontsource/inter/600';
import '@fontsource/inter/400-italic.css';
import '@fontsource/inter/600-italic.css';

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
