import { Toolbar } from '@/components';
import { EditorContent } from '@tiptap/react';
import { forwardRef, useImperativeHandle } from 'react';
import { useTipTapEditor } from '../../hooks';
import './TipTapEditor.css';
import '../Toolbar/Toolbar.css';
import '../Toolbar/ToolbarButton.css';
import { TipTapEditorHandle, TipTapEditorProps } from '../../tiptap/types';

const TipTapEditor = forwardRef<TipTapEditorHandle, TipTapEditorProps>(
  (
    {
      initialContent,
      placeholder,
      onContentChange,
      onReady,
      readOnly,
      onUpdate,
    },
    ref
  ) => {
    const { editor, getContent, setContent, clearContent } = useTipTapEditor({
      initialContent,
      placeholder,
      onContentChange,
      onReady,
      readOnly,
      onUpdate,
    });

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
