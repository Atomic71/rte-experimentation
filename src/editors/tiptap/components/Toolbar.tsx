import React from 'react'
import { Editor } from '@tiptap/react'

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
  const addLink = () => {
    const url = window.prompt('Enter URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const removeLink = () => {
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

      <div className="toolbar-group">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          H3
        </ToolbarButton>
      </div>

      <div className="toolbar-group">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          • List
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          1. List
        </ToolbarButton>
      </div>

      <div className="toolbar-group">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Blockquote"
        >
          "
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title="Code Block"
        >
          {'</>'}
        </ToolbarButton>
      </div>

      <div className="toolbar-group">
        {editor.isActive('link') ? (
          <ToolbarButton onClick={removeLink} title="Remove Link">
            🔗✕
          </ToolbarButton>
        ) : (
          <ToolbarButton onClick={addLink} title="Add Link">
            🔗
          </ToolbarButton>
        )}
      </div>

      <div className="toolbar-group">
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextDirection('ltr').run()}
          isActive={editor.isActive({ textDirection: 'ltr' })}
          title="Left to Right"
        >
          LTR
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextDirection('rtl').run()}
          isActive={editor.isActive({ textDirection: 'rtl' })}
          title="Right to Left"
        >
          RTL
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetTextDirection().run()}
          title="Auto Direction"
        >
          Auto
        </ToolbarButton>
      </div>

      <div className="toolbar-group">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          ↶
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          ↷
        </ToolbarButton>
      </div>
    </div>
  )
}