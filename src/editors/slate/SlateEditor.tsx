import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { createEditor, Descendant } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import { withHistory } from 'slate-history'
import { withFormatting } from './plugins/formatting'
import { withBlocks } from './plugins/blocks'
import { Toolbar } from './components/Toolbar'
import { renderElement } from './components/ElementRenderer'
import { renderLeaf } from './components/LeafRenderer'
import { handleKeyDown } from './utils/keyboard-shortcuts'
import { serialize, deserialize } from './utils/serialization'
import { webViewBridge } from '../common/webview-bridge'
import { BaseEditor, EditorContent, EditorCommand } from '../common/types'

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'Welcome to the Slate.js editor! Try using the toolbar or keyboard shortcuts to format your text.',
      },
    ],
  },
]

export class SlateEditorWrapper implements BaseEditor {
  private editorContent: Descendant[] = initialValue
  private changeCallback?: (content: Descendant[]) => void

  initialize(): void {
    webViewBridge.setEditorType('slate')
    webViewBridge.notifyReady()
  }

  getContent(): EditorContent {
    return {
      format: 'slate',
      data: this.editorContent
    }
  }

  setContent(content: EditorContent): void {
    if (content.format === 'slate') {
      this.editorContent = content.data
      this.changeCallback?.(content.data)
    } else if (content.format === 'html') {
      this.editorContent = deserialize(content.data)
      this.changeCallback?.(this.editorContent)
    }
  }

  executeCommand(command: EditorCommand): void {
    // Commands will be handled by the React component
    console.log('Execute command:', command)
  }

  exportHTML(): string {
    return serialize(this.editorContent)
  }

  importHTML(html: string): void {
    this.editorContent = deserialize(html)
    this.changeCallback?.(this.editorContent)
  }

  destroy(): void {
    // Cleanup if needed
  }

  setChangeCallback(callback: (content: Descendant[]) => void) {
    this.changeCallback = callback
  }
}

export const SlateEditor: React.FC = () => {
  const editor = useMemo(
    () => withBlocks(withFormatting(withHistory(withReact(createEditor())))),
    []
  )

  const [value, setValue] = useState<Descendant[]>(initialValue)
  const wrapper = useMemo(() => new SlateEditorWrapper(), [])

  const handleChange = useCallback((newValue: Descendant[]) => {
    setValue(newValue)
    webViewBridge.notifyChange({
      format: 'slate',
      data: newValue
    })
  }, [])

  useEffect(() => {
    wrapper.setChangeCallback(setValue)
    wrapper.initialize()

    // Set up message handlers
    webViewBridge.on('SET_CONTENT', (payload) => {
      if (payload) {
        wrapper.setContent(payload)
      }
    })

    webViewBridge.on('COMMAND', (payload) => {
      if (payload) {
        wrapper.executeCommand(payload)
      }
    })

    webViewBridge.on('GET_CONTENT', () => {
      webViewBridge.sendContent(wrapper.getContent())
    })

    webViewBridge.on('EXPORT_HTML', () => {
      webViewBridge.sendHTML(wrapper.exportHTML())
    })

    webViewBridge.on('IMPORT_HTML', (payload) => {
      if (payload?.html) {
        wrapper.importHTML(payload.html)
      }
    })
  }, [wrapper])

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