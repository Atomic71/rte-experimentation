# TipTap Implementation

Extension-based rich text editor built on ProseMirror with React integration and WebView communication.

## Architecture Overview

TipTap provides an **extension-based architecture** where each feature is implemented as a modular extension. The editor is built on top of ProseMirror, providing a robust foundation with excellent performance and accessibility.

### Key Characteristics

- **Extension System**: Modular plugins for formatting, lists, mentions, etc.
- **ProseMirror Foundation**: Battle-tested editor framework with excellent accessibility
- **React Integration**: Native React hooks and components with `useEditor`
- **TypeScript First**: Full TypeScript support with comprehensive type definitions
- **WebView Compatible**: Seamless integration with React Native WebView bridge

## Directory Structure

```
tiptap/
├── TipTapEditor.tsx           # Main React editor component
├── TipTapEditorWrapper.ts     # WebView bridge integration
├── TipTapRoute.tsx            # Route component with demo content
├── index.ts                   # Module exports
├── components/
│   ├── Toolbar.tsx            # Rich formatting toolbar
│   └── MentionList.tsx        # @mention dropdown component
├── extensions/
│   ├── MentionExtension.tsx   # Custom mention extension
│   └── configureMention.tsx   # Mention configuration helper
└── styles/
    └── editor.css             # Complete editor styling
```

## Core Extensions

### Built-in Extensions

```typescript
// Core formatting and structure
StarterKit,           // Bold, italic, headings, lists, history
Underline,            // Underline formatting
Link,                 // Link insertion and editing
Placeholder,          // Placeholder text
TextDirection,        // RTL/LTR text direction support
```

### Custom Extensions

- **Mentions**: Custom `@username` system with dropdown search
- **Enhanced Link**: Link editing with preview and validation
- **Direction Control**: Manual and automatic text direction detection

## Implementation Details

### Editor Initialization

```typescript
const editor = useEditor({
  extensions: [
    StarterKit,
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-blue-500 underline',
      },
    }),
    Placeholder.configure({
      placeholder: 'Start typing...',
    }),
    TextDirection.configure({
      types: ['heading', 'paragraph'],
      defaultDirection: 'ltr',
    }),
    configureMention(mentionUsers || []),
  ],
  content: initialContent || '<p></p>',
  editable: !readOnly,
  onUpdate: ({ editor }) => {
    // Handle content changes
  },
})
```

### Command System

TipTap uses a **chain-based command system** for executing editor actions:

```typescript
// Format text
editor.chain().focus().toggleBold().run()
editor.chain().focus().toggleItalic().run()
editor.chain().focus().toggleUnderline().run()

// Structure
editor.chain().focus().toggleBulletList().run()
editor.chain().focus().toggleOrderedList().run()

// Links
editor.chain().focus().setLink({ href: url }).run()
editor.chain().focus().unsetLink().run()
```

### Mentions Implementation

The mentions system uses TipTap's suggestion API with React components:

```typescript
// Extension configuration
configureMention([
  { id: '1', name: 'Alice Johnson' },
  { id: '2', name: 'Bob Smith' }
])

// Suggestion rendering
suggestion: {
  items: ({ query }) => filterUsers(query),
  render: () => ({
    onStart: (props) => {
      // Show dropdown
      component = new ReactRenderer(MentionList, { props, editor })
    },
    onKeyDown: (props) => {
      // Handle keyboard navigation
      return component?.ref?.onKeyDown(props)
    }
  })
}
```

### Content Management

```typescript
// Get content as HTML
const htmlContent = editor.getHTML()

// Set content
editor.commands.setContent('<p>New content</p>')

// Export/Import
const html = editor.getHTML()
editor.commands.setContent(importedHtml)
```

## WebView Integration

### Bridge Implementation

```typescript
export class TipTapEditorWrapper implements BaseEditor {
  private editorRef: TipTapEditorHandle | null = null

  initialize(): void {
    webViewBridge.initialize('tiptap', {
      onSetContent: (content) => this.setContent(content),
      onGetContent: () => this.getContent(),
      onExecuteCommand: (command) => this.executeCommand(command),
      onExportHTML: () => this.exportHTML(),
      onImportHTML: (html) => this.importHTML(html),
    })
  }

  executeCommand(command: EditorCommand): void {
    switch (command.action) {
      case 'bold':
        this.editorRef?.getEditor()?.chain().focus().toggleBold().run()
        break
      case 'italic':
        this.editorRef?.getEditor()?.chain().focus().toggleItalic().run()
        break
      case 'underline':
        this.editorRef?.getEditor()?.chain().focus().toggleUnderline().run()
        break
      // ... other commands
    }
  }
}
```

### Message Protocol

**Outgoing Messages** (Web → React Native):
```typescript
// Editor ready
{ type: 'READY', payload: { editorType: 'tiptap', features: {...} } }

// Content changed
{ type: 'CHANGE', payload: { format: 'html', data: '<p>...</p>' } }

// Content response
{ type: 'CONTENT_RESPONSE', payload: { format: 'html', data: '...' } }
```

**Incoming Messages** (React Native → Web):
```typescript
// Set content
{ type: 'SET_CONTENT', payload: { format: 'html', data: '<p>...</p>' } }

// Execute command
{ type: 'EXECUTE_COMMAND', payload: { action: 'bold' } }

// Get content
{ type: 'GET_CONTENT' }
```

## Features

### Rich Text Formatting

- **Text Styles**: Bold, italic, underline, strikethrough
- **Lists**: Bulleted and numbered lists with nesting

### Advanced Features

- **@Mentions**: User tagging with real-time search and dropdown
- **Links**: URL insertion with validation and editing using shared LinkPopup component
- **Placeholder**: Contextual placeholder text

### Accessibility

- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Keyboard Navigation**: Full keyboard accessibility for all features
- **Focus Management**: Proper focus handling during interactions
- **High Contrast**: Accessible color schemes and visual indicators

## Styling

### CSS Architecture

```css
/* Editor container */
.tiptap-editor-container {
  display: flex;
  flex-direction: column;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

/* Toolbar */
.tiptap-toolbar {
  display: flex;
  gap: 8px;
  padding: 8px;
  border-bottom: 1px solid #e2e8f0;
  background: #f7fafc;
}

/* Content area */
.tiptap-editor-content .ProseMirror {
  min-height: 300px;
  padding: 16px;
  outline: none;
}

/* Mentions */
.tiptap-editor-content .ProseMirror .mention {
  background-color: #f0f9ff;
  color: #0369a1;
  padding: 2px 4px;
  border-radius: 4px;
  font-weight: 500;
}
```

### Responsive Design

The editor is fully responsive with:
- Flexible toolbar layout that wraps on smaller screens
- Touch-friendly button sizes for mobile devices
- Adaptive mention dropdown positioning
- Proper viewport scaling for WebView integration

## Performance

### Optimization Features

- **Virtual Scrolling**: Efficient rendering of large documents
- **Incremental Updates**: Only re-renders changed content
- **Lazy Loading**: Extensions load only when needed
- **Memory Management**: Proper cleanup of event listeners and components

### Bundle Size

- **Core Editor**: ~200KB (gzipped: ~65KB)
- **With Extensions**: ~250KB (gzipped: ~80KB)
- **Total Build**: 1MB HTML (gzipped: 316KB) - includes all dependencies

## Testing

### Feature Testing with Playwright

```typescript
// Test formatting
await page.getByRole('button', { name: 'Bold' }).click()
await page.getByRole('textbox').type('Bold text')

// Test mentions
await page.getByRole('textbox').type('@alice')
await page.getByText('Alice Johnson').click()

// Test RTL/LTR
await page.getByRole('button', { name: 'RTL' }).click()
```

### Unit Testing

```typescript
// Test command execution
const editor = useEditor({ extensions: [...] })
editor.chain().focus().toggleBold().run()
expect(editor.isActive('bold')).toBe(true)

// Test content management
editor.commands.setContent('<p>Test</p>')
expect(editor.getHTML()).toBe('<p>Test</p>')
```

## Deployment

### Build Configuration

The TipTap editor builds into a single HTML file for WebView deployment:

```bash
npm run build
# Creates: dist/index.html (1MB, includes all dependencies)
```

### React Native Integration

```javascript
// WebView setup
<WebView
  source={{ uri: 'file:///path/to/dist/index.html?editor=tiptap' }}
  onMessage={(event) => {
    const message = JSON.parse(event.nativeEvent.data)
    if (message.type === 'READY') {
      // TipTap editor is ready
    }
  }}
/>

// Send commands
webViewRef.current.postMessage(JSON.stringify({
  type: 'EXECUTE_COMMAND',
  payload: { action: 'bold' }
}))
```

## Comparison with Other Editors

| Feature | TipTap | Slate.js | Lexical |
|---------|--------|----------|---------|
| **Architecture** | Extension-based | Plugin-based | Command-based |
| **Foundation** | ProseMirror | Custom | Custom |
| **Bundle Size** | Medium (250KB) | Large (300KB) | Medium (220KB) |
| **TypeScript** | Excellent | Good | Excellent |
| **Accessibility** | Excellent | Good | Excellent |
| **Learning Curve** | Easy | Steep | Medium |
| **Ecosystem** | Large | Medium | Growing |

## Future Enhancements

### Planned Extensions

- **Tables**: Rich table editing with cell formatting
- **Images**: Drag-and-drop image support with resizing
- **Collaboration**: Real-time collaborative editing
- **Math**: LaTeX math equation support
- **Export**: PDF and Word document export

### Performance Improvements

- **Streaming**: Large document streaming for better initial load
- **Web Workers**: Background processing for heavy operations
- **Caching**: Intelligent content caching for faster re-renders

## Troubleshooting

### Common Issues

**Extension Loading Errors**
```typescript
// Ensure proper extension import
import { configureMention } from './extensions/configureMention'
// Not: import MentionExtension from '...'
```

**WebView Communication Issues**
```typescript
// Verify bridge initialization
webViewBridge.initialize('tiptap', callbacks)
// Check message format
{ type: 'COMMAND', payload: { action: 'bold' } }
```

**Styling Problems**
```css
/* Ensure CSS is imported */
import './styles/editor.css'
/* Check ProseMirror selector specificity */
.tiptap-editor-content .ProseMirror p { /* styles */ }
```

### Debug Mode

Enable debug logging for development:

```typescript
const editor = useEditor({
  extensions: [...],
  onUpdate: ({ editor }) => {
    console.log('TipTap Update:', editor.getHTML())
  },
  onSelectionUpdate: ({ editor }) => {
    console.log('Selection:', editor.state.selection)
  }
})
```

---

The TipTap implementation provides a modern, extensible, and performant rich text editing experience with excellent React Native WebView integration. Its extension-based architecture makes it highly customizable while maintaining professional-grade quality and accessibility standards.