# Editor Implementations

This directory contains different rich text editor implementations that share a common WebView communication API.

## Structure

```
editors/
├── common/           # Shared code for all editors
│   ├── types.ts     # Common TypeScript interfaces
│   └── webview-bridge.ts  # Unified WebView communication bridge
├── slate/           # Slate.js implementation
└── lexical/         # Lexical implementation
```

## Unified WebView Bridge

All editors use a single, consolidated [`UnifiedWebViewBridge`](common/webview-bridge.ts) for WebView communication.

### Key Features

- **Single Source of Truth**: One bridge implementation for all editors
- **Callback-Based API**: Clean, type-safe event handling
- **Clean Message Protocol**: Simple `{ type, payload, editor, timestamp }` format
- **Consistent Error Handling**: Unified error reporting across editors
- **Type Safety**: Minimal `any` usage with proper typing

### Message Types

#### From Web to React Native:
- `READY` - Editor initialized and ready
- `CHANGE` - Content changed
- `CONTENT_RESPONSE` - Current content (response to GET_CONTENT)
- `EXPORT_HTML` - HTML export (response to request)
- `ERROR` - Error occurred

#### From React Native to Web:
- `SET_CONTENT` - Set editor content
- `GET_CONTENT` - Request current content
- `EXECUTE_COMMAND` - Execute editor command
- `EXPORT_HTML` - Request HTML export
- `IMPORT_HTML` - Import HTML content

### Message Format

```typescript
interface WebViewMessage {
  type: 'READY' | 'CHANGE' | 'SET_CONTENT' | 'GET_CONTENT' | 'EXECUTE_COMMAND' | 
        'CONTENT_RESPONSE' | 'EXPORT_HTML' | 'IMPORT_HTML' | 'ERROR'
  payload?: any
  editor?: string  // Editor type (slate, lexical, etc.)
  timestamp?: number
}
```

## Adding a New Editor

1. Create a new directory under [`editors/`](./) with your editor name
2. Implement the [`BaseEditor`](common/types.ts) interface from [`common/types.ts`](common/types.ts)
3. Use the unified bridge with callback-based initialization
4. Add your editor to the router in [`src/App.tsx`](../App.tsx)

### Example Implementation

```typescript
import { webViewBridge, EditorCallbacks } from '../[common/webview-bridge](common/webview-bridge.ts)'
import { BaseEditor, EditorContent } from '../[common/types](common/types.ts)'

export class MyEditorWrapper implements BaseEditor {
  initialize(): void {
    const callbacks: EditorCallbacks = {
      onSetContent: (content) => this.setContent(content),
      onGetContent: () => this.getContent(),
      onExecuteCommand: (command) => this.executeCommand(command),
      onExportHTML: () => this.exportHTML(),
      onImportHTML: (html) => this.importHTML(html),
      onError: (error) => console.error('Editor Error:', error)
    }

    webViewBridge.initialize('myeditor', callbacks)
  }
  
  // ... implement other BaseEditor methods
  
  destroy(): void {
    webViewBridge.destroy() // Clean up listeners
  }
}
```

## Usage in WebView

### React Native WebView

```javascript
// Send message to editor
webViewRef.current.injectJavaScript(`
  window.postMessage(JSON.stringify({
    type: "SET_CONTENT",
    payload: { format: "html", data: "<p>Hello</p>" }
  }), "*");
`)

// Receive messages from editor
<WebView
  onMessage={(event) => {
    const message = JSON.parse(event.nativeEvent.data)
    switch (message.type) {
      case 'READY':
        console.log(`${message.editor} editor ready`)
        break
      case 'CHANGE':
        console.log('Content changed:', message.payload)
        break
    }
  }}
/>
```

### URL Parameters

When loading the editor in a WebView, specify the editor type:

```
file:///path/to/index.html?editor=slate
file:///path/to/index.html?editor=lexical
```

## Current Status

- ✅ **[Slate.js](slate/)** - Fully implemented with RTL/LTR support, formatting, lists, headings
- ✅ **[Lexical](lexical/)** - Fully implemented with automatic RTL/LTR detection, rich formatting
- ✅ **[Design System](../design-system/)** - Centralized styling with design tokens