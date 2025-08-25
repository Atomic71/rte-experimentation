import { BaseEditor } from 'slate'
import { ReactEditor } from 'slate-react'
import { HistoryEditor } from 'slate-history'

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor

export type ParagraphElement = {
  type: 'paragraph'
  children: CustomText[]
  direction?: 'ltr' | 'rtl' | 'auto'
}

export type HeadingElement = {
  type: 'heading-one' | 'heading-two' | 'heading-three'
  children: CustomText[]
  direction?: 'ltr' | 'rtl' | 'auto'
}

export type CodeBlockElement = {
  type: 'code-block'
  children: CustomText[]
}

export type BulletedListElement = {
  type: 'bulleted-list'
  children: ListItemElement[]
}

export type NumberedListElement = {
  type: 'numbered-list'
  children: ListItemElement[]
}

export type ListItemElement = {
  type: 'list-item'
  children: CustomText[]
  direction?: 'ltr' | 'rtl' | 'auto'
}

export type LinkElement = {
  type: 'link'
  url: string
  children: CustomText[]
}

export type CustomElement = 
  | ParagraphElement 
  | HeadingElement 
  | CodeBlockElement 
  | BulletedListElement 
  | NumberedListElement 
  | ListItemElement 
  | LinkElement

export type FormattedText = {
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  code?: boolean
}

export type CustomText = FormattedText

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor
    Element: CustomElement
    Text: CustomText
  }
}

export type WebViewMessage = {
  type: 'READY' | 'CHANGE' | 'SET_CONTENT' | 'COMMAND'
  payload?: any
}