import { useRef, useEffect } from 'react'
import TipTapEditor from './TipTapEditor'
import type { TipTapEditorHandle } from './TipTapEditor'
import { tiptapEditorWrapper } from './TipTapEditorWrapper'
import { DUMMY_USERS } from '../../data/users'
import type { EditorContent } from '../common/types'
import './styles/editor.css'

export default function TipTapRoute() {
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
    <div style={{ height: '100vh', padding: '20px', backgroundColor: '#f5f5f5' }}>
      <div style={{ 
        maxWidth: '900px', 
        margin: '0 auto', 
        height: 'calc(100% - 40px)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          marginBottom: '20px',
          color: '#2d3748'
        }}>
          TipTap Editor
        </h1>
        
        <div style={{ flex: 1, minHeight: 0 }}>
          <TipTapEditor
            ref={editorRef}
            placeholder="Start typing... Use @ to mention users"
            onContentChange={handleContentChange}
            onReady={handleReady}
            mentionUsers={DUMMY_USERS.map((user) => ({
              id: user.id,
              name: user.name,
              avatar: undefined
            }))}
            initialContent="<p>Welcome to the <strong>TipTap</strong> editor! Try out the formatting options, mentions with @, and RTL/LTR text direction.</p>"
          />
        </div>
      </div>
    </div>
  )
}