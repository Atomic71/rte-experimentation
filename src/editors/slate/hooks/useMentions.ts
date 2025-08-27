import { useState, useCallback } from 'react';
import { Editor } from 'slate';
import { searchUsers } from '../../../data/users';
import { detectMentionTrigger, insertMention, MentionState } from '../plugins/mentions';

export function useMentions(editor: Editor) {
  const [mentionState, setMentionState] = useState<MentionState | null>(null);
  const [mentionUsers, setMentionUsers] = useState(searchUsers(''));

  const handleMentionTrigger = useCallback(() => {
    const mention = detectMentionTrigger(editor);
    if (mention) {
      setMentionState(mention);
      setMentionUsers(searchUsers(mention.search).slice(0, 10));
    } else {
      setMentionState(null);
    }
  }, [editor]);

  const handleMentionSelect = useCallback((user: any) => {
    if (mentionState?.targetRange) {
      insertMention(editor, user, mentionState.targetRange);
      setMentionState(null);
    }
  }, [editor, mentionState]);

  const handleMentionKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!mentionState) return false;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setMentionState(prev => prev ? {
          ...prev,
          index: Math.min(prev.index + 1, mentionUsers.length - 1)
        } : null);
        return true;
      case 'ArrowUp':
        event.preventDefault();
        setMentionState(prev => prev ? {
          ...prev,
          index: Math.max(prev.index - 1, 0)
        } : null);
        return true;
      case 'Enter':
        if (mentionUsers.length > 0) {
          event.preventDefault();
          handleMentionSelect(mentionUsers[mentionState.index]);
        }
        return true;
      case 'Escape':
        event.preventDefault();
        setMentionState(null);
        return true;
      default:
        return false;
    }
  }, [mentionState, mentionUsers, handleMentionSelect]);

  return {
    mentionState,
    mentionUsers,
    handleMentionTrigger,
    handleMentionSelect,
    handleMentionKeyDown,
  };
}