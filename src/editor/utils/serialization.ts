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

  switch (node.type) {
    case 'paragraph':
      return `<p>${children}</p>`
    case 'heading-one':
      return `<h1>${children}</h1>`
    case 'heading-two':
      return `<h2>${children}</h2>`
    case 'heading-three':
      return `<h3>${children}</h3>`
    case 'code-block':
      return `<pre><code>${children}</code></pre>`
    case 'bulleted-list':
      return `<ul>${children}</ul>`
    case 'numbered-list':
      return `<ol>${children}</ol>`
    case 'list-item':
      return `<li>${children}</li>`
    case 'link':
      return `<a href="${escapeHtml((node as any).url)}">${children}</a>`
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