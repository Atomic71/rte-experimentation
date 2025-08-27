import { Editor, Transforms, Range } from 'slate';

export interface MentionState {
  isActive: boolean;
  search: string;
  index: number;
  targetRange: Range | null;
}

export const withMentions = (editor: Editor) => {
  const { isInline, isVoid } = editor;

  editor.isInline = (element) => {
    return element.type === 'mention' ? true : isInline(element);
  };

  editor.isVoid = (element) => {
    return element.type === 'mention' ? true : isVoid(element);
  };

  return editor;
};

export const insertMention = (
  editor: Editor,
  character: { id: string; name: string; username: string },
  targetRange: Range
) => {
  const mention = {
    type: 'mention',
    userId: character.id,
    userName: character.name,
    username: character.username,
    children: [{ text: '' }],
  };

  Transforms.select(editor, targetRange);
  Transforms.insertNodes(editor, mention as any);
  Transforms.move(editor);
};

export const detectMentionTrigger = (editor: Editor): MentionState | null => {
  const { selection } = editor;

  if (selection && Range.isCollapsed(selection)) {
    const [start] = Range.edges(selection);
    const beforeText = Editor.string(editor, {
      anchor: { path: start.path, offset: 0 },
      focus: start,
    });

    // Find the last @ symbol
    const lastAtIndex = beforeText.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      // Check if there's a space before @ (or it's at the beginning)
      const charBeforeAt = lastAtIndex > 0 ? beforeText[lastAtIndex - 1] : ' ';
      if (charBeforeAt === ' ' || charBeforeAt === '\n' || lastAtIndex === 0) {
        const searchText = beforeText.slice(lastAtIndex + 1);
        
        // Only show mentions if search is less than 20 chars and no spaces
        if (searchText.length < 20 && !searchText.includes(' ')) {
          const targetRange = {
            anchor: { path: start.path, offset: lastAtIndex },
            focus: start,
          };

          return {
            isActive: true,
            search: searchText,
            index: 0,
            targetRange,
          };
        }
      }
    }
  }

  return null;
};