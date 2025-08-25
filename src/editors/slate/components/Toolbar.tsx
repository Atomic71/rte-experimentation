import React from 'react'
import { useSlate } from 'slate-react'
import { isMarkActive, toggleMark } from '../plugins/formatting'
import { isBlockActive, toggleBlock } from '../plugins/blocks'

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

export const Toolbar: React.FC = () => {
  return (
    <div className="toolbar">
      {/* Text formatting */}
      <MarkButton format="bold" icon="B" />
      <MarkButton format="italic" icon="I" />
      <MarkButton format="underline" icon="U" />
      <MarkButton format="strikethrough" icon="S" />
      <MarkButton format="code" icon="&lt;/&gt;" />
      
      <div className="toolbar-separator" />
      
      {/* Block types */}
      <BlockButton format="heading-one" icon="H1" />
      <BlockButton format="heading-two" icon="H2" />
      <BlockButton format="heading-three" icon="H3" />
      
      <div className="toolbar-separator" />
      
      {/* Lists */}
      <BlockButton format="bulleted-list" icon="•" />
      <BlockButton format="numbered-list" icon="1." />
      
      <div className="toolbar-separator" />
      
      {/* Code block */}
      <BlockButton format="code-block" icon="{ }" />
    </div>
  )
}