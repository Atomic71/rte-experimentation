import React from 'react'
import { SlateEditor } from './editors/slate'
import { LexicalEditor } from './editors/lexical'
import { QuillEditorWrapper } from './editors/quill/QuillEditorWrapper'
import HomePage from './HomePage'
import './toolbar.css'

// Simple router based on URL path
const EditorRouter: React.FC = () => {
  const path = window.location.pathname
  
  // For WebView, we'll use query params to determine editor
  const params = new URLSearchParams(window.location.search)
  const editorType = params.get('editor') || path.slice(1)
  
  // Show home page if no editor specified
  if (!editorType) {
    return <HomePage />
  }
  
  switch (editorType) {
    case 'slate':
      return <SlateEditor />
    case 'lexical':
      return <LexicalEditor />
    case 'draft':
      return (
        <div className="editor-container">
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Draft.js Editor</h2>
            <p>Draft.js editor will be implemented here</p>
          </div>
        </div>
      )
    case 'quill':
      return <QuillEditorWrapper />
    default:
      return <SlateEditor />
  }
}

export default EditorRouter