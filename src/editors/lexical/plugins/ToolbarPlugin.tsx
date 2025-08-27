import React, { useCallback, useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
} from 'lexical';
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
} from '@lexical/list';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { LinkPopup } from '../../common/LinkPopup';
import { toolbarStyle, buttonStyle, activeButtonStyle } from '../styles/componentStyles';

export const ToolbarPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [linkData, setLinkData] = useState({ text: '', url: '' });

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));

    }
  }, [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  const formatText = (
    format: 'bold' | 'italic' | 'underline' | 'strikethrough'
  ) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };


  const handleLinkClick = () => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const node = selection.anchor.getNode();
        const parent = node.getParent();
        
        // Check if we're in a link
        if ($isLinkNode(parent)) {
          setLinkData({
            text: parent.getTextContent(),
            url: parent.getURL()
          });
        } else if ($isLinkNode(node)) {
          setLinkData({
            text: node.getTextContent(),
            url: node.getURL()
          });
        } else {
          // Get selected text
          const text = selection.getTextContent();
          setLinkData({ text, url: '' });
        }
      }
    });
    setShowLinkPopup(true);
  };

  const handleSaveLink = (_text: string, url: string) => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
  };

  const handleRemoveLink = () => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
  };



  return (
    <div style={toolbarStyle}>
      <button
        style={isBold ? activeButtonStyle : buttonStyle}
        onClick={() => formatText('bold')}
        title='Bold'
      >
        <strong>B</strong>
      </button>

      <button
        style={isItalic ? activeButtonStyle : buttonStyle}
        onClick={() => formatText('italic')}
        title='Italic'
      >
        <em>I</em>
      </button>

      <button
        style={isUnderline ? activeButtonStyle : buttonStyle}
        onClick={() => formatText('underline')}
        title='Underline'
      >
        <u>U</u>
      </button>

      <button
        style={isStrikethrough ? activeButtonStyle : buttonStyle}
        onClick={() => formatText('strikethrough')}
        title='Strikethrough'
      >
        <s>S</s>
      </button>

      <div
        style={{
          width: '1px',
          height: '24px',
          backgroundColor: '#ccc',
          margin: '0 4px',
        }}
      />

      <button
        style={buttonStyle}
        onClick={() =>
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        }
        title='Bullet List'
      >
        •
      </button>

      <button
        style={buttonStyle}
        onClick={() =>
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        }
        title='Numbered List'
      >
        1.
      </button>


      <button
        style={buttonStyle}
        onClick={handleLinkClick}
        title='Insert Link'
      >
        🔗
      </button>
      
      <LinkPopup
        isOpen={showLinkPopup}
        onClose={() => setShowLinkPopup(false)}
        onSave={handleSaveLink}
        onRemove={handleRemoveLink}
        initialText={linkData.text}
        initialUrl={linkData.url}
      />

      <div
        style={{
          width: '1px',
          height: '24px',
          backgroundColor: '#ccc',
          margin: '0 4px',
        }}
      />

    </div>
  );
};
