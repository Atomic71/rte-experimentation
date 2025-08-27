import React from 'react'
import { RenderElementProps } from 'slate-react'
import { mentionElementStyle } from '../styles/componentStyles'

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
            ...mentionElementStyle,
            margin: '0 2px',
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