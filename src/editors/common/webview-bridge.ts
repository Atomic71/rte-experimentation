import type { EditorContent, EditorCommand } from './types'

// Unified message interface that consolidates all previous formats
export interface WebViewMessage {
  type: 'READY' | 'CHANGE' | 'SET_CONTENT' | 'GET_CONTENT' | 'EXECUTE_COMMAND' | 
        'CONTENT_RESPONSE' | 'EXPORT_HTML' | 'IMPORT_HTML' | 'ERROR' | 'COMMAND'
  payload?: any
  editor?: string
  timestamp?: number
}

// Editor callback interface for type-safe event handling
export interface EditorCallbacks {
  onReady?: () => void
  onContentChange?: (content: EditorContent) => void
  onSetContent?: (content: EditorContent) => void
  onGetContent?: () => EditorContent
  onExecuteCommand?: (command: EditorCommand) => void
  onExportHTML?: () => string
  onImportHTML?: (html: string) => void
  onError?: (error: string) => void
}

// Type-safe React Native WebView interface
interface ReactNativeWebView {
  postMessage: (message: string) => void
}

class UnifiedWebViewBridge {
  private editorType: string = 'unknown'
  private callbacks: EditorCallbacks = {}
  private isReactNative: boolean = false
  private messageListener?: () => void

  constructor() {
    this.isReactNative = !!window.ReactNativeWebView
    this.setupMessageListener()
  }

  // Initialize bridge for specific editor
  initialize(editorType: string, callbacks: EditorCallbacks) {
    this.editorType = editorType
    this.callbacks = callbacks
    
    // Notify React Native that editor is ready
    this.postMessage('READY', { editorType })
  }

  // Clean up listeners
  destroy() {
    if (this.messageListener) {
      this.messageListener()
      this.messageListener = undefined
    }
  }

  private setupMessageListener() {
    const handleMessage = (event: MessageEvent) => {
      try {
        const message = this.parseMessage(event)
        this.handleIncomingMessage(message)
      } catch (error) {
        console.warn('Failed to parse WebView message:', error)
        this.callbacks.onError?.('Failed to parse message')
      }
    }

    window.addEventListener('message', handleMessage)
    document.addEventListener('message', handleMessage as EventListener) // Android support

    // Return cleanup function
    this.messageListener = () => {
      window.removeEventListener('message', handleMessage)
      document.removeEventListener('message', handleMessage as EventListener)
    }
  }

  private parseMessage(event: MessageEvent): WebViewMessage {
    const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
    
    // Handle legacy message formats
    if (data.type && data.data !== undefined) {
      // Lexical format: { type, data }
      return { 
        type: data.type as WebViewMessage['type'], 
        payload: data.data, 
        timestamp: Date.now() 
      }
    }
    
    // Standard format: { type, payload } or EditorMessage format
    return {
      type: data.type as WebViewMessage['type'],
      payload: data.payload || data.data,
      editor: data.editor,
      timestamp: data.timestamp || Date.now()
    }
  }

  private handleIncomingMessage(message: WebViewMessage) {
    switch (message.type) {
      case 'SET_CONTENT':
        this.callbacks.onSetContent?.(message.payload)
        break
        
      case 'GET_CONTENT':
        const content = this.callbacks.onGetContent?.()
        if (content) {
          this.postMessage('CONTENT_RESPONSE', content)
        }
        break
        
      case 'EXECUTE_COMMAND':
      case 'COMMAND': // Support legacy command type
        this.callbacks.onExecuteCommand?.(message.payload)
        break
        
      case 'EXPORT_HTML':
        const html = this.callbacks.onExportHTML?.()
        if (html) {
          this.postMessage('EXPORT_HTML', { html })
        }
        break
        
      case 'IMPORT_HTML':
        this.callbacks.onImportHTML?.(message.payload.html || message.payload)
        break
        
      default:
        console.warn('Unknown message type:', message.type)
    }
  }

  // Public API methods
  postMessage(type: WebViewMessage['type'], payload?: any) {
    const message: WebViewMessage = {
      type,
      payload,
      editor: this.editorType,
      timestamp: Date.now()
    }

    if (this.isReactNative) {
      try {
        window.ReactNativeWebView!.postMessage(JSON.stringify(message))
      } catch (error) {
        console.error('Failed to post message to React Native:', error)
        this.callbacks.onError?.('Failed to communicate with React Native')
      }
    } else {
      // Development logging
      console.log(`[${this.editorType}] WebView Message:`, message)
    }
  }

  // Convenience methods
  notifyContentChange(content: EditorContent) {
    this.postMessage('CHANGE', content)
  }

  notifyError(error: string) {
    this.postMessage('ERROR', { message: error })
    this.callbacks.onError?.(error)
  }

  notifyReady() {
    this.postMessage('READY', { editorType: this.editorType })
  }

  sendContent(content: EditorContent) {
    this.postMessage('CONTENT_RESPONSE', content)
  }

  sendHTML(html: string) {
    this.postMessage('EXPORT_HTML', { html })
  }
}

// Global type declarations - consolidated in one place
declare global {
  interface Window {
    ReactNativeWebView?: ReactNativeWebView
    setLexicalContent?: (content: any) => void
  }
}

// Export singleton instance
export const webViewBridge = new UnifiedWebViewBridge()

// Export for testing or multiple instances if needed
export { UnifiedWebViewBridge }

// Re-export types for convenience
export type { EditorContent, EditorCommand } from './types'