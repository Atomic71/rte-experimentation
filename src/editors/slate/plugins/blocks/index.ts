import { Editor, Transforms, Element as SlateElement, Range, Point } from 'slate'
import { CustomEditor, CustomElement } from '../../types'

const LIST_TYPES = ['numbered-list', 'bulleted-list']
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify']

export const isBlockActive = (editor: CustomEditor, format: string, blockType = 'type') => {
  const { selection } = editor
  if (!selection) return false

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n[blockType as keyof typeof n] === format,
    })
  )

  return !!match
}

export const toggleBlock = (editor: CustomEditor, format: CustomElement['type']) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format as string) ? 'align' : 'type'
  )
  const isList = LIST_TYPES.includes(format as string)

  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type as string) &&
      !TEXT_ALIGN_TYPES.includes(format as string),
    split: true,
  })

  let newProperties: Partial<SlateElement>
  if (TEXT_ALIGN_TYPES.includes(format as string)) {
    newProperties = {
      align: isActive ? undefined : format,
    } as any
  } else {
    newProperties = {
      type: isActive ? 'paragraph' : isList ? 'list-item' : format,
    } as any
  }

  Transforms.setNodes<SlateElement>(editor, newProperties)

  if (!isActive && isList) {
    const block = { type: format, children: [] } as any
    Transforms.wrapNodes(editor, block)
  }
}

export const withBlocks = (editor: CustomEditor) => {
  const { deleteBackward, insertBreak } = editor

  editor.deleteBackward = (...args) => {
    const { selection } = editor

    if (selection && Range.isCollapsed(selection)) {
      const [match] = Editor.nodes(editor, {
        match: n =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n.type === 'list-item',
      })

      if (match) {
        const [, path] = match
        const start = Editor.start(editor, path)

        if (Point.equals(selection.anchor, start)) {
          const newProperties: Partial<SlateElement> = {
            type: 'paragraph',
          }
          Transforms.setNodes(editor, newProperties)

          if (SlateElement.isElement(match[0]) && match[0].type === 'list-item') {
            Transforms.unwrapNodes(editor, {
              match: n =>
                !Editor.isEditor(n) &&
                SlateElement.isElement(n) &&
                LIST_TYPES.includes(n.type as string),
              split: true,
            })
          }
          return
        }
      }
    }

    deleteBackward(...args)
  }

  editor.insertBreak = (...args) => {
    const { selection } = editor

    if (selection) {
      const [match] = Editor.nodes(editor, {
        match: n =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n.type === 'code-block',
      })

      if (match) {
        Editor.insertText(editor, '\n')
        return
      }
    }

    insertBreak(...args)
  }

  return editor
}

