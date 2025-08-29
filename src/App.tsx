import React, { useRef, useEffect } from 'react'
import TipTapEditor from './tiptap/TipTapEditor'
import type { TipTapEditorHandle } from './tiptap/TipTapEditor'
import { tiptapEditorWrapper } from './tiptap/TipTapEditorWrapper'
import type { EditorContent } from './tiptap/webview-bridge'
import './toolbar.css'
import './tiptap/styles/editor.css'

const App: React.FC = () => {
  const editorRef = useRef<TipTapEditorHandle>(null)

  useEffect(() => {
    // Initialize the WebView bridge
    tiptapEditorWrapper.initialize()

    // Set editor reference when ready
    if (editorRef.current) {
      tiptapEditorWrapper.setEditorRef(editorRef.current)

      // Notify React Native that editor is ready
      setTimeout(() => {
        tiptapEditorWrapper.notifyReady()
      }, 100)
    }

    return () => {
      tiptapEditorWrapper.destroy()
    }
  }, [])

  const handleContentChange = (content: EditorContent) => {
    // Notify React Native about content changes
    tiptapEditorWrapper.notifyContentChange(content)
  }

  const handleReady = () => {
    if (editorRef.current) {
      tiptapEditorWrapper.setEditorRef(editorRef.current)
      tiptapEditorWrapper.notifyReady()
    }
  }

  return (
    <div style={{ height: '100vh' }}>
      <div style={{ flex: 1, height: '100%' }}>
        <TipTapEditor
          ref={editorRef}
          placeholder='Start typing... Use @ to mention users'
          onContentChange={handleContentChange}
          onReady={handleReady}
          initialContent='<p>Welcome to the <strong>TipTap</strong> editor! Try out the formatting options, mentions with @, and RTL/LTR text direction.</p>'
        />
      </div>
    </div>
  )
}

export default App