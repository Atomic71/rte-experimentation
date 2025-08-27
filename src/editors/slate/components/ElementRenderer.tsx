import React from 'react'
import { RenderElementProps } from 'slate-react'

export const renderElement = (props: RenderElementProps) => {
  const { attributes, children, element } = props
  
  const elementWithDirection = element as any
  const direction = elementWithDirection.direction
  
  const style: React.CSSProperties = { 
    textAlign: elementWithDirection.align || (direction === 'rtl' ? 'right' : direction === 'ltr' ? 'left' : 'start'),
    direction: direction === 'auto' ? undefined : direction,
    unicodeBidi: direction === 'auto' ? 'plaintext' : undefined
  }

  switch (element.type) {
    case 'bulleted-list':
      return (
        <ul {...attributes} style={style}>
          {children}
        </ul>
      )
    case 'numbered-list':
      return (
        <ol {...attributes} style={style}>
          {children}
        </ol>
      )
    case 'list-item':
      return (
        <li {...attributes} style={style}>
          {children}
        </li>
      )
    case 'link':
      return (
        <a {...attributes} href={(element as any).url} style={style}>
          {children}
        </a>
      )
    case 'mention':
      return (
        <span
          {...attributes}
          contentEditable={false}
          style={{
            padding: '2px 4px',
            margin: '0 2px',
            backgroundColor: '#e8f4fd',
            borderRadius: '3px',
            color: '#1976d2',
            cursor: 'pointer',
            userSelect: 'none'
          }}
          data-mention-id={(element as any).userId}
          data-mention-name={(element as any).userName}
        >
          {(element as any).username}
          {children}
        </span>
      )
    default:
      return (
        <p {...attributes} style={style}>
          {children}
        </p>
      )
  }
}