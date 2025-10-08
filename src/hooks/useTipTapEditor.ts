import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Editor, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextDirection from 'tiptap-text-direction';
import { configureMention } from '@/utils/configureMention';
import { EditorContent as EditorContentType } from '@/utils/WebviewBridge/types';

import { useCallback, useEffect, useMemo, useRef } from 'react';
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
  const { queryMentions, mentionsConfig } = useMentionContext();
  const persistedContentRef = useRef<string | null>(null);
  const previousMentionsEnabledRef = useRef(mentionsConfig.enabled);

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

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          link: {
            openOnClick: false,
            autolink: true,
            enableClickSelection: true,

            defaultProtocol: 'https',
            protocols: ['http', 'https'],
            HTMLAttributes: {
              class: 'text-blue-500 underline',
            },
            isAllowedUri: (url, ctx) => {
              try {
                // Construct URL with default protocol if needed
                const parsedUrl = url.includes(':')
                  ? new URL(url)
                  : new URL(`${ctx.defaultProtocol}://${url}`);

                // Use TipTap's default validation
                if (!ctx.defaultValidate(parsedUrl.href)) {
                  return false;
                }

                // Only allow protocols specified in ctx.protocols
                const allowedProtocols = ctx.protocols.map((p) =>
                  typeof p === 'string' ? p : p.scheme
                );
                const protocol = parsedUrl.protocol.replace(':', '');

                if (!allowedProtocols.includes(protocol)) {
                  return false;
                }

                // All checks passed
                return true;
              } catch {
                return false;
              }
            },
          },
        }),
        Placeholder.configure({
          placeholder: placeholder || 'Start typing...',
        }),
        TextDirection.configure({
          types: ['heading', 'paragraph'],
          defaultDirection: null, // Auto-detect direction based on content
        }),
        ...(mentionsConfig.enabled
          ? [configureMention(queryMentions, () => mentionsConfig.enabled)]
          : []),
      ],
      content: persistedContentRef.current || initialContent,
      editable: !readOnly,
      editorProps: {
        handleClick: (view, pos, event) => {
          // Prevent link clicks from opening
          if (event.target instanceof HTMLAnchorElement) {
            event.preventDefault();
            return true;
          }
          return false;
        },
      },
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
        // Restore content if we have persisted content from config change
        if (persistedContentRef.current) {
          editor.commands.setContent(persistedContentRef.current);
          persistedContentRef.current = null; // Clear after restoring
        }

        if (onReady) {
          onReady(editor);
        }
      },
    },
    [mentionsConfig.enabled]
  );

  console.log({ a: editor.$doc.querySelectorAll('a') });
  // Save content before mentions config changes
  useEffect(() => {
    if (
      previousMentionsEnabledRef.current !== mentionsConfig.enabled &&
      editor
    ) {
      persistedContentRef.current = editor.getHTML();
    }
    previousMentionsEnabledRef.current = mentionsConfig.enabled;
  }, [mentionsConfig.enabled, editor]);

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

  const focusEditor = useCallback(() => {
    if (!editor) return;
    editor.commands.focus();
  }, [editor]);

  return { editor, getContent, setContent, clearContent, focusEditor };
};

export default useTipTapEditor;
