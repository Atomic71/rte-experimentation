import React from 'react'
import { SlateEditor } from './editors/slate'
import { LexicalEditor } from './editors/lexical'
import TipTapRoute from './editors/tiptap/TipTapRoute'
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
    case 'tiptap':
      return <TipTapRoute />
    default:
      return <SlateEditor />
  }
}

export default EditorRouter