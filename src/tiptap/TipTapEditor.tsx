import {
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useMemo,
} from 'react';
import { EditorContent, useEditor, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextDirection from 'tiptap-text-direction';
import { debounce } from 'lodash';
import { EditorContent as EditorContentType } from './webview-bridge';
import { Toolbar } from './components';
import { configureMention } from './extensions/configureMention';
import { useMentionContext } from '../components/MentionContext';
import './styles/editor.css';

export interface TipTapEditorHandle {
  getContent: () => EditorContentType;
  setContent: (content: EditorContentType) => void;
  clearContent: () => void;
  getEditor: () => Editor | null;
}

interface TipTapEditorProps {
  initialContent?: string;
  placeholder?: string;
  onContentChange?: (content: EditorContentType) => void;
  onReady?: (editor: Editor) => void;
  readOnly?: boolean;
}

const TipTapEditor = forwardRef<TipTapEditorHandle, TipTapEditorProps>(
  (
    { initialContent, placeholder, onContentChange, onReady, readOnly },
    ref
  ) => {
    const { queryMentions } = useMentionContext();
    
    const debouncedContentUpdate = useMemo(
      () =>
        debounce((htmlContent: string) => {
          console.log('Debounced editor content (3s delay):', htmlContent);
          // TODO: In the future, this will be sent to React Native side
          // to sync the latest version
        }, 3000),
      []
    );

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


    useImperativeHandle(
      ref,
      () => ({
        getContent,
        setContent,
        clearContent,
        getEditor: () => editor,
      }),
      [getContent, setContent, clearContent, editor]
    );

    useEffect(() => {
      return () => {
        debouncedContentUpdate.cancel();
        editor?.destroy();
      };
    }, [editor, debouncedContentUpdate]);

    if (!editor) {
      return null;
    }

    return (
      <div className='tiptap-editor-container'>
        <div className='tiptap-editor-content'>
          <EditorContent editor={editor} />
        </div>
        <Toolbar editor={editor} />
      </div>
    );
  }
);

TipTapEditor.displayName = 'TipTapEditor';

export default TipTapEditor;
