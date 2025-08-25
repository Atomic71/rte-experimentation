import { EditorMessage, EditorContent } from './types'

// Unified WebView Bridge for all editors
class WebViewBridge {
  private editorType: string = 'unknown'
  private messageHandlers: Map<EditorMessage['type'], (payload: any) => void> = new Map()
  private isReactNative: boolean = false

  constructor() {
    this.isReactNative = !!(window as any).ReactNativeWebView
    this.setupListeners()
  }

  setEditorType(type: string) {
    this.editorType = type
  }

  private setupListeners() {
    const handleMessage = (e: MessageEvent) => {
      try {
        const message = JSON.parse((e as any).data) as EditorMessage
        const handler = this.messageHandlers.get(message.type)
        if (handler) {
          handler(message.payload)
        }
      } catch (error) {
        console.warn('Failed to parse message:', error)
      }
    }

    window.addEventListener('message', handleMessage)
    document.addEventListener('message', handleMessage as any) // Android support
  }

  // Register a handler for a specific message type
  on(type: EditorMessage['type'], handler: (payload: any) => void) {
    this.messageHandlers.set(type, handler)
  }

  // Send message to React Native
  postMessage(type: EditorMessage['type'], payload?: any) {
    const message: EditorMessage = {
      type,
      payload,
      editor: this.editorType,
      timestamp: Date.now()
    }

    if (this.isReactNative) {
      try {
        (window as any).ReactNativeWebView.postMessage(JSON.stringify(message))
      } catch (error) {
        console.error('Failed to post message to React Native:', error)
      }
    } else {
      // For web testing, just log the message
      console.log('WebView Message:', message)
    }
  }

  // Helper methods for common operations
  notifyReady() {
    this.postMessage('READY')
  }

  notifyChange(content: EditorContent) {
    this.postMessage('CHANGE', content)
  }

  notifyError(error: string) {
    this.postMessage('ERROR', { message: error })
  }

  sendContent(content: EditorContent) {
    this.postMessage('GET_CONTENT', content)
  }

  sendHTML(html: string) {
    this.postMessage('EXPORT_HTML', { html })
  }
}

// Export singleton instance
export const webViewBridge = new WebViewBridge()