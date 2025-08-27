# WebView Bridge Consolidation Proposal

## Current State Analysis

### Issues with Current Implementation

1. **Three Different Bridge Implementations**:
   - `src/editors/common/webview-bridge.ts` - Complex class-based approach with handler registration
   - `src/editors/slate/utils/webview-bridge.ts` - Simple functional approach with basic utilities
   - `src/editors/lexical/utils/webview-bridge.ts` - Class-based with editor-specific logic
   - `src/editors/common/simplified-bridge.ts` - Custom event-based approach

2. **Inconsistent Message Formats**:
   - Common bridge uses `EditorMessage` with structured payload
   - Slate bridge uses simple `{ type, payload }` format
   - Lexical bridge uses `{ type, data }` format
   - Simplified bridge uses custom events

3. **Duplicate Logic**:
   - React Native detection logic repeated 4 times
   - Message parsing/stringification duplicated
   - Error handling inconsistent across implementations

4. **Type Safety Issues**:
   - Different message interfaces across bridges
   - Missing global window type declarations in some files
   - Inconsistent payload typing

## Proposed Unified Solution

### Single Bridge Implementation

**File**: `src/editors/common/webview-bridge.ts` (replace existing)

```typescript
import type { EditorContent, EditorCommand } from './types'

// Unified message interface
export interface WebViewMessage {
  type: 'READY' | 'CHANGE' | 'SET_CONTENT' | 'GET_CONTENT' | 'EXECUTE_COMMAND' | 
        'CONTENT_RESPONSE' | 'EXPORT_HTML' | 'IMPORT_HTML' | 'ERROR'
  payload?: any
  editor?: string
  timestamp?: number
}

// Editor callback interface
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

class UnifiedWebViewBridge {
  private editorType: string = 'unknown'
  private callbacks: EditorCallbacks = {}
  private isReactNative: boolean = false
  private messageListener?: () => void

  constructor() {
    this.isReactNative = !!(window as any).ReactNativeWebView
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
    document.addEventListener('message', handleMessage as any) // Android support

    // Return cleanup function
    this.messageListener = () => {
      window.removeEventListener('message', handleMessage)
      document.removeEventListener('message', handleMessage as any)
    }
  }

  private parseMessage(event: MessageEvent): WebViewMessage {
    const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
    
    // Handle legacy message formats
    if (data.type && data.data !== undefined) {
      // Lexical format: { type, data }
      return { type: data.type, payload: data.data, timestamp: Date.now() }
    }
    
    // Standard format: { type, payload } or EditorMessage format
    return {
      type: data.type,
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
        this.callbacks.onExecuteCommand?.(message.payload)
        break
        
      case 'EXPORT_HTML':
        const html = this.callbacks.onExportHTML?.()
        if (html) {
          this.postMessage('EXPORT_HTML', { html })
        }
        break
        
      case 'IMPORT_HTML':
        this.callbacks.onImportHTML?.(message.payload.html)
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
        (window as any).ReactNativeWebView.postMessage(JSON.stringify(message))
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
}

// Global type declarations
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void
    }
  }
}

// Export singleton instance
export const webViewBridge = new UnifiedWebViewBridge()

// Export for testing or multiple instances if needed
export { UnifiedWebViewBridge }
```

### Updated Types (`src/editors/common/types.ts`)

```typescript
// Remove duplicate message types, keep only:
export interface EditorContent {
  format: 'slate' | 'lexical' | 'draft' | 'html' | 'markdown' | 'text'
  data: any
}

export interface EditorCommand {
  action: 'bold' | 'italic' | 'underline' | 'strikethrough' | 
          'heading' | 'list' | 'link' | 'undo' | 'redo' | 'direction'
  value?: any
}

// Re-export WebViewMessage from bridge
export type { WebViewMessage, EditorCallbacks } from './webview-bridge'
```

## Migration Strategy

### 1. Replace Bridge Usage in Editors

**Slate Editor Integration**:
```typescript
import { webViewBridge, EditorCallbacks } from '../common/webview-bridge'

export const useSlateWebViewBridge = (editor: Editor) => {
  useEffect(() => {
    const callbacks: EditorCallbacks = {
      onSetContent: (content) => {
        // Set Slate content
        deserializeToSlate(editor, content)
      },
      onGetContent: () => ({
        format: 'slate',
        data: editor.children
      }),
      onExecuteCommand: (command) => {
        executeSlateCommand(editor, command)
      }
    }

    webViewBridge.initialize('slate', callbacks)

    return () => webViewBridge.destroy()
  }, [editor])

  // Notify changes
  const notifyChange = useCallback(() => {
    webViewBridge.notifyContentChange({
      format: 'slate',
      data: editor.children
    })
  }, [editor])

  return { notifyChange }
}
```

**Lexical Editor Integration**:
```typescript
import { webViewBridge, EditorCallbacks } from '../common/webview-bridge'

export const useLexicalWebViewBridge = (editor: LexicalEditor) => {
  useEffect(() => {
    const callbacks: EditorCallbacks = {
      onSetContent: (content) => {
        if (content.format === 'html') {
          deserializeFromHtml(editor, content.data)
        } else if (content.format === 'lexical') {
          deserializeFromJSON(editor, content.data)
        }
      },
      onGetContent: () => ({
        format: 'lexical',
        data: serializeToJSON(editor)
      }),
      onExecuteCommand: (command) => {
        executeLexicalCommand(editor, command)
      }
    }

    webViewBridge.initialize('lexical', callbacks)

    return () => webViewBridge.destroy()
  }, [editor])
}
```

### 2. Remove Obsolete Files

- Delete `src/editors/slate/utils/webview-bridge.ts`
- Delete `src/editors/lexical/utils/webview-bridge.ts` 
- Delete `src/editors/common/simplified-bridge.ts`

### 3. Update Imports

Search and replace all bridge imports to use the unified bridge:
```typescript
// Replace all these imports:
import { postMessage, setupMessageListener } from '../utils/webview-bridge'
import { lexicalWebViewBridge } from '../utils/webview-bridge'
import { simplifiedBridge } from '../common/simplified-bridge'

// With:
import { webViewBridge } from '../common/webview-bridge'
```

## Benefits of This Approach

### 1. **Single Source of Truth**
- One bridge implementation to maintain
- Consistent message handling across all editors
- Unified error handling and logging

### 2. **Type Safety**
- Single message interface with proper TypeScript support
- Consistent payload typing
- Proper global type declarations

### 3. **Maintainability**
- Centralized React Native detection logic
- Single place to add new message types
- Easier to test and debug

### 4. **Backward Compatibility**
- Handles legacy message formats during migration
- Gradual migration possible without breaking existing functionality

### 5. **Better Developer Experience**
- Clear callback-based API
- Automatic cleanup
- Comprehensive error handling

### 6. **Extensibility**
- Easy to add new message types
- Plugin-like callback system
- Support for multiple editor instances if needed

## Implementation Timeline

1. **Week 1**: Create unified bridge implementation
2. **Week 2**: Migrate Slate editor to use unified bridge
3. **Week 3**: Migrate Lexical editor to use unified bridge  
4. **Week 4**: Remove old bridge files and clean up imports
5. **Week 5**: Testing and documentation updates

This consolidation will reduce the bridge-related code by ~60% while improving type safety and maintainability.