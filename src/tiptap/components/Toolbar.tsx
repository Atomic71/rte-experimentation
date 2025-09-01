import { Editor } from '@tiptap/react';
import React, { useState } from 'react';
import { webViewBridge } from '../webview-bridge';
import { LinkPopup } from './LinkPopup';

interface ToolbarProps {
  editor: Editor;
}

const ToolbarButton: React.FC<{
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}> = ({ onClick, isActive, disabled, title, children }) => {
  // Prevent default click event in order to keep the keyboard open on mobile devices
  const preventDefault = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };
  return (
    <button
      onClick={onClick}
      onMouseDown={preventDefault}
      onPointerDown={preventDefault}
      className={`toolbar-button ${isActive ? 'active' : ''}`}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
};

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

  const handleSendMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent keyboard dismissal on mobile devices
    e.preventDefault();
  };

  const handleSendPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    // Prevent keyboard dismissal for pointer events (touch, stylus, mouse)
    e.preventDefault();
  };

  const handleSendTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    // Prevent keyboard dismissal for touch events
    e.preventDefault();
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
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title='Strikethrough'
        >
          <s>S</s>
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
          onMouseDown={handleSendMouseDown}
          onPointerDown={handleSendPointerDown}
          onTouchStart={handleSendTouchStart}
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
};
