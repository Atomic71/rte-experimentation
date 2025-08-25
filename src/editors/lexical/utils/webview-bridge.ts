import type { LexicalEditor } from 'lexical'
import { serializeToHtml, serializeToJSON } from './serialization'

export interface WebViewMessage {
  type: string
  data?: any
}

export class LexicalWebViewBridge {
  private editor: LexicalEditor | null = null

  setEditor(editor: LexicalEditor) {
    this.editor = editor
    this.notifyReady()
  }

  notifyReady() {
    this.postMessage({
      type: 'READY',
      data: { editorType: 'lexical' }
    })
  }

  notifyChange() {
    if (!this.editor) return
    
    const htmlContent = serializeToHtml(this.editor)
    const jsonContent = serializeToJSON(this.editor)
    
    this.postMessage({
      type: 'CHANGE',
      data: {
        html: htmlContent,
        json: jsonContent,
        format: 'lexical'
      }
    })
  }

  private postMessage(message: WebViewMessage) {
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify(message))
    } else {
      console.log('WebView message:', message)
    }
  }

  handleMessage(message: WebViewMessage) {
    if (!this.editor) return

    switch (message.type) {
      case 'SET_CONTENT':
        if (message.data?.format === 'html' && message.data?.content) {
          this.setHtmlContent(message.data.content)
        } else if (message.data?.format === 'lexical' && message.data?.content) {
          this.setJsonContent(message.data.content)
        }
        break
      
      case 'GET_CONTENT':
        this.postMessage({
          type: 'CONTENT_RESPONSE',
          data: {
            html: serializeToHtml(this.editor),
            json: serializeToJSON(this.editor),
            format: 'lexical'
          }
        })
        break
      
      case 'EXECUTE_COMMAND':
        this.executeCommand(message.data)
        break
    }
  }

  private setHtmlContent(htmlContent: string) {
    if (!this.editor) return
    
    const { deserializeFromHtml } = require('./serialization')
    deserializeFromHtml(this.editor, htmlContent)
  }

  private setJsonContent(jsonContent: string) {
    if (!this.editor) return
    
    const { deserializeFromJSON } = require('./serialization')
    deserializeFromJSON(this.editor, jsonContent)
  }

  private executeCommand(commandData: any) {
    if (!this.editor || !commandData?.command) return
    
    // Handle specific commands based on commandData.command
    console.log('Execute command:', commandData)
  }
}

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void
    }
    setLexicalContent?: (content: any) => void
  }
}

export const lexicalWebViewBridge = new LexicalWebViewBridge()