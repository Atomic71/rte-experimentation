import { KeyboardEvent } from 'react'
import { CustomEditor } from '../types'
import { toggleMark } from '../plugins/formatting'
import { toggleBlock } from '../plugins/blocks'

export const handleKeyDown = (event: KeyboardEvent, editor: CustomEditor) => {
  const { key, ctrlKey, metaKey, shiftKey } = event
  const isModKey = ctrlKey || metaKey

  if (!isModKey) {
    return
  }

  switch (key) {
    // Text formatting shortcuts
    case 'b':
      event.preventDefault()
      toggleMark(editor, 'bold')
      break
    case 'i':
      event.preventDefault()
      toggleMark(editor, 'italic')
      break
    case 'u':
      event.preventDefault()
      toggleMark(editor, 'underline')
      break
    case 'e':
      event.preventDefault()
      toggleMark(editor, 'code')
      break
    
    // Block shortcuts
    case '1':
      if (shiftKey) {
        event.preventDefault()
        toggleBlock(editor, 'heading-one')
      }
      break
    case '2':
      if (shiftKey) {
        event.preventDefault()
        toggleBlock(editor, 'heading-two')
      }
      break
    case '3':
      if (shiftKey) {
        event.preventDefault()
        toggleBlock(editor, 'heading-three')
      }
      break
    case '8':
      if (shiftKey) {
        event.preventDefault()
        toggleBlock(editor, 'bulleted-list')
      }
      break
    case '7':
      if (shiftKey) {
        event.preventDefault()
        toggleBlock(editor, 'numbered-list')
      }
      break
    case '`':
      if (shiftKey) {
        event.preventDefault()
        toggleBlock(editor, 'code-block')
      }
      break
  }
}