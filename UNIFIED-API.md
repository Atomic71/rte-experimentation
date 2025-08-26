# Unified WebView API Documentation

This project provides multiple rich text editor implementations with a unified API for React Native WebView communication.

## Quick Start

### Development
```bash
npm run dev
# Opens at http://localhost:5173
# Home page shows available editors
```

### Production Build
```bash
npm run build
# Creates dist/index.html
```

## Editor Selection

### Via URL Parameters (Recommended for WebView)
```
?editor=slate     # Slate.js editor with RTL/LTR support
?editor=lexical   # Lexical editor with auto RTL detection
?editor=draft     # Draft.js editor (planned)
```

### Via Path (Development)
```
/slate     # Slate.js editor
/lexical   # Lexical editor
/draft     # Draft.js editor
```

## Unified Message Protocol

All editors use the same messaging protocol, making it easy to switch between them without changing your React Native code.

### Message Structure
```typescript
interface EditorMessage {
  type: string        // Message type
  payload?: any       // Message data
  editor?: string     // Editor type (slate, lexical, etc.)
  timestamp?: number  // Unix timestamp
}
```

### Message Types

#### Web → React Native
| Type | Description | Payload |
|------|-------------|---------|
| `READY` | Editor initialized | None |
| `CHANGE` | Content changed | `EditorContent` |
| `GET_CONTENT` | Content response | `EditorContent` |
| `EXPORT_HTML` | HTML export response | `{ html: string }` |
| `ERROR` | Error occurred | `{ message: string }` |

#### React Native → Web
| Type | Description | Payload |
|------|-------------|---------|
| `SET_CONTENT` | Set editor content | `EditorContent` |
| `COMMAND` | Execute command | `EditorCommand` |
| `GET_CONTENT` | Request content | None |
| `EXPORT_HTML` | Request HTML export | None |
| `IMPORT_HTML` | Import HTML | `{ html: string }` |

### Data Types

```typescript
interface EditorContent {
  format: 'slate' | 'lexical' | 'html' | 'markdown'
  data: any  // Format-specific data
}

interface EditorCommand {
  action: 'bold' | 'italic' | 'underline' | 'strikethrough' | 
          'heading' | 'list' | 'link' | 'undo' | 'redo'
  value?: any
}
```

## React Native Integration

### Basic Setup
```javascript
import { WebView } from 'react-native-webview'

const RichTextEditor = ({ editorType = 'slate' }) => {
  const webViewRef = useRef(null)
  
  const handleMessage = (event) => {
    const message = JSON.parse(event.nativeEvent.data)
    
    switch (message.type) {
      case 'READY':
        console.log(`${message.editor} editor ready`)
        // Initialize content if needed
        sendMessage('SET_CONTENT', {
          format: 'html',
          data: '<p>Initial content</p>'
        })
        break
        
      case 'CHANGE':
        console.log('Content changed:', message.payload)
        // Save or process changes
        break
        
      case 'GET_CONTENT':
        console.log('Content received:', message.payload)
        break
    }
  }
  
  const sendMessage = (type, payload) => {
    webViewRef.current?.injectJavaScript(`
      window.postMessage(JSON.stringify({
        type: "${type}",
        payload: ${JSON.stringify(payload)}
      }), "*");
      true;
    `)
  }
  
  return (
    <WebView
      ref={webViewRef}
      source={{ 
        uri: `file:///path/to/index.html?editor=${editorType}` 
      }}
      onMessage={handleMessage}
      originWhitelist={['*']}
      javaScriptEnabled={true}
    />
  )
}
```

### Common Operations

#### Set Initial Content
```javascript
sendMessage('SET_CONTENT', {
  format: 'html',
  data: '<h1>Welcome</h1><p>Start editing...</p>'
})
```

#### Get Current Content
```javascript
sendMessage('GET_CONTENT')
// Response will come via CHANGE message
```

#### Export as HTML
```javascript
sendMessage('EXPORT_HTML')
// Response will come via EXPORT_HTML message
```

#### Execute Formatting Command
```javascript
sendMessage('COMMAND', {
  action: 'bold'
})
```

## Adding New Editors

1. Create directory: `src/editors/[editor-name]/`
2. Implement the `BaseEditor` interface
3. Use `webViewBridge` for communication
4. Add to router in `src/App.tsx`

### BaseEditor Interface
```typescript
interface BaseEditor {
  initialize(): void
  getContent(): EditorContent
  setContent(content: EditorContent): void
  executeCommand(command: EditorCommand): void
  exportHTML(): string
  importHTML(html: string): void
  destroy(): void
}
```

1. **Easy Editor Switching**: Change editors without modifying React Native code
2. **Consistent Interface**: Same message protocol across all editors
3. **Feature Parity**: All editors implement the same base features
4. **Simplified Testing**: Test once, works with all editors
5. **Future-Proof**: Easy to add new editors without breaking existing code