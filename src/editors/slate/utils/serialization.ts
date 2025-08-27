import { Text as SlateText, Descendant } from 'slate'
import { CustomElement, CustomText } from '../types'

// Serialize Slate value to HTML
export const serialize = (nodes: Descendant[]): string => {
  return nodes.map(n => serializeNode(n)).join('')
}

const serializeNode = (node: Descendant): string => {
  if (SlateText.isText(node)) {
    let string = escapeHtml(node.text)
    
    if (node.bold) {
      string = `<strong>${string}</strong>`
    }
    if (node.italic) {
      string = `<em>${string}</em>`
    }
    if (node.underline) {
      string = `<u>${string}</u>`
    }
    if (node.strikethrough) {
      string = `<del>${string}</del>`
    }
    if (node.code) {
      string = `<code>${string}</code>`
    }
    
    return string
  }

  const children = node.children.map(n => serializeNode(n)).join('')
  const direction = (node as any).direction ? ` dir="${(node as any).direction}"` : ''

  switch (node.type) {
    case 'paragraph':
      return `<p${direction}>${children}</p>`
    case 'heading-one':
      return `<h1${direction}>${children}</h1>`
    case 'heading-two':
      return `<h2${direction}>${children}</h2>`
    case 'heading-three':
      return `<h3${direction}>${children}</h3>`
    case 'code-block':
      return `<pre${direction}><code>${children}</code></pre>`
    case 'bulleted-list':
      return `<ul${direction}>${children}</ul>`
    case 'numbered-list':
      return `<ol${direction}>${children}</ol>`
    case 'list-item':
      return `<li${direction}>${children}</li>`
    case 'link':
      return `<a href="${escapeHtml((node as any).url)}"${direction}>${children}</a>`
    case 'mention':
      const mention = node as any
      return `<span data-mention-id="${escapeHtml(mention.userId)}" data-mention-name="${escapeHtml(mention.userName)}" data-mention-username="${escapeHtml(mention.username)}" contenteditable="false" style="background: #e8f4fd; color: #1976d2; padding: 2px 4px; border-radius: 3px; cursor: pointer;">${escapeHtml(mention.username)}</span>`
    default:
      return children
  }
}

// Deserialize HTML to Slate value
export const deserialize = (html: string): Descendant[] => {
  const document = new DOMParser().parseFromString(html, 'text/html')
  return Array.from(document.body.childNodes)
    .map(deserializeNode)
    .filter((node): node is Descendant => node !== null)
}

const deserializeNode = (node: ChildNode): Descendant | null => {
  if (node.nodeType === Node.TEXT_NODE) {
    return {
      text: node.textContent || '',
    }
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null
  }

  const element = node as Element
  const children = Array.from(element.childNodes)
    .map(deserializeNode)
    .filter((node): node is Descendant => node !== null)

  if (children.length === 0) {
    children.push({ text: '' })
  }

  switch (element.nodeName.toLowerCase()) {
    case 'p':
      return {
        type: 'paragraph',
        children,
      } as CustomElement
    case 'h1':
      return {
        type: 'heading-one',
        children,
      } as CustomElement
    case 'h2':
      return {
        type: 'heading-two',
        children,
      } as CustomElement
    case 'h3':
      return {
        type: 'heading-three',
        children,
      } as CustomElement
    case 'pre':
      return {
        type: 'code-block',
        children,
      } as CustomElement
    case 'ul':
      return {
        type: 'bulleted-list',
        children,
      } as CustomElement
    case 'ol':
      return {
        type: 'numbered-list',
        children,
      } as CustomElement
    case 'li':
      return {
        type: 'list-item',
        children,
      } as CustomElement
    case 'a':
      return {
        type: 'link',
        url: element.getAttribute('href') || '',
        children,
      } as CustomElement
    case 'strong':
    case 'b':
      return deserializeMarks(children, { bold: true })
    case 'em':
    case 'i':
      return deserializeMarks(children, { italic: true })
    case 'u':
      return deserializeMarks(children, { underline: true })
    case 'del':
    case 's':
      return deserializeMarks(children, { strikethrough: true })
    case 'code':
      return deserializeMarks(children, { code: true })
    case 'span':
      // Check if it's a mention
      if (element.hasAttribute('data-mention-id')) {
        return {
          type: 'mention',
          userId: element.getAttribute('data-mention-id') || '',
          userName: element.getAttribute('data-mention-name') || '',
          username: element.getAttribute('data-mention-username') || element.textContent || '',
          children: [{ text: '' }]
        } as CustomElement
      }
      return children.length === 1 ? children[0] : {
        type: 'paragraph',
        children,
      } as CustomElement
    default:
      return children.length === 1 ? children[0] : {
        type: 'paragraph',
        children,
      } as CustomElement
  }
}

const deserializeMarks = (children: Descendant[], marks: Partial<CustomText>): Descendant => {
  if (children.length === 0) {
    return { text: '', ...marks }
  }
  
  const firstChild = children[0]
  if (SlateText.isText(firstChild)) {
    return { ...firstChild, ...marks }
  }
  return firstChild
}

const escapeHtml = (text: string): string => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}