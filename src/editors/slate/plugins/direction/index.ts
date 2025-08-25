import { Editor, Transforms, Element as SlateElement } from 'slate'
import { CustomEditor, CustomElement } from '../../types'

// Arabic and RTL character regex
const RTL_REGEX = /[\u0590-\u083F]|[\u08A0-\u08FF]|[\uFB1D-\uFDFF]|[\uFE70-\uFEFF]/

// Detect if text contains RTL characters
export const detectTextDirection = (text: string): 'ltr' | 'rtl' => {
  const rtlChars = /[\u0590-\u083F]|[\u08A0-\u08FF]|[\uFB1D-\uFDFF]|[\uFE70-\uFEFF]/g
  const ltrChars = /[A-Za-z]/g
  
  const rtlMatches = (text.match(rtlChars) || []).length
  const ltrMatches = (text.match(ltrChars) || []).length
  
  if (rtlMatches > ltrMatches) return 'rtl'
  if (ltrMatches > rtlMatches) return 'ltr'
  
  // Check first strong character
  const firstStrongChar = text.match(/[\u0590-\u083F]|[\u08A0-\u08FF]|[\uFB1D-\uFDFF]|[\uFE70-\uFEFF]|[A-Za-z]/)
  if (firstStrongChar) {
    return RTL_REGEX.test(firstStrongChar[0]) ? 'rtl' : 'ltr'
  }
  
  return 'ltr'
}

// Check if direction is active
export const isDirectionActive = (editor: CustomEditor, direction: 'ltr' | 'rtl'): boolean => {
  const [match] = Array.from(
    Editor.nodes(editor, {
      match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && hasDirectionSupport(n),
    })
  )

  return !!match && (match[0] as any).direction === direction
}

// Check if element supports direction
const hasDirectionSupport = (element: CustomElement): boolean => {
  return element.type === 'paragraph' || 
         element.type === 'heading-one' || 
         element.type === 'heading-two' || 
         element.type === 'heading-three' ||
         element.type === 'list-item'
}

// Toggle direction
export const toggleDirection = (editor: CustomEditor, direction: 'ltr' | 'rtl' | 'auto') => {
  const isActive = isDirectionActive(editor, direction as 'ltr' | 'rtl')
  
  Transforms.setNodes(
    editor,
    { direction: isActive ? undefined : direction } as Partial<CustomElement>,
    {
      match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && hasDirectionSupport(n as CustomElement),
      split: true
    }
  )
}

// Set direction explicitly
export const setDirection = (editor: CustomEditor, direction: 'ltr' | 'rtl' | 'auto') => {
  Transforms.setNodes(
    editor,
    { direction } as Partial<CustomElement>,
    {
      match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && hasDirectionSupport(n as CustomElement),
      split: true
    }
  )
}

// Direction plugin with automatic detection
export const withDirection = (editor: CustomEditor): CustomEditor => {
  const { normalizeNode, insertText } = editor

  // Auto-detect direction on text insertion
  editor.insertText = (text: string) => {
    insertText(text)
    
    // Get the current block
    const [match] = Array.from(
      Editor.nodes(editor, {
        match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && hasDirectionSupport(n as CustomElement),
      })
    )

    if (match) {
      const [node, path] = match
      const element = node as CustomElement & { direction?: 'ltr' | 'rtl' | 'auto' }
      
      // Only auto-detect if direction is set to 'auto' or not set
      if (!element.direction || element.direction === 'auto') {
        const blockText = Editor.string(editor, path)
        const detectedDirection = detectTextDirection(blockText)
        
        if (!element.direction || element.direction === 'auto' || element.direction !== detectedDirection) {
          Transforms.setNodes(
            editor,
            { direction: detectedDirection } as Partial<CustomElement>,
            { at: path }
          )
        }
      }
    }
  }

  // Normalize nodes for direction inheritance
  editor.normalizeNode = (entry) => {
    const [node, path] = entry

    // Auto-detect direction for elements with direction: 'auto'
    if (SlateElement.isElement(node) && hasDirectionSupport(node as CustomElement)) {
      const element = node as CustomElement & { direction?: 'ltr' | 'rtl' | 'auto' }
      
      if (element.direction === 'auto') {
        const text = Editor.string(editor, path)
        const detectedDirection = detectTextDirection(text)
        
        if (detectedDirection) {
          Transforms.setNodes(
            editor,
            { direction: detectedDirection } as Partial<CustomElement>,
            { at: path }
          )
          return
        }
      }
    }

    normalizeNode(entry)
  }

  return editor
}