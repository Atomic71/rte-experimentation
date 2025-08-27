import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { createEditor, Descendant } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import { withHistory } from 'slate-history'
import { webViewBridge, EditorCallbacks } from '../../common/webview-bridge'
import { withFormatting } from '../plugins/formatting'
import { withBlocks } from '../plugins/blocks'
import { Toolbar } from './Toolbar'
import { renderElement } from './ElementRenderer'
import { renderLeaf } from './LeafRenderer'
import { handleKeyDown } from '../utils/keyboard-shortcuts'
import { serialize, deserialize } from '../utils/serialization'

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'Welcome to the rich text editor! Try using the toolbar or keyboard shortcuts to format your text.',
      },
    ],
  },
]

export const EditorRoot: React.FC = () => {
  const editor = useMemo(
    () => withBlocks(withFormatting(withHistory(withReact(createEditor())))),
    []
  )

  const [value, setValue] = useState<Descendant[]>(initialValue)

  const handleChange = useCallback((newValue: Descendant[]) => {
    setValue(newValue)
    webViewBridge.notifyContentChange({
      format: 'slate',
      data: {
        slate: newValue,
        html: serialize(newValue)
      }
    })
  }, [])

  useEffect(() => {
    const callbacks: EditorCallbacks = {
      onSetContent: (content) => {
        if (content.format === 'slate') {
          setValue(content.data.slate || content.data)
        } else if (content.format === 'html') {
          const htmlContent = typeof content.data === 'string' ? content.data : content.data.html
          setValue(deserialize(htmlContent))
        }
      },
      onGetContent: () => ({
        format: 'slate',
        data: {
          slate: value,
          html: serialize(value)
        }
      }),
      onExportHTML: () => serialize(value),
      onImportHTML: (html) => {
        setValue(deserialize(html))
      },
      onError: (error) => {
        console.error('Slate Editor Error:', error)
      }
    }

    webViewBridge.initialize('slate', callbacks)

    return () => {
      webViewBridge.destroy()
    }
  }, [value])

  return (
    <div className="editor-container">
      <Slate editor={editor} initialValue={value} onChange={handleChange}>
        <Toolbar />
        <Editable
          className="editor"
          placeholder="Type something..."
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={(event) => handleKeyDown(event, editor)}
          spellCheck
          autoFocus
        />
      </Slate>
    </div>
  )
}