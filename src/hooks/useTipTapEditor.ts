import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { Editor, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextDirection from 'tiptap-text-direction';
import { configureMention } from '@/utils/configureMention';
import { EditorContent as EditorContentType } from '@/utils/WebviewBridge/types';

import { useCallback, useEffect, useMemo } from 'react';
import { debounce } from 'lodash';
import { useMentionContext } from '../components/MentionContext';

type UseTipTapEditorProps = {
  initialContent?: string;
  placeholder?: string;
  onContentChange?: (content: EditorContentType) => void;
  onReady?: (editor: Editor) => void;
  readOnly?: boolean;
  onUpdate?: (content: EditorContentType) => void;
};

const useTipTapEditor = ({
  initialContent,
  placeholder,
  onReady,
  readOnly,
  // sync - listen for realtime content
  onContentChange,
  // async - listen for debounced content
  onUpdate,
}: UseTipTapEditorProps) => {
  const { queryMentions } = useMentionContext();

  const debouncedContentUpdate = useMemo(
    () =>
      debounce((htmlContent: string) => {
        if (onUpdate) {
          onUpdate({
            format: 'html',
            data: htmlContent,
          });
        }
      }, 3000),
    [onUpdate]
  );

  useEffect(() => {
    return () => {
      debouncedContentUpdate.cancel();
    };
  }, [debouncedContentUpdate]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start typing...',
      }),
      TextDirection.configure({
        types: ['heading', 'paragraph'],
        defaultDirection: null, // Auto-detect direction based on content
      }),
      configureMention(queryMentions),
    ],
    content: initialContent,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const htmlContent = editor.getHTML();

      // Call the debounced function with the latest content
      debouncedContentUpdate(htmlContent);

      if (onContentChange) {
        onContentChange({
          format: 'html',
          data: htmlContent,
        });
      }
    },
    onCreate: ({ editor }) => {
      if (onReady) {
        onReady(editor);
      }
    },
  });

  const getContent = useCallback((): EditorContentType => {
    if (!editor) {
      return { format: 'html', data: '' };
    }
    return {
      format: 'html',
      data: editor.getHTML(),
    };
  }, [editor]);

  const setContent = useCallback(
    (content: EditorContentType) => {
      if (!editor) return;

      if (content.format === 'html') {
        editor.commands.setContent(content.data);
      } else if (content.format === 'text') {
        editor.commands.setContent(`<p>${content.data}</p>`);
      } else {
        // For other formats, attempt to convert or use as-is
        editor.commands.setContent(content.data);
      }
    },
    [editor]
  );

  const clearContent = useCallback(() => {
    if (!editor) return;
    editor.commands.clearContent();
  }, [editor]);

  return { editor, getContent, setContent, clearContent };
};

export default useTipTapEditor;
