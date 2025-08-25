import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html'
import { $getRoot } from 'lexical'
import type { LexicalEditor } from 'lexical'

export const serializeToHtml = (editor: LexicalEditor): string => {
  let htmlString = ''
  editor.getEditorState().read(() => {
    htmlString = $generateHtmlFromNodes(editor, null)
  })
  return htmlString
}

export const deserializeFromHtml = (editor: LexicalEditor, htmlString: string): void => {
  editor.update(() => {
    const parser = new DOMParser()
    const dom = parser.parseFromString(htmlString, 'text/html')
    const nodes = $generateNodesFromDOM(editor, dom)
    $getRoot().clear()
    $getRoot().append(...nodes)
  })
}

export const serializeToJSON = (editor: LexicalEditor): string => {
  return JSON.stringify(editor.getEditorState().toJSON())
}

export const deserializeFromJSON = (editor: LexicalEditor, jsonString: string): void => {
  try {
    const editorState = editor.parseEditorState(jsonString)
    editor.setEditorState(editorState)
  } catch (error) {
    console.error('Failed to deserialize JSON:', error)
  }
}