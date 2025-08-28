import { useEffect, useImperativeHandle, forwardRef, useCallback } from 'react'
import { EditorContent, useEditor, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent as EditorContentType, EditorCommand } from '../common/types'
import { Toolbar } from './components/Toolbar'
import { configureMention } from './extensions/configureMention'
import './styles/editor.css'

export interface TipTapEditorHandle {
  getContent: () => EditorContentType
  setContent: (content: EditorContentType) => void
  executeCommand: (command: EditorCommand) => void
  exportHTML: () => string
  importHTML: (html: string) => void
  getEditor: () => Editor | null
}

interface TipTapEditorProps {
  initialContent?: string
  placeholder?: string
  onContentChange?: (content: EditorContentType) => void
  onReady?: (editor: Editor) => void
  readOnly?: boolean
}

const TipTapEditor = forwardRef<TipTapEditorHandle, TipTapEditorProps>(
  ({ initialContent, placeholder, onContentChange, onReady, readOnly }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit,
        Underline,
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-blue-500 underline',
          },
        }),
        Placeholder.configure({
          placeholder: placeholder || 'Start typing...',
        }),
        configureMention(),
      ],
      content: initialContent || '<p></p>',
      editable: !readOnly,
      onUpdate: ({ editor }) => {
        if (onContentChange) {
          onContentChange({
            format: 'html',
            data: editor.getHTML(),
          })
        }
      },
      onCreate: ({ editor }) => {
        if (onReady) {
          onReady(editor)
        }
      },
    })

    const getContent = useCallback((): EditorContentType => {
      if (!editor) {
        return { format: 'html', data: '' }
      }
      return {
        format: 'html',
        data: editor.getHTML(),
      }
    }, [editor])

    const setContent = useCallback(
      (content: EditorContentType) => {
        if (!editor) return

        if (content.format === 'html') {
          editor.commands.setContent(content.data)
        } else if (content.format === 'text') {
          editor.commands.setContent(`<p>${content.data}</p>`)
        } else {
          // For other formats, attempt to convert or use as-is
          editor.commands.setContent(content.data)
        }
      },
      [editor]
    )

    const executeCommand = useCallback(
      (command: EditorCommand) => {
        if (!editor) return

        const chain = editor.chain().focus()

        const commandMap = {
          bold: () => chain.toggleBold().run(),
          italic: () => chain.toggleItalic().run(),
          underline: () => chain.toggleUnderline().run(),
          strikethrough: () => chain.toggleStrike().run(),
          
          heading: () => {
            const level = command.value?.level || 2
            return command.value?.toggle 
              ? chain.toggleHeading({ level }).run()
              : chain.setHeading({ level }).run()
          },
          
          list: () => {
            if (command.value === 'bullet' || command.value === 'unordered') {
              return chain.toggleBulletList().run()
            } else if (command.value === 'ordered' || command.value === 'numbered') {
              return chain.toggleOrderedList().run()
            }
          },
          
          link: () => {
            if (command.value?.url) {
              return chain.extendMarkRange('link').setLink({ href: command.value.url }).run()
            } else {
              return chain.unsetLink().run()
            }
          },
          
          undo: () => chain.undo().run(),
          redo: () => chain.redo().run(),
          
        }

        const commandHandler = commandMap[command.action as keyof typeof commandMap]
        if (commandHandler) {
          commandHandler()
        }
      },
      [editor]
    )

    const exportHTML = useCallback((): string => {
      return editor?.getHTML() || ''
    }, [editor])

    const importHTML = useCallback(
      (html: string) => {
        editor?.commands.setContent(html)
      },
      [editor]
    )

    useImperativeHandle(
      ref,
      () => ({
        getContent,
        setContent,
        executeCommand,
        exportHTML,
        importHTML,
        getEditor: () => editor,
      }),
      [getContent, setContent, executeCommand, exportHTML, importHTML, editor]
    )

    useEffect(() => {
      return () => {
        editor?.destroy()
      }
    }, [editor])

    if (!editor) {
      return null
    }

    return (
      <div className="tiptap-editor-container">
        <Toolbar editor={editor} />
        <div className="tiptap-editor-content">
          <EditorContent editor={editor} />
        </div>
      </div>
    )
  }
)

TipTapEditor.displayName = 'TipTapEditor'

export default TipTapEditor