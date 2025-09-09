import React, { useRef, useEffect } from 'react'
import TipTapEditor from './tiptap/TipTapEditor'
import type { TipTapEditorHandle } from './tiptap/TipTapEditor'
import { webViewBridge, type EditorContent } from './tiptap/webview-bridge'
import { MentionProvider } from './components/MentionContext'
import './toolbar.css'
import './tiptap/styles/editor.css'

const App: React.FC = () => {
  const editorRef = useRef<TipTapEditorHandle>(null)

  useEffect(() => {
    return () => {
      webViewBridge.destroy()
    }
  }, [])

  const handleContentChange = (content: EditorContent) => {
    // Notify React Native about content changes
    webViewBridge.notifyContentChange(content)
  }

  const handleReady = () => {
    if (editorRef.current) {
      // Initialize the WebView bridge AFTER editor is ready
      webViewBridge.initialize({
        onSetContent: (content: EditorContent) => {
          editorRef.current?.setContent(content)
        },
        onClearContent: () => {
          editorRef.current?.clearContent()
        },
        onGetContent: () => {
          return editorRef.current?.getContent() || { format: 'html', data: '' }
        },
      })
      
      // Notify React Native that editor is ready
      setTimeout(() => {
        webViewBridge.notifyReady()
      }, 100)
    }
  }

  return (
    <MentionProvider>
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
    </MentionProvider>
  )
}

export default App