import { RenderLeafProps } from 'slate-react'

export const renderLeaf = (props: RenderLeafProps) => {
  const { attributes, children, leaf } = props

  let element = <span {...attributes}>{children}</span>

  if (leaf.bold) {
    element = <strong>{element}</strong>
  }

  if (leaf.italic) {
    element = <em>{element}</em>
  }

  if (leaf.underline) {
    element = <u>{element}</u>
  }

  if (leaf.strikethrough) {
    element = <del>{element}</del>
  }

  return element
}