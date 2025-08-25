import { Editor } from 'slate'
import { CustomEditor } from '../../types'

export const isMarkActive = (editor: CustomEditor, format: keyof Omit<import('../../types').FormattedText, 'text'>) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}

export const toggleMark = (editor: CustomEditor, format: keyof Omit<import('../../types').FormattedText, 'text'>) => {
  const isActive = isMarkActive(editor, format)
  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

export const withFormatting = (editor: CustomEditor) => {
  return editor
}