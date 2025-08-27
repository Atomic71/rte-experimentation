# Editor Implementations

Rich text editor implementations with shared WebView communication.

## Structure

```
editors/
├── common/           # Shared components and bridge
├── slate/           # Slate.js implementation
└── lexical/         # Lexical implementation
```

## WebView Bridge

All editors use [`UnifiedWebViewBridge`](common/webview-bridge.ts) for React Native communication.

See **[WebView Integration](../webview-integration.md)** for complete protocol documentation.

## Adding a New Editor

1. Create directory under `editors/` with your editor name
2. Implement [`BaseEditor`](common/types.ts) interface  
3. Use [`webViewBridge`](common/webview-bridge.ts) for communication
4. Add editor to router in [`src/App.tsx`](../App.tsx)

### Example Implementation

```typescript
import { webViewBridge, EditorCallbacks } from '../common/webview-bridge'
import { BaseEditor } from '../common/types'

export class MyEditorWrapper implements BaseEditor {
  initialize(): void {
    const callbacks: EditorCallbacks = {
      onSetContent: (content) => this.setContent(content),
      onGetContent: () => this.getContent(),
      onExecuteCommand: (command) => this.executeCommand(command),
      onExportHTML: () => this.exportHTML(),
      onImportHTML: (html) => this.importHTML(html)
    }

    webViewBridge.initialize('myeditor', callbacks)
  }
  
  destroy(): void {
    webViewBridge.destroy()
  }
}
```

## Current Editors

- **[Slate.js](slate/)** - Plugin-based architecture
- **[Lexical](lexical/)** - Command-based architecture  
- **[TipTap](tiptap/)** - Extension-based architecture

See individual editor documentation for implementation details.