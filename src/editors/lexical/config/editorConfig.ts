import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { BeautifulMentionNode } from 'lexical-beautiful-mentions';
import { EditorTheme } from '../theme/EditorTheme';

export const URL_MATCHERS: any[] = [];

export const editorConfig = {
  namespace: 'LexicalRichTextEditor',
  theme: EditorTheme,
  onError: (error: Error) => console.error('Lexical error:', error),
  nodes: [ListNode, ListItemNode, LinkNode, AutoLinkNode, BeautifulMentionNode],
  editorState: undefined, // Remove initial state to avoid require issues
};