import React, { useEffect, useCallback } from 'react'
import './styles.css'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { AutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { registerCodeHighlighting } from '@lexical/code'
// import LexicalClickableLinkPlugin from '@lexical/react/LexicalClickableLinkPlugin'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListItemNode, ListNode } from '@lexical/list'
import { CodeNode, CodeHighlightNode } from '@lexical/code'
import { LinkNode, AutoLinkNode } from '@lexical/link'
// import { BeautifulMentionNode } from 'lexical-beautiful-mentions'
import type { LexicalEditor as LexicalEditorType } from 'lexical'
import { BaseEditor, EditorContent, EditorCommand } from '../common/types'
import { webViewBridge } from '../common/webview-bridge'
import { EditorTheme } from './theme/EditorTheme'
import { ToolbarPlugin } from './plugins/ToolbarPlugin'
import { lexicalWebViewBridge } from './utils/webview-bridge'
import { serializeToHtml, deserializeFromHtml, serializeToJSON } from './utils/serialization'
// import { createLinkMatcherWithRegExp } from '@lexical/link'

const URL_MATCHERS: any[] = []

// const mentionItems = {
//   '@': ['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Wilson', 'Eve Davis'],
//   '#': ['react', 'javascript', 'lexical', 'typescript', 'webdev'],
// }

const editorConfig = {
  namespace: 'LexicalRichTextEditor',
  theme: EditorTheme,
  onError: (error: Error) => console.error('Lexical error:', error),
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    LinkNode,
    AutoLinkNode,
    // BeautifulMentionNode,
  ],
  editorState: () => {
    const { $getRoot, $createParagraphNode, $createTextNode } = require('lexical')
    const { $createHeadingNode } = require('@lexical/rich-text')
    
    const root = $getRoot()
    
    // Welcome paragraph in English
    const welcomeParagraph = $createParagraphNode()
    welcomeParagraph.append($createTextNode('Welcome to Lexical Editor with RTL support! Try typing Arabic text or use the direction buttons.'))
    
    // Arabic paragraph
    const arabicParagraph = $createParagraphNode()
    arabicParagraph.setDirection('rtl')
    arabicParagraph.append($createTextNode('مرحبا بكم في محرر Lexical! جرب كتابة النص العربي أو استخدام أزرار الاتجاه.'))
    
    // Mixed content paragraph
    const mixedParagraph = $createParagraphNode()
    mixedParagraph.append($createTextNode('Mixed content: This is English مع النص العربي في نفس الفقرة.'))
    
    // RTL Heading
    const rtlHeading = $createHeadingNode('h2')
    rtlHeading.setDirection('rtl')
    rtlHeading.append($createTextNode('عنوان باللغة العربية'))
    
    root.append(welcomeParagraph, arabicParagraph, mixedParagraph, rtlHeading)
  },
}

export class LexicalEditorWrapper implements BaseEditor {
  private editor: LexicalEditorType | null = null

  setEditor(editor: LexicalEditorType) {
    this.editor = editor
    lexicalWebViewBridge.setEditor(editor)
    this.setupWebViewHandlers()
  }

  private setupWebViewHandlers() {
    webViewBridge.on('SET_CONTENT', (payload) => {
      if (payload && this.editor) {
        this.setContent(payload)
      }
    })

    webViewBridge.on('GET_CONTENT', () => {
      const content = this.getContent()
      webViewBridge.sendContent(content)
    })

    webViewBridge.on('EXPORT_HTML', () => {
      const html = this.exportHTML()
      webViewBridge.sendHTML(html)
    })

    webViewBridge.on('IMPORT_HTML', (payload) => {
      if (payload?.html && this.editor) {
        this.importHTML(payload.html)
      }
    })

    webViewBridge.on('COMMAND', (payload) => {
      if (payload && this.editor) {
        this.executeCommand(payload)
      }
    })
  }

  initialize(): void {
    webViewBridge.setEditorType('lexical')
    webViewBridge.notifyReady()
  }

  getContent(): EditorContent {
    if (!this.editor) {
      return {
        format: 'lexical',
        data: { text: '' }
      }
    }
    
    return {
      format: 'lexical',
      data: {
        html: serializeToHtml(this.editor),
        json: serializeToJSON(this.editor)
      }
    }
  }

  setContent(content: EditorContent): void {
    if (!this.editor) return
    
    if (content.format === 'html' && content.data?.html) {
      deserializeFromHtml(this.editor, content.data.html)
    } else if (content.format === 'lexical' && content.data?.json) {
      const { deserializeFromJSON } = require('./utils/serialization')
      deserializeFromJSON(this.editor, content.data.json)
    }
  }

  executeCommand(command: EditorCommand): void {
    if (!this.editor) return
    
    const editor = this.editor
    
    if (['bold', 'italic', 'underline', 'strikethrough'].includes(command.action)) {
      const { FORMAT_TEXT_COMMAND } = require('lexical')
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, command.action)
      return
    }
    
    if (['undo', 'redo'].includes(command.action)) {
      const { UNDO_COMMAND, REDO_COMMAND } = require('lexical')
      const cmd = command.action === 'undo' ? UNDO_COMMAND : REDO_COMMAND
      editor.dispatchCommand(cmd, undefined)
      return
    }
    
    if (command.action === 'list') {
      const { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } = require('@lexical/list')
      if (command.value === 'bullet') {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
      } else if (command.value === 'numbered') {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
      }
      return
    }
    
    editor.update(() => {
      const { $getSelection, $isRangeSelection } = require('lexical')
      const selection = $getSelection()
      
      if (!$isRangeSelection(selection)) return
      
      switch (command.action) {
        case 'heading':
          if (command.value) {
            const { $setBlocksType } = require('@lexical/selection')
            const { $createHeadingNode } = require('@lexical/rich-text')
            $setBlocksType(selection, () => $createHeadingNode(command.value))
          }
          break
        case 'link':
          if (command.value) {
            const { $toggleLink } = require('@lexical/link')
            $toggleLink(command.value)
          }
          break
        default:
          console.log('Unknown command:', command)
      }
    })
  }

  exportHTML(): string {
    if (!this.editor) return '<p></p>'
    return serializeToHtml(this.editor)
  }

  importHTML(html: string): void {
    if (!this.editor) return
    deserializeFromHtml(this.editor, html)
  }

  destroy(): void {
    this.editor = null
  }
}

const EditorInitializer: React.FC<{ wrapper: LexicalEditorWrapper }> = ({ wrapper }) => {
  const [editor] = useLexicalComposerContext()
  
  useEffect(() => {
    wrapper.setEditor(editor)
    wrapper.initialize()
    return registerCodeHighlighting(editor)
  }, [editor, wrapper])
  
  return null
}

const EditorContainer: React.FC<{ wrapper: LexicalEditorWrapper }> = ({ wrapper }) => {
  const handleChange = useCallback(() => {
    if (wrapper.getContent) {
      const content = wrapper.getContent()
      webViewBridge.notifyChange(content)
    }
  }, [wrapper])

  // const handleMentionSearch = useCallback(async (trigger: string, query?: string | null) => {
  //   const items = mentionItems[trigger as keyof typeof mentionItems] || []
  //   const searchQuery = query || ''
  //   return items
  //     .filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
  //     .map(item => ({ value: item, id: item, data: item }))
  // }, [])

  useEffect(() => {
    const handleWebViewMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data)
        lexicalWebViewBridge.handleMessage(message)
      } catch (error) {
        console.error('Failed to parse WebView message:', error)
      }
    }

    const handleDocumentMessage = (event: any) => {
      if (event.data && typeof event.data === 'string') {
        handleWebViewMessage(event)
      }
    }

    window.addEventListener('message', handleWebViewMessage)
    document.addEventListener('message', handleDocumentMessage)

    return () => {
      window.removeEventListener('message', handleWebViewMessage)
      document.removeEventListener('message', handleDocumentMessage)
    }
  }, [])

  const editorStyle: React.CSSProperties = {
    minHeight: '300px',
    padding: '16px',
    fontSize: '16px',
    lineHeight: '1.5',
    outline: 'none',
  }

  const placeholderStyle: React.CSSProperties = {
    position: 'absolute',
    top: '16px',
    left: '16px',
    color: '#999',
    fontSize: '16px',
    pointerEvents: 'none',
  }

  return (
    <>
      <EditorInitializer wrapper={wrapper} />
      <ToolbarPlugin />
      <div style={{ position: 'relative', border: '1px solid #e5e5e5', borderTop: 'none' }}>
        <RichTextPlugin
          contentEditable={<ContentEditable style={editorStyle} />}
          placeholder={<div style={placeholderStyle}>Enter some rich text...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
      </div>
      <HistoryPlugin />
      <OnChangePlugin onChange={handleChange} />
      <ListPlugin />
      <LinkPlugin />
      <AutoLinkPlugin matchers={URL_MATCHERS} />
      {/* <LexicalClickableLinkPlugin disabled={false} /> */}
      {/* <BeautifulMentionsPlugin
        triggers={['@', '#']}
        onSearch={handleMentionSearch}
        placeholder={(trigger: string) => `Type ${trigger} to mention...`}
      /> */}
    </>
  )
}

export const LexicalEditor: React.FC = () => {
  const wrapper = React.useMemo(() => new LexicalEditorWrapper(), [])

  return (
    <div className="editor-container" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <LexicalComposer initialConfig={editorConfig}>
        <EditorContainer wrapper={wrapper} />
      </LexicalComposer>
    </div>
  )
}