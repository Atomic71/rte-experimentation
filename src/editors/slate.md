# Slate.js Editor Implementation

Text editor implementation using [Slate.js](https://docs.slatejs.org/) plugin architecture.

## Architecture

```
slate/
├── index.ts                    # Editor wrapper class
├── components/
│   ├── SlateEditor.tsx         # Main editor component
│   ├── ElementRenderer.tsx     # Custom element rendering
│   └── LeafRenderer.tsx        # Text formatting rendering
├── plugins/
│   ├── blocks/                 # Block-level elements (headings, lists)
│   ├── marks/                  # Text formatting (bold, italic)
│   ├── mentions/               # @mention functionality
│   ├── links/                  # Link insertion/editing
│   └── direction/              # RTL/LTR text direction
├── hooks/
│   ├── useSlateEditor.ts       # Editor initialization
│   ├── useMentions.ts          # Mentions state management
│   └── useRTLDetection.ts      # Text direction detection
└── utils/
    ├── serialization.ts        # HTML import/export
    └── commands.ts             # Editor commands
```

## Plugin System

Slate uses higher-order functions that transform the editor instance:

```typescript
const withBlocks = (editor: Editor) => {
  const { insertBreak, normalizeNode } = editor
  
  editor.insertBreak = () => {
    if (isInCodeBlock(editor)) {
      editor.insertText('\n')
      return
    }
    insertBreak()
  }
  
  return editor
}

// Usage
const editor = withBlocks(withMarks(createEditor()))
```

## Commands

Execute formatting and structural changes:

```typescript
import { executeCommand } from './utils/commands'

// Text formatting
executeCommand(editor, 'bold')
executeCommand(editor, 'italic')

// Block elements
executeCommand(editor, 'heading-one')
executeCommand(editor, 'bulleted-list')

// Complex operations
executeCommand(editor, 'link', { url: 'https://example.com' })
executeCommand(editor, 'mention', { userId: '123', username: '@john' })
```

## Data Structure

Slate uses a nested node structure:

```typescript
// Document structure
[
  {
    type: 'paragraph',
    children: [
      { text: 'Hello ' },
      { text: 'world', bold: true },
      { text: '!' }
    ]
  },
  {
    type: 'heading-one',
    children: [{ text: 'Title' }]
  }
]
```

## RTL/LTR Support

Automatic text direction detection:

```typescript
// Hook detects text direction
const { direction } = useRTLDetection(editor)

// Applied to block elements
<div dir={direction} style={editorStyles.container}>
  <Slate editor={editor} value={value} onChange={setValue}>
    <Editable renderElement={renderElement} renderLeaf={renderLeaf} />
  </Slate>
</div>
```

## Mentions Implementation

Dropdown-based @mention system:

```typescript
const { 
  showDropdown, 
  mentionUsers, 
  selectedIndex,
  insertMention 
} = useMentions(editor)

// Trigger on '@' character
if (event.key === '@') {
  setShowDropdown(true)
  setMentionSearch('')
}

// Insert mention
const insertMention = (user: User) => {
  Transforms.insertNodes(editor, {
    type: 'mention',
    userId: user.id,
    userName: user.name,
    username: user.username,
    children: [{ text: '' }]
  })
}
```

## HTML Serialization

Convert between Slate format and HTML:

```typescript
import { serialize, deserialize } from './utils/serialization'

// To HTML
const html = serialize(editor.children)
// Output: "<p>Hello <strong>world</strong>!</p>"

// From HTML
const nodes = deserialize('<p>Hello <strong>world</strong>!</p>')
// Transforms to Slate node structure
```

## WebView Integration

Uses shared bridge from `../common/webview-bridge.ts`:

```typescript
export class SlateEditorWrapper implements BaseEditor {
  initialize(): void {
    const callbacks: EditorCallbacks = {
      onSetContent: (content) => this.setContent(content),
      onGetContent: () => this.getContent(),
      onExecuteCommand: (command) => this.executeCommand(command),
      onExportHTML: () => this.exportHTML(),
      onImportHTML: (html) => this.importHTML(html)
    }

    webViewBridge.initialize('slate', callbacks)
  }
}
```

## Performance Considerations

- Editor instance created once with `useMemo`
- Render functions defined outside component to prevent re-creation
- Plugin composition happens during initialization
- DOM operations batched through transformation system