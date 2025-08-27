# WebView Integration

React Native WebView communication protocol for rich text editors.

## Message Protocol

All messages follow this format:

```typescript
interface WebViewMessage {
  type: 'READY' | 'CHANGE' | 'SET_CONTENT' | 'GET_CONTENT' | 'EXECUTE_COMMAND' | 
        'CONTENT_RESPONSE' | 'EXPORT_HTML' | 'IMPORT_HTML' | 'ERROR'
  payload?: any
  editor?: string
  timestamp?: number
}
```

## Message Types

### Web → React Native

- `READY` - Editor initialized and ready for commands
- `CHANGE` - Content changed (user input)
- `CONTENT_RESPONSE` - Current content (response to GET_CONTENT)
- `EXPORT_HTML` - HTML export (response to request)
- `ERROR` - Error occurred

### React Native → Web

- `SET_CONTENT` - Set editor content
- `GET_CONTENT` - Request current content
- `EXECUTE_COMMAND` - Execute editor command
- `EXPORT_HTML` - Request HTML export
- `IMPORT_HTML` - Import HTML content

## Bridge Implementation

Located at [`src/editors/common/webview-bridge.ts`](src/editors/common/webview-bridge.ts):

```typescript
class UnifiedWebViewBridge {
  initialize(editorType: string, callbacks: EditorCallbacks): void {
    this.editorType = editorType
    this.callbacks = callbacks
    
    window.addEventListener('message', this.handleMessage)
    this.postMessage('READY', null)
  }
  
  private handleMessage = (event: MessageEvent): void => {
    const message = this.parseMessage(event)
    
    switch (message.type) {
      case 'SET_CONTENT':
        this.callbacks.onSetContent?.(message.payload)
        break
      case 'GET_CONTENT':
        const content = this.callbacks.onGetContent?.()
        this.postMessage('CONTENT_RESPONSE', content)
        break
      case 'EXECUTE_COMMAND':
        this.callbacks.onExecuteCommand?.(message.payload)
        break
    }
  }
}
```

## React Native Usage

### Loading Editor

```javascript
<WebView
  source={{ uri: 'file:///path/to/dist/index.html?editor=slate' }}
  onMessage={handleMessage}
/>
```

### Sending Commands

```javascript
// Set content
webViewRef.current.injectJavaScript(`
  window.postMessage(JSON.stringify({
    type: "SET_CONTENT",
    payload: { format: "html", data: "<p>Hello world</p>" }
  }), "*");
`)

// Execute formatting
webViewRef.current.injectJavaScript(`
  window.postMessage(JSON.stringify({
    type: "EXECUTE_COMMAND",
    payload: { command: "bold" }
  }), "*");
`)
```

### Receiving Messages

```javascript
const handleMessage = (event) => {
  const message = JSON.parse(event.nativeEvent.data)
  
  switch (message.type) {
    case 'READY':
      console.log(`${message.editor} ready`)
      break
      
    case 'CHANGE':
      console.log('Content changed:', message.payload)
      break
      
    case 'CONTENT_RESPONSE':
      console.log('Current content:', message.payload)
      break
      
    case 'ERROR':
      console.error('Editor error:', message.payload)
      break
  }
}
```

## Editor Selection

### URL Parameters

```
file:///path/to/index.html?editor=slate
file:///path/to/index.html?editor=lexical
```

### Path-Based

```
file:///path/to/index.html#/slate
file:///path/to/index.html#/lexical
```

## Content Formats

### HTML Format

```javascript
{
  type: "SET_CONTENT",
  payload: {
    format: "html",
    data: "<p>Hello <strong>world</strong></p>"
  }
}
```

### Editor Native Format

```javascript
// Slate format
{
  type: "SET_CONTENT",
  payload: {
    format: "slate",
    data: [
      {
        type: 'paragraph',
        children: [
          { text: 'Hello ' },
          { text: 'world', bold: true }
        ]
      }
    ]
  }
}
```

## Error Handling

Errors are sent back to React Native:

```javascript
{
  type: "ERROR",
  payload: {
    code: "INVALID_COMMAND",
    message: "Unknown command: invalidCommand",
    details: { command: "invalidCommand" }
  },
  editor: "slate",
  timestamp: 1640995200000
}
```

## Build Integration

The WebView uses the built `dist/index.html` file:

```bash
npm run build        # Creates dist/index.html
npm run build:web    # Web build only
```

File can be served locally or bundled with React Native app.