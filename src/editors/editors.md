# Editor Implementations

Rich text editor implementations with shared WebView communication API.

## Quick Links

- **[Slate.js](slate.md)** - Plugin-based editor implementation
- **[Lexical](lexical.md)** - Command-based editor implementation
- **[TipTap](tiptap.md)** - Extension-based editor implementation  
- **[WebView Integration](../webview-integration.md)** - React Native communication protocol
- **[Design System](../design-system/)** - Centralized styling system

## Overview

Three rich text editor implementations:

- **Slate.js**: Plugin-based architecture with higher-order functions
- **Lexical**: Command-based architecture with React component plugins
- **TipTap**: Extension-based architecture with ProseMirror foundation

All three implement the same [`BaseEditor`](common/types.ts) interface and use the [`UnifiedWebViewBridge`](common/webview-bridge.ts) for WebView communication.

## Directory Structure

```
editors/
├── common/          # Shared components and bridge
├── slate/           # Slate.js implementation  
├── lexical/         # Lexical implementation
└── tiptap/          # TipTap implementation
```

### Shared Components

- **[`webview-bridge.ts`](common/webview-bridge.ts)** - WebView communication layer
- **[`MentionsDropdown.tsx`](common/MentionsDropdown.tsx)** - @mention dropdown UI
- **[`LinkPopup.tsx`](common/LinkPopup.tsx)** - Link insertion/editing popup

## Common Features

Both editors support:

- Rich text formatting (bold, italic, underline, strikethrough)
- Headings (H1, H2, H3) and lists (bulleted, numbered)
- @mention system with user search
- Link insertion and editing
- RTL/LTR text direction detection
- HTML import/export
- WebView communication protocol

## Usage

### URL-Based Selection

```
http://localhost:5173?editor=slate
http://localhost:5173?editor=lexical
http://localhost:5173?editor=tiptap
```

### Editor Initialization

Each editor exports a wrapper class that implements `BaseEditor`:

```typescript
// Slate
import SlateEditorWrapper from './slate'
const editor = new SlateEditorWrapper()
editor.initialize()

// Lexical  
import LexicalEditorWrapper from './lexical'
const editor = new LexicalEditorWrapper()
editor.initialize()

// TipTap
import { tiptapEditorWrapper } from './tiptap'
tiptapEditorWrapper.initialize()
```

## Implementation Details

For specific implementation details, plugin architecture, and code examples, see:

- **[Slate Implementation](slate.md)** - Higher-order function plugins, transformation API
- **[Lexical Implementation](lexical.md)** - Command system, immutable state, React plugins  
- **[TipTap Implementation](tiptap.md)** - Extension system, ProseMirror-based, React hooks

For WebView communication protocol and React Native integration:

- **[WebView Integration](../webview-integration.md)** - Message types, commands, error handling
