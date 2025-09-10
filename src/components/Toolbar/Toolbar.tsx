import { Editor } from '@tiptap/react';
import React, { useState } from 'react';
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

  const handleLinkClick = () => {
    const { href } = editor.getAttributes('link');
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      ' '
    );

    if (href) {
      // Editing existing link
      setLinkData({
        text: selectedText || href,
        url: href,
      });
    } else {
      // Creating new link
      setLinkData({
        text: selectedText,
        url: '',
      });
    }

    setShowLinkPopup(true);
  };

  const handleSaveLink = (url: string, text: string) => {
    if (url) {
      // If we have selected text, just add the link
      if (editor.state.selection.from !== editor.state.selection.to) {
        editor.chain().focus().setLink({ href: url }).run();
      } else {
        // Insert text with link
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${url}">${text}</a>`)
          .run();
      }
    }
  };

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
          isActive={editor.isActive('bold')}
          title='Bold (Cmd+B)'
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title='Italic (Cmd+I)'
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title='Underline (Cmd+U)'
        >
          <u>U</u>
        </ToolbarButton>
        <ToolbarButton
          onClick={handleLinkClick}
          isActive={editor.isActive('link')}
          title='Link'
        >
          🔗
        </ToolbarButton>

        <LinkPopup
          isOpen={showLinkPopup}
          onClose={() => setShowLinkPopup(false)}
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
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
