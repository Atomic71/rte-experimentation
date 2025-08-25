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
    case 'heading-one':
      return (
        <h1 {...attributes} style={style}>
          {children}
        </h1>
      )
    case 'heading-two':
      return (
        <h2 {...attributes} style={style}>
          {children}
        </h2>
      )
    case 'heading-three':
      return (
        <h3 {...attributes} style={style}>
          {children}
        </h3>
      )
    case 'code-block':
      return (
        <pre {...attributes}>
          <code>{children}</code>
        </pre>
      )
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
    default:
      return (
        <p {...attributes} style={style}>
          {children}
        </p>
      )
  }
}