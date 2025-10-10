import { Editor, useEditorState } from '@tiptap/react';
import React, { useCallback, useState } from 'react';
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdLink,
  MdSend,
} from 'react-icons/md';
import { LinkPopup } from '../LinkPopup/LinkPopup';
import { ToolbarButton } from './ToolbarButton';
import { createPreventDefaultHandlers } from '../../utils/eventHelpers';
import { webViewBridge } from '@/utils/WebviewBridge';

interface ToolbarProps {
  editor: Editor;
}

export const Toolbar: React.FC<ToolbarProps> = ({ editor }) => {
  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [linkData, setLinkData] = useState({ text: '', url: '' });

  const { selection, href, isLink, isItalic, isBold, isUnderline, isEmpty } =
    useEditorState({
      editor,
      selector: (ctx) => ({
        isLink: ctx.editor.isActive('link'),
        href: ctx.editor.getAttributes('link').href,
        isItalic: ctx.editor.isActive('italic'),
        isBold: ctx.editor.isActive('bold'),
        isUnderline: ctx.editor.isActive('underline'),
        selection: ctx.editor.state.selection,
        isEmpty: ctx.editor.isEmpty,
      }),
    });
  const handleLinkClick = useCallback(() => {
    // if inside a link, we want to extend the selection to the entirety of the link
    // it's hacky is because it's based on this thread https://github.com/ueberdosis/tiptap/discussions/4716
    // docs don't exactly specify how to resolve situation of selecting inside a link
    // but this seems sensible... although the thread has no official solution yet
    if (href) {
      editor.chain().focus().extendMarkRange('link').run();
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to, ' ');
      setLinkData({
        text: selectedText,
        url: href,
      });
    } else {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        // nothing is selected
        const selectedText = editor.state.doc.textBetween(from, to, ' ');
        setLinkData({
          text: selectedText,
          url: 'https://',
        });
      } else {
        setLinkData({
          text: '',
          url: 'https://',
        });
      }
    }

    setShowLinkPopup(true);
  }, [selection, href, editor, setLinkData, setShowLinkPopup]);

  const handleSaveLink = useCallback(
    (url: string, text: string) => {
      console.log(url, text);

      if (url) {
        setLinkData({ url: '', text: '' });
        // If we have selected text, just add the link
        if (selection.from !== selection.to) {
          editor
            .chain()
            // leaving setLink for reference because it could also work
            // although docs are not so explicit on this matter
            // .setLink({ href: url })
            .insertContentAt(
              { from: selection.from, to: selection.to },
              `<a href="${url}">${text}</a> `
            )
            .focus()
            .run();
        } else {
          // Insert text with link
          editor
            .chain()
            .focus()
            .insertContent(`<a href="${url}">${text}</a> `)
            .run();
        }
      }
    },
    [selection, editor]
  );

  const handleSend = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const html = editor.getHTML();
    webViewBridge.send(html);
  };

  return (
    <div className='toolbar'>
      <div className='toolbar-left'>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={isBold}
          title='Bold (Cmd+B)'
        >
          <MdFormatBold size={24} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={isItalic}
          title='Italic (Cmd+I)'
        >
          <MdFormatItalic size={24} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={isUnderline}
          title='Underline (Cmd+U)'
        >
          <MdFormatUnderlined size={24} />
        </ToolbarButton>
        <ToolbarButton
          onClick={handleLinkClick}
          isActive={isLink}
          title='Link'
        >
          <MdLink size={24} />
        </ToolbarButton>

        <LinkPopup
          isOpen={showLinkPopup}
          onClose={() => {
            setShowLinkPopup(false);
            setLinkData({ text: '', url: '' });
            editor.chain().focus().run();
          }}
          onSubmit={handleSaveLink}
          initialUrl={linkData.url}
          initialText={linkData.text}
        />
      </div>

      <div className='toolbar-right'>
        <button
          className='toolbar-send-button'
          {...createPreventDefaultHandlers()}
          onClick={handleSend}
          disabled={isEmpty}
        >
          <MdSend size={28} />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
