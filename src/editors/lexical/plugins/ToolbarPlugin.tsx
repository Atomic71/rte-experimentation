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
import { $toggleLink } from '@lexical/link';

export const ToolbarPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);

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


  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $toggleLink(url);
        }
      });
    }
  };

  const toolbarStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    padding: '12px',
    borderBottom: '1px solid #e5e5e5',
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    overflow: 'scroll',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '6px 12px',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: '14px',
    display: 'flex',
    width: '100%',
    wordBreak: 'keep-all',
  };

  const activeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#007bff',
    color: 'white',
    borderColor: '#007bff',
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
        onClick={insertLink}
        title='Insert Link'
      >
        🔗
      </button>

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
