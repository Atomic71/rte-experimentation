import React, { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalEditorWrapper } from '../LexicalEditorWrapper';

interface EditorInitializerProps {
  wrapper: LexicalEditorWrapper;
}

export const EditorInitializer: React.FC<EditorInitializerProps> = ({
  wrapper,
}) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    wrapper.setEditor(editor);
    wrapper.initialize();
  }, [editor, wrapper]);

  return null;
};