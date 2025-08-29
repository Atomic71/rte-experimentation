import React, { useState } from 'react'
import { useSlate } from 'slate-react'
import { Editor, Transforms, Range, Element as SlateElement } from 'slate'
import { isMarkActive, toggleMark } from '../plugins/formatting'
import { isBlockActive, toggleBlock } from '../plugins/blocks'
import { LinkPopup } from '../../common/LinkPopup'

interface ToolbarButtonProps {
  active: boolean
  onMouseDown: (event: React.MouseEvent) => void
  children: React.ReactNode
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ active, onMouseDown, children }) => (
  <button
    className={`toolbar-button ${active ? 'active' : ''}`}
    onMouseDown={onMouseDown}
  >
    {children}
  </button>
)

interface MarkButtonProps {
  format: keyof Omit<import('../types').FormattedText, 'text'>
  icon: string
}

const MarkButton: React.FC<MarkButtonProps> = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <ToolbarButton
      active={isMarkActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault()
        toggleMark(editor, format)
      }}
    >
      {icon}
    </ToolbarButton>
  )
}

interface BlockButtonProps {
  format: import('../types').CustomElement['type']
  icon: string
}

const BlockButton: React.FC<BlockButtonProps> = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <ToolbarButton
      active={isBlockActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault()
        toggleBlock(editor, format)
      }}
    >
      {icon}
    </ToolbarButton>
  )
}

const LinkButton: React.FC = () => {
  const editor = useSlate()
  const [showPopup, setShowPopup] = useState(false)
  const [linkData, setLinkData] = useState({ text: '', url: '' })

  const isLinkActive = () => {
    const [link] = Editor.nodes(editor, {
      match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link'
    })
    return !!link
  }

  const handleLinkClick = (event: React.MouseEvent) => {
    event.preventDefault()
    
    const { selection } = editor
    if (!selection) return

    // Check if we're in a link
    const [link] = Editor.nodes(editor, {
      match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link'
    })

    if (link) {
      const [node] = link
      setLinkData({
        text: Editor.string(editor, link[1]),
        url: (node as any).url || ''
      })
    } else if (!Range.isCollapsed(selection)) {
      // Get selected text
      const text = Editor.string(editor, selection)
      setLinkData({ text, url: '' })
    } else {
      setLinkData({ text: '', url: '' })
    }

    setShowPopup(true)
  }

  const handleSaveLink = (text: string, url: string) => {
    const { selection } = editor
    if (!selection) return

    // Remove existing link if any
    Transforms.unwrapNodes(editor, {
      match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link'
    })

    const isCollapsed = Range.isCollapsed(selection)

    if (isCollapsed) {
      // Insert new text with link
      Transforms.insertNodes(editor, {
        type: 'link',
        url,
        children: [{ text }]
      } as any)
    } else {
      // Wrap selection in link
      Transforms.wrapNodes(editor, {
        type: 'link',
        url,
        children: []
      } as any, { split: true })
    }
  }

  const handleRemoveLink = () => {
    Transforms.unwrapNodes(editor, {
      match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link'
    })
  }

  return (
    <>
      <ToolbarButton
        active={isLinkActive()}
        onMouseDown={handleLinkClick}
      >
        🔗
      </ToolbarButton>
      <LinkPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        onSave={handleSaveLink}
        onRemove={handleRemoveLink}
        initialText={linkData.text}
        initialUrl={linkData.url}
      />
    </>
  )
}

export const Toolbar: React.FC = () => {
  const handleSend = () => {
    // TODO: Implement send functionality
    console.log('Send clicked');
  };

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        {/* Text formatting */}
        <MarkButton format="bold" icon="B" />
        <MarkButton format="italic" icon="I" />
        <MarkButton format="underline" icon="U" />
        <MarkButton format="strikethrough" icon="S" />
        
        <div className="toolbar-separator" />
        
        {/* Lists */}
        <BlockButton format="bulleted-list" icon="•" />
        <BlockButton format="numbered-list" icon="1." />
        
        <div className="toolbar-separator" />
        
        {/* Link - will trigger popup */}
        <LinkButton />
      </div>
      
      <div className="toolbar-right">
        <button 
          className="toolbar-send-button"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  )
}