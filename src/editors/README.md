# Editor Implementations

This directory contains different rich text editor implementations that share a common WebView communication API.

## Structure

```
editors/
├── common/           # Shared code for all editors
│   ├── types.ts     # Common TypeScript interfaces
│   └── webview-bridge.ts  # Unified WebView communication
├── slate/           # Slate.js implementation
├── lexical/         # Lexical implementation (planned)
├── draft/           # Draft.js implementation (planned)
└── quill/           # Quill implementation (planned)
```

## Unified WebView API

All editors implement the same WebView messaging protocol for React Native communication:

### Message Types

#### From Web to React Native:
- `READY` - Editor initialized and ready
- `CHANGE` - Content changed
- `GET_CONTENT` - Sending current content (response)
- `EXPORT_HTML` - Sending HTML export (response)
- `ERROR` - Error occurred

#### From React Native to Web:
- `SET_CONTENT` - Set editor content
- `COMMAND` - Execute editor command
- `GET_CONTENT` - Request current content
- `EXPORT_HTML` - Request HTML export
- `IMPORT_HTML` - Import HTML content

### Message Format

```typescript
interface EditorMessage {
  type: string
  payload?: any
  editor?: string  // Editor type (slate, lexical, etc.)
  timestamp?: number
}
```

## Adding a New Editor

1. Create a new directory under `editors/` with your editor name
2. Implement the `BaseEditor` interface from `common/types.ts`
3. Use `webViewBridge` from `common/webview-bridge.ts` for communication
4. Add your editor to the router in `src/App.tsx`

### Example Implementation

```typescript
import { webViewBridge } from '../common/webview-bridge'
import { BaseEditor, EditorContent } from '../common/types'

export class MyEditorWrapper implements BaseEditor {
  initialize(): void {
    webViewBridge.setEditorType('myeditor')
    webViewBridge.notifyReady()
  }
  
  // ... implement other BaseEditor methods
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

- ✅ **Slate.js** - Fully implemented with all features
- 🚧 **Lexical** - Planned
- 🚧 **Draft.js** - Planned
- 🚧 **Quill** - Planned