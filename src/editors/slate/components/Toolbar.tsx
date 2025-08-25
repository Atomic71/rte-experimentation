import React from 'react'
import { useSlate } from 'slate-react'
import { isMarkActive, toggleMark } from '../plugins/formatting'
import { isBlockActive, toggleBlock } from '../plugins/blocks'
import { isDirectionActive, toggleDirection, setDirection } from '../plugins/direction'

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

interface DirectionButtonProps {
  direction: 'ltr' | 'rtl' | 'auto'
  icon: string
  title: string
}

const DirectionButton: React.FC<DirectionButtonProps> = ({ direction, icon, title }) => {
  const editor = useSlate()
  const isActive = direction === 'auto' ? false : isDirectionActive(editor, direction)
  
  return (
    <ToolbarButton
      active={isActive}
      onMouseDown={(event) => {
        event.preventDefault()
        if (direction === 'auto') {
          setDirection(editor, 'auto')
        } else {
          toggleDirection(editor, direction)
        }
      }}
    >
      <span title={title}>{icon}</span>
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
      
      <div className="toolbar-separator" />
      
      {/* Text direction */}
      <DirectionButton direction="ltr" icon="←→" title="Left to Right" />
      <DirectionButton direction="rtl" icon="→←" title="Right to Left (Arabic/Hebrew)" />
      <DirectionButton direction="auto" icon="↔" title="Auto-detect direction" />
    </div>
  )
}