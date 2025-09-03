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
      
      // Initialize the WebView bridge AFTER editor is ready and extensions are set up
      tiptapEditorWrapper.initialize()
      
      // Notify React Native that editor is ready
      setTimeout(() => {
        tiptapEditorWrapper.notifyReady()
      }, 100)
    }
  }

  return (
    <div style={{ height: '100vh' }}>
      <div style={{ flex: 1, height: '100%' }}>
        <TipTapEditor
          ref={editorRef}
          placeholder='enter your message here'
          onContentChange={handleContentChange}
          onReady={handleReady}
        />
      </div>
    </div>
  )
}

export default App