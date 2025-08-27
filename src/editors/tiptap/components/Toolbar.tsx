import React, { useState } from 'react'
import { Editor } from '@tiptap/react'
import { LinkPopup } from '../../common/LinkPopup'

interface ToolbarProps {
  editor: Editor
}

const ToolbarButton: React.FC<{
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}> = ({ onClick, isActive, disabled, title, children }) => (
  <button
    onClick={onClick}
    className={`toolbar-button ${isActive ? 'active' : ''}`}
    disabled={disabled}
    title={title}
  >
    {children}
  </button>
)

export const Toolbar: React.FC<ToolbarProps> = ({ editor }) => {
  const [showLinkPopup, setShowLinkPopup] = useState(false)
  const [linkData, setLinkData] = useState({ text: '', url: '' })

  const handleLinkClick = () => {
    const { href } = editor.getAttributes('link')
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      ' '
    )

    if (href) {
      // Editing existing link
      setLinkData({
        text: selectedText || href,
        url: href
      })
    } else {
      // Creating new link
      setLinkData({
        text: selectedText,
        url: ''
      })
    }

    setShowLinkPopup(true)
  }

  const handleSaveLink = (text: string, url: string) => {
    if (url) {
      // If we have selected text, just add the link
      if (editor.state.selection.from !== editor.state.selection.to) {
        editor.chain().focus().setLink({ href: url }).run()
      } else {
        // Insert text with link
        editor.chain().focus().insertContent(`<a href="${url}">${text}</a>`).run()
      }
    }
  }

  const handleRemoveLink = () => {
    editor.chain().focus().unsetLink().run()
  }

  return (
    <div className="tiptap-toolbar">
      <div className="toolbar-group">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold (Cmd+B)"
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic (Cmd+I)"
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline (Cmd+U)"
        >
          <u>U</u>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <s>S</s>
        </ToolbarButton>
      </div>
      
      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          •
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          1.
        </ToolbarButton>
      </div>
      
      <div className="toolbar-separator" />
      
      <div className="toolbar-group">
        <ToolbarButton 
          onClick={handleLinkClick} 
          isActive={editor.isActive('link')}
          title="Link"
        >
          🔗
        </ToolbarButton>
      </div>

      <LinkPopup
        isOpen={showLinkPopup}
        onClose={() => setShowLinkPopup(false)}
        onSave={handleSaveLink}
        onRemove={handleRemoveLink}
        initialText={linkData.text}
        initialUrl={linkData.url}
      />
    </div>
  )
}