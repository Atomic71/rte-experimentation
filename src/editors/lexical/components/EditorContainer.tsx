import React, { useCallback } from 'react';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { AutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { MentionsPlugin } from '../plugins/MentionsPlugin';
import { ToolbarPlugin } from '../plugins/ToolbarPlugin';
import { LexicalEditorWrapper } from '../LexicalEditorWrapper';
import { URL_MATCHERS } from '../config/editorConfig';
import { editor } from '../../../design-system';

interface EditorContainerProps {
  wrapper: LexicalEditorWrapper;
}

export const EditorContainer: React.FC<EditorContainerProps> = ({ wrapper }) => {
  const handleChange = useCallback(() => {
    // The simplified bridge handles notifications internally
    // No need to explicitly notify changes here
  }, [wrapper]);



  return (
    <>
      <div style={editor.wrapper}>
        <RichTextPlugin
          contentEditable={<ContentEditable style={editor.content} />}
          placeholder={
            <div style={editor.placeholder}>Enter some rich text...</div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
      </div>
      <ToolbarPlugin />
      <HistoryPlugin />
      <OnChangePlugin onChange={handleChange} />
      <ListPlugin />
      <LinkPlugin />
      <AutoLinkPlugin matchers={URL_MATCHERS} />
      <MentionsPlugin />
    </>
  );
};