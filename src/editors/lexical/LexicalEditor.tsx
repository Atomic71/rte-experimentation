import React from 'react';
import './styles.css';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { LexicalEditorWrapper } from './LexicalEditorWrapper';
import { EditorInitializer } from './components/EditorInitializer';
import { EditorContainer } from './components/EditorContainer';
import { editorConfig } from './config/editorConfig';
import { editorContainerStyle } from './styles/componentStyles';

export const LexicalEditor: React.FC = () => {
  const wrapper = React.useMemo(() => new LexicalEditorWrapper(), []);

  return (
    <div
      className='editor-container'
      style={editorContainerStyle}
    >
      <LexicalComposer initialConfig={editorConfig}>
        <EditorInitializer wrapper={wrapper} />
        <EditorContainer wrapper={wrapper} />
      </LexicalComposer>
    </div>
  );
};

// Re-export the wrapper for external use
export { LexicalEditorWrapper };