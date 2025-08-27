import React, { useCallback } from 'react';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { AutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { BeautifulMentionsPlugin } from 'lexical-beautiful-mentions';
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

  const handleMentionSearch = useCallback(
    async (_trigger: string, query?: string | null) => {
      const { searchUsers } = await import('../../../data/users');
      const users = searchUsers(query || '').slice(0, 10);
      return users.map((user) => ({
        value: user.username.replace('@', ''), // Remove @ since Beautiful Mentions adds it
        id: user.id,
        avatar: user.name,
      }));
    },
    []
  );


  return (
    <>
      <ToolbarPlugin />
      <div style={editor.wrapper}>
        <RichTextPlugin
          contentEditable={<ContentEditable style={editor.content} />}
          placeholder={
            <div style={editor.placeholder}>Enter some rich text...</div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
      </div>
      <HistoryPlugin />
      <OnChangePlugin onChange={handleChange} />
      <ListPlugin />
      <LinkPlugin />
      <AutoLinkPlugin matchers={URL_MATCHERS} />
      <BeautifulMentionsPlugin
        triggers={['@']}
        onSearch={handleMentionSearch}
        menuItemLimit={10}
      />
    </>
  );
};