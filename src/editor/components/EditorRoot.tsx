import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { createEditor, Descendant } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import { withHistory } from 'slate-history'
import { WebViewMessage } from '../types'
import { withFormatting } from '../plugins/formatting'
import { withBlocks } from '../plugins/blocks'
import { postMessage, setupMessageListener } from '../utils/webview-bridge'
import { Toolbar } from './Toolbar'
import { renderElement } from './ElementRenderer'
import { renderLeaf } from './LeafRenderer'
import { handleKeyDown } from '../utils/keyboard-shortcuts'

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
    postMessage('CHANGE', newValue)
  }, [])

  const handleMessage = useCallback((message: WebViewMessage) => {
    switch (message.type) {
      case 'SET_CONTENT':
        if (message.payload) {
          setValue(message.payload)
        }
        break
      case 'COMMAND':
        // Handle editor commands from native
        break
    }
  }, [])

  useEffect(() => {
    postMessage('READY')
    return setupMessageListener(handleMessage)
  }, [handleMessage])

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