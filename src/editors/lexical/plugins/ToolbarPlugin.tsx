import React, { useCallback, useEffect, useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
} from 'lexical'
import { $setBlocksType } from '@lexical/selection'
import { $createHeadingNode, HeadingTagType } from '@lexical/rich-text'
import { $createParagraphNode } from 'lexical'
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND,
} from '@lexical/list'
import { $toggleLink } from '@lexical/link'
import { DirectionPlugin } from './DirectionPlugin'

export const ToolbarPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext()
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)
  const [blockType, setBlockType] = useState('paragraph')

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'))
      setIsItalic(selection.hasFormat('italic'))
      setIsUnderline(selection.hasFormat('underline'))
      setIsStrikethrough(selection.hasFormat('strikethrough'))
      
      const anchorNode = selection.anchor.getNode()
      const element = anchorNode.getKey() === 'root' 
        ? anchorNode 
        : anchorNode.getTopLevelElementOrThrow()
      
      const elementKey = element.getKey()
      const elementDOM = editor.getElementByKey(elementKey)
      
      if (elementDOM !== null) {
        if (elementDOM.tagName === 'H1') setBlockType('h1')
        else if (elementDOM.tagName === 'H2') setBlockType('h2')
        else if (elementDOM.tagName === 'H3') setBlockType('h3')
        else if (elementDOM.tagName === 'H4') setBlockType('h4')
        else if (elementDOM.tagName === 'H5') setBlockType('h5')
        else if (elementDOM.tagName === 'H6') setBlockType('h6')
        else if (elementDOM.tagName === 'UL') setBlockType('ul')
        else if (elementDOM.tagName === 'OL') setBlockType('ol')
        else setBlockType('paragraph')
      }
    }
  }, [editor])

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar()
      })
    })
  }, [editor, updateToolbar])

  const formatText = (format: 'bold' | 'italic' | 'underline' | 'strikethrough') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)
  }

  const formatHeading = (headingSize: HeadingTagType) => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(headingSize))
      }
    })
  }

  const insertLink = () => {
    const url = prompt('Enter URL:')
    if (url) {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $toggleLink(url)
        }
      })
    }
  }

  const toolbarStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    padding: '12px',
    borderBottom: '1px solid #e5e5e5',
    backgroundColor: '#f8f9fa',
    flexWrap: 'wrap',
    alignItems: 'center',
  }

  const buttonStyle: React.CSSProperties = {
    padding: '6px 12px',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: '14px',
  }

  const activeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#007bff',
    color: 'white',
    borderColor: '#007bff',
  }

  const selectStyle: React.CSSProperties = {
    padding: '6px 12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
  }

  return (
    <div style={toolbarStyle}>
      <button
        style={isBold ? activeButtonStyle : buttonStyle}
        onClick={() => formatText('bold')}
        title="Bold"
      >
        <strong>B</strong>
      </button>
      
      <button
        style={isItalic ? activeButtonStyle : buttonStyle}
        onClick={() => formatText('italic')}
        title="Italic"
      >
        <em>I</em>
      </button>
      
      <button
        style={isUnderline ? activeButtonStyle : buttonStyle}
        onClick={() => formatText('underline')}
        title="Underline"
      >
        <u>U</u>
      </button>
      
      <button
        style={isStrikethrough ? activeButtonStyle : buttonStyle}
        onClick={() => formatText('strikethrough')}
        title="Strikethrough"
      >
        <s>S</s>
      </button>

      <div style={{ width: '1px', height: '24px', backgroundColor: '#ccc', margin: '0 4px' }} />

      <select
        style={selectStyle}
        value={blockType}
        onChange={(e) => {
          const value = e.target.value
          if (value === 'paragraph') {
            editor.update(() => {
              const selection = $getSelection()
              if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createParagraphNode())
              }
            })
          } else if (value.startsWith('h')) {
            formatHeading(value as HeadingTagType)
          }
        }}
      >
        <option value="paragraph">Normal</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
        <option value="h4">Heading 4</option>
        <option value="h5">Heading 5</option>
        <option value="h6">Heading 6</option>
      </select>

      <div style={{ width: '1px', height: '24px', backgroundColor: '#ccc', margin: '0 4px' }} />

      <button
        style={buttonStyle}
        onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
        title="Bullet List"
      >
        • List
      </button>
      
      <button
        style={buttonStyle}
        onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
        title="Numbered List"
      >
        1. List
      </button>
      
      <button
        style={buttonStyle}
        onClick={() => editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)}
        title="Checklist"
      >
        ☐ Check
      </button>

      <div style={{ width: '1px', height: '24px', backgroundColor: '#ccc', margin: '0 4px' }} />

      <button
        style={buttonStyle}
        onClick={() => {
          // Code block functionality will be implemented later
          console.log('Code block clicked')
        }}
        title="Code Block"
      >
        &lt;/&gt;
      </button>
      
      <button
        style={buttonStyle}
        onClick={insertLink}
        title="Insert Link"
      >
        Link
      </button>

      <div style={{ width: '1px', height: '24px', backgroundColor: '#ccc', margin: '0 4px' }} />

      <button
        style={buttonStyle}
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        title="Undo"
      >
        ↶
      </button>
      
      <button
        style={buttonStyle}
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        title="Redo"
      >
        ↷
      </button>

      <div style={{ width: '1px', height: '24px', backgroundColor: '#ccc', margin: '0 4px' }} />

      <DirectionPlugin />
    </div>
  )
}